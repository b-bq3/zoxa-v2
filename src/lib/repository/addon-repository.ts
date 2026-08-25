// ===== Zoxa — Repo (Cached + CB) =====
import { createClient } from '@supabase/supabase-js'
import type { AddonRow } from '@/types'
import { Logger } from '@/lib/infrastructure/logger'
import { addonCache, statsCache } from '@/lib/infrastructure/cache'
import { isCircuitBreakerOpen, recordFailure, recordSuccess } from '@/lib/infrastructure/circuit-breaker'

export class AddonRepository {
  private c
  constructor() {
    this.c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
  }
  async listRecent(limit = 6, log?: Logger): Promise<AddonRow[]> {
    const k = `r:${limit}`; const cached = addonCache.get(k)
    if (cached) return cached
    if (isCircuitBreakerOpen('supabase')) { log?.warn('CB open'); return [] }
    const s = performance.now()
    const { data, error } = await this.c.rpc('get_recent_addons', { limit_count: limit })
    if (error) { recordFailure('supabase', log); log?.error('listRecent', error.message, { ms: performance.now() - s }); return [] }
    recordSuccess('supabase'); addonCache.set(k, data || []); return (data || []) as AddonRow[]
  }
  async listAll(limit = 50, log?: Logger): Promise<AddonRow[]> {
    const k = `a:${limit}`; const cached = addonCache.get(k)
    if (cached) return cached
    if (isCircuitBreakerOpen('supabase')) { log?.warn('CB open'); return [] }
    const s = performance.now()
    const { data, error } = await this.c.rpc('get_all_addons', { limit_count: limit })
    if (error) { recordFailure('supabase', log); log?.error('listAll', error.message, { ms: performance.now() - s }); return [] }
    recordSuccess('supabase'); addonCache.set(k, data || []); return (data || []) as AddonRow[]
  }
  async search(q: string, max = 24, log?: Logger): Promise<AddonRow[]> {
    const k = `s:${q}:${max}`; const cached = addonCache.get(k)
    if (cached) return cached
    if (isCircuitBreakerOpen('supabase')) { log?.warn('CB open'); return [] }
    const s = performance.now()
    const { data, error } = await this.c.rpc('search_addons', { search_query: q.replace(/[%_\\]/g, '\\$&'), max_results: max })
    if (error) { recordFailure('supabase', log); log?.error('search', error.message, { ms: performance.now() - s }); return [] }
    recordSuccess('supabase'); addonCache.set(k, data || [], 30_000); return (data || []) as AddonRow[]
  }
  async getStats(log?: Logger): Promise<{ addonsCount: number; totalDownloads: number }> {
    const cached = statsCache.get('stats')
    if (cached) return cached
    if (isCircuitBreakerOpen('supabase')) { log?.warn('CB open'); return { addonsCount: 0, totalDownloads: 0 } }
    const s = performance.now()
    const { data, error } = await this.c.rpc('get_stats')
    if (error) { recordFailure('supabase', log); log?.error('getStats', error.message, { ms: performance.now() - s }); return { addonsCount: 0, totalDownloads: 0 } }
    recordSuccess('supabase'); statsCache.set('stats', data?.[0] || { addonsCount: 0, totalDownloads: 0 }); return data?.[0] || { addonsCount: 0, totalDownloads: 0 }
  }
}
export const addonRepo = new AddonRepository()