import {
  computeCartPassWorkStepBreakdown,
  computeCostPerCartPass,
  computeMinutesPerCartPass,
  computeTotalCartPassMinutes,
  type CartPassStepCost,
  type CartPassWorkStep,
} from './cart-pass-work-steps'
import { calculateCartRunCost, formatCartRunLineLabel } from './cart-run-cost'
import type { Dimensions3D } from './dimensions'
import { calculateHangingCapacity } from './hanging-cart-capacity'
import type { HangingMode, OrientationMode, PartOrientation } from './part-orientations'
import { calculatePowderConsumption } from './powder-consumption'

export interface PowderCoatingQuoteCatalog {
  pretreatments: { id: string, label: string, rateEurPerM2: number }[]
  powderTypes: { id: string, label: string, costEurPerKg: number }[]
  globalOverspray: number
  cartPassWorkSteps: CartPassWorkStep[]
  minimumChargeEur: number
  threadSealingRateEur: number
}

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
  costPerCartPassEur: number
  cartPassStepCosts: CartPassStepCost[]
  minutesPerCartPass: number
  totalCartPassMinutes: number
  hangingMode: HangingMode
  orientationMode: OrientationMode
  selectedOrientation: PartOrientation
  orientedPartDimensionsMm: Dimensions3D
  threadsPerPart: number
  totalThreads: number
  threadSealingRateEur: number
  threadSealingCost: number
}

export interface PowderCoatingQuote {
  lines: PowderCoatingQuoteLine[]
  subtotal: number
  minimumApplied: boolean
  minimumCharge: number
  total: number
  breakdown: PowderCoatingQuoteBreakdown
}

function getLabel(options: { id: string, label: string }[], id: string): string {
  return options.find(option => option.id === id)?.label ?? id
}

export function calculatePowderCoatingQuote(
  input: PowderCoatingQuoteInput,
  catalog: PowderCoatingQuoteCatalog,
): PowderCoatingQuote {
  const powderType = catalog.powderTypes.find(option => option.id === input.powderTypeId)
    ?? catalog.powderTypes[0]

  if (!powderType) {
    throw new Error('Catalog must contain powder types')
  }

  const pretreatment = input.pretreatmentId
    ? catalog.pretreatments.find(option => option.id === input.pretreatmentId)
    : undefined

  const capacity = calculateHangingCapacity({
    cartDimensionsMm: input.cartDimensionsMm,
    partDimensionsMm: input.partDimensionsMm,
    partSpacingMm: input.partSpacingMm,
    hangingMode: input.hangingMode,
    orientationMode: input.orientationMode,
    partOrientation: input.partOrientation,
    quantity: input.quantity,
  })

  const powder = calculatePowderConsumption({
    surfaceAreaM2: input.surfaceAreaM2,
    quantity: input.quantity,
    overspray: catalog.globalOverspray,
  })

  const partsPerCart = capacity?.partsPerCart ?? 0
  const cartsNeeded = capacity?.cartsNeeded ?? 0
  const powderKgPerPart = powder?.powderKgPerPart ?? 0
  const powderKgTotal = powder?.powderKgTotal ?? 0

  const materialCost = powderKgTotal * powderType.costEurPerKg
  const cartPassBreakdown = computeCartPassWorkStepBreakdown(catalog.cartPassWorkSteps)
  const costPerCartPass = computeCostPerCartPass(catalog.cartPassWorkSteps)
  const minutesPerCartPass = computeMinutesPerCartPass(catalog.cartPassWorkSteps)
  const cartPassTime = computeTotalCartPassMinutes(
    minutesPerCartPass,
    cartsNeeded,
    partsPerCart,
    input.quantity,
    input.partialLastCart ?? false,
  )
  const cartRunCost = calculateCartRunCost(
    cartsNeeded,
    partsPerCart,
    input.quantity,
    costPerCartPass,
    input.partialLastCart ?? false,
  )

  const lines: PowderCoatingQuoteLine[] = []

  if (pretreatment) {
    lines.push({
      label: `Vorbehandlung (${pretreatment.label})`,
      amount: input.surfaceAreaM2 * pretreatment.rateEurPerM2 * input.quantity,
    })
  }

  const threadsPerPart = input.threadsPerPart ?? 0
  const threadSealingRateEur = catalog.threadSealingRateEur ?? 0
  const totalThreads = threadsPerPart * input.quantity
  const threadSealingCost = totalThreads * threadSealingRateEur

  if (threadSealingCost > 0) {
    const rateLabel = threadSealingRateEur.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    lines.push({
      label: `Gewinde abdecken (${threadsPerPart} × ${input.quantity} Stk. × ${rateLabel} €)`,
      amount: threadSealingCost,
    })
  }

  lines.push(
    {
      label: `Pulvermaterial (${getLabel(catalog.powderTypes, powderType.id)}, ${powderKgTotal.toFixed(3)} kg)`,
      amount: materialCost,
    },
    {
      label: formatCartRunLineLabel(
        cartsNeeded,
        partsPerCart,
        cartRunCost.partsOnLastCart,
        cartRunCost.partialLastCartApplied,
        cartRunCost.loadFraction,
      ),
      amount: cartRunCost.cost,
    },
  )

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0)
  const total = Math.max(subtotal, catalog.minimumChargeEur)

  return {
    lines,
    subtotal,
    minimumApplied: total > subtotal,
    minimumCharge: catalog.minimumChargeEur,
    total,
    breakdown: {
      surfaceAreaM2: input.surfaceAreaM2,
      powderKgPerPart,
      powderKgTotal,
      partsPerCart,
      cartsNeeded,
      partsOnLastCart: cartRunCost.partsOnLastCart,
      lastCartLoadFraction: cartRunCost.loadFraction,
      partialLastCartApplied: cartRunCost.partialLastCartApplied,
      costPerCartPassEur: cartPassBreakdown.costPerCartPassEur,
      cartPassStepCosts: cartPassBreakdown.steps,
      minutesPerCartPass: cartPassTime.minutesPerCartPass,
      totalCartPassMinutes: cartPassTime.totalMinutes,
      hangingMode: input.hangingMode,
      orientationMode: input.orientationMode,
      selectedOrientation: capacity?.selectedOrientation ?? {
        alongCartX: 'x',
        alongCartY: 'y',
        alongCartZ: 'z',
      },
      orientedPartDimensionsMm: capacity?.orientedPartDimensionsMm ?? input.partDimensionsMm,
      threadsPerPart,
      totalThreads,
      threadSealingRateEur,
      threadSealingCost,
    },
  }
}
