/**
 * İki katmanlı cache: bellek + localStorage (TTL destekli).
 * Amaç: gereksiz API çağrısını engellemek (Overpass/Nominatim rate limit)
 * ve mobil performansı artırmak. localStorage erişilemezse (private mode)
 * sessizce sadece bellek cache kullanılır.
 */

interface CacheEntry<T> {
  v: T;
  e: number; // expiry epoch ms
}

const MEM = new Map<string, CacheEntry<unknown>>();
const PREFIX = "ngv1:cache:";

function readLS(key: string): CacheEntry<unknown> | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as CacheEntry<unknown>) : null;
  } catch {
    return null;
  }
}

function writeLS(key: string, entry: CacheEntry<unknown>) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* kota dolu veya erişilemez — sorun değil */
  }
}

export function cacheGet<T>(key: string): T | null {
  const now = Date.now();
  const mem = MEM.get(key);
  if (mem && mem.e > now) return mem.v as T;
  const ls = readLS(key);
  if (ls && ls.e > now) {
    MEM.set(key, ls);
    return ls.v as T;
  }
  return null;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number) {
  const entry: CacheEntry<T> = { v: value, e: Date.now() + ttlMs };
  MEM.set(key, entry);
  writeLS(key, entry);
}

/** cache → stale-fallback → fn akışı: cache varsa ağa hiç gitmez. */
export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await fn();
  cacheSet(key, value, ttlMs);
  return value;
}
