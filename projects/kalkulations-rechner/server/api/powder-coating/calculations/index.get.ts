import { listPowderCoatingCalculations } from '../../../domain/powder-coating/calculation-repository'
import { getPool } from '../../../db/pool'

export default defineEventHandler(async (event) => {
  requirePersistence()
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 50, 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const pool = getPool()
  return listPowderCoatingCalculations(pool, limit, offset)
})
