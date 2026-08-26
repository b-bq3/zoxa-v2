// ===== Zoxa — Site API =====
import { NextResponse } from 'next/server'
import {
  getAllAddons,
  searchAddons,
  getStats,
  recordDownload,
  getAddon,
} from '@/lib/db/neon'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('a')
    const query = searchParams.get('q')

    if (action === 'list') {
      const data = await getAllAddons(50, 0)
      return NextResponse.json({
        success: true,
        data,
      })
    }

    if (action === 'search' && query) {
      const data = await searchAddons(query, 20)
      return NextResponse.json({
        success: true,
        data,
      })
    }

    if (action === 'stats') {
      const stats = await getStats()
      return NextResponse.json({
        success: true,
        ...stats,
      })
    }

    if (action === 'addon' && query) {
      const addon = await getAddon(parseInt(query))
      if (!addon) {
        return NextResponse.json(
          { success: false, error: 'Addon not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        data: addon,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { addonId, download } = body

    if (download && addonId) {
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      const userAgent = request.headers.get('user-agent') || ''
      await recordDownload(addonId, ip, userAgent)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
