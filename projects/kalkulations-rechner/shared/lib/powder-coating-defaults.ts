import { DEFAULT_CART_PASS_WORK_STEPS } from './cart-pass-work-steps'

export const pretreatmentOptions = [
  { id: 'degrease', label: 'Entfetten' },
  { id: 'phosphate', label: 'Phosphatieren' },
  { id: 'light-blast', label: 'Leichtstrahlen' },
  { id: 'heavy-blast', label: 'Schwerstrahlen' },
] as const

export const powderTypeOptions = [
  {
    id: 'polyester',
    label: 'Polyester (Standard)',
    costEurPerKg: 8.5,
    coatThicknessUm: 60,
    densityKgM3: 1400,
  },
  {
    id: 'epoxy',
    label: 'Epoxid',
    costEurPerKg: 9.5,
    coatThicknessUm: 70,
    densityKgM3: 1450,
  },
  {
    id: 'metallic',
    label: 'Metallic',
    costEurPerKg: 14,
    coatThicknessUm: 65,
    densityKgM3: 1500,
  },
  {
    id: 'texture',
    label: 'Struktur',
    costEurPerKg: 11,
    coatThicknessUm: 80,
    densityKgM3: 1350,
  },
] as const

export const pretreatmentRatesEurPerM2: Record<string, number> = {
  degrease: 4,
  phosphate: 6,
  'light-blast': 18,
  'heavy-blast': 35,
}

export const MINIMUM_CHARGE_EUR = 75
export const GLOBAL_OVERSPRAY = 1 / 0.65
export const DEFAULT_PART_SPACING_MM = { x: 100, y: 100, z: 100 }
export const DEFAULT_CART_DIMENSIONS_MM = { x: 2000, y: 1500, z: 1800 }
export const THREAD_SEALING_RATE_EUR = 0

export { DEFAULT_CART_PASS_WORK_STEPS }

/** Seed setup for browser-only mode (Pinia + localStorage) when Postgres is not used. */
export function createDefaultPowderCoatingSetup() {
  return {
    pretreatments: pretreatmentOptions.map(option => ({
      id: option.id,
      label: option.label,
      rateEurPerM2: pretreatmentRatesEurPerM2[option.id] ?? 5,
    })),
    powderTypes: powderTypeOptions.map(option => ({
      id: option.id,
      label: option.label,
      costEurPerKg: option.costEurPerKg,
      coatThicknessUm: option.coatThicknessUm,
      densityKgM3: option.densityKgM3,
    })),
    defaultCartDimensionsMm: { ...DEFAULT_CART_DIMENSIONS_MM },
    cartPassWorkSteps: DEFAULT_CART_PASS_WORK_STEPS.map(step => ({ ...step })),
    globalOverspray: GLOBAL_OVERSPRAY,
    defaultPartSpacingMm: { ...DEFAULT_PART_SPACING_MM },
    minimumChargeEur: MINIMUM_CHARGE_EUR,
    threadSealingRateEur: THREAD_SEALING_RATE_EUR,
  }
}
