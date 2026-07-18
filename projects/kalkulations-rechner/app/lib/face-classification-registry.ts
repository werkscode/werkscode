import type { StepFace } from '#shared/types/step-model'
import type { Material, Mesh, Object3D } from 'three'
import {
  applyMeshGroupColors,
  applyNeutralToMesh,
  createVividClassificationMaterials,
  EXTERIOR_COLOR_HEX,
  groupSlotFromFaceIndex,
  INTERIOR_COLOR_HEX,
  syncMeshGroupMaterialIndices,
} from '@/lib/face-classification-materials'

export { EXTERIOR_COLOR_HEX, INTERIOR_COLOR_HEX }

export interface FaceOverrideState {
  overrides: Record<string, boolean>
  adjustedSurfaceAreaM2: number
}

export interface FaceClassificationMaterials {
  exterior: Material
  interior: Material
}

export function createClassificationMaterials(
  three: typeof import('three'),
): FaceClassificationMaterials {
  return createVividClassificationMaterials(three)
}

function slotKey(gltfNodeName: string, groupIndex: number): string {
  return `${gltfNodeName}:${groupIndex}`
}

export class FaceClassificationRegistry {
  private faces: StepFace[] = []
  private overrides = new Map<string, boolean>()
  private faceIdByMeshGroup = new Map<string, string[]>()
  private faceIdsByMeshUuid = new Map<string, string[]>()
  private groupSlotByFaceId = new Map<string, { meshUuid: string; groupSlot: number }>()
  private meshByNodeName = new Map<string, Mesh>()
  private meshBySlotKey = new Map<string, Mesh>()
  private meshesByUuid = new Map<string, Mesh>()
  private meshesInSceneOrder: Mesh[] = []
  private materials: FaceClassificationMaterials | null = null

  initialize(
    faces: StepFace[],
    root: Object3D,
    three: typeof import('three'),
  ): void {
    this.disposeMaterials()
    this.faces = faces
    this.overrides.clear()
    this.faceIdByMeshGroup.clear()
    this.faceIdsByMeshUuid.clear()
    this.groupSlotByFaceId.clear()
    this.meshByNodeName.clear()
    this.meshBySlotKey.clear()
    this.meshesByUuid.clear()
    this.meshesInSceneOrder = []
    this.materials = createClassificationMaterials(three)

    this.collectSceneMeshes(root)

    const fallbackMesh = this.meshesByUuid.size === 1
      ? this.meshesInSceneOrder[0]!
      : null

    for (const face of faces) {
      const mesh = this.resolveMeshForFace(face, fallbackMesh)
      if (!mesh) {
        continue
      }

      this.registerFaceOnMesh(face, mesh)
    }

    if (fallbackMesh) {
      for (const face of faces) {
        if (this.groupSlotByFaceId.has(face.id)) {
          continue
        }
        this.registerFaceOnMesh(face, fallbackMesh)
      }
    }

    this.applyMeshPerFaceMapping(faces)

    this.applyAllClassifications()
  }

  private collectSceneMeshes(root: Object3D): void {
    const walk = (object: Object3D) => {
      if ('isMesh' in object && (object as Mesh).isMesh) {
        const mesh = object as Mesh
        this.meshesByUuid.set(mesh.uuid, mesh)
        this.meshesInSceneOrder.push(mesh)

        const nodeName = mesh.name || `node-${this.meshesInSceneOrder.length - 1}`
        this.meshByNodeName.set(nodeName, mesh)
        this.meshByNodeName.set(nodeName.toLowerCase(), mesh)

        const groups = mesh.geometry?.groups ?? []
        if (!groups.length) {
          this.meshBySlotKey.set(slotKey(nodeName, 0), mesh)
        }
        else {
          for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
            this.meshBySlotKey.set(slotKey(nodeName, groupIndex), mesh)
          }
        }
      }

      for (const child of object.children) {
        walk(child)
      }
    }

    walk(root)
  }

  private registerFaceOnMesh(face: StepFace, mesh: Mesh, groupSlot = face.groupIndex): void {
    const key = `${mesh.uuid}:${groupSlot}`
    const existing = this.faceIdByMeshGroup.get(key) ?? []
    if (!existing.includes(face.id)) {
      existing.push(face.id)
    }
    this.faceIdByMeshGroup.set(key, existing)

    const meshFaces = this.faceIdsByMeshUuid.get(mesh.uuid) ?? []
    if (!meshFaces.includes(face.id)) {
      meshFaces.push(face.id)
    }
    this.faceIdsByMeshUuid.set(mesh.uuid, meshFaces)
    this.groupSlotByFaceId.set(face.id, { meshUuid: mesh.uuid, groupSlot })
  }

  private applyMeshPerFaceMapping(faces: StepFace[]): void {
    if (faces.length !== this.meshesInSceneOrder.length) {
      return
    }

    const allSinglePrimitive = this.meshesInSceneOrder.every(
      mesh => (mesh.geometry?.groups?.length ?? 0) <= 1,
    )
    if (!allSinglePrimitive) {
      return
    }

    this.faceIdByMeshGroup.clear()
    this.faceIdsByMeshUuid.clear()
    this.groupSlotByFaceId.clear()

    for (let index = 0; index < faces.length; index++) {
      const face = faces[index]!
      const mesh = this.meshesInSceneOrder[index]!
      this.registerFaceOnMesh(face, mesh, 0)
    }
  }

  private meshNameCandidates(face: StepFace): string[] {
    const faceNum = Number(face.id)
    if (Number.isNaN(faceNum)) {
      return []
    }

    const base = face.gltfNodeName
    return [
      `${base}_${faceNum + 1}`,
      `${base}_${faceNum}`,
      `${base}[${faceNum + 1}]`,
      `${base}[${faceNum}]`,
    ]
  }

  private resolveMeshForFace(face: StepFace, fallbackMesh: Mesh | null): Mesh | null {
    for (const candidate of this.meshNameCandidates(face)) {
      const mesh = this.meshByNodeName.get(candidate)
        ?? this.meshByNodeName.get(candidate.toLowerCase())
      if (mesh) {
        return mesh
      }
    }

    const bySlot = this.meshBySlotKey.get(slotKey(face.gltfNodeName, face.groupIndex))
    if (bySlot) {
      return bySlot
    }

    const byName = this.meshByNodeName.get(face.gltfNodeName)
      ?? this.meshByNodeName.get(face.gltfNodeName.toLowerCase())
    if (byName) {
      return byName
    }

    if (face.meshIndex >= 0 && face.meshIndex < this.meshesInSceneOrder.length) {
      const meshIndexValues = new Set(this.faces.map(entry => entry.meshIndex))
      if (meshIndexValues.size > 1) {
        return this.meshesInSceneOrder[face.meshIndex]!
      }
    }

    const faceNum = Number(face.id)
    if (!Number.isNaN(faceNum) && faceNum >= 0 && faceNum < this.meshesInSceneOrder.length) {
      return this.meshesInSceneOrder[faceNum]!
    }

    return fallbackMesh
  }

  dispose(): void {
    this.disposeMaterials()
    this.faces = []
    this.overrides.clear()
    this.faceIdByMeshGroup.clear()
    this.faceIdsByMeshUuid.clear()
    this.groupSlotByFaceId.clear()
    this.meshByNodeName.clear()
    this.meshBySlotKey.clear()
    this.meshesByUuid.clear()
    this.meshesInSceneOrder = []
  }

  private disposeMaterials(): void {
    this.materials?.exterior.dispose()
    this.materials?.interior.dispose()
    this.materials = null
  }

  private resolveFaceIds(mesh: Mesh, groupSlot: number): string[] {
    const byMeshUuid = this.faceIdsByMeshUuid.get(mesh.uuid)
    if (byMeshUuid?.length) {
      return byMeshUuid
    }

    const direct = this.faceIdByMeshGroup.get(`${mesh.uuid}:${groupSlot}`)
    if (direct?.length) {
      return direct
    }

    const singleMesh = this.meshesByUuid.size === 1
    if (singleMesh) {
      const byGroupIndex = this.faces
        .filter(face => face.groupIndex === groupSlot)
        .map(face => face.id)
      if (byGroupIndex.length) {
        return byGroupIndex
      }

      const bySlot = this.faces[groupSlot]?.id
      if (bySlot) {
        return [bySlot]
      }
    }

    const groups = mesh.geometry?.groups ?? []
    const group = groups[groupSlot]
    if (group) {
      const nodeName = mesh.name
      const byMaterial = this.faces
        .filter(face =>
          face.materialIndex === group.materialIndex
          && (face.gltfNodeName === nodeName || face.gltfNodeName.toLowerCase() === nodeName.toLowerCase()),
        )
        .map(face => face.id)
      if (byMaterial.length) {
        return byMaterial
      }
    }

    return []
  }

  getFaceId(mesh: Mesh, groupSlot: number): string | null {
    return this.resolveFaceIds(mesh, groupSlot)[0] ?? null
  }

  getFaceIdFromHit(mesh: Mesh, faceIndex: number | undefined | null): string | null {
    if (faceIndex == null || !mesh.geometry) {
      return null
    }

    const groupSlot = groupSlotFromFaceIndex(mesh.geometry, faceIndex)
    if (groupSlot === null) {
      return null
    }

    return this.resolveFaceIds(mesh, groupSlot)[0] ?? null
  }

  private isGroupEffectivelyExterior(faceIds: string[]): boolean {
    if (!faceIds.length) {
      return true
    }
    return faceIds.every(faceId => this.isEffectivelyExterior(faceId))
  }

  isEffectivelyExterior(faceId: string): boolean {
    const face = this.faces.find(entry => entry.id === faceId)
    if (!face) {
      return true
    }
    if (this.overrides.has(faceId)) {
      return this.overrides.get(faceId)!
    }
    return face.isExterior
  }

  toggleFaceAtHit(mesh: Mesh, faceIndex: number | undefined | null): boolean | null {
    if (faceIndex == null || !mesh.geometry) {
      return null
    }

    const groupSlot = groupSlotFromFaceIndex(mesh.geometry, faceIndex)
    if (groupSlot === null) {
      return null
    }

    const faceIds = this.resolveFaceIds(mesh, groupSlot)
    if (!faceIds.length) {
      return null
    }

    return this.toggleFaceGroup(faceIds)
  }

  toggleFaceGroup(faceIds: string[]): boolean | null {
    const knownFaces = faceIds.filter(faceId => this.faces.some(face => face.id === faceId))
    if (!knownFaces.length) {
      return null
    }

    const current = this.isGroupEffectivelyExterior(knownFaces)
    const next = !current

    for (const faceId of knownFaces) {
      const face = this.faces.find(entry => entry.id === faceId)
      if (!face) {
        continue
      }

      if (next === face.isExterior) {
        this.overrides.delete(faceId)
      }
      else {
        this.overrides.set(faceId, next)
      }
    }

    this.applyAllClassifications()
    return next
  }

  toggleFace(faceId: string): boolean | null {
    return this.toggleFaceGroup([faceId])
  }

  private buildGroupColorsForMesh(mesh: Mesh): boolean[] {
    const groups = mesh.geometry?.groups ?? []
    const slotCount = Math.max(groups.length, 1)
    const colors: boolean[] = []

    for (let slot = 0; slot < slotCount; slot++) {
      const faceIds = this.resolveFaceIds(mesh, slot)
      colors.push(this.isGroupEffectivelyExterior(faceIds))
    }

    return colors
  }

  applyNeutralClassification(neutral: Material): void {
    for (const mesh of this.meshesByUuid.values()) {
      applyNeutralToMesh(mesh, neutral)
    }
  }

  applyAllClassifications(): void {
    if (!this.materials) {
      return
    }

    for (const mesh of this.meshesByUuid.values()) {
      const groupColors = this.buildGroupColorsForMesh(mesh)
      applyMeshGroupColors(mesh, groupColors, this.materials)
      syncMeshGroupMaterialIndices(mesh)
    }
  }

  getAdjustedSurfaceAreaM2(): number {
    const areaMm2 = this.faces.reduce((sum, face) => {
      if (this.isEffectivelyExterior(face.id)) {
        return sum + face.areaMm2
      }
      return sum
    }, 0)
    return areaMm2 / 1_000_000
  }

  getOverrideState(): FaceOverrideState {
    return {
      overrides: Object.fromEntries(this.overrides.entries()),
      adjustedSurfaceAreaM2: this.getAdjustedSurfaceAreaM2(),
    }
  }

  getMaterials(): FaceClassificationMaterials | null {
    return this.materials
  }
}
