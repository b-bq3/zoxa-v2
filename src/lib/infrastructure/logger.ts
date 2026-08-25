// ===== Zoxa Addons — Structured Logger with Correlation ID =====

import { randomUUID } from 'crypto'

export type LogLevel = 'info' | 'warn' | 'error' | 'audit'

export interface LogEntry {
  timestamp: string // ISO 8601 with microsecond precision
  level: LogLevel
  service: string
  correlationId: string
  userId?: string
  sessionId?: string
  message: string
  error?: string
  durationMs?: number
  metadata?: Record<string, unknown>
}

const REDACTED_FIELDS = new Set(['password', 'token', 'secret', 'key', 'authorization', 'cookie'])

function redactSensitive(meta: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta)) {
    if (REDACTED_FIELDS.has(key.toLowerCase())) {
      redacted[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value as Record<string, unknown>)
    } else {
      redacted[key] = value
    }
  }
  return redacted
}

export class Logger {
  private correlationId: string

  constructor(correlationId?: string) {
    this.correlationId = correlationId || randomUUID()
  }

  getCorrelationId(): string {
    return this.correlationId
  }

  private log(level: LogLevel, message: string, entry?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'service' | 'correlationId' | 'message'>>): void {
    const now = new Date()
    const micros = String(now.getMilliseconds() * 1000).padStart(6, '0')
    const timestamp = now.toISOString().replace('Z', `${micros}Z`)

    const logLine: LogEntry = {
      timestamp,
      level,
      service: 'zoxa-api',
      correlationId: this.correlationId,
      message,
      ...entry,
      metadata: entry?.metadata ? redactSensitive(entry.metadata) : undefined,
    }

    // stdout — piped to Logtail / Signoz / filebeat
    process.stdout.write(JSON.stringify(logLine) + '\n')
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, { metadata: meta })
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, { metadata: meta })
  }

  error(message: string, error?: string, meta?: Record<string, unknown>): void {
    this.log('error', message, { error, metadata: meta })
  }

  audit(userId: string, action: string, reason: string, meta?: Record<string, unknown>): void {
    this.log('audit', `Audit: ${action}`, {
      userId,
      metadata: { action, reason, ...meta },
    })
  }
}

// Factory: create a logger from a request (with optional Correlation ID header)
export function createLogger(request?: Request): Logger {
  const correlationId = request?.headers?.get('X-Correlation-ID') || randomUUID()
  return new Logger(correlationId)
}