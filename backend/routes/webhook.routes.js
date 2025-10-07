import express from 'express';
import { handleWebhook } from '../controllers/webhook.controller.js';

const webhookRouter = express.Router();

webhookRouter.post('/', handleWebhook);
webhookRouter.get('/', handleWebhook);

export default webhookRouter;