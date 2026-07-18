import { createPowderCoatingCalculation } from '../../../domain/powder-coating/calculation-repository'
import { createSaveCalculationSchema } from '../../../domain/powder-coating/calculation-schema'
import { loadPowderCoatingCatalog } from '../../../domain/powder-coating/catalog-repository'
import { buildQuoteFromCalculationInput } from '../../../domain/powder-coating/save-calculation'
import { getPool } from '../../../db/pool'

export default defineEventHandler(async (event) => {
  requirePersistence()
  const pool = getPool()
  const catalog = await loadPowderCoatingCatalog(pool)
  const schema = createSaveCalculationSchema(catalog)

  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ungültige Kalkulationsdaten',
      data: parsed.error.flatten(),
    })
  }

  const result = buildQuoteFromCalculationInput(parsed.data.input, catalog)

  return createPowderCoatingCalculation(pool, {
    title: parsed.data.title ?? null,
    artikelNumber: parsed.data.artikelNumber ?? null,
    description: parsed.data.description ?? null,
    imageData: parsed.data.imageData ?? null,
    createdBy: parsed.data.createdBy ?? null,
    customer: parsed.data.customer ?? null,
    input: parsed.data.input,
    result,
    catalogSnapshot: catalog,
  })
})
