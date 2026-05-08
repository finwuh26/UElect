import { config } from '../config';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function get<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function set<T>(key: string, value: T, ttlSeconds?: number): void {
  const ttl = (ttlSeconds ?? config.CACHE_TTL_SECONDS) * 1000;
  store.set(key, { value, expiresAt: Date.now() + ttl });
}

export function clear(): void {
  store.clear();
}

export function del(key: string): void {
  store.delete(key);
}
