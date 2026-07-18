import type { Dimensions3D } from '#shared/lib/dimensions'

export interface AssemblyNode {
  id: string
  name: string
  type: 'assembly' | 'part'
  gltfName?: string
  gltfIndex?: number
  children: AssemblyNode[]
}

export interface StepFace {
  id: string
  areaMm2: number
  isExterior: boolean
  gltfNodeName: string
  meshIndex: number
  groupIndex: number
  materialIndex: number
}

export interface StepConvertResult {
  modelId: string
  glbUrl: string
  fileName: string
  surfaceAreaM2: number
  totalSurfaceAreaM2: number
  boundingBoxMm: Dimensions3D
  faces: StepFace[]
  assemblyTree?: AssemblyNode
}
