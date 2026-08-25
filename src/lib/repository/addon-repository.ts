// ===== Zoxa Addons — Repository Layer (no service_role) =====

import { createClient } from '@supabase/supabase-js'
import type { AddonRow } from '@/types'
import { Logger } from '@/lib/infrastructure/logger'
import { addonCache, statsCache } from '@/lib/infrastructure/cache'
import { isCircuitBreakerOpen, recordFailure, recordSuccess } from '@/lib/infrastructure/circuit-breaker'

export class AddonRepository {
  private client

  constructor() {
    // ⚠️ anon key فقط — service_role ممنوع تماماً
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  }

  async listRecent(limit = 6, logger?: Logger): Promise<AddonRow[]> {
    const cacheKey = `recent:${limit}`
    const cached = addonCache.get(cacheKey)
    if (cached) return cached

    if (isCircuitBreakerOpen('supabase')) {
      logger?.warn('Circuit breaker open for listRecent, returning empty')
      return []
    }

    const start = performance.now()
    const { data, error } = await this.client
      .rpc('get_recent_addons', { limit_count: limit })

    if (error) {
      recordFailure('supabase', logger)
      logger?.error('listRecent failed', error.message, { durationMs: performance.now() - start })
      return []
    }
    recordSuccess('supabase')
    logger?.info('listRecent success', { durationMs: performance.now() - start, count: data?.length })
    addonCache.set(cacheKey, data || [])
    return (data || []) as AddonRow[]
  }

  async listAll(limit = 50, logger?: Logger): Promise<AddonRow[]> {
    const cacheKey = `all:${limit}`
    const cached = addonCache.get(cacheKey)
    if (cached) return cached

    if (isCircuitBreakerOpen('supabase')) {
      logger?.warn('Circuit breaker open for listAll, returning empty')
      return []
    }

    const start = performance.now()
    const { data, error } = await this.client
      .rpc('get_all_addons', { limit_count: limit })

    if (error) {
      recordFailure('supabase', logger)
      logger?.error('listAll failed', error.message, { durationMs: performance.now() - start })
      return []
    }
    recordSuccess('supabase')
    logger?.info('listAll success', { durationMs: performance.now() - start, count: data?.length })
    addonCache.set(cacheKey, data || [])
    return (data || []) as AddonRow[]
  }

  async search(query: string, maxResults = 24, logger?: Logger): Promise<AddonRow[]> {
    const cacheKey = `search:${query}:${maxResults}`
    const cached = addonCache.get(cacheKey)
    if (cached) return cached

    if (isCircuitBreakerOpen('supabase')) {
      logger?.warn('Circuit breaker open for search, returning empty')
      return []
    }

    const start = performance.now()
    // Escape LIKE special chars
    const escaped = query.replace(/[%_\\]/g, '\\$&')
    const { data, error } = await this.client
      .rpc('search_addons', { search_query: escaped, max_results: maxResults })

    if (error) {
      recordFailure('supabase', logger)
      logger?.error('search failed', error.message, { query, durationMs: performance.now() - start })
      return []
    }
    recordSuccess('supabase')
    logger?.info('search success', { durationMs: performance.now() - start, count: data?.length })
    addonCache.set(cacheKey, data || [], 30_000) // search cache shorter
    return (data || []) as AddonRow[]
  }

  async getStats(logger?: Logger): Promise<{ addonsCount: number; totalDownloads: number }> {
    const cached = statsCache.get('stats')
    if (cached) return cached

    if (isCircuitBreakerOpen('supabase')) {
      logger?.warn('Circuit breaker open for getStats, returning cached')
      return { addonsCount: 0, totalDownloads: 0 }
    }

    const start = performance.now()
    const { data, error } = await this.client
      .rpc('get_stats')

    if (error) {
      recordFailure('supabase', logger)
      logger?.error('getStats failed', error.message, { durationMs: performance.now() - start })
      return { addonsCount: 0, totalDownloads: 0 }
    }
    recordSuccess('supabase')
    logger?.info('getStats success', { durationMs: performance.now() - start })
    statsCache.set('stats', data?.[0] || { addonsCount: 0, totalDownloads: 0 })
    return data?.[0] || { addonsCount: 0, totalDownloads: 0 }
  }
}

export const addonRepo = new AddonRepository()