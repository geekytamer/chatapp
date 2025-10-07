import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import { auto } from "openai/_shims/registry.mjs";

export const getConversationsForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Fetch conversations where the logged-in user is a participant
    const conversations = await Conversation.find({
      participants: { $in: loggedInUserId },
    })
      .populate("participants", "fullname profilePic _id") // Populate participants, but only select fullname, profilePic, and _id
      .populate("messages") // Optionally populate the messages if needed (e.g., for the last message)
      .exec();

    // Process conversations to return the other participant's info for the sidebar
    const sidebarConversations = conversations.map((conversation) => {
      // Find the other participant in the conversation
      const otherParticipant = conversation.participants.find(
        (participant) =>
          participant._id.toString() !== loggedInUserId.toString()
      );

      return {
        _id: otherParticipant._id, // Conversation ID
        fullname: otherParticipant?.fullname || "Unknown", // Fallback in case of missing participant data
        profilePic: otherParticipant?.profilePic || "", // Fallback in case of missing profilePic
        isOnline: false, // You can calculate online status based on your socket connection logic
        autoResponseEnabled:
          conversation.autoResponseEnabled || false, // Include auto-response status
        lastMessage:
          conversation.messages.length > 0
            ? conversation.messages[conversation.messages.length - 1].message
            : "", // Get the last message if available
      };
    });

    res.status(200).json(sidebarConversations);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error in get conversations for sidebar function" });
  }
};
