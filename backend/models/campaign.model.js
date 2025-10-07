import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CampaignMessage",
        default: [],
      },
    ],
    category: { type: String, enum: ["MARKETING", "UTILITY"] },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "failed"],
        },
    target: {type: Number, required: true },
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
