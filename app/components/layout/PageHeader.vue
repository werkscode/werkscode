<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  align?: 'left' | 'center'
}>()
</script>

<template>
  <header
    class="mb-12 sm:mb-16"
    :class="$props.align === 'center' ? 'text-center' : 'text-left'"
  >
    <div
      v-if="$slots.eyebrow"
      class="mb-5 flex flex-wrap items-center gap-3"
      :class="$props.align === 'center' && 'justify-center'"
    >
      <slot name="eyebrow" />
    </div>
    <h1
      class="max-w-4xl break-words text-4xl leading-[1.05] min-w-0 sm:text-5xl lg:text-6xl"
      :class="$props.align === 'center' && 'mx-auto'"
    >
      {{ title }}
    </h1>
    <p
      v-if="description"
      class="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground"
      :class="$props.align === 'center' && 'mx-auto'"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="mt-8"
      :class="$props.align === 'center' && 'flex justify-center'"
    >
      <slot />
    </div>
  </header>
</template>
