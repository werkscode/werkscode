import { POWDER_GRAMS_PER_M2 } from './powder-constants'

export { POWDER_GRAMS_PER_M2 } from './powder-constants'

const POWDER_KG_PER_M2 = POWDER_GRAMS_PER_M2 / 1000

export interface PowderConsumptionInput {
  surfaceAreaM2: number
  quantity: number
  overspray: number
}

export interface PowderConsumptionResult {
  powderKgPerPart: number
  powderKgTotal: number
  gramsPerM2: number
  overspray: number
  steps: { label: string; expression: string }[]
}

export function calculatePowderConsumption(
  input: PowderConsumptionInput,
): PowderConsumptionResult | null {
  const { surfaceAreaM2, quantity, overspray } = input

  if (
    surfaceAreaM2 <= 0
    || quantity < 1
    || !Number.isFinite(overspray)
    || overspray <= 0
  ) {
    return null
  }

  const powderKgPerPart = surfaceAreaM2 * POWDER_KG_PER_M2 * overspray
  const powderKgTotal = powderKgPerPart * quantity

  return {
    powderKgPerPart,
    powderKgTotal,
    gramsPerM2: POWDER_GRAMS_PER_M2,
    overspray,
    steps: [
      {
        label: 'Pulver pro Teil',
        expression: `${surfaceAreaM2} m² × ${POWDER_GRAMS_PER_M2} g/m² × ${overspray} = ${powderKgPerPart.toFixed(6)} kg`,
      },
      {
        label: 'Pulver gesamt',
        expression: `${powderKgPerPart.toFixed(6)} kg × ${quantity} = ${powderKgTotal.toFixed(6)} kg`,
      },
    ],
  }
}
