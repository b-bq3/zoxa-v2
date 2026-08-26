// ===== Zoxa — Database Init API =====
import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Check authorization header
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.ADMIN_SECRET_KEY || 'admin-secret-key'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting database initialization...')
    const result = await initializeDatabase()
    
    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Init error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Database initialization failed',
        details: error.detail || error.toString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST with authorization header to initialize database',
    endpoint: '/api/db-init',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_ADMIN_SECRET_KEY',
      'Content-Type': 'application/json'
    }
  })
}
