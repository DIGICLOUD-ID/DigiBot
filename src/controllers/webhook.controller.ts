import type { Request, Response } from 'express';
import { githubService } from '../services/github.service.js';
import { logger } from '../utils/logger.js';

export class WebhookController {
  /**
   * Handle POST /webhook/github
   */
  public async handleWebhook(req: Request, res: Response): Promise<void> {
    const event = req.headers['x-github-event'] as string | undefined;
    const deliveryId = (req.headers['x-github-delivery'] as string | undefined) || `gen-${Date.now()}`;

    if (!event) {
      logger.warn({ ip: req.ip }, 'Webhook request missing X-GitHub-Event header');
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing X-GitHub-Event header',
      });
      return;
    }

    if (!req.body || typeof req.body !== 'object') {
      logger.warn({ event, deliveryId }, 'Webhook request has invalid or empty body');
      res.status(400).json({
        error: 'Bad Request',
        message: 'Request payload must be a valid JSON object',
      });
      return;
    }

    try {
      const result = await githubService.processEvent(event, deliveryId, req.body);

      if (result.duplicate) {
        res.status(200).json({
          status: 'skipped',
          message: 'Duplicate delivery already processed',
          deliveryId,
          event,
        });
        return;
      }

      if (!result.success) {
        // 202 Accepted: Event accepted and processed by webhook server, but delivery to WhatsApp deferred / not connected
        res.status(202).json({
          status: 'accepted_with_warning',
          message: result.reason || 'Event processed but not broadcasted to WhatsApp',
          deliveryId,
          event,
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Notification queued for WhatsApp delivery',
        deliveryId,
        event,
        targets: result.targetCount,
      });
    } catch (error) {
      logger.error({ error, event, deliveryId }, 'Error processing GitHub webhook in controller');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to process webhook',
        deliveryId,
        event,
      });
    }
  }
}

export const webhookController = new WebhookController();
