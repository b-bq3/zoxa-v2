// ===== Zoxa Addons — Secure API Route =====

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { searchQuerySchema, addonQuerySchema } from '@/lib/schemas'

// Cache for stats (refresh every 60 seconds)
let statsCache: { addonsCount: number; totalDownloads: number; fetchedAt: number } | null = null
const STATS_CACHE_TTL = 60_000

// Rate limiting setup
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX = 60 // 60 requests per minute

function getRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const a = searchParams.get('a')
  const q = searchParams.get('q')

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!getRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  try {
    if (a === 'list') {
      // Validate query params
      const query = addonQuerySchema.safeParse({
        category: searchParams.get('category'),
        sort: searchParams.get('sort'),
        page: searchParams.get('page'),
        pageSize: searchParams.get('pageSize'),
      })

      if (!query.success) {
        return NextResponse.json(
          { error: 'Invalid query parameters', issues: query.error.issues },
          { status: 400 }
        )
      }

      const { page, pageSize, sort } = query.data

      let dbQuery = supabaseServer
        .from('addons')
        .select('id,name,description,version,mc_version,edition,image_url,file_url,file_size,downloads,rating,category,created_at', { count: 'exact' })

      // Sorting
      if (sort === 'popular') {
        dbQuery = dbQuery.order('downloads', { ascending: false })
      } else if (sort === 'downloads') {
        dbQuery = dbQuery.order('downloads', { ascending: false })
      } else {
        dbQuery = dbQuery.order('created_at', { ascending: false })
      }

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      dbQuery = dbQuery.range(from, to)

      const { data, count, error } = await dbQuery

      if (error) {
        console.error('Supabase list error:', error.message)
        return NextResponse.json({ data: [], error: 'Database error' }, { status: 500 })
      }

      // Resolve file URLs
      const resolvedData = (data || []).map((item) => ({
        ...item,
        file_url: item.file_url
          ? item.file_url.startsWith('http')
            ? item.file_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.file_url}`
          : null,
        image_url: item.image_url
          ? item.image_url.startsWith('http')
            ? item.image_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.image_url}`
          : null,
      }))

      return NextResponse.json({
        data: resolvedData,
        total: count || 0,
        page,
        pageSize,
      })

    } else if (a === 'search' && q) {
      // Validate search query
      const query = searchQuerySchema.safeParse({ q })
      if (!query.success) {
        return NextResponse.json(
          { error: 'Invalid search query', issues: query.error.issues },
          { status: 400 }
        )
      }

      const sanitizedQuery = query.data.q

      const { data, error } = await supabaseServer
        .from('addons')
        .select('id,name,description,version,mc_version,edition,image_url,file_url,file_size,downloads,rating,category,created_at')
        .ilike('name', `%${sanitizedQuery}%`)
        .order('created_at', { ascending: false })
        .limit(24)

      if (error) {
        console.error('Supabase search error:', error.message)
        return NextResponse.json({ data: [], error: 'Search error' }, { status: 500 })
      }

      const resolvedData = (data || []).map((item) => ({
        ...item,
        file_url: item.file_url
          ? item.file_url.startsWith('http')
            ? item.file_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.file_url}`
          : null,
        image_url: item.image_url
          ? item.image_url.startsWith('http')
            ? item.image_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.image_url}`
          : null,
      }))

      return NextResponse.json({ data: resolvedData })

    } else if (a === 'stats') {
      // Return cached stats if fresh
      const now = Date.now()
      if (statsCache && now - statsCache.fetchedAt < STATS_CACHE_TTL) {
        return NextResponse.json({
          addonsCount: statsCache.addonsCount,
          totalDownloads: statsCache.totalDownloads,
        })
      }

      // Fetch real stats from Supabase
      const { count: addonsCount, error: addonsError } = await supabaseServer
        .from('addons')
        .select('*', { count: 'exact', head: true })

      const { data: downloadsData, error: downloadsError } = await supabaseServer
        .from('addons')
        .select('downloads')

      if (addonsError || downloadsError) {
        console.error('Stats error:', addonsError?.message || downloadsError?.message)
        return NextResponse.json({ addonsCount: 0, totalDownloads: 0 })
      }

      const totalDownloads = (downloadsData || []).reduce(
        (sum, item) => sum + (item.downloads || 0),
        0
      )

      // Update cache
      statsCache = {
        addonsCount: addonsCount || 0,
        totalDownloads,
        fetchedAt: now,
      }

      return NextResponse.json({
        addonsCount: addonsCount || 0,
        totalDownloads,
      })

    } else if (a === 'download' && q) {
      // Validate download URL
      try {
        const url = new URL(q)
        // Only allow redirect to Supabase storage URLs
        if (!url.hostname.includes('supabase.co')) {
          return NextResponse.json({ error: 'Invalid download source' }, { status: 400 })
        }
        return NextResponse.redirect(q, 301)
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (e) {
    console.error('API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}