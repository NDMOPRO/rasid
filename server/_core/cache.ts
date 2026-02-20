/**
 * Cache Layer — Redis-based caching with in-memory fallback.
 * 
 * When Redis is available, uses it for distributed caching.
 * Falls back to a simple in-memory LRU cache when Redis is unavailable.
 */

import { ENV } from "./env";

// ============================================
// In-Memory LRU Cache (Fallback)
// ============================================
class MemoryCache {
  private cache = new Map<string, { value: string; expiresAt: number }>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    // Periodic cleanup every 60 seconds
    setInterval(() => this.cleanup(), 60000);
  }

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const result: string[] = [];
    for (const key of this.cache.keys()) {
      if (regex.test(key)) result.push(key);
    }
    return result;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// ============================================
// Redis Client (Optional)
// ============================================
let redisClient: any = null;
let redisAvailable = false;

async function initRedis(): Promise<boolean> {
  const redisUrl = (ENV as any).redisUrl || process.env.REDIS_URL;
  if (!redisUrl) return false;

  try {
    const { createClient } = await import("redis");
    redisClient = createClient({ url: redisUrl });
    redisClient.on("error", (err: any) => {
      console.warn("[Cache] Redis error:", err.message);
      redisAvailable = false;
    });
    redisClient.on("connect", () => {
      console.log("[Cache] Redis connected");
      redisAvailable = true;
    });
    await redisClient.connect();
    redisAvailable = true;
    return true;
  } catch (err: any) {
    console.warn("[Cache] Redis unavailable, using in-memory cache:", err.message);
    return false;
  }
}

// ============================================
// Unified Cache Interface
// ============================================
const memoryCache = new MemoryCache(2000);

// Try to initialize Redis on module load
initRedis().catch(() => {});

export const cache = {
  /**
   * Get a cached value by key.
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      let raw: string | null;
      if (redisAvailable && redisClient) {
        raw = await redisClient.get(key);
      } else {
        raw = await memoryCache.get(key);
      }
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set a cached value with TTL in seconds.
   */
  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (redisAvailable && redisClient) {
        await redisClient.set(key, serialized, { EX: ttlSeconds });
      }
      // Always write to memory cache as backup
      await memoryCache.set(key, serialized, ttlSeconds);
    } catch (err) {
      console.warn("[Cache] Set error:", err);
    }
  },

  /**
   * Delete a cached value.
   */
  async del(key: string): Promise<void> {
    try {
      if (redisAvailable && redisClient) {
        await redisClient.del(key);
      }
      await memoryCache.del(key);
    } catch {
      // Ignore
    }
  },

  /**
   * Invalidate all keys matching a pattern (e.g., "dashboard:*").
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (redisAvailable && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      }
      const memKeys = await memoryCache.keys(pattern);
      for (const k of memKeys) {
        await memoryCache.del(k);
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Flush all cache.
   */
  async flush(): Promise<void> {
    try {
      if (redisAvailable && redisClient) {
        await redisClient.flushDb();
      }
      await memoryCache.flush();
    } catch {
      // Ignore
    }
  },

  /**
   * Cache-aside helper: get from cache or compute and store.
   */
  async getOrSet<T>(key: string, compute: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await compute();
    await this.set(key, value, ttlSeconds);
    return value;
  },

  /** Check if Redis is connected */
  isRedisAvailable(): boolean {
    return redisAvailable;
  },
};

export default cache;
