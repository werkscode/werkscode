import { eq } from 'drizzle-orm'
import { contactMessages } from '../../../db/schema'
import { requireAdminAuth } from '../../../utils/admin-auth'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request',
    })
  }

  const db = useDb()
  const [message] = await db
    .update(contactMessages)
    .set({ readAt: new Date() })
    .where(eq(contactMessages.id, id))
    .returning({
      id: contactMessages.id,
      readAt: contactMessages.readAt,
    })

  if (!message) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    })
  }

  return {
    success: true,
    id: message.id,
    readAt: message.readAt,
  }
})
