import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

export default defineNitroPlugin(async () => {
  // Prerender runs during `nuxt build` — no database host exists in the build container.
  if (import.meta.prerender) {
    return
  }

  const config = useRuntimeConfig()
  const connectionString = config.databaseUrl || process.env.DATABASE_URL

  if (!connectionString) {
    console.warn('[db] DATABASE_URL not set — database features disabled')
    return
  }

  const client = postgres(connectionString, { prepare: false, max: 1 })
  const db = drizzle(client, { schema })

  try {
    await migrate(db, { migrationsFolder: `${process.cwd()}/drizzle` })
    console.info('[db] Migrations applied')
  }
  catch (error) {
    console.error('[db] Migration failed:', error)
  }
  finally {
    await client.end()
  }
})
