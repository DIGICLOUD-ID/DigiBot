/**
 * In-memory TTL cache to track GitHub delivery IDs (X-GitHub-Delivery)
 * preventing duplicate webhook processing.
 */
export class DeliveryCache {
  private cache = new Map<string, number>();
  private readonly ttlMs: number;
  private readonly maxSize: number;

  constructor(ttlMinutes = 15, maxSize = 5000) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.maxSize = maxSize;

    // Periodic sweep every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  /**
   * Check if a delivery ID has already been seen and is still fresh.
   * If not seen, mark it as seen and return false.
   * If seen, return true.
   */
  public hasOrAdd(deliveryId: string): boolean {
    const now = Date.now();
    const expiry = this.cache.get(deliveryId);

    if (expiry !== undefined && expiry > now) {
      return true; // Already processed
    }

    // Evict oldest entries if capacity exceeded
    if (this.cache.size >= this.maxSize) {
      this.evictOldest(Math.floor(this.maxSize * 0.2));
    }

    this.cache.set(deliveryId, now + this.ttlMs);
    return false;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, expiry] of this.cache.entries()) {
      if (expiry <= now) {
        this.cache.delete(id);
      }
    }
  }

  private evictOldest(count: number): void {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (deleted >= count) break;
      this.cache.delete(key);
      deleted++;
    }
  }

  public get size(): number {
    return this.cache.size;
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const deliveryCache = new DeliveryCache();
