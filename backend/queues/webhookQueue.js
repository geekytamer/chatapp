import Queue from "bull";
import axios from "axios";
import fs from "fs";
import path from "path";
import CampaignMessage from "../models/campaignMessage.model.js";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { fileURLToPath } from "url";
import { generateResponse } from "../utils/openai_service.js";
import { sendWhatsappMessage, getTextMessageInput } from "../utils/whatsapp_handler.js";

// Get the current directory of the module (ES module replacement for __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the new __dirname in your code
const saveDirectory = path.join(__dirname, "../downloads");

// Create a Bull queue for processing webhook messages
const webhookQueue = new Queue("webhookQueue", {
  redis: {
    host: "127.0.0.1", // Redis server address
    port: 6379, // Redis server port
  },
});

const messageIds = {}; // To track duplicate message IDs and statuses

async function handleStatusUpdate(body) {
  const messageId = body.entry[0].changes[0].value.statuses[0].id;
  const messageStatus = body.entry[0].changes[0].value.statuses[0].status;
  if (messageStatus === "failed") {
    console.log("Message failed, deleting from the database");
    console.log(body.entry[0].changes[0].value.statuses[0]);
  }
  let message = null;
  try {
    message = await CampaignMessage.findOne({ waId: messageId });
  } catch (error) {
    console.error("Error fetching message from database:", error);
    return;
  }
  if (!message) {
    console.log("No message found in the database for ID:", messageId);
    return;
  }

  // Check for duplicate message IDs and statuses (same as before)
  if (!messageIds[messageId]) {
    messageIds[messageId] = [];
  }

  if (messageIds[messageId].includes(messageStatus)) {
    console.log("Duplicate message status, ignoring");
  } else {
    messageIds[messageId].push(messageStatus);

    // Update the message status in the database
    message.status = messageStatus;
    await message.save();
  }
}

function isValidWhatsAppMessage(body) {
  return (
    body?.object &&
    body?.entry &&
    body.entry[0]?.changes &&
    body.entry[0].changes[0]?.value &&
    body.entry[0].changes[0].value?.messages &&
    body.entry[0].changes[0].value.messages[0]
  );
}

async function handleNewMessage(body) {
  const waId = body["entry"][0]["changes"][0]["value"]["contacts"][0]["wa_id"];
  const name =
    body["entry"][0]["changes"][0]["value"]["contacts"][0]["profile"]["name"];

  const message = body["entry"][0]["changes"][0]["value"]["messages"][0];

  let user = await User.findOne({ username: waId });
  let targetUser = await User.findOne({ username: "walaa" });
  let conversation = null;

  if (!user) {
    user = new User({
      username: waId,
      fullname: waId,
    });
    await user.save();

    conversation = new Conversation({
      participants: [user._id, targetUser],
    });
    await conversation.save();
  }

  if (!conversation) {
    try {
      conversation = await Conversation.findOne({
        participants: { $in: [user._id] },
      })
        .sort({ updatedAt: -1 }) // Sort by most recent
        .populate("participants")
        .populate("messages")
        .populate("requests")
        .exec();
    } catch (error) {
      console.error("Error fetching conversation from database:", error);
      return { message: "Error fetching conversation from database." };
    }

    if (!conversation) {
      console.log("No conversation found for the user.");
      return { message: "No conversation found for the user." };
    }
  }

  let newMessage;
  const isImage = message.type === "image";
  if (!isImage) {
    // Handle text message
    newMessage = new Message({
      senderId: user._id,
      receiverId: targetUser._id,
      message: message.text.body,
    });
  } else if (isImage) {
    // Handle image message
    const mediaId = message.image.id;
    const imageUrl = await getImageUrl(mediaId);

    if (imageUrl) {
      // Download and save the image locally
      const savedImageName = await downloadAndSaveImage(imageUrl, mediaId);
      console.log("Image saved as:", savedImageName);
      // Create a new message with the image
      newMessage = new Message({
        senderId: user._id,
        receiverId: targetUser._id,
        message: message.image.caption || " ", // Optional, or any other metadata you want to store
        imageUrl: savedImageName, // Store the path to the downloaded image
      });
    }
  }

  const socketId = getReceiverSocketId(targetUser._id);
  if (conversation.messages.length == 0 && socketId) {
    io.to(socketId).emit("newConversation", {
      _id: user._id, // Conversation ID
      fullname: user?.fullname || "Unknown", // Fallback in case of missing participant data
      profilePic: user?.profilePic || "", // Fallback in case of missing profilePic
      isOnline: false, // You can calculate online status based on your socket connection logic
      lastMessage: newMessage.imageUrl ? "image" : newMessage.message, // Show the last message in the conversation
    });
   }
  if (newMessage) {
    conversation.messages.push(newMessage);
  }

  if (!conversation.participants.includes(targetUser._id)) {
    conversation.participants.push(targetUser._id);
  }

  if (socketId) {
    io.to(socketId).emit("newMessage", newMessage);
  }

  try {
    await Promise.all([conversation.save(), newMessage.save()]);
  } catch (error) {
    console.error("Error saving conversation and message to database:", error);
    return { message: "Error saving conversation and message to database." };
   }

  if (conversation.autoResponseEnabled && !isImage) {
    // Generate an auto-response
    console.log("Generating auto-response for:", newMessage.message);
    const autoResponse = await generateResponse(newMessage.message, waId);
    const autoResponseMessage = new Message({
      senderId: targetUser._id,
      receiverId: user._id,
      message: autoResponse,
    });
    conversation.messages.push(autoResponseMessage);
    try {
      await Promise.all([conversation.save(), autoResponseMessage.save()]);
    } catch (error) {
      console.error("Error saving conversation and message to database:", error);
      return { message: "Error saving conversation and message to database." };
     }
    const data = getTextMessageInput(waId, autoResponse);
    console.log("Sending auto-response:", data);
    await sendWhatsappMessage(data);

    console.log("Auto-response sent:", autoResponse);

    if (socketId) {
      io.to(socketId).emit("newMessage", autoResponseMessage);
    }
  }

  return { message: "New message received and saved." };
}

// Helper function to get image URL
async function getImageUrl(mediaId) {
  const url = `https://graph.facebook.com/v19.0/${mediaId}`;
  console.log("Getting image URL:", url);
  const headers = {
    Authorization: `Bearer EAASaGKQLCyoBPOcuHkj4ZCwUOMAgYexo2DvuVFdEMH0JxZAoj6cUKUY02GieLjGeZAxHMIsWETYZAIEwEwkHefxcGZAi6HwMgPvXtkkCLCAzZC6qmfuxzSR8F3G30Tncy82Xtm5B8FjVafqokLUBBsTZAUTiZC5dwXfrpQOYBHinSdcapMvSiRYcNyK61uKrtDKgcAZDZD`, // WhatsApp API access token
  };

  try {
    const response = await axios.get(url, { headers });
    if (response.data && response.data.url) {
      return response.data.url;
    } else {
      console.error("Failed to retrieve image URL from WhatsApp API");
      return null;
    }
  } catch (error) {
    console.error("Error fetching image URL:", error);
    return null;
  }
}

// Helper function to download and save image
async function downloadAndSaveImage(imageUrl, mediaId) {
  
  console.log("Save directory:", saveDirectory);
  const imagePath = path.join(saveDirectory, `${mediaId}.jpg`);
  console.log("Image path:", imagePath);

  try {
    const headers = {
      Authorization: `Bearer EAASaGKQLCyoBPOcuHkj4ZCwUOMAgYexo2DvuVFdEMH0JxZAoj6cUKUY02GieLjGeZAxHMIsWETYZAIEwEwkHefxcGZAi6HwMgPvXtkkCLCAzZC6qmfuxzSR8F3G30Tncy82Xtm5B8FjVafqokLUBBsTZAUTiZC5dwXfrpQOYBHinSdcapMvSiRYcNyK61uKrtDKgcAZDZD`, // Use your access token from environment variables
    };

    const response = await axios.get(imageUrl, {
      responseType: "stream",
      headers, // Add the headers object containing the Authorization token
    });
    console.log("Downloading image:", imageUrl);
    const writer = fs.createWriteStream(imagePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(`${mediaId}.jpg`));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading image:", error);
    return null;
  }
}

// Define a job processor for the queue (where the actual processing logic happens)
webhookQueue.process(async (job) => {
  console.log("Processing webhook message:", job.id);
  const body = job.data;
  if (body?.entry?.[0]?.changes?.[0]?.value?.statuses) {
    return await handleStatusUpdate(body);
  } else if (isValidWhatsAppMessage(body)) {
    return await handleNewMessage(body);
  }
  console.error("Invalid webhook message:", body);
});

export default webhookQueue;
