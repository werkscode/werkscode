import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

let client: ReturnType<typeof postgres> | null = null
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (!db) {
    const config = useRuntimeConfig()
    const connectionString = config.databaseUrl || process.env.DATABASE_URL

    if (!connectionString) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Database is not configured',
      })
    }

    client = postgres(connectionString, { prepare: false })
    db = drizzle(client, { schema })
  }

  return db
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.end()
    client = null
    db = null
  }
}
