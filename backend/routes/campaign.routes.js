import express from "express";
import { getCampaigns } from "../controllers/campaign.controller.js";
import protectRoute from "../middleware/protectRoute.js";
const campaignRouter = express.Router();

campaignRouter.get("/:templateName", protectRoute, async (req, res) => {
  const { templateName } = req.params;

  return res.json(await getCampaigns(templateName));
});

export default campaignRouter;