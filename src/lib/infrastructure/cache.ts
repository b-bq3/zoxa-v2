// ===== Zoxa — L1 Cache =====
interface E<T> { d: T; e: number; f: number; l: number }
export class LFUCache<T = unknown> {
  private s = new Map<string, E<T>>()
  constructor(private m = 100, private ttl = 120_000) {}
  get(k: string): T | null {
    const e = this.s.get(k)
    if (!e) return null
    if (Date.now() > e.e) { this.s.delete(k); return null }
    e.f++; e.l = Date.now()
    return e.d
  }
  set(k: string, d: T, t?: number) {
    if (this.s.size >= this.m) this.evict()
    this.s.set(k, { d, e: Date.now() + (t ?? this.ttl), f: 1, l: Date.now() })
  }
  private evict() {
    let lf = Infinity, oa = Infinity, k: string | null = null
    for (const [key, e] of this.s) {
      if (e.f < lf || (e.f === lf && e.l < oa)) { lf = e.f; oa = e.l; k = key }
    }
    if (k) this.s.delete(k)
  }
  clear() { this.s.clear() }
}
export const addonCache = new LFUCache<any>(100, 120_000)
export const statsCache = new LFUCache<any>(5, 60_000)