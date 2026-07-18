import type { PowderTypeCatalogEntry } from './types'

export const pretreatmentOptions = [
  { id: 'degrease', label: 'Entfetten' },
  { id: 'phosphate', label: 'Phosphatieren' },
  { id: 'light-blast', label: 'Leichtstrahlen' },
  { id: 'heavy-blast', label: 'Schwerstrahlen' },
] as const

export const powderTypeOptions: PowderTypeCatalogEntry[] = [
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
]

export const pretreatmentRatesEurPerM2: Record<string, number> = {
  degrease: 4,
  phosphate: 6,
  'light-blast': 18,
  'heavy-blast': 35,
}

export { DEFAULT_CART_PASS_WORK_STEPS } from '#shared/lib/cart-pass-work-steps'

export const MINIMUM_CHARGE_EUR = 75
export const GLOBAL_OVERSPRAY = 1 / 0.65
export const DEFAULT_PART_SPACING_MM = { x: 100, y: 100, z: 100 }
export const THREAD_SEALING_RATE_EUR = 0
