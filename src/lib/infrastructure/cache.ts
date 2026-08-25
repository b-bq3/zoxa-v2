// ===== Zoxa Addons — Caching Layer (L1 + L2 ready) =====

interface CacheEntry<T> { data: T; expiresAt: number; frequency: number; lastAccess: number }

export class LFUCache<T = unknown> {
  private store = new Map<string, CacheEntry<T>>()
  constructor(private maxSize = 50, private defaultTTLMs = 60_000) {}

  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null }
    entry.frequency++; entry.lastAccess = Date.now()
    return entry.data
  }

  set(key: string, data: T, ttlMs?: number): void {
    if (this.store.size >= this.maxSize) this.evict()
    this.store.set(key, { data, expiresAt: Date.now() + (ttlMs ?? this.defaultTTLMs), frequency: 1, lastAccess: Date.now() })
  }

  private evict(): void {
    let lowestFreq = Infinity, oldestAccess = Infinity, keyToEvict: string | null = null
    for (const [key, entry] of this.store) {
      if (entry.frequency < lowestFreq || (entry.frequency === lowestFreq && entry.lastAccess < oldestAccess))
        { lowestFreq = entry.frequency; oldestAccess = entry.lastAccess; keyToEvict = key }
    }
    if (keyToEvict) this.store.delete(keyToEvict)
  }
  clear(): void { this.store.clear() }
}

export const addonCache = new LFUCache<any>(50, 60_000)
export const statsCache = new LFUCache<any>(5, 60_000)