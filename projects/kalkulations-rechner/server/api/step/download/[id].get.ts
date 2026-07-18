import { z } from 'zod'

const uuidSchema = z.string().uuid()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const rawId = getRouterParam(event, 'id')

  if (!rawId) {
    throw createError({ statusCode: 400, message: 'Ungültige Modell-ID.' })
  }

  const id = rawId.replace(/\.glb$/i, '')
  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Ungültige Modell-ID.' })
  }

  const response = await fetch(`${config.stepConverterUrl}/api/models/${id}.glb`)

  if (!response.ok) {
    throw createError({ statusCode: response.status, message: 'Modell nicht gefunden.' })
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  setResponseHeader(event, 'content-type', 'model/gltf-binary')
  setResponseHeader(event, 'cache-control', 'private, max-age=3600')

  return buffer
})
