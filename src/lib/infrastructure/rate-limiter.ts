// ===== Zoxa Addons — Adaptive Rate Limiter =====

import { Logger } from './logger'

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  penaltyBlockDuration: number // ms
}

interface RateLimitEntry {
  count: number
  resetAt: number
  penaltyExpiresAt: number
  consecutiveErrors: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000, // 1 minute
  maxRequests: 60,
  penaltyBlockDuration: 300_000, // 5 minutes
}

const CONFIG_BY_STATUS: Record<number, RateLimitConfig> = {
  401: { windowMs: 60_000, maxRequests: 20, penaltyBlockDuration: 600_000 }, // 10 min
  429: { windowMs: 60_000, maxRequests: 10, penaltyBlockDuration: 300_000 }, // 5 min
  403: { windowMs: 60_000, maxRequests: 5, penaltyBlockDuration: 600_000 },  // 10 min
}

// In-memory store (will be replaced with Vercel KV in Phase 3)
const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt && now > entry.penaltyExpiresAt) {
      store.delete(key)
    }
  }
}, 300_000)

export function getRateLimitStatus(
  ip: string,
  statusCode?: number
): { allowed: boolean; retryAfterMs: number; remaining: number } {
  const now = Date.now()
  const config = statusCode && CONFIG_BY_STATUS[statusCode] ? CONFIG_BY_STATUS[statusCode] : DEFAULT_CONFIG

  let entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
      penaltyExpiresAt: 0,
      consecutiveErrors: 0,
    }
    store.set(ip, entry)
    return { allowed: true, retryAfterMs: 0, remaining: config.maxRequests - 1 }
  }

  // Check if penalty is active
  if (entry.penaltyExpiresAt > now) {
    return {
      allowed: false,
      retryAfterMs: entry.penaltyExpiresAt - now,
      remaining: 0,
    }
  }

  // Adaptive: increase penalty on consecutive errors
  if (statusCode && statusCode >= 400) {
    entry.consecutiveErrors++
    if (entry.consecutiveErrors >= 3) {
      entry.penaltyExpiresAt = now + 600_000 // 10 min block
      return {
        allowed: false,
        retryAfterMs: 600_000,
        remaining: 0,
      }
    }
  } else {
    entry.consecutiveErrors = Math.max(0, entry.consecutiveErrors - 1)
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      retryAfterMs: entry.resetAt - now,
      remaining: 0,
    }
  }

  entry.count++
  return { allowed: true, retryAfterMs: 0, remaining: config.maxRequests - entry.count }
}

export function recordError(ip: string, statusCode: number): void {
  const entry = store.get(ip)
  if (entry) {
    entry.consecutiveErrors++
  }
}