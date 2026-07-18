import type { StepFace } from '#shared/types/step-model'
import type { Material, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import type { FaceOverrideState } from '@/lib/face-classification-registry'
import { FaceClassificationRegistry } from '@/lib/face-classification-registry'
import {
  applyVividClassificationToScene,
  createVividClassificationMaterials,
  restoreStoredClassificationMaterials,
  setFaceClassificationVisible,
  storeFaceClassificationMaterials,
} from '@/lib/face-classification-materials'

export interface PartModelSceneHandle {
  mount: (container: HTMLElement) => Promise<void>
  loadModel: (url: string | null, faces?: StepFace[]) => Promise<void>
  setFaceClassificationVisible: (visible: boolean) => void
  setFaceEditEnabled: (enabled: boolean) => void
  onFaceOverridesChange: (callback: (state: FaceOverrideState) => void) => void
  getFaceOverrides: () => FaceOverrideState | null
  dispose: () => void
}

const DRAG_THRESHOLD_PX = 5

export function usePartModelScene(): PartModelSceneHandle {
  let renderer: WebGLRenderer | null = null
  let scene: Scene | null = null
  let camera: PerspectiveCamera | null = null
  let controls: import('three/addons/controls/OrbitControls.js').OrbitControls | null = null
  let animationId: number | null = null
  let resizeObserver: ResizeObserver | null = null
  let modelGroup: import('three').Group | null = null
  let THREE: typeof import('three') | null = null
  let Raycaster: typeof import('three').Raycaster | null = null
  let currentUrl: string | null = null
  let lastFittedObject: import('three').Object3D | null = null
  let faceClassificationVisible = true
  let faceEditEnabled = false
  let neutralMaterial: Material | null = null
  let faceRegistry: FaceClassificationRegistry | null = null
  let vividMaterials: import('@/lib/face-classification-materials').VividClassificationMaterials | null = null
  let currentFaces: StepFace[] = []
  let currentFacesKey = ''
  let overrideCallback: ((state: FaceOverrideState) => void) | null = null
  let containerElement: HTMLElement | null = null

  let pointerDownX = 0
  let pointerDownY = 0

  const pointerDownHandler = (event: PointerEvent) => {
    if (event.button !== 0) {
      return
    }
    pointerDownX = event.clientX
    pointerDownY = event.clientY
  }

  const pointerUpHandler = (event: PointerEvent) => {
    if (event.button !== 0) {
      return
    }
    if (!faceEditEnabled || !faceClassificationVisible || !faceRegistry || !THREE || !Raycaster || !camera || !lastFittedObject || !renderer) {
      return
    }

    const dx = event.clientX - pointerDownX
    const dy = event.clientY - pointerDownY
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      return
    }

    const rect = renderer.domElement.getBoundingClientRect()
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )

    const raycaster = new Raycaster()
    raycaster.params.Mesh.threshold = 0.001
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObject(lastFittedObject, true)

    for (const hit of hits) {
      if (!('isMesh' in hit.object) || !(hit.object as Mesh).isMesh) {
        continue
      }

      const mesh = hit.object as Mesh
      const toggled = faceRegistry.toggleFaceAtHit(mesh, hit.faceIndex)
      if (toggled === null) {
        continue
      }

      if (lastFittedObject) {
        storeFaceClassificationMaterials(lastFittedObject)
      }
      emitOverrideChange()
      return
    }
  }

  function emitOverrideChange() {
    const state = faceRegistry?.getOverrideState()
    if (state && overrideCallback) {
      overrideCallback(state)
    }
  }

  async function ensureThree() {
    if (!THREE) {
      THREE = await import('three')
      Raycaster = THREE.Raycaster
    }
    return THREE
  }

  function fitCameraToObject(
    three: typeof import('three'),
    cam: PerspectiveCamera,
    object: import('three').Object3D,
  ) {
    const box = new three.Box3().setFromObject(object)
    if (box.isEmpty()) {
      return
    }

    const size = box.getSize(new three.Vector3())
    const center = box.getCenter(new three.Vector3())
    const maxSize = Math.max(size.x, size.y, size.z, 0.001)

    const fovRadians = (cam.fov * Math.PI) / 180
    const fitHeightDistance = maxSize / (2 * Math.tan(fovRadians / 2))
    const fitWidthDistance = fitHeightDistance / Math.max(cam.aspect, 0.001)
    const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.05

    const direction = new three.Vector3(0.85, 0.5, 0.85).normalize()
    cam.position.copy(center).addScaledVector(direction, distance)
    cam.near = Math.max(distance / 1000, 0.01)
    cam.far = Math.max(distance * 1000, 1000)
    cam.lookAt(center)
    cam.updateProjectionMatrix()

    if (controls) {
      controls.target.copy(center)
      controls.minDistance = distance * 0.15
      controls.maxDistance = distance * 8
      controls.update()
    }
  }

  function applyClassificationVisibility() {
    if (!THREE || !lastFittedObject) {
      return
    }

    if (!faceClassificationVisible) {
      if (faceRegistry && currentFaces.length > 0) {
        if (!neutralMaterial) {
          neutralMaterial = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            metalness: 0.1,
            roughness: 0.6,
          })
        }
        faceRegistry.applyNeutralClassification(neutralMaterial)
        return
      }

      neutralMaterial = setFaceClassificationVisible(
        lastFittedObject,
        false,
        THREE,
        neutralMaterial ?? undefined,
      ) ?? neutralMaterial
      return
    }

    if (faceRegistry && currentFaces.length > 0) {
      faceRegistry.applyAllClassifications()
      storeFaceClassificationMaterials(lastFittedObject)
      return
    }

    if (!restoreStoredClassificationMaterials(lastFittedObject) && vividMaterials) {
      applyVividClassificationToScene(lastFittedObject, vividMaterials)
      storeFaceClassificationMaterials(lastFittedObject)
    }
  }

  function updateCanvasCursor() {
    if (!renderer) {
      return
    }
    renderer.domElement.style.cursor = faceEditEnabled && faceClassificationVisible ? 'crosshair' : 'grab'
  }

  function clearModel() {
    if (!THREE || !modelGroup) {
      return
    }

    while (modelGroup.children.length > 0) {
      const child = modelGroup.children[0]!
      modelGroup.remove(child)
      const registryMaterials = faceRegistry?.getMaterials()
      child.traverse((obj) => {
        if ('geometry' in obj && obj.geometry) {
          (obj.geometry as import('three').BufferGeometry).dispose()
        }
        if ('material' in obj) {
          const material = obj.material
          const materials = Array.isArray(material) ? material : [material]
          materials.forEach((m) => {
            if (
              m
              && m !== neutralMaterial
              && m !== registryMaterials?.exterior
              && m !== registryMaterials?.interior
            ) {
              m.dispose()
            }
          })
        }
        const stored = obj.userData?.classificationMaterials as Material[] | undefined
        stored?.forEach(material => material.dispose())
      })
    }

    faceRegistry?.dispose()
    faceRegistry = null
    vividMaterials?.exterior.dispose()
    vividMaterials?.interior.dispose()
    vividMaterials = null
    currentFaces = []
    currentFacesKey = ''
  }

  async function loadModel(url: string | null, faces: StepFace[] = []) {
    if (!THREE || !scene || !camera || !modelGroup) {
      return
    }

    if (url === currentUrl && faces.map(face => face.id).join(',') === currentFacesKey) {
      return
    }

    currentUrl = url
    currentFaces = faces
    currentFacesKey = faces.map(face => face.id).join(',')
    clearModel()

    if (!url) {
      lastFittedObject = null
      return
    }

    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(url)
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = box.getCenter(new THREE.Vector3())
    gltf.scene.position.sub(center)
    modelGroup.add(gltf.scene)
    lastFittedObject = gltf.scene

    vividMaterials = createVividClassificationMaterials(THREE)

    if (faces.length > 0) {
      faceRegistry = new FaceClassificationRegistry()
      faceRegistry.initialize(faces, gltf.scene, THREE)
    }
    else {
      storeFaceClassificationMaterials(gltf.scene)
    }

    applyClassificationVisibility()
    emitOverrideChange()
    fitCameraToObject(THREE, camera, gltf.scene)
  }

  function updateFaceClassificationVisible(visible: boolean) {
    faceClassificationVisible = visible
    if (visible && faceEditEnabled) {
      updateCanvasCursor()
    }
    else if (!faceEditEnabled) {
      updateCanvasCursor()
    }
    applyClassificationVisibility()
  }

  function updateFaceEditEnabled(enabled: boolean) {
    faceEditEnabled = enabled
    if (enabled) {
      faceClassificationVisible = true
      applyClassificationVisibility()
    }
    updateCanvasCursor()
  }

  async function mount(container: HTMLElement) {
    const three = await ensureThree()
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')

    containerElement = container
    scene = new three.Scene()
    scene.background = new three.Color(0xf8fafc)

    const width = container.clientWidth
    const height = container.clientHeight

    camera = new three.PerspectiveCamera(45, width / height, 0.1, 100000)
    renderer = new three.WebGLRenderer({ antialias: true })
    renderer.outputColorSpace = three.SRGBColorSpace
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const ambient = new three.AmbientLight(0xffffff, 0.55)
    const directional = new three.DirectionalLight(0xffffff, 0.9)
    directional.position.set(1, 2, 1)
    const fill = new three.DirectionalLight(0xffffff, 0.35)
    fill.position.set(-1, 0.5, -1)
    scene.add(ambient, directional, fill)

    modelGroup = new three.Group()
    scene.add(modelGroup)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.update()

    renderer.domElement.addEventListener('pointerdown', pointerDownHandler)
    renderer.domElement.addEventListener('pointerup', pointerUpHandler)

    updateCanvasCursor()

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      controls?.update()
      renderer?.render(scene!, camera!)
    }
    animate()

    resizeObserver = new ResizeObserver(() => {
      if (!renderer || !camera) {
        return
      }
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) {
        return
      }
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      if (THREE && lastFittedObject) {
        fitCameraToObject(THREE, camera, lastFittedObject)
      }
    })
    resizeObserver.observe(container)
  }

  function dispose() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
    resizeObserver?.disconnect()
    renderer?.domElement.removeEventListener('pointerdown', pointerDownHandler)
    renderer?.domElement.removeEventListener('pointerup', pointerUpHandler)
    clearModel()
    neutralMaterial?.dispose()
    neutralMaterial = null
    controls?.dispose()
    renderer?.dispose()
    if (renderer?.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement)
    }
    renderer = null
    scene = null
    camera = null
    controls = null
    modelGroup = null
    containerElement = null
    currentUrl = null
    lastFittedObject = null
    overrideCallback = null
  }

  return {
    mount,
    loadModel,
    setFaceClassificationVisible: updateFaceClassificationVisible,
    setFaceEditEnabled: updateFaceEditEnabled,
    onFaceOverridesChange: (callback) => {
      overrideCallback = callback
    },
    getFaceOverrides: () => faceRegistry?.getOverrideState() ?? null,
    dispose,
  }
}
