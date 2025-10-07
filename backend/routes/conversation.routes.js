import express from "express";
import Conversation from "../models/conversation.model.js";
import protectRoute from "../middleware/protectRoute.js";
const router = express.Router();

// 🚀 API Endpoint to Toggle Auto-Response (Optional if not using sockets)
router.post("/:id/toggle-auto-response", protectRoute, async (req, res) => {
  try {
    const participantId = req.params.id;
    const { autoResponseEnabled } = req.body;
    const loggedInUserId = req.user._id;

    console.log("Toggling auto-response for participant:", participantId, "Status:", autoResponseEnabled);

    // 🔄 Find the conversation that includes this participant
    const conversation = await Conversation.findOneAndUpdate(
      { participants: participantId },
      { autoResponseEnabled },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found for participant ID." });
    }

    console.log("Updated conversation:", conversation);
    const otherParticipant = conversation.participants.find(
        (participant) =>
          participant._id.toString() !== loggedInUserId.toString()
      );

    res.status(200).json( {
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
      });
  } catch (error) {
    console.error("Error toggling auto-response:", error);
    res.status(500).json({ message: "Failed to update auto-response status." });
  }
});

export default router;