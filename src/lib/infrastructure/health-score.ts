// ===== Zoxa — Health Score & Observability =====
// 5 أبعاد: Availability, Latency, Error Rate, Cache Health, Circuit Breaker

import { addonCache, statsCache } from './cache'

export interface HealthDimension {
  score: number
  weight: number
  label: string
  detail: string
}

export interface HealthReport {
  overall: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  dimensions: HealthDimension[]
  timestamp: string
  cached: boolean
}

let lastReport: HealthReport | null = null
let lastReportTime = 0
const CACHE_TTL = 30_000

const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalLatencyMs: 0,
  slowRequests: 0,
  circuitBreakerOpens: 0,
  circuitBreakerHalves: 0,
}

export function recordRequest(success: boolean, latencyMs: number): void {
  metrics.totalRequests++
  if (success) metrics.successfulRequests++
  else metrics.failedRequests++
  metrics.totalLatencyMs += latencyMs
  if (latencyMs > 1000) metrics.slowRequests++
}

export function recordCircuitBreaker(type: 'open' | 'half-open'): void {
  if (type === 'open') metrics.circuitBreakerOpens++
  else metrics.circuitBreakerHalves++
}

function getAvailabilityScore(): HealthDimension {
  const total = metrics.totalRequests || 1
  const rate = metrics.successfulRequests / total
  return { score: Math.round(rate * 100), weight: 0.30, label: 'Availability', detail: `${metrics.successfulRequests}/${total} (${Math.round(rate*100)}%)` }
}

function getLatencyScore(): HealthDimension {
  const total = metrics.totalRequests || 1
  const avg = total > 0 ? metrics.totalLatencyMs / total : 0
  const slow = metrics.slowRequests / total
  let s = 100
  if (avg > 500) s -= 15
  if (avg > 1000) s -= 25
  if (slow > 0.1) s -= 20
  if (slow > 0.3) s -= 30
  return { score: Math.max(0, s), weight: 0.25, label: 'Latency', detail: `Avg ${Math.round(avg)}ms, Slow ${metrics.slowRequests}` }
}

function getErrorRateScore(): HealthDimension {
  const total = metrics.totalRequests || 1
  const rate = metrics.failedRequests / total
  let s = 100
  if (rate > 0.01) s -= 10
  if (rate > 0.05) s -= 25
  if (rate > 0.10) s -= 40
  if (rate > 0.25) s -= 50
  return { score: Math.max(0, s), weight: 0.20, label: 'Error Rate', detail: `${metrics.failedRequests} errors (${Math.round(rate*100)}%)` }
}

function getCacheHealthScore(): HealthDimension {
  const addonSize = (addonCache as any).s?.size ?? 0
  const statsSize = (statsCache as any).s?.size ?? 0
  const total = addonSize + statsSize
  let s = 50
  if (total > 0) s += 20
  if (total > 10) s += 15
  if (total > 50) s += 15
  return { score: Math.min(100, s), weight: 0.15, label: 'Cache Health', detail: `${addonSize} addons, ${statsSize} stats cached` }
}

function getCircuitBreakerScore(): HealthDimension {
  const o = metrics.circuitBreakerOpens
  const h = metrics.circuitBreakerHalves
  let s = 100
  if (o > 0) s -= 20 * o
  if (h > 5) s -= 10
  return { score: Math.max(0, s), weight: 0.10, label: 'Circuit Breaker', detail: `Opens ${o}, Half-opens ${h}` }
}

function getGrade(score: number): HealthReport['grade'] {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function getHealthReport(force = false): HealthReport {
  const now = Date.now()
  if (!force && lastReport && now - lastReportTime < CACHE_TTL) return { ...lastReport, cached: true }

  const dims = [getAvailabilityScore(), getLatencyScore(), getErrorRateScore(), getCacheHealthScore(), getCircuitBreakerScore()]
  const overall = Math.round(dims.reduce((s, d) => s + d.score * d.weight, 0))

  lastReport = { overall, grade: getGrade(overall), dimensions: dims, timestamp: new Date().toISOString(), cached: false }
  lastReportTime = now
  return { ...lastReport }
}

export function getMetricsSummary(): string {
  const r = getHealthReport()
  return [`Health: ${r.overall}/100 (${r.grade})`, ...r.dimensions.map(d => `  ${d.label}: ${d.score}/100 [${d.detail}]`)].join('\n')
}