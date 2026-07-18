import type { Dimensions3D } from './dimensions'
import type { HangingCapacityResult } from './hanging-cart-capacity'
import { calculateHangingCapacity, type HangingCapacityInput } from './hanging-cart-capacity'
import type { OrientationMode, PartOrientation } from './part-orientations'

export interface PartPlacement {
  index: number
  positionMm: Dimensions3D
  sizeMm: Dimensions3D
}

export interface HangingCartLayout {
  cartDimensionsMm: Dimensions3D
  partDimensionsMm: Dimensions3D
  orientedPartDimensionsMm: Dimensions3D
  selectedOrientation: PartOrientation
  orientationMode: OrientationMode
  spacingMm: Dimensions3D
  hangingMode: HangingCapacityResult['hangingMode']
  counts: { x: number; y: number; z: number }
  partsPerCart: number
  placements: PartPlacement[]
  fitsInCart: boolean
  reason?: string
}

const MAX_PLACEMENTS = 500

function buildPlacements(
  oriented: Dimensions3D,
  spacing: Dimensions3D,
  counts: { x: number; y: number; z: number },
  hangingMode: HangingCapacityResult['hangingMode'],
  cartZ: number,
): PartPlacement[] {
  const placements: PartPlacement[] = []
  const countZ = hangingMode === 'side_by_side' ? 1 : counts.z
  const cellX = oriented.x + spacing.x
  const cellY = oriented.y + spacing.y
  const cellZ = oriented.z + spacing.z

  for (let iz = 0; iz < countZ; iz++) {
    for (let iy = 0; iy < counts.y; iy++) {
      for (let ix = 0; ix < counts.x; ix++) {
        if (placements.length >= MAX_PLACEMENTS) {
          return placements
        }

        placements.push({
          index: placements.length,
          positionMm: {
            x: ix * cellX,
            y: iy * cellY,
            // Parts hang from the cart ceiling: first row at the top, stacked downward.
            z: cartZ - oriented.z - iz * cellZ,
          },
          sizeMm: { ...oriented },
        })
      }
    }
  }

  return placements
}

export function buildHangingCartLayout(
  input: HangingCapacityInput,
): HangingCartLayout | null {
  const capacity = calculateHangingCapacity(input)
  if (!capacity) {
    return null
  }

  const placements = capacity.partsPerCart > 0
    ? buildPlacements(
        capacity.orientedPartDimensionsMm,
        input.partSpacingMm,
        capacity.counts,
        capacity.hangingMode,
        input.cartDimensionsMm.z,
      )
    : []

  return {
    cartDimensionsMm: input.cartDimensionsMm,
    partDimensionsMm: input.partDimensionsMm,
    orientedPartDimensionsMm: capacity.orientedPartDimensionsMm,
    selectedOrientation: capacity.selectedOrientation,
    orientationMode: capacity.orientationMode,
    spacingMm: input.partSpacingMm,
    hangingMode: capacity.hangingMode,
    counts: capacity.counts,
    partsPerCart: capacity.partsPerCart,
    placements,
    fitsInCart: capacity.fitsInCart,
    reason: capacity.reason,
  }
}
