/**
 * True when NUXT_PUBLIC_PERSISTENCE_ENABLED is set to "true".
 * Env values arrive as strings; treat only explicit true/"true" as enabled.
 */
export function isPersistenceEnabled(): boolean {
  const value = useRuntimeConfig().public.persistenceEnabled
  return value === true || value === 'true'
}

/** Throw 403 when demo/public mode has persistence disabled. */
export function requirePersistence() {
  if (!isPersistenceEnabled()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Persistence is disabled in demo mode. Clone the repo to enable saving locally.',
    })
  }
}
