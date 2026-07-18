import { defineStore } from 'pinia'
import type { PowderCoatingSetup } from '@/composables/usePowderCoatingQuote'

function cloneSetup(value: PowderCoatingSetup): PowderCoatingSetup {
  return JSON.parse(JSON.stringify(value)) as PowderCoatingSetup
}

/**
 * Browser-local setup when Postgres persistence is off (public demo / production).
 * Hydrates once from the read-only API seed, then saves only in this store (+ localStorage).
 */
export const usePowderCoatingSetupStore = defineStore('powder-coating-setup', {
  state: () => ({
    setup: null as PowderCoatingSetup | null,
  }),

  actions: {
    async ensureHydrated(): Promise<PowderCoatingSetup> {
      if (this.setup) {
        return this.setup
      }
      const fromApi = await $fetch<PowderCoatingSetup>('/api/powder-coating/setup')
      this.setup = cloneSetup(fromApi)
      return this.setup
    },

    save(payload: PowderCoatingSetup): PowderCoatingSetup {
      this.setup = cloneSetup(payload)
      return this.setup
    },
  },

  persist: {
    pick: ['setup'],
  },
})
