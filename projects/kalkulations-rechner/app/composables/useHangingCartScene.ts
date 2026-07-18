import type { HangingCartLayout } from '#shared/lib/hanging-cart-layout'
import type { PartAxis, PartOrientation } from '#shared/lib/part-orientations'
import type { Material, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

export interface HangingCartSceneHandle {
  mount: (container: HTMLElement) => Promise<void>
  updateLayout: (layout: HangingCartLayout | null, partModelUrl?: string | null) => Promise<void>
  dispose: () => void
}

export function useHangingCartScene(): HangingCartSceneHandle {
  let renderer: WebGLRenderer | null = null
  let scene: Scene | null = null
  let camera: PerspectiveCamera | null = null
  let controls: { update: () => void; dispose: () => void; target?: import('three').Vector3 } | null = null
  let animationId: number | null = null
  let resizeObserver: ResizeObserver | null = null
  let contentGroup: import('three').Group | null = null
  let THREE: typeof import('three') | null = null
  let cachedPartModel: Object3D | null = null
  let cachedPartModelUrl: string | null = null
  let cachedPartTemplate: Object3D | null = null
  let cachedPartTemplateKey = ''

  async function ensureThree() {
    if (!THREE) {
      THREE = await import('three')
    }
    return THREE
  }

  function disposeObjectTree(object: Object3D, disposeMaterials = true) {
    object.traverse((child) => {
      if ('geometry' in child && child.geometry) {
        (child.geometry as import('three').BufferGeometry).dispose()
      }
      if (!disposeMaterials || !('material' in child)) {
        return
      }
      const material = child.material as Material | Material[] | undefined
      const materials = Array.isArray(material) ? material : material ? [material] : []
      materials.forEach(m => m.dispose())
    })
  }

  function clearContentGroup() {
    if (!contentGroup) {
      return
    }

    while (contentGroup.children.length > 0) {
      const child = contentGroup.children[0]!
      contentGroup.remove(child)
      disposeObjectTree(child, !child.userData.fromPartModel)
    }
  }

  function fitCameraToBox(
    three: typeof import('three'),
    cam: PerspectiveCamera,
    size: { x: number; y: number; z: number },
  ) {
    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 1.8
    cam.position.set(distance, distance * 0.7, distance)
    cam.lookAt(size.x / 2, size.z / 2, size.y / 2)
    cam.updateProjectionMatrix()
  }

  async function ensurePartModel(url: string) {
    if (cachedPartModel && cachedPartModelUrl === url) {
      return cachedPartModel
    }

    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(url)
    cachedPartModel = gltf.scene
    cachedPartModelUrl = url
    cachedPartTemplate = null
    cachedPartTemplateKey = ''
    return cachedPartModel
  }

  function orientationKey(orientation: PartOrientation): string {
    return `${orientation.alongCartX}-${orientation.alongCartY}-${orientation.alongCartZ}`
  }

  function preparePartTemplate(
    three: typeof import('three'),
    sourceModel: Object3D,
    orientation: PartOrientation,
  ) {
    const key = orientationKey(orientation)
    if (cachedPartTemplate && cachedPartTemplateKey === key) {
      return cachedPartTemplate
    }

    const template = new three.Group()
    const model = sourceModel.clone(true)

    const bbox = new three.Box3().setFromObject(model)
    const center = bbox.getCenter(new three.Vector3())
    model.position.sub(center)

    const rotation = new three.Quaternion().setFromRotationMatrix(
      orientationRotationMatrix(three, orientation),
    )
    model.setRotationFromQuaternion(rotation)
    template.add(model)

    cachedPartTemplate = template
    cachedPartTemplateKey = key
    return template
  }

  function createPartInstance(
    three: typeof import('three'),
    partTemplate: Object3D,
    placement: HangingCartLayout['placements'][number],
  ) {
    const instance = partTemplate.clone(true)
    const orientedSize = new three.Box3().setFromObject(partTemplate).getSize(new three.Vector3())
    instance.scale.set(
      placement.sizeMm.x / (orientedSize.x || 1),
      placement.sizeMm.z / (orientedSize.y || 1),
      placement.sizeMm.y / (orientedSize.z || 1),
    )
    instance.position.set(
      placement.positionMm.x + placement.sizeMm.x / 2,
      placement.positionMm.z + placement.sizeMm.z / 2,
      placement.positionMm.y + placement.sizeMm.y / 2,
    )
    instance.userData.fromPartModel = true
    return instance
  }

  function orientationRotationMatrix(
    three: typeof import('three'),
    orientation: PartOrientation,
  ) {
    const colX = new three.Vector3()
    const colY = new three.Vector3()
    const colZ = new three.Vector3()
    const worldX = new three.Vector3(1, 0, 0)
    const worldY = new three.Vector3(0, 1, 0)
    const worldZ = new three.Vector3(0, 0, 1)

    const assignColumn = (axis: PartAxis, target: import('three').Vector3) => {
      if (axis === 'x') {
        colX.copy(target)
      }
      else if (axis === 'y') {
        colY.copy(target)
      }
      else {
        colZ.copy(target)
      }
    }

    assignColumn(orientation.alongCartX, worldX)
    assignColumn(orientation.alongCartY, worldZ)
    assignColumn(orientation.alongCartZ, worldY)

    return new three.Matrix4().makeBasis(colX, colY, colZ)
  }

  function rebuildScene(layout: HangingCartLayout | null, partModel: Object3D | null) {
    if (!THREE || !scene || !camera || !contentGroup) {
      return
    }

    clearContentGroup()

    if (!layout) {
      return
    }

    const { cartDimensionsMm: cart } = layout

    const cartGeometry = new THREE.BoxGeometry(cart.x, cart.z, cart.y)
    const cartEdges = new THREE.EdgesGeometry(cartGeometry)
    cartGeometry.dispose()
    const cartLine = new THREE.LineSegments(
      cartEdges,
      new THREE.LineBasicMaterial({ color: 0x94a3b8 }),
    )
    cartLine.position.set(cart.x / 2, cart.z / 2, cart.y / 2)
    contentGroup.add(cartLine)

    const cartFill = new THREE.Mesh(
      new THREE.BoxGeometry(cart.x, cart.z, cart.y),
      new THREE.MeshBasicMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
      }),
    )
    cartFill.position.set(cart.x / 2, cart.z / 2, cart.y / 2)
    contentGroup.add(cartFill)

    if (partModel) {
      const partTemplate = preparePartTemplate(THREE, partModel, layout.selectedOrientation)
      for (const placement of layout.placements) {
        contentGroup.add(createPartInstance(THREE, partTemplate, placement))
      }
    }
    else {
      const partMaterial = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        transparent: layout.placements.length > 20,
        opacity: layout.placements.length > 20 ? 0.75 : 1,
        metalness: 0.1,
        roughness: 0.6,
      })

      if (layout.placements.length >= 50) {
        const mesh = new THREE.InstancedMesh(
          new THREE.BoxGeometry(1, 1, 1),
          partMaterial,
          layout.placements.length,
        )
        const matrix = new THREE.Matrix4()
        const position = new THREE.Vector3()
        const quaternion = new THREE.Quaternion()
        const scale = new THREE.Vector3()

        layout.placements.forEach((placement, index) => {
          position.set(
            placement.positionMm.x + placement.sizeMm.x / 2,
            placement.positionMm.z + placement.sizeMm.z / 2,
            placement.positionMm.y + placement.sizeMm.y / 2,
          )
          scale.set(placement.sizeMm.x, placement.sizeMm.z, placement.sizeMm.y)
          matrix.compose(position, quaternion, scale)
          mesh.setMatrixAt(index, matrix)
        })
        mesh.instanceMatrix.needsUpdate = true
        contentGroup.add(mesh)
      }
      else {
        for (const placement of layout.placements) {
          const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(
              placement.sizeMm.x,
              placement.sizeMm.z,
              placement.sizeMm.y,
            ),
            partMaterial,
          )
          mesh.position.set(
            placement.positionMm.x + placement.sizeMm.x / 2,
            placement.positionMm.z + placement.sizeMm.z / 2,
            placement.positionMm.y + placement.sizeMm.y / 2,
          )
          contentGroup.add(mesh)
        }
      }
    }

    fitCameraToBox(THREE, camera, cart)
  }

  async function mount(container: HTMLElement) {
    const three = await ensureThree()
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')

    scene = new three.Scene()
    scene.background = new three.Color(0xf8fafc)

    const width = container.clientWidth
    const height = container.clientHeight

    camera = new three.PerspectiveCamera(45, width / height, 1, 100000)
    renderer = new three.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const ambient = new three.AmbientLight(0xffffff, 0.85)
    const directional = new three.DirectionalLight(0xffffff, 0.65)
    directional.position.set(1, 2, 1)
    scene.add(ambient, directional)

    contentGroup = new three.Group()
    scene.add(contentGroup)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.update()

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
    })
    resizeObserver.observe(container)
  }

  async function updateLayout(layout: HangingCartLayout | null, partModelUrl?: string | null) {
    let partModel: Object3D | null = null

    if (partModelUrl) {
      partModel = await ensurePartModel(partModelUrl)
    }
    else {
      cachedPartModel = null
      cachedPartModelUrl = null
      cachedPartTemplate = null
      cachedPartTemplateKey = ''
    }

    rebuildScene(layout, partModel)

    if (layout && controls && THREE && camera) {
      const target = new THREE.Vector3(
        layout.cartDimensionsMm.x / 2,
        layout.cartDimensionsMm.z / 2,
        layout.cartDimensionsMm.y / 2,
      )
      if (controls.target) {
        controls.target.copy(target)
      }
    }
  }

  function dispose() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
    resizeObserver?.disconnect()
    clearContentGroup()
    controls?.dispose()
    renderer?.dispose()
    if (renderer?.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement)
    }
    renderer = null
    scene = null
    camera = null
    controls = null
    contentGroup = null
    cachedPartModel = null
    cachedPartModelUrl = null
    cachedPartTemplate = null
    cachedPartTemplateKey = ''
  }

  return { mount, updateLayout, dispose }
}
