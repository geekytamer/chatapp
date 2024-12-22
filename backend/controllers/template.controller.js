import Campaign from "../models/campaign.model";
import CampaignMessage from "../models/campaignMessage.model";
import multer from "multer";

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const createCampaign = async (req, recipients, res) => {
    try {
        const { templateName, language, category } = req.body;
        const { userId } = req.user;
        
        const campaign = new Campaign({
            templateName: templateName,
            creator: userId,
            category: category,
            status: "pending",
            target: recipients.length,
        });

        // Save campaign to the database
        await campaign.save();
        
        // Create campaign messages for each recipient
        recipients.forEach(async (recipient) => {
            templateData = {
                recipient: recipient,
                templateId: campaign._id,
                language: language,
            }

            const message = new CampaignMessage({
                recipient: recipient,
            });

            
        }
        )

    } catch (error) { 
        return
    }
    return;
 }