type CacheEntry<T> = {
  data: T;
  expiry: number;
};

// Singleton pattern for global cache in Next.js dev environment
// to prevent clearing on hot reloads
const globalForCache = global as unknown as {
  albionCache: Map<string, CacheEntry<unknown>>;
};

export const memoryCache = globalForCache.albionCache || new Map<string, CacheEntry<unknown>>();

if (process.env.NODE_ENV !== 'production') globalForCache.albionCache = memoryCache;

export const CACHE_TTL = 60 * 1000; // 60 seconds

export function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlMs: number = CACHE_TTL): void {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}
