import type {
  CalculationListItem,
  PowderCoatingCalculationInput,
  SaveCalculationPayload,
  StoredCalculation,
} from '#shared/types/powder-coating-calculation'
import { usePowderCoatingCalculationsStore } from '@/stores/powder-coating-calculations'
import { usePowderCoatingSetupStore } from '@/stores/powder-coating-setup'

export function usePowderCoatingCalculations() {
  const { persistenceEnabled } = usePersistenceEnabled()
  const calculationsStore = usePowderCoatingCalculationsStore()
  const setupStore = usePowderCoatingSetupStore()

  const calculations = ref<CalculationListItem[]>([])
  const current = ref<StoredCalculation | null>(null)
  const pending = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function loadList() {
    pending.value = true
    error.value = null

    try {
      if (!persistenceEnabled.value) {
        calculations.value = calculationsStore.listItems
        return
      }
      calculations.value = await $fetch<CalculationListItem[]>('/api/powder-coating/calculations')
    }
    catch (err: unknown) {
      calculations.value = []
      error.value = err instanceof Error ? err.message : 'Kalkulationen konnten nicht geladen werden'
      throw err
    }
    finally {
      pending.value = false
    }
  }

  async function loadOne(id: string) {
    pending.value = true
    error.value = null

    try {
      if (!persistenceEnabled.value) {
        const found = calculationsStore.getById(id)
        if (!found) {
          throw new Error('Kalkulation nicht gefunden')
        }
        current.value = found
        return current.value
      }
      current.value = await $fetch<StoredCalculation>(`/api/powder-coating/calculations/${id}`)
      return current.value
    }
    catch (err: unknown) {
      current.value = null
      error.value = err instanceof Error ? err.message : 'Kalkulation konnte nicht geladen werden'
      throw err
    }
    finally {
      pending.value = false
    }
  }

  async function saveCalculation(
    payload: SaveCalculationPayload,
    id?: string,
  ): Promise<StoredCalculation> {
    saving.value = true
    error.value = null

    try {
      if (!persistenceEnabled.value) {
        const catalog = setupStore.ensureHydrated()
        const result = id
          ? calculationsStore.update(id, payload, catalog)
          : calculationsStore.create(payload, catalog)

        if (!result) {
          throw new Error('Kalkulation nicht gefunden')
        }
        current.value = result
        return result
      }

      const result = id
        ? await $fetch<StoredCalculation>(`/api/powder-coating/calculations/${id}`, {
            method: 'PUT',
            body: payload,
          })
        : await $fetch<StoredCalculation>('/api/powder-coating/calculations', {
            method: 'POST',
            body: payload,
          })

      current.value = result
      return result
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Speichern fehlgeschlagen'
      throw err
    }
    finally {
      saving.value = false
    }
  }

  async function deleteCalculation(id: string) {
    saving.value = true
    error.value = null

    try {
      if (!persistenceEnabled.value) {
        if (!calculationsStore.remove(id)) {
          throw new Error('Kalkulation nicht gefunden')
        }
        calculations.value = calculationsStore.listItems
        if (current.value?.id === id) {
          current.value = null
        }
        return
      }

      await $fetch(`/api/powder-coating/calculations/${id}`, { method: 'DELETE' })
      calculations.value = calculations.value.filter(item => item.id !== id)
      if (current.value?.id === id) {
        current.value = null
      }
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Löschen fehlgeschlagen'
      throw err
    }
    finally {
      saving.value = false
    }
  }

  return {
    calculations,
    current,
    pending,
    saving,
    error,
    loadList,
    loadOne,
    saveCalculation,
    deleteCalculation,
  }
}

export type {
  CalculationMetadata,
  PowderCoatingCalculationInput,
  StoredCalculation,
  CalculationListItem,
} from '#shared/types/powder-coating-calculation'
