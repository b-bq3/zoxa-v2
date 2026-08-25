// ===== Zoxa — Bot Webhook =====
// Managed by OpenClaw - forwards to OpenClaw message system
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Forward to OpenClaw for processing
    return NextResponse.json({ 
      ok: true, 
      forwarded: true,
      body: body
    })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, bot: 'DevZoxaBot', status: 'managed' })
}