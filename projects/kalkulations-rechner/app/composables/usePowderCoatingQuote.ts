import type { CartPassStepCost, CartPassWorkStep } from '#shared/lib/cart-pass-work-steps'
import type { Dimensions3D } from '#shared/lib/dimensions'
import type { HangingMode, OrientationMode, PartOrientation } from '#shared/lib/part-orientations'
import { usePowderCoatingSetupStore } from '@/stores/powder-coating-setup'

export interface CatalogOption {
  id: string
  label: string
}

export interface PretreatmentCatalogEntry extends CatalogOption {
  rateEurPerM2: number
}

export interface PowderTypeCatalogEntry extends CatalogOption {
  costEurPerKg: number
  coatThicknessUm: number
  densityKgM3: number
}

export interface PowderCoatingSetup {
  pretreatments: PretreatmentCatalogEntry[]
  powderTypes: PowderTypeCatalogEntry[]
  defaultCartDimensionsMm: Dimensions3D
  cartPassWorkSteps: CartPassWorkStep[]
  globalOverspray: number
  defaultPartSpacingMm: Dimensions3D
  minimumChargeEur: number
  threadSealingRateEur: number
}

export type PowderCoatingCatalog = PowderCoatingSetup

export interface PowderCoatingFormState {
  quantity: number
  surfaceAreaM2: number
  partDimensionsMm: Dimensions3D
  partSpacingMm: Dimensions3D
  hangingMode: HangingMode
  orientationMode: OrientationMode
  partOrientation?: PartOrientation
  cartDimensionsMm: Dimensions3D
  pretreatmentId: string
  powderTypeId: string
  partialLastCart?: boolean
  threadsPerPart?: number
}

export interface QuoteLine {
  label: string
  amount: number
}

export interface PowderCoatingQuoteBreakdown {
  surfaceAreaM2: number
  powderKgPerPart: number
  powderKgTotal: number
  partsPerCart: number
  cartsNeeded: number
  partsOnLastCart: number
  lastCartLoadFraction: number
  partialLastCartApplied: boolean
  costPerCartPassEur?: number
  cartPassStepCosts?: CartPassStepCost[]
  minutesPerCartPass?: number
  totalCartPassMinutes?: number
  hangingMode: HangingMode
  orientationMode: OrientationMode
  selectedOrientation: PartOrientation
  orientedPartDimensionsMm: Dimensions3D
}

export interface PowderCoatingQuote {
  lines: QuoteLine[]
  subtotal: number
  minimumApplied: boolean
  minimumCharge: number
  total: number
  breakdown: PowderCoatingQuoteBreakdown
}

export function usePowderCoatingQuote() {
  const { persistenceEnabled } = usePersistenceEnabled()
  const catalog = ref<PowderCoatingCatalog | null>(null)
  const quote = ref<PowderCoatingQuote | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function loadCatalog() {
    if (!persistenceEnabled.value) {
      const setupStore = usePowderCoatingSetupStore()
      catalog.value = await setupStore.ensureHydrated()
      return
    }
    catalog.value = await $fetch<PowderCoatingCatalog>('/api/powder-coating/catalog')
  }

  async function calculate(input: PowderCoatingFormState) {
    pending.value = true
    error.value = null

    try {
      quote.value = await $fetch<PowderCoatingQuote>('/api/powder-coating/quote', {
        method: 'POST',
        body: input,
      })
    }
    catch (err: unknown) {
      quote.value = null
      error.value = err instanceof Error ? err.message : 'Kalkulation fehlgeschlagen'
      throw err
    }
    finally {
      pending.value = false
    }
  }

  return {
    catalog,
    quote,
    pending,
    error,
    loadCatalog,
    calculate,
  }
}
