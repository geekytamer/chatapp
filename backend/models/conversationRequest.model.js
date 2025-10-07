import mongoose from "mongoose";

const conversationRequestSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
        },
        status: {
            type: mongoose.Schema.Types.String,
            enum: ["pending", "accepted", "closed"],
            default: "pending"
    }
  },
  { timestamps: true }
);

const ConversationRequest = mongoose.model("ConversationRequest", conversationRequestSchema);

export default ConversationRequest;
