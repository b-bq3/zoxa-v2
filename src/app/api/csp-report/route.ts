// ===== Zoxa Addons — CSP Report Endpoint =====

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const report = await request.json()
    console.log('CSP Violation:', JSON.stringify(report, null, 2))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid report' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}