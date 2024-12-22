import CampaignMessage from "../models/campaignMessage.model.js";
import webhookQueue from "../queues/webhookQueue.js"; // Import the queue

export const handleWebhook = async (req, res) => {
  const token = "123456"; // Same secret you type in the secret input in the WhatsApp dashboard
  console.log("Webhook request received");

  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verify_token = req.query["hub.verify_token"];

  // Confirms the WhatsApp webhook/callback URL is good (only happens once)
  if (mode === "subscribe" && verify_token === token) {
    console.log("Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  const body = req.body;

    // Immediately add the webhook data to the queue
    console.log("Adding webhook data to queue");
  await webhookQueue.add(body);

  // Return 200 OK immediately to avoid WhatsApp resending the same message
  return res.status(200).send("Webhook received and added to queue");
};
