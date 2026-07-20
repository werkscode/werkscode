import { defineStore } from 'pinia'
import { createDefaultPowderCoatingSetup } from '#shared/lib/powder-coating-defaults'
import type { PowderCoatingSetup } from '@/composables/usePowderCoatingQuote'

function cloneSetup(value: PowderCoatingSetup): PowderCoatingSetup {
  return JSON.parse(JSON.stringify(value)) as PowderCoatingSetup
}

/**
 * Browser-local setup when Postgres persistence is off (public demo / production).
 * Seeds from shared defaults once, then saves only in this store (+ localStorage).
 */
export const usePowderCoatingSetupStore = defineStore('powder-coating-setup', {
  state: () => ({
    setup: null as PowderCoatingSetup | null,
  }),

  actions: {
    ensureHydrated(): PowderCoatingSetup {
      if (this.setup) {
        return this.setup
      }
      this.setup = cloneSetup(createDefaultPowderCoatingSetup())
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
