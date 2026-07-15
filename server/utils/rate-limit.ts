import type { H3Event } from 'h3'

type RateLimitEntry = {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count += 1
  return true
}

export function enforceRateLimit(
  event: H3Event,
  options: { limit?: number, windowMs?: number, keyPrefix?: string } = {},
): void {
  const { limit = 5, windowMs = 15 * 60 * 1000, keyPrefix = 'default' } = options
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const key = `${keyPrefix}:${ip}`

  if (!checkRateLimit(key, limit, windowMs)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
    })
  }
}
