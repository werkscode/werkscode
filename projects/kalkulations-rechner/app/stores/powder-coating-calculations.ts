import { defineStore } from 'pinia'
import { calculatePowderCoatingQuote } from '#shared/lib/powder-coating-quote'
import type {
  CalculationListItem,
  PowderCoatingQuoteResult,
  SaveCalculationPayload,
  StoredCalculation,
} from '#shared/types/powder-coating-calculation'
import type { PowderCoatingSetup } from '@/composables/usePowderCoatingQuote'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function toListItem(item: StoredCalculation): CalculationListItem {
  return {
    id: item.id,
    processType: item.processType,
    title: item.title,
    artikelNumber: item.artikelNumber,
    description: item.description,
    imageData: item.imageData,
    createdBy: item.createdBy,
    customer: item.customer,
    quantity: item.input.quoteInput.quantity,
    totalEur: item.result.total,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function buildResult(
  payload: SaveCalculationPayload,
  catalog: PowderCoatingSetup,
): PowderCoatingQuoteResult {
  return calculatePowderCoatingQuote(payload.input.quoteInput, catalog)
}

/**
 * Browser-local saved calculations when Postgres persistence is off.
 */
export const usePowderCoatingCalculationsStore = defineStore('powder-coating-calculations', {
  state: () => ({
    items: [] as StoredCalculation[],
  }),

  getters: {
    listItems(state): CalculationListItem[] {
      return state.items
        .map(toListItem)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
  },

  actions: {
    getById(id: string): StoredCalculation | null {
      const found = this.items.find(item => item.id === id)
      return found ? clone(found) : null
    },

    create(payload: SaveCalculationPayload, catalog: PowderCoatingSetup): StoredCalculation {
      const now = new Date().toISOString()
      const stored: StoredCalculation = {
        id: crypto.randomUUID(),
        processType: 'powder_coating',
        title: payload.title,
        artikelNumber: payload.artikelNumber,
        description: payload.description,
        imageData: payload.imageData,
        createdBy: payload.createdBy,
        customer: payload.customer,
        input: clone(payload.input),
        result: buildResult(payload, catalog),
        createdAt: now,
        updatedAt: now,
      }
      this.items.unshift(stored)
      return clone(stored)
    },

    update(
      id: string,
      payload: SaveCalculationPayload,
      catalog: PowderCoatingSetup,
    ): StoredCalculation | null {
      const index = this.items.findIndex(item => item.id === id)
      if (index < 0) {
        return null
      }
      const existing = this.items[index]!
      const updated: StoredCalculation = {
        ...existing,
        title: payload.title,
        artikelNumber: payload.artikelNumber,
        description: payload.description,
        imageData: payload.imageData,
        createdBy: payload.createdBy,
        customer: payload.customer,
        input: clone(payload.input),
        result: buildResult(payload, catalog),
        updatedAt: new Date().toISOString(),
      }
      this.items.splice(index, 1, updated)
      return clone(updated)
    },

    remove(id: string): boolean {
      const before = this.items.length
      this.items = this.items.filter(item => item.id !== id)
      return this.items.length < before
    },
  },

  persist: {
    pick: ['items'],
  },
})
