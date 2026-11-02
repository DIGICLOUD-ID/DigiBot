import { logger } from '../utils/logger.js';
import { deliveryCache } from '../utils/cache.js';
import { formatGitHubEvent } from '../formatters/index.js';
import { whatsappService } from './whatsapp.service.js';

export interface ProcessWebhookResult {
  success: boolean;
  duplicate: boolean;
  event: string;
  deliveryId: string;
  message?: string;
  reason?: string;
  targetCount?: number;
}

export class GitHubService {
  /**
   * Process incoming GitHub Webhook event
   */
  public async processEvent(
    event: string,
    deliveryId: string,
    payload: unknown
  ): Promise<ProcessWebhookResult> {
    logger.info({ event, deliveryId }, 'Processing incoming GitHub Webhook event');

    // 1. Duplicate delivery protection
    if (deliveryId && deliveryCache.hasOrAdd(deliveryId)) {
      logger.warn({ deliveryId, event }, 'Duplicate GitHub delivery ID detected, skipping processing');
      return {
        success: true,
        duplicate: true,
        event,
        deliveryId,
        reason: 'Duplicate delivery skipped',
      };
    }

    // 2. Format the event message
    let formattedMessage: string;
    try {
      formattedMessage = formatGitHubEvent(event, payload);
    } catch (formatError) {
      logger.error({ formatError, event, deliveryId }, 'Failed to format GitHub event message');
      throw new Error(`Failed to format event: ${formatError instanceof Error ? formatError.message : String(formatError)}`);
    }

    // 3. WhatsApp connection check
    if (!whatsappService.isReady()) {
      logger.warn(
        { event, deliveryId },
        'WhatsApp is not connected. Notification cannot be sent at this time.'
      );
      return {
        success: false,
        duplicate: false,
        event,
        deliveryId,
        message: formattedMessage,
        reason: 'WhatsApp client is not connected',
      };
    }

    // 4. Send via WhatsApp broadcast
    try {
      const broadcastResult = await whatsappService.broadcastNotification(formattedMessage);

      if (!broadcastResult.success && broadcastResult.totalGroups === 0) {
        return {
          success: false,
          duplicate: false,
          event,
          deliveryId,
          message: formattedMessage,
          reason: 'No target WhatsApp groups configured',
        };
      }

      logger.info(
        { event, deliveryId, targets: broadcastResult.totalGroups },
        'GitHub webhook successfully processed and queued for WhatsApp delivery'
      );

      return {
        success: true,
        duplicate: false,
        event,
        deliveryId,
        targetCount: broadcastResult.totalGroups,
      };
    } catch (sendError) {
      logger.error({ sendError, event, deliveryId }, 'Error dispatching message to WhatsApp queue');
      return {
        success: false,
        duplicate: false,
        event,
        deliveryId,
        reason: sendError instanceof Error ? sendError.message : 'Unknown dispatch error',
      };
    }
  }
}

export const githubService = new GitHubService();
