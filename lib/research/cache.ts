type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const searchCache = new Map<string, CacheEntry<unknown>>();
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 30; // polite per-user searches / minute

export function getCached<T>(key: string): T | null {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    searchCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  searchCache.set(key, { value, expiresAt: Date.now() + ttlMs });
  // Bound memory: drop oldest when oversized
  if (searchCache.size > 200) {
    const first = searchCache.keys().next().value;
    if (first) searchCache.delete(first);
  }
}

export function checkRateLimit(userKey: string): {
  allowed: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  const bucket = rateBuckets.get(userKey);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(userKey, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (bucket.count >= RATE_LIMIT) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}
