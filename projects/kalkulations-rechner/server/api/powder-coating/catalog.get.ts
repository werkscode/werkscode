import { loadPowderCoatingCatalog } from '../../domain/powder-coating/catalog-repository'
import { getPool } from '../../db/pool'

export default defineEventHandler(async () => {
  const pool = getPool()
  return loadPowderCoatingCatalog(pool)
})
