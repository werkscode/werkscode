import { deletePowderCoatingCalculation } from '../../../domain/powder-coating/calculation-repository'
import { getPool } from '../../../db/pool'

export default defineEventHandler(async (event) => {
  requirePersistence()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })
  }

  const pool = getPool()
  const deleted = await deletePowderCoatingCalculation(pool, id)

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Kalkulation nicht gefunden' })
  }

  return { success: true }
})
