// ===== Zoxa — Addon API =====
import { NextResponse } from 'next/server'
import { createAddon } from '@/lib/db/neon'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const addon = await createAddon(data)
    return NextResponse.json(addon)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}