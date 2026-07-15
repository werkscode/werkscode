import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { contactMessages } from '../db/schema'
import { notifyContactMessage } from '../utils/contact-notify'
import { useDb } from '../utils/db'
import { enforceRateLimit } from '../utils/rate-limit'

const contactSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email().max(255),
  message: z.string().min(1).max(5000),
  website: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { keyPrefix: 'contact' })

  const body = await readBody(event)
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid form data',
      data: z.flattenError(parsed.error),
    })
  }

  const { website, ...formData } = parsed.data

  if (website) {
    return { success: true }
  }

  const db = useDb()
  const [message] = await db
    .insert(contactMessages)
    .values(formData)
    .returning({
      id: contactMessages.id,
      createdAt: contactMessages.createdAt,
    })

  if (!message?.id || !message.createdAt) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save message',
    })
  }

  const emailSent = await notifyContactMessage({
    id: message.id,
    name: formData.name,
    email: formData.email,
    message: formData.message,
    createdAt: message.createdAt,
  })

  if (emailSent) {
    await db
      .update(contactMessages)
      .set({ emailSentAt: new Date() })
      .where(eq(contactMessages.id, message.id))
  }

  return {
    success: true,
    id: message.id,
  }
})
