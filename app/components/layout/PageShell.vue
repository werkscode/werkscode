<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  width?: 'default' | 'narrow'
  class?: string
}>(), {
  width: 'default',
})
</script>

<template>
  <div
    :class="cn(
      'mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20',
      props.class,
    )"
  >
    <div :class="props.width === 'narrow' ? 'max-w-3xl' : 'w-full'">
      <slot />
    </div>
  </div>
</template>
