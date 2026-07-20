<template>
  <TooltipProvider>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </TooltipProvider>
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

const config = useRuntimeConfig()

const ogImage = computed(() => {
  const base = config.public.appUrl as string | undefined
  if (!base) return '/og.png'
  return `${base.replace(/\/$/, '')}/og.png`
})

useSeoMeta({
  ogImage: () => ogImage.value,
  twitterImage: () => ogImage.value,
  ogLocale: 'de_DE',
  twitterCard: 'summary_large_image',
})
</script>
