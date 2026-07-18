import { calculatePowderCoatingQuote } from '../../domain/powder-coating/calculate'
import { loadPowderCoatingCatalog } from '../../domain/powder-coating/catalog-repository'
import { createPowderCoatingInputSchema } from '../../domain/powder-coating/schema'
import { getPool } from '../../db/pool'

export default defineEventHandler(async (event) => {
  const pool = getPool()
  const catalog = await loadPowderCoatingCatalog(pool)
  const schema = createPowderCoatingInputSchema(catalog)

  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ungültige Eingabedaten',
      data: parsed.error.flatten(),
    })
  }

  return calculatePowderCoatingQuote(parsed.data, catalog)
})
