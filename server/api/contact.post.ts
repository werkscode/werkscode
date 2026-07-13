import { z } from 'zod'
import { contactMessages } from '../db/schema'
import { useDb } from '../utils/db'

const contactSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email().max(255),
  message: z.string().min(1).max(5000),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid form data',
      data: parsed.error.flatten(),
    })
  }

  const db = useDb()
  const [message] = await db
    .insert(contactMessages)
    .values(parsed.data)
    .returning({ id: contactMessages.id })

  return {
    success: true,
    id: message?.id,
  }
})
