import type { CartPassStepCost } from '#shared/lib/cart-pass-work-steps'
import type { Dimensions3D } from '#shared/lib/dimensions'
import { formatCalculationDateTime } from '#shared/lib/date-format'
import type { HangingMode, OrientationMode, PartOrientation } from '#shared/lib/part-orientations'
import type { SheetMaterialId } from '#shared/lib/sheet-metal-surface'

export type SurfaceInputMode = 'sheet-metal' | 'step'

export interface PowderCoatingQuoteInput {
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

export interface PowderCoatingCalculationInput {
  surfaceInputMode?: SurfaceInputMode
  materialId: SheetMaterialId
  thicknessMm: number
  weightKg: number
  includeEdges: boolean
  stepFileName?: string
  stepModelId?: string
  stepTotalSurfaceAreaM2?: number
  quoteInput: PowderCoatingQuoteInput
}

export interface PowderCoatingQuoteLine {
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

export interface PowderCoatingQuoteResult {
  lines: PowderCoatingQuoteLine[]
  subtotal: number
  minimumApplied: boolean
  minimumCharge: number
  total: number
  breakdown: PowderCoatingQuoteBreakdown
}

export interface CalculationMetadata {
  title: string | null
  artikelNumber: string | null
  description: string | null
  imageData: string | null
  createdBy: string | null
  customer: string | null
}

export interface CalculationListItem {
  id: string
  processType: string
  title: string | null
  artikelNumber: string | null
  description: string | null
  imageData: string | null
  createdBy: string | null
  customer: string | null
  quantity: number
  totalEur: number
  createdAt: string
  updatedAt: string
}

export interface StoredCalculation extends CalculationMetadata {
  id: string
  processType: string
  input: PowderCoatingCalculationInput
  result: PowderCoatingQuoteResult
  createdAt: string
  updatedAt: string
}

export interface SaveCalculationPayload extends CalculationMetadata {
  input: PowderCoatingCalculationInput
}

export interface CalculationMetadataForm {
  title: string
  artikelNumber: string
  description: string
  imageData: string | null
  createdBy: string
  customer: string
}

export function emptyCalculationMetadataForm(): CalculationMetadataForm {
  return {
    title: '',
    artikelNumber: '',
    description: '',
    imageData: null,
    createdBy: '',
    customer: '',
  }
}

export function storedToForm(metadata: CalculationMetadata): CalculationMetadataForm {
  return {
    title: metadata.title ?? '',
    artikelNumber: metadata.artikelNumber ?? '',
    description: metadata.description ?? '',
    imageData: metadata.imageData,
    createdBy: metadata.createdBy ?? '',
    customer: metadata.customer ?? '',
  }
}

export function formToStored(form: CalculationMetadataForm): CalculationMetadata {
  return {
    title: form.title.trim() || null,
    artikelNumber: form.artikelNumber.trim() || null,
    description: form.description.trim() || null,
    imageData: form.imageData,
    createdBy: form.createdBy.trim() || null,
    customer: form.customer.trim() || null,
  }
}

export function resolveCalculationQuantity(
  item: { quantity?: number; input?: PowderCoatingCalculationInput },
): number | undefined {
  if (typeof item.quantity === 'number' && Number.isFinite(item.quantity)) {
    return item.quantity
  }
  const nested = item.input?.quoteInput?.quantity
  if (typeof nested === 'number' && Number.isFinite(nested)) {
    return nested
  }
  return undefined
}

export function formatCalculationLabel(
  item: Pick<CalculationListItem, 'title' | 'artikelNumber' | 'createdAt'> & {
    quantity?: number
    input?: PowderCoatingCalculationInput
  },
): string {
  if (item.title) {
    return item.title
  }
  if (item.artikelNumber) {
    return `Art.-Nr. ${item.artikelNumber}`
  }
  const quantity = resolveCalculationQuantity(item)
  const quantityLabel = quantity != null
    ? ` · ${quantity.toLocaleString('de-DE')} Stk.`
    : ''
  return `Kalkulation ${formatCalculationDateTime(item.createdAt)}${quantityLabel}`
}
