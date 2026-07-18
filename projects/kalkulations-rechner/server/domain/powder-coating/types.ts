import type { CartPassStepCost, CartPassWorkStep } from '#shared/lib/cart-pass-work-steps'
import type { Dimensions3D } from '#shared/lib/dimensions'
import type { HangingMode, OrientationMode, PartOrientation } from '#shared/lib/part-orientations'

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

export interface PowderCoatingCatalog {
  pretreatments: PretreatmentCatalogEntry[]
  powderTypes: PowderTypeCatalogEntry[]
  defaultCartDimensionsMm: Dimensions3D
  cartPassWorkSteps: CartPassWorkStep[]
  globalOverspray: number
  defaultPartSpacingMm: Dimensions3D
  minimumChargeEur: number
  threadSealingRateEur: number
}

export interface PowderCoatingInput {
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
  costPerCartPassEur: number
  cartPassStepCosts: CartPassStepCost[]
  minutesPerCartPass: number
  totalCartPassMinutes: number
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
