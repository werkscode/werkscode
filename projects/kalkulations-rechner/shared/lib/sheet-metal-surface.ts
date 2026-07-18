export const sheetMaterials = {
  steel: {
    id: 'steel',
    label: 'Stahl',
    densityKgPerM3: 7850,
  },
  aluminium: {
    id: 'aluminium',
    label: 'Aluminium',
    densityKgPerM3: 2700,
  },
} as const

export type SheetMaterialId = keyof typeof sheetMaterials

export interface SheetSurfaceInput {
  materialId: SheetMaterialId
  thicknessMm: number
  weightKg: number
  includeEdges?: boolean
}

export interface SheetSurfaceStep {
  label: string
  expression: string
}

export interface SheetSurfaceResult {
  volumeM3: number
  thicknessM: number
  singleSidedAreaM2: number
  edgeAreaM2: number
  totalAreaM2: number
  steps: SheetSurfaceStep[]
}

const numberFormatter = new Intl.NumberFormat('de-DE', {
  maximumFractionDigits: 6,
})

function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function calculateSheetSurfaceArea(input: SheetSurfaceInput): SheetSurfaceResult | null {
  const { materialId, thicknessMm, weightKg, includeEdges = false } = input

  if (thicknessMm <= 0 || weightKg <= 0) {
    return null
  }

  const material = sheetMaterials[materialId]
  const density = material.densityKgPerM3
  const thicknessM = thicknessMm / 1000

  const volumeM3 = weightKg / density
  const singleSidedAreaM2 = volumeM3 / thicknessM

  let edgeAreaM2 = 0
  const steps: SheetSurfaceStep[] = [
    {
      label: 'Volumen',
      expression: `V = m / ρ = ${formatNumber(weightKg)} kg / ${formatNumber(density)} kg/m³ = ${formatNumber(volumeM3)} m³`,
    },
    {
      label: 'Fläche (einseitig)',
      expression: `A_einseitig = V / d = ${formatNumber(volumeM3)} m³ / ${formatNumber(thicknessM)} m = ${formatNumber(singleSidedAreaM2)} m²`,
    },
  ]

  if (includeEdges) {
    const sideLengthM = Math.sqrt(singleSidedAreaM2)
    edgeAreaM2 = 4 * sideLengthM * thicknessM
    steps.push({
      label: 'Kantenfläche',
      expression: `A_kanten = 4 · √A_einseitig · d = 4 · ${formatNumber(sideLengthM)} m · ${formatNumber(thicknessM)} m = ${formatNumber(edgeAreaM2)} m²`,
    })
  }

  const faceAreaM2 = 2 * singleSidedAreaM2
  const totalAreaM2 = faceAreaM2 + edgeAreaM2

  steps.push({
    label: includeEdges ? 'Gesamtfläche (Flächen + Kanten)' : 'Gesamtfläche (beide Seiten)',
    expression: includeEdges
      ? `A_gesamt = 2 · A_einseitig + A_kanten = 2 · ${formatNumber(singleSidedAreaM2)} m² + ${formatNumber(edgeAreaM2)} m² = ${formatNumber(totalAreaM2)} m²`
      : `A_gesamt = 2 · A_einseitig = 2 · ${formatNumber(singleSidedAreaM2)} m² = ${formatNumber(totalAreaM2)} m²`,
  })

  return {
    volumeM3,
    thicknessM,
    singleSidedAreaM2,
    edgeAreaM2,
    totalAreaM2,
    steps,
  }
}
