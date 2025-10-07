// 🚀 Updated Conversation Schema
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message", default: [] }],
    requests: [{ type: [mongoose.Schema.Types.ObjectId], ref: "ConversationRequest", default: [] }],
    autoResponseEnabled: { type: Boolean, default: false } // ⭐ New field to track auto-response status
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;