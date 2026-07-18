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
</script>
