import type { Dimensions3D } from './dimensions'
import {
  type HangingMode,
  type OrientationMode,
  type PartOrientation,
  ORIENTATIONS_90,
  orientedDimensionsMm,
  orientationLabel,
} from './part-orientations'

export interface HangingCapacityInput {
  cartDimensionsMm: Dimensions3D
  partDimensionsMm: Dimensions3D
  partSpacingMm: Dimensions3D
  hangingMode: HangingMode
  orientationMode: OrientationMode
  partOrientation?: PartOrientation
  quantity: number
}

export interface HangingCapacityStep {
  label: string
  expression: string
}

export interface HangingCapacityResult {
  partsPerCart: number
  cartsNeeded: number
  counts: { x: number; y: number; z: number }
  orientedPartDimensionsMm: Dimensions3D
  selectedOrientation: PartOrientation
  orientationMode: OrientationMode
  hangingMode: HangingMode
  fitsInCart: boolean
  reason?: string
  steps: HangingCapacityStep[]
}

function countAxis(cartAxis: number, cellSize: number): number {
  if (cellSize <= 0) {
    return 0
  }
  return Math.floor(cartAxis / cellSize)
}

function evaluateOrientation(
  cart: Dimensions3D,
  part: Dimensions3D,
  spacing: Dimensions3D,
  hangingMode: HangingMode,
  orientation: PartOrientation,
): {
  orientation: PartOrientation
  partsPerCart: number
  counts: { x: number; y: number; z: number }
  oriented: Dimensions3D
  fits: boolean
  reason?: string
} {
  const oriented = orientedDimensionsMm(part, orientation)
  const cellX = oriented.x + spacing.x
  const cellY = oriented.y + spacing.y
  const cellZ = oriented.z + spacing.z

  const countX = countAxis(cart.x, cellX)
  const countY = countAxis(cart.y, cellY)

  if (hangingMode === 'side_by_side') {
    if (cellZ > cart.z) {
      return {
        orientation,
        partsPerCart: 0,
        counts: { x: countX, y: countY, z: 0 },
        oriented,
        fits: false,
        reason: `Teilhöhe ${oriented.z} mm + Abstand Z ${spacing.z} mm übersteigt Wagenhöhe ${cart.z} mm`,
      }
    }

    return {
      orientation,
      partsPerCart: countX * countY,
      counts: { x: countX, y: countY, z: 1 },
      oriented,
      fits: countX > 0 && countY > 0,
      reason: countX === 0 || countY === 0 ? 'Teil passt nicht in Wagenbreite/-tiefe' : undefined,
    }
  }

  const countZ = countAxis(cart.z, cellZ)
  const partsPerCart = countX * countY * countZ

  return {
    orientation,
    partsPerCart,
    counts: { x: countX, y: countY, z: countZ },
    oriented,
    fits: partsPerCart > 0,
    reason: partsPerCart === 0 ? 'Teil passt nicht in Wagenbauraum' : undefined,
  }
}

function selectBestOrientation(
  cart: Dimensions3D,
  part: Dimensions3D,
  spacing: Dimensions3D,
  hangingMode: HangingMode,
): ReturnType<typeof evaluateOrientation> | null {
  let best: ReturnType<typeof evaluateOrientation> | null = null

  for (const orientation of ORIENTATIONS_90) {
    const result = evaluateOrientation(cart, part, spacing, hangingMode, orientation)
    if (!result.fits) {
      continue
    }

    if (!best) {
      best = result
      continue
    }

    if (result.partsPerCart > best.partsPerCart) {
      best = result
      continue
    }

    if (
      result.partsPerCart === best.partsPerCart
      && result.counts.z < best.counts.z
    ) {
      best = result
    }
  }

  return best
}

export function calculateHangingCapacity(input: HangingCapacityInput): HangingCapacityResult | null {
  const {
    cartDimensionsMm,
    partDimensionsMm,
    partSpacingMm,
    hangingMode,
    orientationMode,
    partOrientation,
    quantity,
  } = input

  if (
    cartDimensionsMm.x <= 0
    || cartDimensionsMm.y <= 0
    || cartDimensionsMm.z <= 0
    || partDimensionsMm.x <= 0
    || partDimensionsMm.y <= 0
    || partDimensionsMm.z <= 0
    || partSpacingMm.x < 0
    || partSpacingMm.y < 0
    || partSpacingMm.z < 0
    || quantity < 1
  ) {
    return null
  }

  const defaultOrientation = ORIENTATIONS_90[0]!
  let evaluation: ReturnType<typeof evaluateOrientation> | null = null
  let selectedOrientation: PartOrientation = defaultOrientation

  if (orientationMode === 'manual' && partOrientation) {
    evaluation = evaluateOrientation(
      cartDimensionsMm,
      partDimensionsMm,
      partSpacingMm,
      hangingMode,
      partOrientation,
    )
    selectedOrientation = partOrientation
  }
  else {
    evaluation = selectBestOrientation(
      cartDimensionsMm,
      partDimensionsMm,
      partSpacingMm,
      hangingMode,
    )
    if (evaluation) {
      selectedOrientation = evaluation.orientation
    }
  }

  if (!evaluation) {
    return {
      partsPerCart: 0,
      cartsNeeded: 0,
      counts: { x: 0, y: 0, z: 0 },
      orientedPartDimensionsMm: partDimensionsMm,
      selectedOrientation: partOrientation ?? defaultOrientation,
      orientationMode,
      hangingMode,
      fitsInCart: false,
      reason: orientationMode === 'manual'
        ? 'Gewählte Orientierung passt nicht in den Wagen'
        : 'Keine gültige 90°-Orientierung gefunden',
      steps: [],
    }
  }

  const partsPerCart = evaluation.partsPerCart
  const cartsNeeded = partsPerCart > 0 ? Math.ceil(quantity / partsPerCart) : 0

  const steps: HangingCapacityStep[] = [
    {
      label: 'Orientierung',
      expression: `${orientationLabel(selectedOrientation)} → ${evaluation.oriented.x} × ${evaluation.oriented.y} × ${evaluation.oriented.z} mm`,
    },
    {
      label: 'Zellen pro Achse',
      expression: `X: ${evaluation.counts.x}, Y: ${evaluation.counts.y}, Z: ${evaluation.counts.z}`,
    },
    {
      label: 'Teile pro Wagen',
      expression: hangingMode === 'side_by_side'
        ? `${evaluation.counts.x} × ${evaluation.counts.y} = ${partsPerCart}`
        : `${evaluation.counts.x} × ${evaluation.counts.y} × ${evaluation.counts.z} = ${partsPerCart}`,
    },
    {
      label: 'Benötigte Wagen',
      expression: `ceil(${quantity} / ${partsPerCart}) = ${cartsNeeded}`,
    },
  ]

  return {
    partsPerCart,
    cartsNeeded,
    counts: evaluation.counts,
    orientedPartDimensionsMm: evaluation.oriented,
    selectedOrientation,
    orientationMode,
    hangingMode,
    fitsInCart: evaluation.fits,
    reason: evaluation.reason,
    steps,
  }
}
