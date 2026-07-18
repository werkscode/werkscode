<script setup lang="ts">
import type { StepFace } from '#shared/types/step-model'
import type { FaceOverrideState } from '@/lib/face-classification-registry'

const props = defineProps<{
  modelUrl: string | null
  faces?: StepFace[]
  class?: string
}>()

const emit = defineEmits<{
  faceAreaChanged: [state: FaceOverrideState]
}>()

const faceEditEnabled = defineModel<boolean>('faceEditEnabled', { default: false })

const containerRef = ref<HTMLElement | null>(null)
const scene = usePartModelScene()
const mounted = ref(false)
const showFaceClassification = ref(true)

async function loadCurrentModel() {
  await scene.loadModel(props.modelUrl, props.faces ?? [])
  scene.setFaceClassificationVisible(showFaceClassification.value)
  scene.setFaceEditEnabled(faceEditEnabled.value)
}

onMounted(async () => {
  if (!containerRef.value) {
    return
  }
  scene.onFaceOverridesChange((state) => {
    emit('faceAreaChanged', state)
  })
  await scene.mount(containerRef.value)
  mounted.value = true
  if (props.modelUrl) {
    await loadCurrentModel()
  }
})

onUnmounted(() => {
  scene.dispose()
})

watch(
  () => [props.modelUrl, props.faces] as const,
  async () => {
    if (mounted.value) {
      await loadCurrentModel()
    }
  },
)

watch(showFaceClassification, (visible) => {
  scene.setFaceClassificationVisible(visible)
})

watch(faceEditEnabled, (enabled) => {
  scene.setFaceEditEnabled(enabled)
  if (enabled) {
    showFaceClassification.value = true
  }
})
</script>

<template>
  <div class="space-y-2">
    <div
      ref="containerRef"
      :class="['h-80 w-full overflow-hidden rounded-lg border bg-muted/20', props.class]"
    />
    <div
      v-if="modelUrl"
      class="space-y-2"
    >
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <label class="flex cursor-pointer items-center gap-2">
          <input
            v-model="showFaceClassification"
            type="checkbox"
            class="size-4 rounded border accent-primary"
          >
          <span>Flächenklassifizierung anzeigen</span>
        </label>
        <label
          v-if="faces?.length"
          class="flex cursor-pointer items-center gap-2"
        >
          <input
            v-model="faceEditEnabled"
            type="checkbox"
            class="size-4 rounded border accent-primary"
          >
          <span>Flächen bearbeiten</span>
        </label>
        <template v-if="showFaceClassification">
          <span class="flex items-center gap-1.5">
            <span class="inline-block size-3 rounded-sm bg-[#2563EB]" />
            Außenfläche (pulverbeschichtbar)
          </span>
          <span class="flex items-center gap-1.5">
            <span class="inline-block size-3 rounded-sm bg-[#DC2626]" />
            Innenfläche (nicht beschichtet)
          </span>
        </template>
      </div>
      <p
        v-if="faceEditEnabled"
        class="text-xs text-muted-foreground"
      >
        Klicken Sie auf eine Fläche, um Außen/Innen umzuschalten. Ziehen zum Drehen.
      </p>
    </div>
    <p
      v-if="!modelUrl"
      class="text-xs text-muted-foreground"
    >
      STEP-Datei hochladen für 3D-Vorschau.
    </p>
  </div>
</template>
