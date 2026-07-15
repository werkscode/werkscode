import type { H3Event } from 'h3'

export function requireAdminAuth(event: H3Event): void {
  const config = useRuntimeConfig()
  const expected = config.contactAdminToken

  if (!expected) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service unavailable',
    })
  }

  const authorization = getHeader(event, 'authorization')

  if (authorization !== `Bearer ${expected}`) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
}
