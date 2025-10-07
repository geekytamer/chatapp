import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { getConversationsForSideBar } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', protectRoute, getConversationsForSideBar);

export default router;