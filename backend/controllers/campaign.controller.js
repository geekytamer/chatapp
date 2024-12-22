import Campaign from "../models/campaign.model.js";

export const getCampaigns = async (templateName) => {
  try {
    // Find the campaign by the given templateName
    const campaigns = await Campaign.find({ templateName }).populate(
      "messages"
    );

    if (!campaigns || campaigns.length === 0) {
      return {};
    }

    const campaignsDetails = campaigns.map((campaign) => {
      // Initialize counts
      let sentCount = 0;
      let deliveredCount = 0;
        let seenCount = 0;
        console.log("campaign messages", campaign.messages)
        campaign.messages.forEach((message) => {
            if (message.status === "read") {
                seenCount++;
                deliveredCount++;
                sentCount++;
            } else if (message.status === "delivered") {
                deliveredCount++;
                sentCount++;
            } else if (message.status === "sent") {
                sentCount++;
          }
      });

      return {
        campaignDetails: {
          status: campaign.status,
          target: campaign.target,
          createdAt: campaign.createdAt,
          sent: sentCount,
          delivered: deliveredCount,
          seen: seenCount,
        },
      };
    });

    return campaignsDetails;
  } catch (error) {
    return { error: error.message };
  }
};
