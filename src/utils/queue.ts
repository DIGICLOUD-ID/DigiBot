import { logger } from './logger.js';
import { config } from '../config/env.js';

export interface QueueItem {
  id: string;
  groupId: string;
  message: string;
  retries: number;
  maxRetries: number;
  resolve: (value: boolean) => void;
  reject: (reason?: unknown) => void;
}

export type SendMessageFunction = (groupId: string, message: string) => Promise<unknown>;

export class MessageQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private isDraining = false;
  private sendFn: SendMessageFunction | null = null;
  private readonly rateLimitMs: number;
  private readonly maxRetries: number;

  constructor(rateLimitMs = config.MESSAGE_RATE_LIMIT_MS, maxRetries = config.MESSAGE_MAX_RETRIES) {
    this.rateLimitMs = rateLimitMs;
    this.maxRetries = maxRetries;
  }

  public registerSender(fn: SendMessageFunction): void {
    this.sendFn = fn;
  }

  public enqueue(groupId: string, message: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.isDraining) {
        logger.warn('Cannot enqueue message: queue is shutting down');
        resolve(false);
        return;
      }

      const item: QueueItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        groupId,
        message,
        retries: 0,
        maxRetries: this.maxRetries,
        resolve,
        reject,
      };

      this.queue.push(item);
      logger.debug({ queueId: item.id, target: groupId, queueLength: this.queue.length }, 'Message enqueued');

      if (!this.isProcessing) {
        void this.processNext();
      }
    });
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const item = this.queue.shift();
    if (!item) {
      this.isProcessing = false;
      return;
    }

    if (!this.sendFn) {
      logger.error('WhatsApp send function is not registered in MessageQueue');
      item.reject(new Error('Sender function not registered'));
      this.isProcessing = false;
      return;
    }

    let success = false;
    try {
      await this.sendFn(item.groupId, item.message);
      logger.info({ queueId: item.id, target: item.groupId }, 'WhatsApp message successfully delivered from queue');
      item.resolve(true);
      success = true;
    } catch (error) {
      item.retries += 1;
      const errMsg = error instanceof Error ? error.message : String(error);

      if (item.retries <= item.maxRetries) {
        const backoffDelay = this.rateLimitMs * item.retries;
        logger.warn(
          { queueId: item.id, attempt: item.retries, maxRetries: item.maxRetries, error: errMsg, retryInMs: backoffDelay },
          'Failed to send message, scheduling retry'
        );
        // Wait backoff delay before pushing back to front of queue
        await new Promise((r) => setTimeout(r, backoffDelay));
        this.queue.unshift(item);
      } else {
        logger.error(
          { queueId: item.id, target: item.groupId, maxRetries: item.maxRetries, error: errMsg },
          'Message dropped after exceeding maximum retries'
        );
        item.resolve(false); // resolve false instead of crashing
      }
    }

    // Rate limiting delay between messages
    if (success && this.queue.length > 0) {
      await new Promise((r) => setTimeout(r, this.rateLimitMs));
    }

    // Continue processing next item
    void this.processNext();
  }

  public get pendingCount(): number {
    return this.queue.length;
  }

  public get active(): boolean {
    return this.isProcessing;
  }

  public async drain(timeoutMs = 10000): Promise<void> {
    this.isDraining = true;
    const startTime = Date.now();
    while (this.queue.length > 0 && Date.now() - startTime < timeoutMs) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}

export const messageQueue = new MessageQueue();
