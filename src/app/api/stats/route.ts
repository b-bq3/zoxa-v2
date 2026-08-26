// ===== Zoxa — Stats API =====
import { NextResponse } from 'next/server'
import { getStats } from '@/lib/db/neon'

export async function GET() {
  try {
    const stats = await getStats()
    return NextResponse.json(stats)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}