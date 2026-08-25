import { NextResponse } from 'next/server'
import { createLogger } from '@/lib/infrastructure/logger'
import { getRateLimitStatus } from '@/lib/infrastructure/rate-limiter'
import { listAddons } from '@/lib/use-cases/queries/list-addons.query'
import { searchAddons } from '@/lib/use-cases/queries/search-addons.query'
import { getStats } from '@/lib/use-cases/queries/get-stats.query'
import { searchQuerySchema, addonQuerySchema, addonCreateSchema } from '@/lib/schemas'
import { recordRequest, recordCircuitBreaker } from '@/lib/infrastructure/health-score'
import { createClient } from '@supabase/supabase-js'
import { addonCache, statsCache } from '@/lib/infrastructure/cache'

const UPLOAD_TOKEN = 'z0x4-r4f3-s3cr3t'

export async function GET(request: Request) {
  const logger = createLogger(request)
  const start = Date.now()
  const { searchParams } = new URL(request.url)
  const a = searchParams.get('a')
  const q = searchParams.get('q')

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed, retryAfterMs } = getRateLimitStatus(ip)
  if (!allowed) {
    logger.warn('RL exceeded', { ip })
    recordRequest(false, Date.now() - start)
    return NextResponse.json({ error: 'Too many requests', retryAfter: Math.ceil(retryAfterMs / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)), 'X-Correlation-ID': logger.getCorrelationId() } })
  }

  try {
    if (a === 'list') {
      const qq = addonQuerySchema.safeParse({ category: searchParams.get('category'), sort: searchParams.get('sort'), page: searchParams.get('page'), pageSize: searchParams.get('pageSize') })
      if (!qq.success) { recordRequest(false, Date.now() - start); return NextResponse.json({ error: 'Invalid query', issues: qq.error.issues, ref: logger.getCorrelationId() }, { status: 400, headers: { 'X-Correlation-ID': logger.getCorrelationId() } }) }
      const r = await listAddons(qq.data.page, qq.data.pageSize, logger)
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ ...r, page: qq.data.page, pageSize: qq.data.pageSize })
    } else if (a === 'search' && q) {
      const qq = searchQuerySchema.safeParse({ q })
      if (!qq.success) { recordRequest(false, Date.now() - start); return NextResponse.json({ error: 'Invalid search', issues: qq.error.issues, ref: logger.getCorrelationId() }, { status: 400, headers: { 'X-Correlation-ID': logger.getCorrelationId() } }) }
      const d = await searchAddons(qq.data.q, 24, logger)
      recordRequest(true, Date.now() - start)
      return NextResponse.json({ data: d })
    } else if (a === 'stats') {
      const s = await getStats(logger)
      recordRequest(true, Date.now() - start)
      return NextResponse.json(s)
    } else if (a === 'download' && q) {
      try {
        const u = new URL(q)
        if (!u.hostname.includes('supabase.co')) { recordRequest(false, Date.now() - start); return NextResponse.json({ error: 'Invalid source', ref: logger.getCorrelationId() }, { status: 400 }) }
        recordRequest(true, Date.now() - start)
        return NextResponse.redirect(q, 301)
      } catch { recordRequest(false, Date.now() - start); return NextResponse.json({ error: 'Invalid URL', ref: logger.getCorrelationId() }, { status: 400 }) }
    } else {
      recordRequest(false, Date.now() - start)
      return NextResponse.json({ error: 'Invalid action', ref: logger.getCorrelationId() }, { status: 400 })
    }
  } catch (e) {
    logger.error('API error', e instanceof Error ? e.message : 'Unknown')
    recordRequest(false, Date.now() - start)
    recordCircuitBreaker('open')
    return NextResponse.json({ error: 'Internal error', ref: logger.getCorrelationId() }, { status: 500, headers: { 'X-Correlation-ID': logger.getCorrelationId() } })
  }
}

export async function POST(request: Request) {
  const logger = createLogger(request)
  const start = Date.now()
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed, retryAfterMs } = getRateLimitStatus(ip)
  if (!allowed) {
    recordRequest(false, Date.now() - start)
    return NextResponse.json({ error: 'Too many requests', retryAfter: Math.ceil(retryAfterMs / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)), 'X-Correlation-ID': logger.getCorrelationId() } })
  }

  try {
    const body = await request.json()
    const qq = addonCreateSchema.safeParse(body)
    if (!qq.success) {
      recordRequest(false, Date.now() - start)
      return NextResponse.json({ error: 'Invalid addon data', issues: qq.error.issues, ref: logger.getCorrelationId() }, { status: 400, headers: { 'X-Correlation-ID': logger.getCorrelationId() } })
    }

    const { tk, nm, ds, v, mv, ed, ct, im, fl, fs } = qq.data
    if (tk !== UPLOAD_TOKEN) {
      recordRequest(false, Date.now() - start)
      return NextResponse.json({ error: 'Invalid token', ref: logger.getCorrelationId() }, { status: 401, headers: { 'X-Correlation-ID': logger.getCorrelationId() } })
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error } = await sb.from('addons').insert({
      name: nm,
      description: ds,
      version: v,
      mc_version: mv,
      edition: ed,
      category: ct || null,
      image_url: im || null,
      file_url: fl || null,
      file_size: fs || null,
      downloads: 0,
    }).select('id').single()

    if (error) {
      logger.error('rf3 fshl', error.message, { body: { nm, v, mv } })
      recordRequest(false, Date.now() - start)
      return NextResponse.json({ error: 'Failed to create addon', detail: error.message, ref: logger.getCorrelationId() }, { status: 500, headers: { 'X-Correlation-ID': logger.getCorrelationId() } })
    }

    addonCache.clear()
    statsCache.clear()

    logger.info('rf3 nAjH', { id: data.id, nm })
    recordRequest(true, Date.now() - start)
    return NextResponse.json({ success: true, id: data.id, ref: logger.getCorrelationId() }, { status: 201, headers: { 'X-Correlation-ID': logger.getCorrelationId() } })
  } catch (e) {
    logger.error('rf3 estthnay', e instanceof Error ? e.message : 'Unknown')
    recordRequest(false, Date.now() - start)
    return NextResponse.json({ error: 'Internal error', ref: logger.getCorrelationId() }, { status: 500, headers: { 'X-Correlation-ID': logger.getCorrelationId() } })
  }
}