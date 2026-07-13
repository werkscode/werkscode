<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.about.title'),
  description: () => t('seo.about.description'),
})
</script>

<template>
  <PageShell>
    <PageHeader
      :title="t('about.title')"
      :description="t('about.description')"
    />
  </PageShell>
</template>
