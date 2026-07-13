<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <div class="flex items-center gap-1 rounded-md border border-border/60 p-0.5">
    <NuxtLink
      v-for="loc in locales"
      :key="loc.code"
      :to="switchLocalePath(loc.code)"
      class="rounded px-2 py-1 text-xs font-medium transition-colors"
      :class="locale === loc.code
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:text-foreground'"
      :aria-current="locale === loc.code ? 'true' : undefined"
    >
      {{ loc.code.toUpperCase() }}
    </NuxtLink>
  </div>
</template>
