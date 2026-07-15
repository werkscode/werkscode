import { desc } from 'drizzle-orm'
import { z } from 'zod'
import { contactMessages } from '../../db/schema'
import { requireAdminAuth } from '../../utils/admin-auth'
import { useDb } from '../../utils/db'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const query = getQuery(event)
  const parsed = querySchema.safeParse(query)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query',
      data: z.flattenError(parsed.error),
    })
  }

  const { limit, offset } = parsed.data
  const db = useDb()

  const messages = await db
    .select({
      id: contactMessages.id,
      name: contactMessages.name,
      email: contactMessages.email,
      message: contactMessages.message,
      readAt: contactMessages.readAt,
      emailSentAt: contactMessages.emailSentAt,
      createdAt: contactMessages.createdAt,
    })
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    messages,
    limit,
    offset,
  }
})
