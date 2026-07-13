<script setup lang="ts">
const config = useRuntimeConfig()

const ogImage = computed(() => {
  const base = config.public.appUrl
  if (!base) return '/logo.png'
  return `${base.replace(/\/$/, '')}/logo.png`
})

useSeoMeta({
  ogImage: () => ogImage.value,
  twitterImage: () => ogImage.value,
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
