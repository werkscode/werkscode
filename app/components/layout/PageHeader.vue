<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="mb-10 sm:mb-12">
    <div v-if="$slots.eyebrow" class="mb-4 flex flex-wrap items-center gap-3">
      <slot name="eyebrow" />
    </div>
    <h1 class="text-4xl sm:text-5xl">
      {{ title }}
    </h1>
    <p
      v-if="description"
      class="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground"
    >
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </header>
</template>
