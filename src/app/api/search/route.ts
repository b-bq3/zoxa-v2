// ===== Zoxa — Search API =====
import { NextResponse } from 'next/server'
import { searchAddons } from '@/lib/db/neon'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const limit = parseInt(searchParams.get('limit') || '5')
  
  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }
  
  try {
    const results = await searchAddons(q, limit)
    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}