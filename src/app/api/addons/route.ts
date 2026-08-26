// ===== Zoxa — Addons API =====
import { NextResponse } from 'next/server'
import { getAllAddons } from '@/lib/db/neon'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  try {
    const addons = await getAllAddons(limit, offset)
    return NextResponse.json(addons)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}