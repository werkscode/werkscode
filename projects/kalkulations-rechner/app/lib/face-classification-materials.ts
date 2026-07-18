import type { Material, Mesh, Object3D } from 'three'

export const EXTERIOR_COLOR_HEX = 0x2563EB
export const INTERIOR_COLOR_HEX = 0xDC2626

const NEUTRAL_MATERIAL_OPTIONS = {
  color: 0x94a3b8,
  metalness: 0.1,
  roughness: 0.6,
} as const

export interface VividClassificationMaterials {
  exterior: Material
  interior: Material
}

export function createVividClassificationMaterials(
  three: typeof import('three'),
): VividClassificationMaterials {
  const exterior = new three.MeshLambertMaterial({ color: EXTERIOR_COLOR_HEX })
  const interior = new three.MeshLambertMaterial({ color: INTERIOR_COLOR_HEX })
  exterior.userData.isClassificationTemplate = true
  interior.userData.isClassificationTemplate = true
  return { exterior, interior }
}

export function cloneClassificationMaterial(
  isExterior: boolean,
  materials: VividClassificationMaterials,
): Material {
  return (isExterior ? materials.exterior : materials.interior).clone()
}

function isNearColor(hex: number, target: number, tolerance = 0x30): boolean {
  const dr = Math.abs(((hex >> 16) & 0xff) - ((target >> 16) & 0xff))
  const dg = Math.abs(((hex >> 8) & 0xff) - ((target >> 8) & 0xff))
  const db = Math.abs((hex & 0xff) - (target & 0xff))
  return dr + dg + db < tolerance * 3
}

function inferExteriorFromMaterial(material: Material): boolean {
  if (!('color' in material) || !material.color || typeof material.color.getHex !== 'function') {
    return true
  }

  const hex = material.color.getHex()
  if (isNearColor(hex, INTERIOR_COLOR_HEX) || isNearColor(hex, 0xEF4444) || isNearColor(hex, 0xF04545)) {
    return false
  }
  if (isNearColor(hex, EXTERIOR_COLOR_HEX) || isNearColor(hex, 0x3B82F6)) {
    return true
  }

  const red = (hex >> 16) & 0xff
  const blue = hex & 0xff
  return red <= blue + 30
}

export function groupSlotFromFaceIndex(geometry: import('three').BufferGeometry, faceIndex: number): number | null {
  const groups = geometry.groups
  if (!groups.length) {
    return 0
  }

  for (let index = 0; index < groups.length; index++) {
    const group = groups[index]!
    const startTriangle = group.start / 3
    const endTriangle = startTriangle + group.count / 3
    if (faceIndex >= startTriangle && faceIndex < endTriangle) {
      return index
    }
  }

  return null
}

export function syncMeshGroupMaterialIndices(mesh: Mesh): void {
  const groups = mesh.geometry?.groups ?? []
  for (let index = 0; index < groups.length; index++) {
    groups[index]!.materialIndex = index
  }
}

function isDisposableMaterial(
  material: Material,
  templates: VividClassificationMaterials,
): boolean {
  if (material.userData.isClassificationTemplate) {
    return false
  }
  if (material === templates.exterior || material === templates.interior) {
    return false
  }
  return true
}

export function applyNeutralToMesh(mesh: Mesh, neutral: Material): void {
  const groups = mesh.geometry?.groups ?? []

  if (groups.length > 1) {
    mesh.material = groups.map(() => neutral.clone())
    syncMeshGroupMaterialIndices(mesh)
    return
  }

  mesh.material = neutral.clone()
}

export function applyMeshGroupColors(
  mesh: Mesh,
  groupColors: boolean[],
  materials: VividClassificationMaterials,
): void {
  const previous = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  previous.forEach((material) => {
    if (isDisposableMaterial(material, materials)) {
      material.dispose()
    }
  })

  const groups = mesh.geometry?.groups ?? []

  if (!groups.length) {
    mesh.material = cloneClassificationMaterial(groupColors[0] ?? true, materials)
    return
  }

  const nextMaterials = groupColors.map(isExterior =>
    cloneClassificationMaterial(isExterior, materials),
  )
  syncMeshGroupMaterialIndices(mesh)
  mesh.material = nextMaterials.length === 1 ? nextMaterials[0]! : nextMaterials
}

export function applyVividClassificationToScene(
  root: Object3D,
  materials: VividClassificationMaterials,
): void {
  root.traverse((child) => {
    if (!('isMesh' in child) || !(child as Mesh).isMesh) {
      return
    }

    const mesh = child as Mesh
    const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const groups = mesh.geometry?.groups ?? []

    if (groups.length > 1) {
      const groupColors = groups.map((group) => {
        const source = meshMaterials[group.materialIndex] ?? meshMaterials[0]!
        return inferExteriorFromMaterial(source)
      })
      applyMeshGroupColors(mesh, groupColors, materials)
      return
    }

    if (meshMaterials.length === 2) {
      mesh.material = [
        cloneClassificationMaterial(true, materials),
        cloneClassificationMaterial(false, materials),
      ]
      return
    }

    const nextMaterials = meshMaterials.map((material) => {
      const isExterior = inferExteriorFromMaterial(material)
      return cloneClassificationMaterial(isExterior, materials)
    })
    mesh.material = nextMaterials.length === 1 ? nextMaterials[0]! : nextMaterials
  })
}

export function storeFaceClassificationMaterials(root: Object3D): void {
  root.traverse((child) => {
    if (!('isMesh' in child) || !(child as Mesh).isMesh) {
      return
    }

    const mesh = child as Mesh
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mesh.userData.classificationMaterials = materials.map(material => material.clone())
  })
}

export function restoreStoredClassificationMaterials(root: Object3D): boolean {
  let restored = false

  root.traverse((child) => {
    if (!('isMesh' in child) || !(child as Mesh).isMesh) {
      return
    }

    const mesh = child as Mesh
    const stored = mesh.userData.classificationMaterials as Material[] | undefined
    if (!stored?.length) {
      return
    }

    mesh.material = stored.length === 1
      ? stored[0]!.clone()
      : stored.map(material => material.clone())
    syncMeshGroupMaterialIndices(mesh)
    restored = true
  })

  return restored
}

export function setFaceClassificationVisible(
  root: Object3D,
  visible: boolean,
  three: typeof import('three'),
  neutralMaterial?: Material,
): Material | undefined {
  const sharedNeutral = neutralMaterial ?? new three.MeshStandardMaterial(NEUTRAL_MATERIAL_OPTIONS)
  sharedNeutral.userData.isClassificationNeutral = true

  root.traverse((child) => {
    if (!('isMesh' in child) || !(child as Mesh).isMesh) {
      return
    }

    const mesh = child as Mesh

    if (!visible) {
      applyNeutralToMesh(mesh, sharedNeutral)
      return
    }

    const stored = mesh.userData.classificationMaterials as Material[] | undefined
    if (!stored?.length) {
      return
    }

    mesh.material = stored.length === 1
      ? stored[0]!.clone()
      : stored.map(material => material.clone())
    syncMeshGroupMaterialIndices(mesh)
  })

  return sharedNeutral
}
