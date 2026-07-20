import type { PowderCoatingSetup } from '@/composables/usePowderCoatingQuote'
import { usePowderCoatingSetupStore } from '@/stores/powder-coating-setup'

export function usePowderCoatingSetup() {
  const { persistenceEnabled } = usePersistenceEnabled()
  const setupStore = usePowderCoatingSetupStore()

  const setup = ref<PowderCoatingSetup | null>(null)
  const pending = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function loadSetup() {
    pending.value = true
    error.value = null

    try {
      if (!persistenceEnabled.value) {
        setup.value = setupStore.ensureHydrated()
        return
      }
      setup.value = await $fetch<PowderCoatingSetup>('/api/powder-coating/setup')
    }
    catch (err: unknown) {
      setup.value = null
      error.value = err instanceof Error ? err.message : 'Einstellungen konnten nicht geladen werden'
      throw err
    }
    finally {
      pending.value = false
    }
  }

  async function saveSetup(payload: PowderCoatingSetup) {
    saving.value = true
    error.value = null

    try {
      if (!persistenceEnabled.value) {
        setup.value = setupStore.save(payload)
        return
      }
      setup.value = await $fetch<PowderCoatingSetup>('/api/powder-coating/setup', {
        method: 'PUT',
        body: payload,
      })
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Speichern fehlgeschlagen'
      throw err
    }
    finally {
      saving.value = false
    }
  }

  return {
    setup,
    pending,
    saving,
    error,
    loadSetup,
    saveSetup,
  }
}
