import type { Dimensions3D } from './dimensions'

export type PartAxis = 'x' | 'y' | 'z'

export interface PartOrientation {
  alongCartX: PartAxis
  alongCartY: PartAxis
  alongCartZ: PartAxis
}

export type OrientationMode = 'auto' | 'manual'

export type HangingMode = 'stackable' | 'side_by_side'

export const ORIENTATIONS_90: PartOrientation[] = [
  { alongCartX: 'x', alongCartY: 'y', alongCartZ: 'z' },
  { alongCartX: 'x', alongCartY: 'z', alongCartZ: 'y' },
  { alongCartX: 'y', alongCartY: 'x', alongCartZ: 'z' },
  { alongCartX: 'y', alongCartY: 'z', alongCartZ: 'x' },
  { alongCartX: 'z', alongCartY: 'x', alongCartZ: 'y' },
  { alongCartX: 'z', alongCartY: 'y', alongCartZ: 'x' },
]

export function isValidOrientation(orientation: PartOrientation): boolean {
  const axes = [orientation.alongCartX, orientation.alongCartY, orientation.alongCartZ]
  return new Set(axes).size === 3
}

export function orientedDimensionsMm(
  part: Dimensions3D,
  orientation: PartOrientation,
): Dimensions3D {
  return {
    x: part[orientation.alongCartX],
    y: part[orientation.alongCartY],
    z: part[orientation.alongCartZ],
  }
}

export function orientationLabel(orientation: PartOrientation): string {
  return `X←${orientation.alongCartX.toUpperCase()}, Y←${orientation.alongCartY.toUpperCase()}, Z←${orientation.alongCartZ.toUpperCase()}`
}

export function orientationKey(orientation: PartOrientation): string {
  return `${orientation.alongCartX}-${orientation.alongCartY}-${orientation.alongCartZ}`
}

export function orientationFromKey(key: string): PartOrientation | null {
  const found = ORIENTATIONS_90.find(o => orientationKey(o) === key)
  return found ?? null
}
