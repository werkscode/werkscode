import { savePowderCoatingSetup } from '../../domain/powder-coating/catalog-repository'
import { powderCoatingSetupSchema } from '../../domain/powder-coating/setup-schema'
import { getPool } from '../../db/pool'

export default defineEventHandler(async (event) => {
  requirePersistence()
  const body = await readBody(event)
  const parsed = powderCoatingSetupSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ungültige Einstellungen',
      data: parsed.error.flatten(),
    })
  }

  const pool = getPool()
  return savePowderCoatingSetup(pool, parsed.data)
})
