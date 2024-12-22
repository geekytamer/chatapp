import express from "express";
import multer from "multer";
import axios from "axios";
import csvParser from "csv-parser"; // Library to parse CSV files
import Queue from "bull"; // Using Bull for Redis-based queuing
import Campaign from "../models/campaign.model.js";
import CampaignMessage from "../models/campaignMessage.model.js";
import { Readable } from "stream";
import protectRoute from "../middleware/protectRoute.js";
import { startSession, uploadFile, uploadFileBuffer } from "../controllers/media.controller.js";
const messageQueue = new Queue("message-queue"); // Create a Redis-backed queue
const templateRouter = express.Router();
import mongoose from "mongoose";
import path from "path";
import { outputDir } from "../server.js";
import fs from "fs";
import pLimit from "p-limit";

// Configure multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

templateRouter.post(
  "/send-messages-file",
  protectRoute,
  upload.single("file"),
  async (req, res) => {
    const template = JSON.parse(req.body.template);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`Template: ${JSON.stringify(template)}`);

    const headerComponent = template.components.find(
      (c) => c.type === "HEADER"
    );
    let mediaId = null;
    if (
      headerComponent &&
      headerComponent.format === "IMAGE" &&
      headerComponent.example.header_handle
    ) {
      const { filePath, fileName, fileSize, fileType } =
        await downloadFileToFileSystem(
          headerComponent.example.header_handle[0],
          outputDir
        );
      mediaId = `https://v10fwg0x-5000.inc1.devtunnels.ms/fetch-file/${fileName}`;
    }

    try {
      const phoneNumbers = [];
      const campaignMessages = [];

      // Create a new campaign
      const campaign = new Campaign({
        templateName: template.name,
        category: template.category,
        target: 0, // Will update later after counting phone numbers
        status: "pending",
        creator: req.user._id, // Assuming user authentication
      });

      await campaign.save();

      // Accumulate promises for processing phone numbers
      const processPromises = [];

      // Use a stream to process the CSV file in chunks
      const stream = Readable.from(file.buffer);
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          const phoneNumber = Object.values(row)[0].trim();
          if (phoneNumber) {
            phoneNumbers.push("+" + phoneNumber);

            // Push the promise for processing each phone number
            // Modify how promises are added
            processPromises.push(() =>
              processPhoneNumber(
                constructTemplateJson(template, "+" + phoneNumber, mediaId)
              )
            );
          }
        })
        .on("end", async () => {
          try {
            const limit = pLimit(5); // Limit to 5 concurrent executions

            // Map to limited promise executions
            const limitedPromises = processPromises.map((promiseFn) =>
              limit(promiseFn)
            );

            // Wait for all promises to resolve
            const processedMessages = await Promise.all(limitedPromises);

            // Filter out any null values (failed message processing)
            const validMessages = processedMessages.filter(
              (msg) => msg !== null
            );

            // Bulk insert the valid messages
            if (validMessages.length > 0) {
              const insertedMessages = await CampaignMessage.insertMany(
                validMessages
              );
              const messageIds = insertedMessages.map((msg) => msg._id);
              console.log("Inserted message IDs:", processedMessages);
              // Update campaign with message IDs and target
              campaign.target = phoneNumbers.length;
              campaign.messages = messageIds;
              campaign.status = "completed";
              await campaign.save();
            }

            res.status(200).json({
              message: "File processed successfully. Messages are being sent.",
            });
          } catch (processError) {
            console.error("Error processing phone numbers:", processError);
            res.status(500).json({ error: "Failed to process phone numbers" });
          }
        })
        .on("error", (err) => {
          console.error("Error processing file:", err);
          res.status(500).json({ error: "Failed to process the file" });
        });
    } catch (error) {
      console.error("Error handling request:", error);
      res.status(500).json({ error: "Failed to process the request" });
    }
  }
);


async function processPhoneNumber(templateJson) {
  try {
    // Simulate sending message (replace with real service)
    const messageResponse = await sendMessage(templateJson);

    // Check if the message sending failed
    if (!messageResponse || messageResponse === "failed") {
      // Optionally, return a null value or an object indicating the failure
      console.error("Failed to send message to:", templateJson.to);
      return null;
    }

    // Create a new CampaignMessage object with the necessary fields
    const campaignMessage = new CampaignMessage({
      waId: messageResponse.messages[0].id, // Assuming response contains message ID
      recipient: templateJson.to, // The phone number
      status: "pending", // Initial status, can be updated later
      createdAt: new Date(), // Timestamp (optional)
      // You can add more fields if needed, such as message content, media ID, etc.
    });

    // Return the prepared CampaignMessage object for later insertion
    return campaignMessage;
  } catch (error) {
    console.error("Error processing phone number:", error);
    return null; // Return null in case of an error to avoid breaking the flow
  }
}
 
// Process the queue
messageQueue.process(async (job, done) => {
  const { campaignId, phoneNumber, templateData } = job.data;

  try {
    const templateJson = constructTemplateJson(templateData);
    // Simulate sending message (replace with real service)
    const messageResponse = await sendMessage(phoneNumber, templateJson);

    if (messageResponse === "failed") {
      return;
    }

    const campaignMessage = new CampaignMessage({
      _id: messageResponse.messages[0].id,
      recipient: phoneNumber,
      status: "pending",
    });

    await campaignMessage.save();

    done();
  } catch (error) {
    console.error("Error sending message:", error);
    done(error);
  }
});

function constructTemplateJson(data, phoneNumber, mediaId) {
  // Destructuring the key components from the input JSON
  const { name, components, language } = data;

  // Find the required components in the original structure
  const headerComponent = components.find((c) => c.type === "HEADER");
  const bodyComponent = components.find((c) => c.type === "BODY");

  // Construct the template JSON
  const templateJson = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneNumber, // Placeholder for phone number
    type: "template",
    template: {
      name: name, // Template name
      language: {
        code: language, // Language and locale
      },
      components: [],
    },
  };

  // Map HEADER component if exists
  if (
    headerComponent &&
    headerComponent.format === "IMAGE" &&
    headerComponent.example.header_handle && mediaId
  ) {
    templateJson.template.components.push({
      type: "header",
      parameters: [{
        type: "image",
        image: {
          link: mediaId, // Replace with uploaded media handle
        }
      }],
    });
  }

  // Map BODY component if exists
//   if (bodyComponent) {
//     const bodyParameters = [
//       {
//         type: "text",
//         text: bodyComponent.text, // Text with variables
//       },
//     ];

//     // Example currency parameter
//     bodyParameters.push({
//       type: "currency",
//       currency: {
//         fallback_value: "VALUE", // Placeholder for value
//         code: "USD", // Currency code
//         amount_1000: 1000, // Placeholder for amount
//       },
//     });

//     // Example date_time parameter
//     bodyParameters.push({
//       type: "date_time",
//       date_time: {
//         fallback_value: "MONTH DAY, YEAR", // Placeholder for date
//       },
//     });

//     templateJson.template.components.push({
//       type: "body",
//       parameters: bodyParameters,
//     });
//   }

  return templateJson;
}

async function sendMessage(data) {
  const headers = {
    "Content-type": "application/json",
    Authorization:
      "Bearer EAAGALlgZCIMsBO3SrQN0NEZCBmKbXdrdgr50gvg4xzIZCMNmOZAkZCG32rICJAOkdtU0yN88lheddkoY1wA47Frgy82HijOP16aFnt3ka6gysbaSJCi9tqBO14T8MQnd3kM66BFCLKwwwE7jZAZCSsg8X2H84SOnxbuTSbuzA9dxocyGIvLr2DspugOukNUeVKr0ZBZC52aabZAjkmC6PZB",
  };

  const url = "https://graph.facebook.com/v20.0/394225673770982/messages";

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status !== 200) {
      console.log(response.data);
      throw new Error("Failed to send message");
    }

    console.log(response.data);
    return response.data;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log("Connection Error", error.message);
    } else {
      console.log("Errorrr", error);
    }
    return "failed";
  }
}

async function downloadFileToMemory(url) {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer",
    });

    const fileBuffer = Buffer.from(response.data);
    console.log("File downloaded and stored in memory.");

    // Extract metadata
    const fileType = response.headers["content-type"]; // MIME type from response headers
    const fileSize = response.headers["content-length"]; // File size from response headers
    const fileName = url.split("/").pop(); // Extract file name from URL

    return { fileBuffer, fileName, fileSize, fileType };
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

// Function to download a file from a URL and save it to the filesystem
async function downloadFileToFileSystem(url, outputDir) {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
    });

    // Extract filename and determine file path
    const fileName = path.basename(url.split("?")[0]); // You can also set this as needed
    const filePath = path.join(outputDir, fileName);

    // Write file to the filesystem
    fs.writeFileSync(filePath, response.data);
    console.log(`File downloaded and saved to ${filePath}`);

    // Return file details
    return { filePath, fileName, fileSize: response.data.length, fileType: response.headers['content-type'] };
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

async function processWithLimit(promises, limit) {
  const results = [];
  const executing = [];

  for (const promise of promises) {
    const p = promise.then((result) => {
      executing.splice(executing.indexOf(p), 1); // Remove finished promise
      return result;
    });
    results.push(p);
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing); // Wait for the first promise to finish
    }
  }

  return Promise.all(results);
}
export default templateRouter;
