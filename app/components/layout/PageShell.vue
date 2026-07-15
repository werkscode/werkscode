<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  width?: 'default' | 'narrow' | 'wide'
  class?: string
}>(), {
  width: 'default',
})
</script>

<template>
  <div
    :class="cn(
      'mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20',
      props.class,
    )"
  >
    <div
      :class="cn(
        props.width === 'narrow' && 'max-w-3xl',
        props.width === 'wide' && 'w-full',
        props.width === 'default' && 'w-full',
      )"
    >
      <slot />
    </div>
  </div>
</template>
