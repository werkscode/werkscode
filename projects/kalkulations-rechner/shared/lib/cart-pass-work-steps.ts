import { getLastCartLoad } from './cart-run-cost'

export const CART_PASS_WORK_STEP_IDS = [
  'wash',
  'dry',
  'hang',
  'powder',
  'unhang',
  'cure',
] as const

export type CartPassWorkStepId = (typeof CART_PASS_WORK_STEP_IDS)[number]

export interface CartPassWorkStep {
  id: CartPassWorkStepId
  label: string
  minutesPerCartPass: number
  hourlyRateEur: number
}

export interface CartPassStepCost extends CartPassWorkStep {
  costPerCartPassEur: number
}

export interface CartPassWorkStepCostBreakdown {
  steps: CartPassStepCost[]
  costPerCartPassEur: number
}

export const DEFAULT_CART_PASS_WORK_STEPS: CartPassWorkStep[] = [
  { id: 'wash', label: 'Waschen', minutesPerCartPass: 10, hourlyRateEur: 45 },
  { id: 'dry', label: 'Trocknen', minutesPerCartPass: 10, hourlyRateEur: 45 },
  { id: 'hang', label: 'Aufhängen', minutesPerCartPass: 10, hourlyRateEur: 45 },
  { id: 'powder', label: 'Pulvern', minutesPerCartPass: 10, hourlyRateEur: 45 },
  { id: 'unhang', label: 'Abhängen', minutesPerCartPass: 10, hourlyRateEur: 45 },
  { id: 'cure', label: 'Einbrennen', minutesPerCartPass: 10, hourlyRateEur: 45 },
]

export function computeCartPassStepCost(step: CartPassWorkStep): number {
  if (
    !Number.isFinite(step.minutesPerCartPass)
    || step.minutesPerCartPass < 0
    || !Number.isFinite(step.hourlyRateEur)
    || step.hourlyRateEur < 0
  ) {
    return 0
  }

  return (step.minutesPerCartPass / 60) * step.hourlyRateEur
}

export function computeCartPassWorkStepBreakdown(
  steps: CartPassWorkStep[],
): CartPassWorkStepCostBreakdown {
  const stepCosts: CartPassStepCost[] = steps.map(step => ({
    ...step,
    costPerCartPassEur: computeCartPassStepCost(step),
  }))

  const costPerCartPassEur = stepCosts.reduce(
    (sum, step) => sum + step.costPerCartPassEur,
    0,
  )

  return { steps: stepCosts, costPerCartPassEur }
}

export function computeCostPerCartPass(steps: CartPassWorkStep[]): number {
  return computeCartPassWorkStepBreakdown(steps).costPerCartPassEur
}

export function computeMinutesPerCartPass(steps: CartPassWorkStep[]): number {
  return steps.reduce((sum, step) => {
    if (!Number.isFinite(step.minutesPerCartPass) || step.minutesPerCartPass < 0) {
      return sum
    }
    return sum + step.minutesPerCartPass
  }, 0)
}

export interface CartPassTimeResult {
  minutesPerCartPass: number
  totalMinutes: number
  partialLastCartApplied: boolean
}

export function computeTotalCartPassMinutes(
  minutesPerCartPass: number,
  cartsNeeded: number,
  partsPerCart: number,
  quantity: number,
  partialLastCart: boolean,
): CartPassTimeResult {
  if (
    !Number.isFinite(minutesPerCartPass)
    || minutesPerCartPass <= 0
    || cartsNeeded <= 0
    || !Number.isFinite(partsPerCart)
    || partsPerCart <= 0
    || !Number.isFinite(quantity)
    || quantity < 1
  ) {
    return {
      minutesPerCartPass: minutesPerCartPass > 0 ? minutesPerCartPass : 0,
      totalMinutes: 0,
      partialLastCartApplied: false,
    }
  }

  const lastCartLoad = getLastCartLoad(quantity, partsPerCart)

  if (!lastCartLoad) {
    return {
      minutesPerCartPass,
      totalMinutes: 0,
      partialLastCartApplied: false,
    }
  }

  if (!partialLastCart || !lastCartLoad.isPartial) {
    return {
      minutesPerCartPass,
      totalMinutes: cartsNeeded * minutesPerCartPass,
      partialLastCartApplied: false,
    }
  }

  const fullCartRuns = cartsNeeded - 1
  return {
    minutesPerCartPass,
    totalMinutes: (fullCartRuns + lastCartLoad.loadFraction) * minutesPerCartPass,
    partialLastCartApplied: true,
  }
}

export function formatDurationMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '—'
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }

  const hours = minutes / 60
  if (Math.abs(hours - Math.round(hours)) < 0.05) {
    return `${Math.round(hours).toLocaleString('de-DE')} h`
  }

  return `${hours.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} h`
}
