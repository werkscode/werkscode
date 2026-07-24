<template>
  <div class="morph-field">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div v-else class="morph-stage">
      <div ref="canvasContainer" class="morph-canvas" />
      <div class="perf-badge">{{ perfBadge }}</div>
      <div class="toolbar">
        <button
          type="button"
          :class="['tool-btn', { active: toolMode === 'erase' }]"
          @click="setTool('erase')"
          @touchstart.prevent="setTool('erase')"
        >
          {{ t('lab.morph.erase') }}
        </button>
        <button
          type="button"
          :class="['tool-btn', { active: toolMode === 'seed' }]"
          @click="setTool('seed')"
          @touchstart.prevent="setTool('seed')"
        >
          {{ t('lab.morph.seed') }}
        </button>
        <button
          type="button"
          class="tool-btn"
          @click="cycleSpecies"
          @touchstart.prevent="cycleSpecies"
        >
          {{ t('lab.morph.species', { n: activeSpecies + 1 }) }}
        </button>
        <button
          type="button"
          :class="['tool-btn', { active: audioMuted }]"
          @click="toggleMute"
          @touchstart.prevent="toggleMute"
        >
          {{ audioMuted ? t('lab.morph.soundOff') : t('lab.morph.soundOn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import {
  createNebulaMaterial,
  createHazeUniforms,
  hazeVertexShader,
  hazeFragmentShader,
} from './nebulaShaders.js'
import { createAudioEngine } from './audioEngine.js'

const QUALITY_FULL = 2
const QUALITY_BLOOM = 1
const QUALITY_RAW = 0
const QUALITY_LABELS = ['raw', 'bloom', 'full']


    const canvasContainer = ref(null);
    const width = ref(800);
    const height = ref(560);
    const { t } = useI18n();
    let animationFrameId = null;
    const errorMessage = ref('');
    const perfBadge = ref('— fps · —');
    const toolMode = ref('none'); // 'none' | 'erase' | 'seed'
    const activeSpecies = ref(0);
    const audioMuted = ref(false);

    let isMobileDevice = false;

    let controlsRef = null;
    const toolModeRef = { value: 'none' };
    const activeSpeciesRef = { value: 0 };
    let disposeScene = null;
    let audioEngine = null;

    const syncToolControls = () => {
      if (controlsRef) {
        controlsRef.enabled = toolModeRef.value === 'none';
      }
    };

    const setTool = (mode) => {
      if (toolMode.value === mode) {
        toolMode.value = 'none';
      } else {
        toolMode.value = mode;
      }
      toolModeRef.value = toolMode.value;
      syncToolControls();
      if (audioEngine) audioEngine.unlock();
    };

    const cycleSpecies = () => {
      activeSpecies.value = (activeSpecies.value + 1) % 3;
      activeSpeciesRef.value = activeSpecies.value;
      if (audioEngine) audioEngine.unlock();
    };

    const toggleMute = () => {
      audioMuted.value = !audioMuted.value;
      if (audioEngine) {
        audioEngine.unlock();
        audioEngine.setMuted(audioMuted.value);
      }
    };

    const measureContainer = () => {
      const el = canvasContainer.value;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      width.value = Math.max(320, Math.floor(rect.width));
      height.value = Math.max(360, Math.floor(rect.height));
    };

    const initScene = () => {
      isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;

      measureContainer();
      audioEngine = createAudioEngine();

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        width.value / height.value,
        0.1,
        150
      );

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: !isMobileDevice });
      } catch (error) {
        errorMessage.value = t('lab.morph.webglError');
        return;
      }

      if (!renderer) return;

      const maxDpr = isMobileDevice ? 1.0 : 1.5;
      renderer.setSize(width.value, height.value);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      canvasContainer.value.appendChild(renderer.domElement);

      let qualityLevel = isMobileDevice ? QUALITY_BLOOM : QUALITY_FULL;

      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      let ssaoPass = null;
      if (!isMobileDevice) {
        ssaoPass = new SSAOPass(scene, camera);
        ssaoPass.kernelRadius = 8;
        ssaoPass.minDistance = 0.005;
        ssaoPass.maxDistance = 0.1;
        composer.addPass(ssaoPass);
      }

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width.value, height.value),
        0.85,
        0.4,
        0.7
      );
      composer.addPass(bloomPass);

      const hazeUniforms = createHazeUniforms();
      const hazePass = new ShaderPass({
        uniforms: hazeUniforms,
        vertexShader: hazeVertexShader,
        fragmentShader: hazeFragmentShader,
      });
      composer.addPass(hazePass);

      const applyQuality = () => {
        if (ssaoPass) ssaoPass.enabled = qualityLevel >= QUALITY_FULL;
        bloomPass.enabled = qualityLevel >= QUALITY_BLOOM;
        hazePass.enabled = qualityLevel >= QUALITY_BLOOM;
        hazeUniforms.uStrength.value = qualityLevel >= QUALITY_BLOOM ? 1 : 0;
      };
      applyQuality();

      const bgColor = new THREE.Color('#001a33');
      scene.background = bgColor;
      scene.fog = new THREE.FogExp2('#001a33', 0.00055);

      const controls = new OrbitControls(camera, renderer.domElement);
      controlsRef = controls;
      camera.position.set(40, 40, 40);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 0.8;
      controls.panSpeed = 0.5;
      controls.update();

      const size = 50;
      const cellCount = size * size * size;
      let grid = new Uint8Array(cellCount);
      let next = new Uint8Array(cellCount);
      const species = new Uint8Array(cellCount);
      let gamePaused = false;
      let frameCount = 0;
      let shellRegenerationTime = 0;

      const shellThickness = 2;
      const shellRegenerationSpeed = 0.001;
      const shellGrowthProbability = 0.08;

      function getIndex(x, y, z) {
        return x + y * size + z * size * size;
      }

      function isInShell(x, y, z) {
        return (
          x < shellThickness ||
          x >= size - shellThickness ||
          y < shellThickness ||
          y >= size - shellThickness ||
          z < shellThickness ||
          z >= size - shellThickness
        );
      }

      const shellIndices = [];
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          for (let z = 0; z < size; z++) {
            if (isInShell(x, y, z)) {
              shellIndices.push(getIndex(x, y, z));
            }
          }
        }
      }
      const shellIndexArray = new Uint32Array(shellIndices);
      const shellUpdates = new Uint8Array(cellCount);
      const sizeSq = size * size;

      // Instance attribute buffers
      const aOrganicArr = new Float32Array(cellCount);
      const aSpeciesArr = new Float32Array(cellCount);
      const aScaleArr = new Float32Array(cellCount);

      const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      geometry.setAttribute(
        'aOrganic',
        new THREE.InstancedBufferAttribute(aOrganicArr, 1)
      );
      geometry.setAttribute(
        'aSpecies',
        new THREE.InstancedBufferAttribute(aSpeciesArr, 1)
      );
      geometry.setAttribute(
        'aScale',
        new THREE.InstancedBufferAttribute(aScaleArr, 1)
      );

      const material = createNebulaMaterial();
      material.uniforms.uGridHalf.value = size / 2;

      const ambientLight = new THREE.AmbientLight('#222244', 0.45);
      scene.add(ambientLight);

      const rimLight = new THREE.DirectionalLight('#00ffff', 1.4);
      rimLight.position.set(70, 50, 0);
      scene.add(rimLight);

      const accentLight = new THREE.DirectionalLight('#aa00ff', 0.75);
      accentLight.position.set(-50, -30, 50);
      scene.add(accentLight);

      const keyLight = new THREE.DirectionalLight('#aaccff', 1.4);
      keyLight.position.set(1, 2, 1);
      scene.add(keyLight);

      const pulseLights = [];
      const pulseLightColors = ['#ff3377', '#00ccff'];
      for (let i = 0; i < 2; i++) {
        const pulseLight = new THREE.PointLight(pulseLightColors[i], 1.2, 60);
        pulseLight.position.set(
          Math.sin((i * Math.PI * 2) / 2) * 30,
          Math.cos((i * Math.PI * 2) / 2) * 20,
          10 - i * 10
        );
        scene.add(pulseLight);
        pulseLights.push(pulseLight);
      }

      const internalLights = [];
      const internalLightColors = ['#ffaa33', '#aa33ff'];
      for (let i = 0; i < 2; i++) {
        const internalLight = new THREE.PointLight(
          internalLightColors[i],
          1.0,
          40
        );
        const angle = (i * Math.PI * 2) / 2;
        internalLight.position.set(
          Math.cos(angle) * 15,
          Math.sin((i * Math.PI) / 2) * 15,
          Math.sin(angle) * 15
        );
        scene.add(internalLight);
        internalLights.push(internalLight);
      }

      const impactLight = new THREE.PointLight('#ffffff', 0, 40);
      scene.add(impactLight);
      let impactLightLife = 0;

      const instancedMesh = new THREE.InstancedMesh(
        geometry,
        material,
        cellCount
      );
      const identity = new THREE.Matrix4();
      const tempMatrix = new THREE.Matrix4();
      const tempColor = new THREE.Color();

      // Place each instance at its cube lattice point (morph happens in shader)
      for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const index = getIndex(x, y, z);
            tempMatrix.copy(identity);
            tempMatrix.setPosition(
              x - size / 2,
              y - size / 2,
              z - size / 2
            );
            instancedMesh.setMatrixAt(index, tempMatrix);
            aScaleArr[index] = 0;
          }
        }
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.setColorAt(0, new THREE.Color('#000000'));
      scene.add(instancedMesh);

      // Flying seeds: spawn anywhere, fly into the morphing lattice
      const SEED_FLY_CAP = 256;
      const seedGeom = new THREE.BoxGeometry(0.65, 0.65, 0.65);
      const seedMat = new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 0.25,
        emissive: new THREE.Color('#1a3344'),
        emissiveIntensity: 1.1,
      });
      const seedMesh = new THREE.InstancedMesh(seedGeom, seedMat, SEED_FLY_CAP);
      seedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      seedMesh.frustumCulled = false;
      const seedZero = new THREE.Matrix4().makeScale(0, 0, 0);
      for (let i = 0; i < SEED_FLY_CAP; i++) {
        seedMesh.setMatrixAt(i, seedZero);
      }
      seedMesh.instanceMatrix.needsUpdate = true;
      seedMesh.setColorAt(0, new THREE.Color('#33ddff'));
      scene.add(seedMesh);

      const flyingSeeds = new Array(SEED_FLY_CAP);
      for (let i = 0; i < SEED_FLY_CAP; i++) {
        flyingSeeds[i] = {
          active: false,
          ox: 0,
          oy: 0,
          oz: 0,
          targetIndex: 0,
          species: 0,
          t: 0,
          duration: 1,
        };
      }
      let seedFlyCursor = 0;
      const seedReserved = new Set();
      const morphTmpA = new THREE.Vector3();
      const morphTmpB = new THREE.Vector3();
      const morphTmpC = new THREE.Vector3();
      const morphTmpD = new THREE.Vector3();
      const seedPos = new THREE.Vector3();
      const seedTarget = new THREE.Vector3();
      const seedCamDir = new THREE.Vector3();
      const seedPlane = new THREE.Plane();
      const seedSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1);
      let lastSeedSpawnMs = 0;
      let bioMorphSeed = Math.random() * 1000;
      let wasInBioPhase = false;

      function morphTorusVec(p, gridHalf, out) {
        const majorRadius = gridHalf * 0.7;
        const minorRadius = gridHalf * 0.24;
        const radius = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        const theta = Math.atan2(p.y, p.x);
        const phi =
          radius > 0.001
            ? Math.acos(Math.min(1, Math.max(-1, p.z / radius)))
            : Math.PI * 0.5;
        const normalizedRadius = Math.min(radius / gridHalf, 1);
        const v = phi + normalizedRadius * Math.PI * 2;
        const cv = Math.cos(v);
        out.set(
          (majorRadius + minorRadius * cv) * Math.cos(theta),
          (majorRadius + minorRadius * cv) * Math.sin(theta),
          minorRadius * Math.sin(v)
        );
        return out;
      }

      function morphHelixVec(p, gridHalf, out) {
        const r = Math.hypot(p.x, p.z);
        const theta = Math.atan2(p.z, p.x);
        const turns = theta + p.y * 0.35;
        const helixR = r + (gridHalf * 0.55 - r) * 0.65;
        out.set(
          Math.cos(turns) * helixR,
          p.y * 0.55 + Math.sin(turns * 2) * 2,
          Math.sin(turns) * helixR
        );
        return out;
      }

      function bioHash(px, py, pz, seed) {
        const n =
          Math.sin(px * 12.9898 + py * 78.233 + pz * 37.719 + seed) *
          43758.5453;
        return n - Math.floor(n);
      }

      function bioHash1(seed, salt) {
        const n = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
        return n - Math.floor(n);
      }

      function morphBioVec(p, gridHalf, seed, out) {
        const r0 = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        const nr = Math.min(r0 / Math.max(gridHalf, 0.001), 1);
        const theta = Math.atan2(p.y, p.x);
        const phi =
          r0 > 0.001
            ? Math.acos(Math.min(1, Math.max(-1, p.z / r0)))
            : Math.PI * 0.5;

        const g1 = bioHash1(seed, 1);
        const g2 = bioHash1(seed, 2);
        const g3 = bioHash1(seed, 3);
        const kTheta = 4 + Math.floor(g1 * 5);
        const kPhi = 3 + Math.floor(g2 * 4);
        const budCount = 2 + Math.floor(g3 * 3);

        const h = bioHash(p.x, p.y, p.z, seed);
        const h2 = bioHash(p.y, p.z, p.x, seed * 1.37 + 2.1);

        let sinoid =
          0.5 * Math.sin(kTheta * theta + seed * Math.PI * 2 + g3 * 4) +
          0.32 *
            Math.sin(kPhi * phi + kTheta * 0.45 * theta + g2 * Math.PI * 2) +
          0.22 * Math.sin((kTheta + kPhi) * 0.5 * (theta + phi) + seed * 2.4) +
          0.14 * Math.sin(nr * 10 - phi * 2.5 + seed * 1.7) +
          0.08 * Math.sin(theta * 2 + phi * 3 + h * Math.PI * 2);

        const budAxis = theta * (1 + g1) - phi * (1.5 + g2) + seed;
        const buds =
          Math.sin(budAxis * budCount) * Math.cos(phi * 2 + seed + h2);
        sinoid += 0.22 * buds;

        const radius = gridHalf * (0.4 + 0.24 * nr) * (1 + 0.52 * sinoid);
        const stretch =
          1 +
          0.22 *
            (Math.sin(phi * 3 + g1 * Math.PI * 2) * 0.5 + buds * 0.35);
        let dx = Math.sin(phi) * Math.cos(theta);
        let dy = Math.cos(phi) * stretch + 0.18 * sinoid * Math.sin(phi + buds);
        let dz = Math.sin(phi) * Math.sin(theta);
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (len > 0.001) {
          dx /= len;
          dy /= len;
          dz /= len;
        }
        out.set(dx * radius, dy * radius, dz * radius);
        return out;
      }

      function morphedLatticePos(lx, ly, lz, morph, out) {
        const gridHalf = size / 2;
        morphTmpA.set(lx - gridHalf, ly - gridHalf, lz - gridHalf);
        const t = Math.min(1, Math.max(0, morph));
        const phase = t * 3;
        morphTorusVec(morphTmpA, gridHalf, morphTmpB);
        morphHelixVec(morphTmpA, gridHalf, morphTmpC);
        morphBioVec(morphTmpA, gridHalf, bioMorphSeed, morphTmpD);
        if (phase < 1) {
          out.lerpVectors(morphTmpA, morphTmpB, phase);
        } else if (phase < 2) {
          out.lerpVectors(morphTmpB, morphTmpC, phase - 1);
        } else {
          out.lerpVectors(morphTmpC, morphTmpD, phase - 2);
        }
        return out;
      }

      function claimSeedTargetNear(worldHint) {
        let best = -1;
        let bestScore = Infinity;
        const hintX = worldHint.x + size / 2;
        const hintY = worldHint.y + size / 2;
        const hintZ = worldHint.z + size / 2;

        // Sample live tissue for empty surface neighbors toward the click
        if (liveCount > 0) {
          const samples = Math.min(liveCount, 96);
          for (let s = 0; s < samples; s++) {
            const liveIdx = liveIndices[(Math.random() * liveCount) | 0];
            const lz = (liveIdx / sizeSq) | 0;
            const ly = ((liveIdx % sizeSq) / size) | 0;
            const lx = liveIdx % size;
            for (let n = 0; n < neighborOffsets.length; n++) {
              const nx = lx + neighborOffsets[n][0];
              const ny = ly + neighborOffsets[n][1];
              const nz = lz + neighborOffsets[n][2];
              if (
                nx < 0 ||
                nx >= size ||
                ny < 0 ||
                ny >= size ||
                nz < 0 ||
                nz >= size
              ) {
                continue;
              }
              const idx = getIndex(nx, ny, nz);
              if (grid[idx] === 1 || seedReserved.has(idx)) continue;
              const dx = nx - hintX;
              const dy = ny - hintY;
              const dz = nz - hintZ;
              const score = dx * dx + dy * dy + dz * dz + Math.random() * 12;
              if (score < bestScore) {
                bestScore = score;
                best = idx;
              }
            }
          }
        }

        if (best < 0) {
          // Fallback: empty cell near volume center toward the hint
          for (let attempt = 0; attempt < 48; attempt++) {
            const nx = Math.min(
              size - 1,
              Math.max(0, Math.round(hintX + (Math.random() - 0.5) * 12))
            );
            const ny = Math.min(
              size - 1,
              Math.max(0, Math.round(hintY + (Math.random() - 0.5) * 12))
            );
            const nz = Math.min(
              size - 1,
              Math.max(0, Math.round(hintZ + (Math.random() - 0.5) * 12))
            );
            const idx = getIndex(nx, ny, nz);
            if (grid[idx] === 0 && !seedReserved.has(idx)) {
              best = idx;
              break;
            }
          }
        }

        if (best >= 0) seedReserved.add(best);
        return best;
      }

      function spawnFlyingSeeds(worldPos, count) {
        const sp = activeSpeciesRef.value;
        let spawned = 0;
        for (let n = 0; n < count; n++) {
          const targetIndex = claimSeedTargetNear(worldPos);
          if (targetIndex < 0) break;

          let slot = -1;
          for (let k = 0; k < SEED_FLY_CAP; k++) {
            const i = (seedFlyCursor + k) % SEED_FLY_CAP;
            if (!flyingSeeds[i].active) {
              slot = i;
              seedFlyCursor = (i + 1) % SEED_FLY_CAP;
              break;
            }
          }
          if (slot < 0) {
            seedReserved.delete(targetIndex);
            break;
          }

          const seed = flyingSeeds[slot];
          seed.active = true;
          seed.ox = worldPos.x + (Math.random() - 0.5) * 2.5;
          seed.oy = worldPos.y + (Math.random() - 0.5) * 2.5;
          seed.oz = worldPos.z + (Math.random() - 0.5) * 2.5;
          seed.targetIndex = targetIndex;
          seed.species = sp;
          seed.t = 0;
          seed.duration = 0.55 + Math.random() * 0.55;

          const hex = sp === 1 ? '#ffaa33' : sp === 2 ? '#aa66ff' : '#33ddff';
          tempColor.set(hex);
          seedMesh.setColorAt(slot, tempColor);
          spawned++;
        }
        if (spawned > 0 && seedMesh.instanceColor) {
          seedMesh.instanceColor.needsUpdate = true;
        }
        return spawned;
      }

      function updateFlyingSeeds(dt) {
        let any = false;
        let landed = 0;
        for (let i = 0; i < SEED_FLY_CAP; i++) {
          const seed = flyingSeeds[i];
          if (!seed.active) continue;
          any = true;
          seed.t += dt / seed.duration;
          const idx = seed.targetIndex;
          const lz = (idx / sizeSq) | 0;
          const ly = ((idx % sizeSq) / size) | 0;
          const lx = idx % size;
          morphedLatticePos(lx, ly, lz, smoothMorph, seedTarget);

          if (seed.t >= 1) {
            seed.active = false;
            seedReserved.delete(idx);
            seedMesh.setMatrixAt(i, seedZero);
            if (grid[idx] === 0) {
              grid[idx] = 1;
              totalPopulation++;
              landed++;
            }
            species[idx] = seed.species;
            aSpeciesArr[idx] = seed.species;
            continue;
          }

          const u = seed.t * seed.t * (3 - 2 * seed.t);
          seedPos.set(
            seed.ox + (seedTarget.x - seed.ox) * u,
            seed.oy + (seedTarget.y - seed.oy) * u,
            seed.oz + (seedTarget.z - seed.oz) * u
          );
          const s = 1.15 - 0.25 * u;
          tempMatrix.makeScale(s, s, s);
          tempMatrix.setPosition(seedPos.x, seedPos.y, seedPos.z);
          seedMesh.setMatrixAt(i, tempMatrix);
        }
        if (any) {
          seedMesh.instanceMatrix.needsUpdate = true;
        }
        if (landed > 0) {
          organicStructuresValid = false;
          rebuildLiveIndices();
          geometry.attributes.aSpecies.needsUpdate = true;
        }
      }

      let totalPopulation = 0;
      const maxPopulation = Math.floor(cellCount * 0.3);
      const minPopulation = Math.floor(cellCount * 0.05);
      let isExpanding = true;

      const neighborCounts = new Uint8Array(cellCount);
      const cachedOrganicStructures = new Uint8Array(cellCount);
      let organicStructuresValid = false;
      let cachedShowOrganic = true;

      const liveIndices = new Uint32Array(cellCount);
      let liveCount = 0;

      const center = Math.floor(size / 2);
      const centerRadiusSq = 15 * 15;

      const neighborOffsets = [
        [0, 0, 1],
        [0, 0, -1],
        [0, 1, 0],
        [0, -1, 0],
        [1, 0, 0],
        [-1, 0, 0],
        [1, 1, 0],
        [1, -1, 0],
        [-1, 1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [1, 0, -1],
        [-1, 0, 1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, 1, -1],
        [0, -1, 1],
        [0, -1, -1],
      ];

      let time = 0;
      let lastTime = performance.now();
      let fpsFrames = 0;
      let fpsLastSample = performance.now();
      let displayedFps = 0;
      let lowFpsAccumMs = 0;
      let smoothMorph = 0;

      function countShellNeighbors(x, y, z) {
        let count = 0;
        const directions = [
          [1, 0, 0],
          [-1, 0, 0],
          [0, 1, 0],
          [0, -1, 0],
          [0, 0, 1],
          [0, 0, -1],
        ];
        for (let i = 0; i < directions.length; i++) {
          const nx = x + directions[i][0];
          const ny = y + directions[i][1];
          const nz = z + directions[i][2];
          if (
            nx >= 0 &&
            nx < size &&
            ny >= 0 &&
            ny < size &&
            nz >= 0 &&
            nz < size &&
            isInShell(nx, ny, nz) &&
            grid[getIndex(nx, ny, nz)] === 1
          ) {
            count++;
          }
        }
        return count;
      }

      function updateShell() {
        shellRegenerationTime += shellRegenerationSpeed;

        for (let i = 0; i < shellIndexArray.length; i++) {
          shellUpdates[shellIndexArray[i]] = grid[shellIndexArray[i]];
        }

        for (let i = 0; i < shellIndexArray.length; i++) {
          const index = shellIndexArray[i];
          const z = (index / sizeSq) | 0;
          const y = ((index % sizeSq) / size) | 0;
          const x = index % size;
          const neighbors = countShellNeighbors(x, y, z);
          const noiseX = Math.sin(x * 0.3 + shellRegenerationTime);
          const noiseY = Math.cos(y * 0.3 + shellRegenerationTime * 0.7);
          const noiseZ = Math.sin(z * 0.3 + shellRegenerationTime * 1.3);
          const combinedNoise = (noiseX + noiseY + noiseZ) / 3;

          if (grid[index] === 1) {
            if (neighbors < 1 || neighbors > 4 || Math.random() < 0.01) {
              shellUpdates[index] = 0;
            }
          } else if (
            neighbors >= 1 &&
            neighbors <= 3 &&
            Math.random() <
              shellGrowthProbability * (1 + 0.5 * combinedNoise)
          ) {
            shellUpdates[index] = 1;
          }
        }

        for (let i = 0; i < shellIndexArray.length; i++) {
          const index = shellIndexArray[i];
          const newState = shellUpdates[index];
          if (grid[index] !== newState) {
            if (newState === 0) {
              aScaleArr[index] = 0;
              totalPopulation--;
            } else {
              totalPopulation++;
              if (species[index] === 0) species[index] = 0;
            }
            grid[index] = newState;
            organicStructuresValid = false;
          }
        }
      }

      function countNeighbors(x, y, z) {
        let sum = 0;
        for (let i = 0; i < neighborOffsets.length; i++) {
          const nx = (x + neighborOffsets[i][0] + size) % size;
          const ny = (y + neighborOffsets[i][1] + size) % size;
          const nz = (z + neighborOffsets[i][2] + size) % size;
          sum += grid[getIndex(nx, ny, nz)];
        }
        return sum;
      }

      function rebuildLiveIndices() {
        liveCount = 0;
        for (let i = 0; i < cellCount; i++) {
          if (grid[i] === 1) liveIndices[liveCount++] = i;
        }
      }

      function majoritySpeciesAround(x, y, z) {
        const counts = [0, 0, 0];
        for (let i = 0; i < neighborOffsets.length; i++) {
          const nx = (x + neighborOffsets[i][0] + size) % size;
          const ny = (y + neighborOffsets[i][1] + size) % size;
          const nz = (z + neighborOffsets[i][2] + size) % size;
          const ni = getIndex(nx, ny, nz);
          if (grid[ni] === 1) counts[species[ni]]++;
        }
        let best = 0;
        if (counts[1] > counts[best]) best = 1;
        if (counts[2] > counts[best]) best = 2;
        return best;
      }

      function evaluateCell(state, neighbors, nearCenter, cellSpecies) {
        // Species 1: stricter survival / slower birth (gold)
        // Species 2: sparse sparkle births (violet)
        // Species 0: default organic rules
        const strict = cellSpecies === 1;
        const sparkle = cellSpecies === 2;

        if (state === 1) {
          if (isExpanding) {
            if (nearCenter) {
              return neighbors >= 2 && neighbors <= (strict ? 9 : 12) ? 1 : 0;
            }
            if (strict) return neighbors >= 4 && neighbors <= 7 ? 1 : 0;
            return neighbors >= 3 && neighbors <= 8 ? 1 : 0;
          }
          if (nearCenter) {
            return neighbors >= 2 && neighbors <= (strict ? 8 : 10) ? 1 : 0;
          }
          return neighbors >= (strict ? 5 : 4) && neighbors <= 7 ? 1 : 0;
        }

        if (neighbors === 0) return 0;

        let birthChance;
        let nMin;
        let nMax;
        if (isExpanding) {
          if (nearCenter) {
            nMin = sparkle ? 3 : 2;
            nMax = sparkle ? 6 : 8;
            birthChance = sparkle ? 0.35 : strict ? 0.55 : 0.85;
          } else {
            nMin = sparkle ? 4 : 3;
            nMax = sparkle ? 5 : 6;
            birthChance = sparkle ? 0.25 : strict ? 0.4 : 0.7;
          }
        } else if (nearCenter) {
          nMin = 3;
          nMax = sparkle ? 5 : 7;
          birthChance = sparkle ? 0.15 : strict ? 0.25 : 0.4;
        } else {
          nMin = 4;
          nMax = 6;
          birthChance = sparkle ? 0.05 : strict ? 0.08 : 0.15;
        }

        if (neighbors >= nMin && neighbors <= nMax && Math.random() < birthChance) {
          return 1;
        }
        return 0;
      }

      function setup() {
        const mainRadius = 15;
        const subRadius = 4;
        const offset = 6;

        const createSphere = (cx, cy, cz, radius, density, sp) => {
          for (let x = cx - radius; x <= cx + radius; x++) {
            for (let y = cy - radius; y <= cy + radius; y++) {
              for (let z = cz - radius; z <= cz + radius; z++) {
                if (
                  x >= 0 &&
                  x < size &&
                  y >= 0 &&
                  y < size &&
                  z >= 0 &&
                  z < size
                ) {
                  const dx = x - cx;
                  const dy = y - cy;
                  const dz = z - cz;
                  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                  if (distance <= radius) {
                    const index = getIndex(x, y, z);
                    const noise =
                      Math.sin(x * 0.2) * Math.cos(y * 0.2) * Math.sin(z * 0.2);
                    const adjustedDensity =
                      density * (1 - distance / radius) * (0.8 + 0.2 * noise);
                    if (Math.random() < adjustedDensity) {
                      grid[index] = 1;
                      species[index] = sp;
                    }
                  }
                }
              }
            }
          }
        };

        for (let i = 0; i < shellIndexArray.length; i++) {
          const index = shellIndexArray[i];
          const z = (index / sizeSq) | 0;
          const y = ((index % sizeSq) / size) | 0;
          const x = index % size;
          const isCorner =
            (x < shellThickness || x >= size - shellThickness) &&
            (y < shellThickness || y >= size - shellThickness) &&
            (z < shellThickness || z >= size - shellThickness);
          const isEdge =
            ((x < shellThickness || x >= size - shellThickness) &&
              (y < shellThickness || y >= size - shellThickness)) ||
            ((y < shellThickness || y >= size - shellThickness) &&
              (z < shellThickness || z >= size - shellThickness)) ||
            ((x < shellThickness || x >= size - shellThickness) &&
              (z < shellThickness || z >= size - shellThickness));
          if (isCorner) {
            grid[index] = 1;
          } else if (isEdge) {
            grid[index] = Math.random() < 0.5 ? 1 : 0;
          } else {
            grid[index] = Math.random() < 0.2 ? 1 : 0;
          }
          species[index] = 0;
        }

        createSphere(center, center, center, mainRadius, 0.98, 0);
        createSphere(center + offset, center + offset, center + offset, subRadius, 0.85, 1);
        createSphere(
          center - offset,
          center - offset,
          center - offset,
          subRadius,
          0.85,
          2
        );
        createSphere(center + offset, center - offset, center + offset, subRadius, 0.85, 1);
        createSphere(
          center - offset,
          center + offset,
          center - offset,
          subRadius,
          0.85,
          2
        );

        totalPopulation = 0;
        for (let i = 0; i < cellCount; i++) {
          if (grid[i] === 1) totalPopulation++;
        }

        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
              neighborCounts[getIndex(x, y, z)] = countNeighbors(x, y, z);
            }
          }
        }

        rebuildLiveIndices();
        organicStructuresValid = false;
      }

      function nextGeneration() {
        updateShell();
        let populationDelta = 0;

        for (let x = shellThickness; x < size - shellThickness; x++) {
          for (let y = shellThickness; y < size - shellThickness; y++) {
            for (let z = shellThickness; z < size - shellThickness; z++) {
              neighborCounts[getIndex(x, y, z)] = countNeighbors(x, y, z);
            }
          }
        }

        for (let i = 0; i < shellIndexArray.length; i++) {
          next[shellIndexArray[i]] = grid[shellIndexArray[i]];
        }

        for (let x = shellThickness; x < size - shellThickness; x++) {
          for (let y = shellThickness; y < size - shellThickness; y++) {
            for (let z = shellThickness; z < size - shellThickness; z++) {
              const index = getIndex(x, y, z);
              const state = grid[index];
              const neighbors = neighborCounts[index];
              const dx = x - center;
              const dy = y - center;
              const dz = z - center;
              const nearCenter = dx * dx + dy * dy + dz * dz <= centerRadiusSq;
              const cellSp = state === 1 ? species[index] : majoritySpeciesAround(x, y, z);

              const newState = evaluateCell(
                state,
                neighbors,
                nearCenter,
                cellSp
              );
              next[index] = newState;

              if (state !== newState) {
                populationDelta += newState - state;
                if (newState === 0) {
                  aScaleArr[index] = 0;
                } else {
                  species[index] = cellSp;
                }
              }
            }
          }
        }

        totalPopulation += populationDelta;
        if (totalPopulation >= maxPopulation) isExpanding = false;
        else if (totalPopulation <= minPopulation) isExpanding = true;

        if (populationDelta !== 0) {
          organicStructuresValid = false;
          geometry.attributes.aScale.needsUpdate = true;
        }

        const swap = grid;
        grid = next;
        next = swap;
        rebuildLiveIndices();
      }

      const organicAdj = [
        [-1, 0, 0],
        [1, 0, 0],
        [0, -1, 0],
        [0, 1, 0],
        [0, 0, -1],
        [0, 0, 1],
      ];

      function updateOrganicStructuresCache() {
        cachedOrganicStructures.fill(0);
        for (let i = 0; i < liveCount; i++) {
          const index = liveIndices[i];
          if (neighborCounts[index] >= 10) {
            cachedOrganicStructures[index] = 1;
          }
        }
        for (let i = 0; i < liveCount; i++) {
          const index = liveIndices[i];
          if (cachedOrganicStructures[index] !== 0) continue;
          const z = (index / sizeSq) | 0;
          const y = ((index % sizeSq) / size) | 0;
          const x = index % size;
          for (let a = 0; a < organicAdj.length; a++) {
            const nx = x + organicAdj[a][0];
            const ny = y + organicAdj[a][1];
            const nz = z + organicAdj[a][2];
            if (
              nx >= 0 &&
              nx < size &&
              ny >= 0 &&
              ny < size &&
              nz >= 0 &&
              nz < size &&
              cachedOrganicStructures[getIndex(nx, ny, nz)] === 1
            ) {
              cachedOrganicStructures[index] = 2;
              break;
            }
          }
        }
        organicStructuresValid = true;
        let organicCount = 0;
        for (let i = 0; i < liveCount; i++) {
          if (cachedOrganicStructures[liveIndices[i]] > 0) organicCount++;
        }
        cachedShowOrganic = organicCount <= cellCount * 0.05;
      }

      const outerLayerDepth = 2;

      const draw = () => {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - lastTime) * 0.001, 0.05);
        time += deltaTime;
        lastTime = currentTime;

        fpsFrames++;
        const sampleDelta = currentTime - fpsLastSample;
        if (sampleDelta >= 250) {
          displayedFps = Math.round((fpsFrames * 1000) / sampleDelta);
          fpsFrames = 0;
          fpsLastSample = currentTime;

          if (qualityLevel > QUALITY_RAW && displayedFps > 0 && displayedFps < 30) {
            lowFpsAccumMs += sampleDelta;
            if (lowFpsAccumMs >= 1000) {
              qualityLevel -= 1;
              applyQuality();
              lowFpsAccumMs = 0;
            }
          } else {
            lowFpsAccumMs = 0;
          }

          perfBadge.value = `${displayedFps} fps · Q:${QUALITY_LABELS[qualityLevel]}`;
        }

        const centerBrightness =
          0.7 + 0.2 * Math.sin(time * 0.2) + 0.1 * Math.sin(time * 0.5);
        bgColor.setRGB(
          (0 / 255) * centerBrightness * 0.3,
          (26 / 255) * centerBrightness * 0.5,
          (51 / 255) * (0.6 + 0.4 * centerBrightness)
        );
        scene.background = bgColor;

        pulseLights.forEach((light, i) => {
          light.intensity =
            0.5 +
            0.3 * Math.sin(time * (0.3 + i * 0.1)) +
            0.2 * Math.sin(time * (0.7 + i * 0.2));
          const baseAngle = time * 0.15 + (i * Math.PI * 2) / 3;
          const radius = 20 + 8 * Math.sin(time * 0.08 + i * 0.5);
          light.position.x = Math.sin(baseAngle) * radius;
          light.position.z = Math.cos(baseAngle) * radius;
          light.position.y = 10 * Math.sin(time * 0.2 + i * 0.3);
        });

        internalLights.forEach((light, i) => {
          const timeOffset = (i * Math.PI) / 2;
          light.intensity = 0.8 + 0.4 * Math.sin(time * 0.3 + timeOffset);
          light.position.x = Math.sin(time * 0.2 + timeOffset) * 15;
          light.position.y = Math.cos(time * 0.15 + timeOffset) * 15;
          light.position.z = Math.sin(time * 0.25 + timeOffset) * 15;
        });

        rimLight.position.x = Math.sin(time * 0.08) * 70;
        rimLight.position.z = Math.cos(time * 0.08) * 70;
        rimLight.intensity = 0.8 + 0.2 * Math.sin(time * 0.3);

        if (impactLightLife > 0) {
          impactLightLife -= deltaTime;
          impactLight.intensity = Math.max(0, impactLightLife * 8);
        }

        const cycleTime = 28.0;
        const progress = (Math.sin((time * Math.PI * 2) / cycleTime) + 1) / 2;
        smoothMorph = progress * progress * (3 - 2 * progress);

        const inBioPhase = smoothMorph >= 2 / 3;
        if (!inBioPhase && wasInBioPhase) {
          bioMorphSeed = Math.random() * 1000;
        }
        wasInBioPhase = inBioPhase;

        updateFlyingSeeds(deltaTime);
        controls.update();

        material.uniforms.uMorph.value = smoothMorph;
        material.uniforms.uTime.value = time;
        material.uniforms.uExpand.value = isExpanding ? 1 : 0;
        material.uniforms.uMorphSeed.value = bioMorphSeed;

        const popNorm = totalPopulation / cellCount;
        hazeUniforms.uTime.value = time;
        hazeUniforms.uExpand.value = isExpanding ? 1 : 0;
        hazeUniforms.uPopulation.value = popNorm;

        if (audioEngine) {
          audioEngine.update({
            populationNorm: popNorm,
            expanding: isExpanding,
            morph: smoothMorph,
          });
        }

        if (!organicStructuresValid) {
          updateOrganicStructuresCache();
        }
        const showOrganic = cachedShowOrganic;
        const pulseIntensity = isExpanding ? 0.4 : 0.3;
        const baseScale = isExpanding ? 0.9 : 0.7;

        for (let i = 0; i < liveCount; i++) {
          const index = liveIndices[i];
          const z = (index / sizeSq) | 0;
          const y = ((index % sizeSq) / size) | 0;
          const x = index % size;

          const isOuterLayer =
            x < outerLayerDepth ||
            x >= size - outerLayerDepth ||
            y < outerLayerDepth ||
            y >= size - outerLayerDepth ||
            z < outerLayerDepth ||
            z >= size - outerLayerDepth;

          const isOrganic =
            cachedOrganicStructures[index] > 0 && showOrganic && !isOuterLayer;

          let customScale = 1.0;
          if (isOrganic) {
            customScale = 1.3 + 0.2 * Math.sin(time * 0.5 + (x + y + z) * 0.1);
          }

          aScaleArr[index] =
            baseScale * customScale +
            pulseIntensity * Math.sin(time + (x + y + z) * 0.1);
          aOrganicArr[index] = isOrganic ? 1 : 0;
          aSpeciesArr[index] = species[index];

          let hue;
          let saturation;
          let lightness;
          const sp = species[index];
          if (isOrganic) {
            hue = (0.7 + 0.3 * Math.sin(time * 0.3 + (x + y + z) * 0.02)) % 1;
            saturation = 1.0;
            lightness =
              0.65 + 0.25 * Math.sin(time * 0.4 + (x + y + z) * 0.03);
          } else if (sp === 1) {
            hue = 0.08 + 0.04 * Math.sin(time + x * 0.05);
            saturation = 0.95;
            lightness = 0.55 + 0.1 * Math.sin(time * 0.5);
          } else if (sp === 2) {
            hue = 0.75 + 0.08 * Math.sin(time * 0.4 + z * 0.05);
            saturation = 0.9;
            lightness = 0.5 + 0.15 * Math.sin(time * 0.6);
          } else {
            hue = isExpanding
              ? ((x + y + z) / (size * 3) + time * 0.05) % 1
              : (0.65 + 0.15 * Math.sin(time)) % 1;
            saturation = 0.95;
            lightness = isExpanding
              ? 0.6 + 0.1 * Math.sin(time + (x + y + z) * 0.05)
              : 0.5 + 0.1 * Math.sin(time + (x + y + z) * 0.05);
          }

          tempColor.setHSL(hue, saturation, lightness);
          instancedMesh.setColorAt(index, tempColor);
        }

        geometry.attributes.aScale.needsUpdate = true;
        geometry.attributes.aOrganic.needsUpdate = true;
        geometry.attributes.aSpecies.needsUpdate = true;
        if (instancedMesh.instanceColor) {
          instancedMesh.instanceColor.needsUpdate = true;
        }

        if (qualityLevel >= QUALITY_BLOOM) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      };

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const hitPoint = new THREE.Vector3();

      function applyEraseAlongRay(ray) {
        // Brush radius in world units (morph-aware cylinder along the view ray)
        const brushRadius = size * 0.18;
        const brushRadiusSq = brushRadius * brushRadius;
        let erased = 0;
        let impactT = Infinity;

        const count = liveCount;
        for (let i = 0; i < count; i++) {
          const index = liveIndices[i];
          if (grid[index] !== 1) continue;

          const lz = (index / sizeSq) | 0;
          const ly = ((index % sizeSq) / size) | 0;
          const lx = index % size;
          morphedLatticePos(lx, ly, lz, smoothMorph, seedTarget);

          seedPos.subVectors(seedTarget, ray.origin);
          const t = seedPos.dot(ray.direction);
          if (t < 0) continue;

          const distSq = Math.max(0, seedPos.lengthSq() - t * t);
          if (distSq > brushRadiusSq) continue;

          aScaleArr[index] = 0;
          grid[index] = 0;
          totalPopulation--;
          erased++;
          organicStructuresValid = false;
          if (t < impactT) impactT = t;
        }

        if (erased > 0) {
          hitPoint.copy(ray.origin).addScaledVector(ray.direction, impactT);
          impactLight.position.copy(hitPoint);
          impactLightLife = 0.35;
          if (audioEngine) audioEngine.eraseBurst();
          rebuildLiveIndices();
          geometry.attributes.aScale.needsUpdate = true;
        }
      }

      function applySeedAtWorld(worldPos) {
        const now = performance.now();
        if (now - lastSeedSpawnMs < 45) return;
        lastSeedSpawnMs = now;

        const spawned = spawnFlyingSeeds(worldPos, 10);
        if (spawned > 0) {
          impactLight.position.copy(worldPos);
          impactLightLife = 0.25;
          if (audioEngine) audioEngine.seedChirp();
        }
      }

      function getSeedWorldPoint() {
        camera.getWorldDirection(seedCamDir);
        seedSphere.radius = size * 0.78;
        if (raycaster.ray.intersectSphere(seedSphere, hitPoint)) {
          return hitPoint;
        }
        seedPlane.setFromNormalAndCoplanarPoint(seedCamDir, seedSphere.center);
        if (raycaster.ray.intersectPlane(seedPlane, hitPoint)) {
          return hitPoint;
        }
        hitPoint
          .copy(raycaster.ray.origin)
          .addScaledVector(raycaster.ray.direction, size * 0.9);
        return hitPoint;
      }

      function updateCellFromMouse(event) {
        const mode = toolModeRef.value;
        if (mode !== 'erase' && mode !== 'seed') return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / width.value) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / height.value) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        if (mode === 'seed') {
          applySeedAtWorld(getSeedWorldPoint());
          return;
        }

        applyEraseAlongRay(raycaster.ray);
      }

      const handleKeyDown = (e) => {
        const key = e.key.toLowerCase();
        if (audioEngine) audioEngine.unlock();

        if (key === 'e') {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setTool(toolMode.value === 'erase' ? 'none' : 'erase');
          } else {
            toolMode.value = 'erase';
            toolModeRef.value = 'erase';
            syncToolControls();
          }
        } else if (key === 's' && !e.ctrlKey && !e.metaKey) {
          toolMode.value = 'seed';
          toolModeRef.value = 'seed';
          syncToolControls();
        } else if (key === '1' || key === '2' || key === '3') {
          activeSpecies.value = Number(key) - 1;
          activeSpeciesRef.value = activeSpecies.value;
        } else if (key === 'm') {
          toggleMute();
        }
      };

      const handleKeyUp = (e) => {
        const key = e.key.toLowerCase();
        if (key === 'e' && !e.ctrlKey && !e.metaKey) {
          if (toolMode.value === 'erase') {
            toolMode.value = 'none';
            toolModeRef.value = 'none';
            syncToolControls();
          }
        } else if (key === 's' && !e.ctrlKey && !e.metaKey) {
          if (toolMode.value === 'seed') {
            toolMode.value = 'none';
            toolModeRef.value = 'none';
            syncToolControls();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      const onMouseDown = (e) => {
        if (audioEngine) audioEngine.unlock();
        if (toolModeRef.value !== 'none') {
          gamePaused = true;
          updateCellFromMouse(e);
        }
      };
      const onMouseUp = () => {
        gamePaused = false;
      };
      const onMouseMove = (e) => {
        if (gamePaused && toolModeRef.value !== 'none') {
          updateCellFromMouse(e);
        }
      };
      const onTouchStart = (e) => {
        e.preventDefault();
        if (audioEngine) audioEngine.unlock();
        if (toolModeRef.value !== 'none') {
          gamePaused = true;
          updateCellFromMouse(e.touches[0]);
        }
      };
      const onTouchEnd = () => {
        gamePaused = false;
      };
      const onTouchMove = (e) => {
        e.preventDefault();
        if (gamePaused && toolModeRef.value !== 'none') {
          updateCellFromMouse(e.touches[0]);
        }
      };

      renderer.domElement.addEventListener('mousedown', onMouseDown);
      renderer.domElement.addEventListener('mouseup', onMouseUp);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('touchstart', onTouchStart, {
        passive: false,
      });
      renderer.domElement.addEventListener('touchend', onTouchEnd);
      renderer.domElement.addEventListener('touchmove', onTouchMove, {
        passive: false,
      });

      const gameLoop = () => {
        frameCount++;
        if (!gamePaused && frameCount % 5 === 0) {
          nextGeneration();
        }
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
      };

      const onResize = () => {
        measureContainer();
        camera.aspect = width.value / height.value;
        camera.updateProjectionMatrix();
        renderer.setSize(width.value, height.value);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
        composer.setSize(width.value, height.value);
        bloomPass.resolution.set(width.value, height.value);
      };
      window.addEventListener('resize', onResize);
      const resizeObserver =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(() => onResize())
          : null;
      if (resizeObserver && canvasContainer.value) {
        resizeObserver.observe(canvasContainer.value);
      }

      setup();
      gameLoop();

      disposeScene = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('resize', onResize);
        if (resizeObserver) resizeObserver.disconnect();

        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('touchstart', onTouchStart);
        renderer.domElement.removeEventListener('touchend', onTouchEnd);
        renderer.domElement.removeEventListener('touchmove', onTouchMove);

        if (audioEngine) {
          audioEngine.dispose();
          audioEngine = null;
        }

        controls.dispose();
        geometry.dispose();
        material.dispose();
        seedGeom.dispose();
        seedMat.dispose();
        if (composer && typeof composer.dispose === 'function') {
          composer.dispose();
        }
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        controlsRef = null;
      };
    };

    onMounted(() => {
      initScene();
    });

    onUnmounted(() => {
      if (disposeScene) {
        disposeScene();
        disposeScene = null;
      }
    });
</script>

<style scoped>
.morph-field {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
}

.morph-stage {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  background: #001a33;
}

.morph-canvas {
  width: 100%;
  height: 100%;
  min-height: 420px;
}

.morph-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.perf-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 10px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  color: #a8e6ff;
  background: rgba(0, 20, 40, 0.75);
  border: 1px solid rgba(0, 255, 255, 0.35);
  border-radius: 4px;
  z-index: 2;
  pointer-events: none;
  user-select: none;
}

.toolbar {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 320px;
  justify-content: flex-end;
  z-index: 2;
}

.tool-btn {
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(0, 68, 136, 0.85);
  color: white;
  border: 2px solid rgba(0, 255, 255, 0.45);
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tool-btn:hover {
  background: rgba(0, 68, 136, 0.95);
  border-color: rgba(0, 255, 255, 0.8);
}

.tool-btn.active {
  background: rgba(170, 0, 255, 0.9);
  border-color: rgba(255, 51, 119, 0.8);
  box-shadow: 0 4px 16px rgba(170, 0, 255, 0.45);
}

.tool-btn:active {
  transform: scale(0.96);
}

.error-message {
  padding: 20px;
  color: #b91c1c;
  background: rgba(255, 0, 0, 0.08);
  border: 1px solid #b91c1c;
  border-radius: 4px;
}
</style>
