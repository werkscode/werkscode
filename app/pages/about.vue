<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.about.title'),
  description: () => t('seo.about.description'),
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
    <h1 class="text-4xl">
      {{ t('about.title') }}
    </h1>
    <p class="mt-6 text-lg text-muted-foreground">
      {{ t('about.description') }}
    </p>
  </div>
</template>
