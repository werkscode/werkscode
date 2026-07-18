import { z } from 'zod'
import type { StepFace } from '#shared/types/step-model'

const uuidSchema = z.string().uuid()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const rawId = getRouterParam(event, 'id')

  if (!rawId) {
    throw createError({ statusCode: 400, message: 'Ungültige Modell-ID.' })
  }

  const id = rawId.replace(/\.json$/i, '')
  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Ungültige Modell-ID.' })
  }

  try {
    const faces = await $fetch<StepFace[]>(`${config.stepConverterUrl}/api/models/${id}/faces.json`)
    setResponseHeader(event, 'cache-control', 'private, max-age=3600')
    return faces
  }
  catch {
    throw createError({ statusCode: 404, message: 'Flächendaten nicht gefunden.' })
  }
})
