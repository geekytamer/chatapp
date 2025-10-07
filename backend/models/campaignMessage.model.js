import mongoose from "mongoose";

const campaignMessageSchema = new mongoose.Schema(
  {
    waId: { type: String, required: true },
    recipient: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "delivered", "read", "clicked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const CampaignMessage = mongoose.model("CampaignMessage", campaignMessageSchema);

export default CampaignMessage;
