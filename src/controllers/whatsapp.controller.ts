import type { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service.js';
import { logger } from '../utils/logger.js';

export class WhatsAppController {
  /**
   * Handle GET /health
   */
  public getHealth(_req: Request, res: Response): void {
    const status = whatsappService.getStatus();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      whatsappConnected: status.connected,
      whatsappStatus: status.status,
    });
  }

  /**
   * Handle GET /whatsapp/status
   */
  public getStatus(_req: Request, res: Response): void {
    const status = whatsappService.getStatus();
    res.status(200).json(status);
  }

  /**
   * Handle GET /whatsapp/groups
   */
  public async getGroups(_req: Request, res: Response): Promise<void> {
    try {
      if (!whatsappService.isReady()) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'WhatsApp is not connected. Please scan the QR code first.',
        });
        return;
      }

      const groups = await whatsappService.getAvailableGroups();
      res.status(200).json({
        total: groups.length,
        groups,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to retrieve WhatsApp groups in controller');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Could not fetch groups',
      });
    }
  }
}

export const whatsappController = new WhatsAppController();
