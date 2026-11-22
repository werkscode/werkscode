<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.about.title'),
  description: () => t('seo.about.description') || undefined,
})
</script>

<template>
  <EditorialPage slug="about" />
</template>
