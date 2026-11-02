import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
  type ConnectionState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcodeTerminal from 'qrcode-terminal';
import fs from 'node:fs';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { messageQueue } from '../utils/queue.js';
import type { WhatsAppConnectionStatus, WhatsAppGroupInfo, WhatsAppStatusResponse } from '../types/whatsapp.js';

export class WhatsAppService {
  private sock: WASocket | null = null;
  private status: WhatsAppConnectionStatus = 'disconnected';
  private connectedAt: number | null = null;
  private isShuttingDown = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Register WhatsApp send implementation into the reliability message queue
    messageQueue.registerSender((groupId: string, message: string) => {
      return this.sendRawMessage(groupId, message);
    });
  }

  /**
   * Initialize and connect Baileys WhatsApp client
   */
  public async initialize(): Promise<void> {
    if (this.isShuttingDown) return;

    try {
      this.status = 'connecting';
      logger.info('Initializing WhatsApp Baileys client...');

      // Ensure session folder exists
      if (!fs.existsSync(config.WHATSAPP_SESSION_PATH)) {
        fs.mkdirSync(config.WHATSAPP_SESSION_PATH, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(config.WHATSAPP_SESSION_PATH);

      // Create a dedicated quiet pino logger for Baileys internal noise
      const baileysLogger = pino({ level: 'silent' });

      const sock = makeWASocket({
        auth: state,
        logger: baileysLogger,
        printQRInTerminal: false,
        browser: ['GitHub Webhook Bot', 'Chrome', '1.0.0'],
        syncFullHistory: false,
        markOnlineOnConnect: false,
      });

      this.sock = sock;

      // Listen for credentials update
      sock.ev.on('creds.update', saveCreds);

      // Listen for connection state updates
      sock.ev.on('connection.update', (update: Partial<ConnectionState>) => {
        this.handleConnectionUpdate(update);
      });
    } catch (error) {
      logger.error({ error }, 'Failed to initialize WhatsApp socket');
      this.status = 'disconnected';
      this.scheduleReconnect(5000);
    }
  }

  /**
   * Handle Baileys connection state changes
   */
  private handleConnectionUpdate(update: Partial<ConnectionState>): void {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      this.status = 'qr_ready';
      logger.info('\n======================================================');
      logger.info('SCAN WHATSAPP QR CODE DENGAN HP ANDA:');
      logger.info('======================================================\n');
      qrcodeTerminal.generate(qr, { small: true });
      logger.info('\nBuka WhatsApp di HP > Linked Devices > Link a Device > Scan QR diatas.\n');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut && !this.isShuttingDown;

      logger.warn(
        { statusCode, reason: lastDisconnect?.error?.message || 'Connection lost' },
        'WhatsApp connection closed'
      );

      this.status = 'disconnected';
      this.sock = null;
      this.connectedAt = null;

      if (statusCode === DisconnectReason.loggedOut) {
        logger.error('WhatsApp session logged out! Please delete session folder and scan QR again.');
      } else if (shouldReconnect) {
        logger.info('Attempting automatic WhatsApp reconnection in 5 seconds...');
        this.scheduleReconnect(5000);
      }
    } else if (connection === 'open') {
      this.status = 'connected';
      this.connectedAt = Date.now();
      const userJid = this.sock?.user?.id || 'unknown';
      const userName = this.sock?.user?.name || 'WhatsApp User';
      logger.info({ userJid, userName }, 'WhatsApp connection established successfully!');

      if (config.WHATSAPP_GROUP_IDS.length === 0) {
        logger.warn('No WHATSAPP_GROUP_IDS configured! Access GET /whatsapp/groups to retrieve available groups.');
      } else {
        logger.info({ groups: config.WHATSAPP_GROUP_IDS }, 'Configured target WhatsApp group(s)');
      }
    }
  }

  private scheduleReconnect(delayMs: number): void {
    if (this.isShuttingDown) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      void this.initialize();
    }, delayMs);
  }

  /**
   * Check if WhatsApp is connected and ready to send messages
   */
  public isReady(): boolean {
    return this.status === 'connected' && this.sock !== null;
  }

  /**
   * Send standard WhatsApp text message with clean WhatsApp markdown
   */
  private async sendRawMessage(targetJid: string, message: string): Promise<void> {
    if (!this.isReady() || !this.sock) {
      throw new Error('WhatsApp client is not connected');
    }

    const normalizedJid = this.normalizeJid(targetJid);
    // Send standard text message - 100% reliable across all WhatsApp clients
    await this.sock.sendMessage(normalizedJid, { text: message });
  }

  /**
   * Dispatch notification message to all configured WhatsApp target groups
   * Enqueues through reliability message queue with retry & rate limiting.
   */
  public async broadcastNotification(
    message: string
  ): Promise<{ success: boolean; totalGroups: number }> {
    const targetGroups = config.WHATSAPP_GROUP_IDS;

    if (targetGroups.length === 0) {
      logger.warn('Cannot broadcast notification: No WHATSAPP_GROUP_IDS configured in .env');
      return { success: false, totalGroups: 0 };
    }

    logger.info({ targetCount: targetGroups.length }, 'Queueing notification to target groups...');

    const enqueuePromises = targetGroups.map((groupId) => {
      return messageQueue.enqueue(groupId, message);
    });

    const results = await Promise.all(enqueuePromises);
    const successCount = results.filter(Boolean).length;

    return {
      success: successCount > 0,
      totalGroups: targetGroups.length,
    };
  }

  /**
   * Fetch all participating WhatsApp groups metadata
   */
  public async getAvailableGroups(): Promise<WhatsAppGroupInfo[]> {
    if (!this.isReady() || !this.sock) {
      throw new Error('WhatsApp client is not connected. Please scan QR code and connect first.');
    }

    try {
      const groupsData = await this.sock.groupFetchAllParticipating();
      const groups: WhatsAppGroupInfo[] = Object.values(groupsData).map((group) => ({
        id: group.id,
        subject: group.subject,
        owner: group.owner,
        creation: group.creation,
        participantsCount: group.participants?.length || 0,
      }));

      // Sort alphabetically by subject
      groups.sort((a, b) => a.subject.localeCompare(b.subject));
      return groups;
    } catch (error) {
      logger.error({ error }, 'Failed to fetch WhatsApp groups');
      throw error;
    }
  }

  /**
   * Get current connection status and health diagnostics
   */
  public getStatus(): WhatsAppStatusResponse {
    const uptimeSeconds = this.connectedAt ? Math.floor((Date.now() - this.connectedAt) / 1000) : 0;

    return {
      status: this.status,
      connected: this.isReady(),
      user: this.sock?.user
        ? {
            id: this.sock.user.id,
            name: this.sock.user.name,
          }
        : null,
      targetGroups: config.WHATSAPP_GROUP_IDS,
      pendingMessages: messageQueue.pendingCount,
      uptimeSeconds,
    };
  }

  /**
   * Ensure group JID ends with @g.us
   */
  private normalizeJid(jid: string): string {
    const trimmed = jid.trim();
    if (!trimmed.includes('@')) {
      return `${trimmed}@g.us`;
    }
    return trimmed;
  }

  /**
   * Graceful disconnection
   */
  public async destroy(): Promise<void> {
    this.isShuttingDown = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.sock) {
      try {
        this.sock.end(undefined);
      } catch (err) {
        logger.debug({ err }, 'Error ending WhatsApp socket');
      }
      this.sock = null;
    }
    this.status = 'disconnected';
  }
}

export const whatsappService = new WhatsAppService();
