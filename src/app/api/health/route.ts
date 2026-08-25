// ===== Zoxa — Health Check API =====
import { NextResponse } from 'next/server'
import { getHealthReport, getMetricsSummary } from '@/lib/infrastructure/health-score'
import { createLogger } from '@/lib/infrastructure/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const logger = createLogger(request)
  const start = Date.now()

  try {
    const force = new URL(request.url).searchParams.get('force') === 'true'
    const report = getHealthReport(force)

    const status = report.overall >= 80 ? 200 : report.overall >= 60 ? 200 : 503
    const headers: Record<string, string> = {
      'X-Health-Score': String(report.overall),
      'X-Health-Grade': report.grade,
      'X-Correlation-ID': logger.getCorrelationId(),
      'Cache-Control': 'no-store, must-revalidate',
    }

    logger.info('Health check', { score: report.overall, grade: report.grade, forced: force })

    return NextResponse.json(
      {
        status: status === 200 ? 'healthy' : 'degraded',
        score: report.overall,
        grade: report.grade,
        dimensions: report.dimensions,
        cached: report.cached,
        timestamp: report.timestamp,
        correlationId: logger.getCorrelationId(),
      },
      { status, headers }
    )
  } catch (err) {
    logger.error('Health check failed', String(err))
    return NextResponse.json(
      { status: 'error', score: 0, grade: 'F', error: 'Health check failed', correlationId: logger.getCorrelationId() },
      { status: 500, headers: { 'X-Correlation-ID': logger.getCorrelationId(), 'Cache-Control': 'no-store' } }
    )
  }
}

export async function POST(request: Request) {
  const logger = createLogger(request)
  const body = await request.json().catch(() => ({}))
  const action = body.action

  if (action === 'reset') {
    const { getHealthReport } = await import('@/lib/infrastructure/health-score')
    getHealthReport(true)
    return NextResponse.json({ status: 'reset', correlationId: logger.getCorrelationId() })
  }

  return NextResponse.json({ status: 'unknown action', correlationId: logger.getCorrelationId() }, { status: 400 })
}