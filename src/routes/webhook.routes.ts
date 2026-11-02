import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller.js';
import { whatsappController } from '../controllers/whatsapp.controller.js';
import { verifyGitHubWebhookSignature } from '../middlewares/webhook-auth.middleware.js';

export const router = Router();

// 1. Health check endpoint
router.get('/health', (req, res) => whatsappController.getHealth(req, res));

// 2. WhatsApp diagnostics endpoints
router.get('/whatsapp/status', (req, res) => whatsappController.getStatus(req, res));
router.get('/whatsapp/groups', (req, res) => whatsappController.getGroups(req, res));

// 3. GitHub Webhook receiver endpoint
router.post('/webhook/github', verifyGitHubWebhookSignature, (req, res) =>
  webhookController.handleWebhook(req, res)
);
