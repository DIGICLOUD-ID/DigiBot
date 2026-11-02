import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedWebhookRequest extends Request {
  rawBody?: Buffer;
}

export function verifyGitHubWebhookSignature(
  req: AuthenticatedWebhookRequest,
  res: Response,
  next: NextFunction
): void {
  const secret = config.GITHUB_WEBHOOK_SECRET;

  // If no secret configured, allow with a security warning in logs
  if (!secret) {
    logger.warn('GITHUB_WEBHOOK_SECRET is not configured. Webhook signature verification skipped!');
    next();
    return;
  }

  const signature = req.headers['x-hub-signature-256'];

  if (!signature || typeof signature !== 'string') {
    logger.warn('Webhook request rejected: Missing X-Hub-Signature-256 header');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing X-Hub-Signature-256 header',
    });
    return;
  }

  if (!req.rawBody) {
    logger.error('Webhook request error: Raw request body not captured for signature verification');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Raw body verification failed',
    });
    return;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(req.rawBody);
    const expectedSignature = `sha256=${hmac.digest('hex')}`;

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      logger.warn({ received: signature }, 'Webhook request rejected: Invalid signature');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid signature',
      });
      return;
    }

    logger.debug('GitHub webhook signature verified successfully');
    next();
  } catch (error) {
    logger.error({ error }, 'Error during webhook signature verification');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Signature verification error',
    });
  }
}
