import { updatePowderCoatingCalculation } from '../../../domain/powder-coating/calculation-repository'
import { createSaveCalculationSchema } from '../../../domain/powder-coating/calculation-schema'
import { loadPowderCoatingCatalog } from '../../../domain/powder-coating/catalog-repository'
import { buildQuoteFromCalculationInput } from '../../../domain/powder-coating/save-calculation'
import { getPool } from '../../../db/pool'

export default defineEventHandler(async (event) => {
  requirePersistence()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })
  }

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

  const updated = await updatePowderCoatingCalculation(pool, id, {
    title: parsed.data.title,
    artikelNumber: parsed.data.artikelNumber,
    description: parsed.data.description,
    imageData: parsed.data.imageData,
    createdBy: parsed.data.createdBy,
    customer: parsed.data.customer,
    input: parsed.data.input,
    result,
    catalogSnapshot: catalog,
  })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Kalkulation nicht gefunden' })
  }

  return updated
})
