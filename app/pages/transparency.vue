<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.transparency.title'),
  description: () => t('seo.transparency.description') || undefined,
})
</script>

<template>
  <EditorialPage slug="transparency" />
</template>
