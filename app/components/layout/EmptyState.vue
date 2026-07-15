<script setup lang="ts">
const props = withDefaults(defineProps<{
  ctaTo?: string
  ctaLabel?: string
  secondaryCtaTo?: string
  secondaryCtaLabel?: string
}>(), {})
</script>

<template>
  <div class="rounded-md border-2 border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
    <p class="text-base text-muted-foreground">
      <slot />
    </p>
    <p
      v-if="$slots.hint"
      class="mt-3 text-sm text-muted-foreground"
    >
      <slot name="hint" />
    </p>
    <div
      v-if="ctaTo || secondaryCtaTo"
      class="mt-6 flex flex-wrap justify-center gap-3"
    >
      <Button
        v-if="ctaTo && ctaLabel"
        size="lg"
        as-child
      >
        <NuxtLink :to="ctaTo" class="whitespace-nowrap">
          {{ ctaLabel }}
        </NuxtLink>
      </Button>
      <Button
        v-if="secondaryCtaTo && secondaryCtaLabel"
        variant="outline"
        size="lg"
        as-child
      >
        <NuxtLink :to="secondaryCtaTo" class="whitespace-nowrap">
          {{ secondaryCtaLabel }}
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
