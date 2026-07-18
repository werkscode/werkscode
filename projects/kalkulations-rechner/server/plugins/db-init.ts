import { migrate } from '../db/migrate'
import { getPool } from '../db/pool'
import { seedIfEmpty } from '../db/seed'

export default defineNitroPlugin(async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('[db] DATABASE_URL not set — database features disabled')
    return
  }

  const pool = getPool()
  await migrate(pool)
  await seedIfEmpty(pool)
})
