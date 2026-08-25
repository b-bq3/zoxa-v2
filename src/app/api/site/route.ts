import { NextResponse } from 'next/server'
import { createLogger } from '@/lib/infrastructure/logger'
import { getRateLimitStatus } from '@/lib/infrastructure/rate-limiter'
import { listAddons } from '@/lib/use-cases/queries/list-addons.query'
import { searchAddons } from '@/lib/use-cases/queries/search-addons.query'
import { getStats } from '@/lib/use-cases/queries/get-stats.query'
import { searchQuerySchema, addonQuerySchema } from '@/lib/schemas'

export async function GET(request: Request) {
  const logger = createLogger(request)
  const { searchParams } = new URL(request.url)
  const a = searchParams.get('a')
  const q = searchParams.get('q')

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed, retryAfterMs } = getRateLimitStatus(ip)
  if (!allowed) {
    logger.warn('Rate limit exceeded', { ip })
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil(retryAfterMs / 1000) },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)), 'X-Correlation-ID': logger.getCorrelationId() },
      }
    )
  }

  try {
    if (a === 'list') {
      const query = addonQuerySchema.safeParse({
        category: searchParams.get('category'),
        sort: searchParams.get('sort'),
        page: searchParams.get('page'),
        pageSize: searchParams.get('pageSize'),
      })
      if (!query.success) {
        return NextResponse.json({ error: 'Invalid query', issues: query.error.issues, ref: logger.getCorrelationId() }, { status: 400, headers: { 'X-Correlation-ID': logger.getCorrelationId() } })
      }
      const { page, pageSize } = query.data
      const result = await listAddons(page, pageSize, logger)
      return NextResponse.json({ ...result, page, pageSize })
    } else if (a === 'search' && q) {
      const query = searchQuerySchema.safeParse({ q })
      if (!query.success) {
        return NextResponse.json({ error: 'Invalid search', issues: query.error.issues, ref: logger.getCorrelationId() }, { status: 400, headers: { 'X-Correlation-ID': logger.getCorrelationId() } })
      }
      const data = await searchAddons(query.data.q, 24, logger)
      return NextResponse.json({ data })
    } else if (a === 'stats') {
      const stats = await getStats(logger)
      return NextResponse.json(stats)
    } else if (a === 'download' && q) {
      try {
        const url = new URL(q)
        if (!url.hostname.includes('supabase.co')) return NextResponse.json({ error: 'Invalid source', ref: logger.getCorrelationId() }, { status: 400 })
        return NextResponse.redirect(q, 301)
      } catch {
        return NextResponse.json({ error: 'Invalid URL', ref: logger.getCorrelationId() }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid action', ref: logger.getCorrelationId() }, { status: 400 })
    }
  } catch (e) {
    logger.error('API error', e instanceof Error ? e.message : 'Unknown')
    return NextResponse.json({ error: 'Internal error', ref: logger.getCorrelationId() }, { status: 500, headers: { 'X-Correlation-ID': logger.getCorrelationId() } })
  }
}