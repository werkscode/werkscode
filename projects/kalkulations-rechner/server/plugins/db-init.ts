import { migrate } from '../db/migrate'
import { getPool } from '../db/pool'
import { seedIfEmpty } from '../db/seed'

function isPersistenceEnabled(): boolean {
  const value = process.env.NUXT_PUBLIC_PERSISTENCE_ENABLED
  return value === 'true' || value === '1'
}

export default defineNitroPlugin(async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('[db] DATABASE_URL not set — database features disabled')
    return
  }

  try {
    const pool = getPool()
    await migrate(pool)
    await seedIfEmpty(pool)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (isPersistenceEnabled()) {
      throw error
    }
    console.warn(
      `[db] Skipping migrate/seed (browser-only mode): ${message}`,
    )
  }
})
