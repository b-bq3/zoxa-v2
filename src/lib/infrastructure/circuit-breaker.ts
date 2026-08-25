// ===== Zoxa Addons — Circuit Breaker for Supabase =====

import { Logger } from './logger'

interface CircuitState {
  failures: number
  lastFailureAt: number
  state: 'closed' | 'open' | 'half-open'
}

const store = new Map<string, CircuitState>()

const THRESHOLD = 3 // failures before open
const OPEN_TIMEOUT = 10_000 // 10s before half-open
const HALF_OPEN_TIMEOUT = 60_000 // 60s before full open again

export function isCircuitBreakerOpen(service: string): boolean {
  const now = Date.now()
  const state = store.get(service)

  if (!state) return false

  if (state.state === 'open' && now - state.lastFailureAt > OPEN_TIMEOUT) {
    state.state = 'half-open'
    return false
  }

  if (state.state === 'half-open' && now - state.lastFailureAt > HALF_OPEN_TIMEOUT) {
    state.state = 'closed'
    state.failures = 0
    return false
  }

  return state.state === 'open'
}

export function recordFailure(service: string, logger?: Logger): void {
  const now = Date.now()
  let state = store.get(service)

  if (!state) {
    state = { failures: 1, lastFailureAt: now, state: 'closed' }
    store.set(service, state)
    return
  }

  state.failures++
  state.lastFailureAt = now

  if (state.failures >= THRESHOLD) {
    state.state = 'open'
    logger?.warn('Circuit breaker opened', { service, failures: state.failures })
  }
}

export function recordSuccess(service: string): void {
  const state = store.get(service)
  if (state) {
    state.failures = 0
    state.state = 'closed'
  }
}