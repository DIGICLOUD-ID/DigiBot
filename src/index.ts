import express from 'express';
import type { Server } from 'node:http';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { messageQueue } from './utils/queue.js';
import { router } from './routes/webhook.routes.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import { whatsappService } from './services/whatsapp.service.js';
import type { AuthenticatedWebhookRequest } from './middlewares/webhook-auth.middleware.js';

const app = express();

// Capture raw body buffer for GitHub HMAC SHA-256 signature verification
app.use(
  express.json({
    limit: '5mb',
    verify: (req: AuthenticatedWebhookRequest, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// URL-encoded middleware (fallback)
app.use(express.urlencoded({ extended: true }));

// Register application routes
app.use(router);

// 404 and global error handlers
app.use(notFoundHandler);
app.use(errorHandler);

let server: Server | null = null;

async function bootstrap(): Promise<void> {
  try {
    // Start HTTP Webhook server
    server = app.listen(config.PORT, config.HOST, () => {
      logger.info(`=================================================`);
      logger.info(`🚀 GitHub Webhook to WhatsApp Bot is running!`);
      logger.info(`📡 Server listening on http://${config.HOST}:${config.PORT}`);
      logger.info(`🔗 Webhook endpoint: http://${config.HOST}:${config.PORT}/webhook/github`);
      logger.info(`🩺 Health check:    http://${config.HOST}:${config.PORT}/health`);
      logger.info(`📱 WhatsApp status: http://${config.HOST}:${config.PORT}/whatsapp/status`);
      logger.info(`👥 WhatsApp groups: http://${config.HOST}:${config.PORT}/whatsapp/groups`);
      logger.info(`=================================================`);
    });

    // Initialize WhatsApp connection
    await whatsappService.initialize();
  } catch (error) {
    logger.fatal({ error }, 'Fatal error during application startup');
    process.exit(1);
  }
}

// Graceful shutdown handling
let isTerminating = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isTerminating) return;
  isTerminating = true;

  logger.info({ signal }, 'Received termination signal. Initiating graceful shutdown...');

  // 1. Stop receiving new HTTP requests
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // 2. Drain pending messages in queue (up to 5s)
  try {
    if (messageQueue.pendingCount > 0) {
      logger.info({ pending: messageQueue.pendingCount }, 'Draining pending WhatsApp messages...');
      await messageQueue.drain(5000);
    }
  } catch (err) {
    logger.warn({ err }, 'Error while draining message queue');
  }

  // 3. Disconnect WhatsApp socket cleanly
  try {
    logger.info('Disconnecting WhatsApp client...');
    await whatsappService.destroy();
  } catch (err) {
    logger.warn({ err }, 'Error during WhatsApp disconnect');
  }

  logger.info('Graceful shutdown completed successfully. Exiting.');
  process.exit(0);
}

process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught Exception detected');
  void gracefulShutdown('uncaughtException');
});

void bootstrap();
