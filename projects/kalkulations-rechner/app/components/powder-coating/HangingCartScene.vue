<script setup lang="ts">
import type { HangingCartLayout } from '#shared/lib/hanging-cart-layout'

const props = defineProps<{
  layout: HangingCartLayout | null
  partModelUrl?: string | null
  class?: string
}>()

const containerRef = ref<HTMLElement | null>(null)
const scene = useHangingCartScene()
const mounted = ref(false)

onMounted(async () => {
  if (!containerRef.value) {
    return
  }
  await scene.mount(containerRef.value)
  mounted.value = true
  await scene.updateLayout(props.layout, props.partModelUrl)
})

onUnmounted(() => {
  scene.dispose()
})

watch(
  () => [props.layout, props.partModelUrl] as const,
  async ([layout, partModelUrl]) => {
    if (mounted.value) {
      await scene.updateLayout(layout, partModelUrl)
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="space-y-2">
    <div
      ref="containerRef"
      :class="['h-80 w-full overflow-hidden rounded-lg border bg-muted/20', props.class]"
    />
    <p
      v-if="layout && layout.partsPerCart === 0"
      class="text-xs text-destructive"
    >
      {{ layout.reason ?? 'Teil passt nicht in den Wagen.' }}
    </p>
    <p
      v-else-if="layout"
      class="text-xs text-muted-foreground"
    >
      {{ layout.partsPerCart }} Teil(e) auf diesem Wagen · {{ layout.orientationMode === 'auto' ? 'Orientierung automatisch' : 'Orientierung manuell' }}
    </p>
    <p
      v-else
      class="text-xs text-muted-foreground"
    >
      Gültige Maße eingeben für 3D-Vorschau.
    </p>
  </div>
</template>
