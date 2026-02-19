/**
 * Smart Response Cache - Issue #8
 * Caches repeated responses with TTL to reduce API costs and improve response time
 */

interface CacheEntry {
  query: string;
  normalizedQuery: string;
  response: string;
  timestamp: number;
  expiresAt: number;
  metadata: {
    toolsUsed: string[];
    incidentsAnalyzed: number;
    responseSource: 'ai' | 'fallback' | 'cache';
  };
}

export class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(ttlMinutes: number = 30, maxSize: number = 1000) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.maxSize = maxSize;
    
    // Clean expired entries every 5 minutes
    setInterval(() => this.cleanExpired(), 5 * 60 * 1000);
  }

  /**
   * Normalize query to improve cache hit rate
   * - Convert to lowercase
   * - Remove extra whitespace
   * - Remove common Arabic filler words
   * - Standardize numbers
   */
  private normalizeQuery(query: string): string {
    let normalized = query.toLowerCase().trim();
    
    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ');
    
    // Remove common Arabic filler words that don't affect meaning
    const fillerWords = ['من فضلك', 'لو سمحت', 'ممكن', 'أريد', 'عطني', 'أعطني'];
    fillerWords.forEach(word => {
      normalized = normalized.replace(new RegExp(word, 'gi'), '');
    });
    
    // Standardize numbers (Arabic to English)
    const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    arabicNums.forEach((num, idx) => {
      normalized = normalized.replace(new RegExp(num, 'g'), idx.toString());
    });
    
    return normalized.trim();
  }

  /**
   * Get cached response if available and not expired
   */
  get(query: string): CacheEntry | null {
    const normalized = this.normalizeQuery(query);
    const entry = this.cache.get(normalized);
    
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(normalized);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return entry;
  }

  /**
   * Store response in cache
   */
  set(
    query: string,
    response: string,
    metadata: CacheEntry['metadata']
  ): void {
    const normalized = this.normalizeQuery(query);
    
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    const now = Date.now();
    this.cache.set(normalized, {
      query,
      normalizedQuery: normalized,
      response,
      timestamp: now,
      expiresAt: now + this.ttlMs,
      metadata,
    });
  }

  /**
   * Invalidate all cached entries (e.g., when data updates)
   */
  invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Invalidate entries containing specific keywords
   */
  invalidateByKeywords(keywords: string[]): void {
    const normalizedKeywords = keywords.map(k => k.toLowerCase());
    
    for (const [key, entry] of this.cache.entries()) {
      const hasKeyword = normalizedKeywords.some(
        keyword => entry.normalizedQuery.includes(keyword)
      );
      if (hasKeyword) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Remove expired entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest entry when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + '%',
      ttlMinutes: this.ttlMs / (60 * 1000),
    };
  }
}

// Singleton instance
export const responseCache = new ResponseCache(30, 1000);
