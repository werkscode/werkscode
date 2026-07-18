/**
 * Whether this deployment may persist calculations and setup to Postgres.
 * When false (public demo), the UI still saves via Pinia + localStorage in the browser.
 * Controlled by NUXT_PUBLIC_PERSISTENCE_ENABLED (default false).
 */
export function usePersistenceEnabled() {
  const config = useRuntimeConfig()
  const persistenceEnabled = computed(() => {
    const value = config.public.persistenceEnabled
    return value === true || value === 'true'
  })

  return { persistenceEnabled }
}
