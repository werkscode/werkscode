<script setup lang="ts">
import type { Component } from 'vue'
import {
  CogIcon,
  HistoryIcon,
  HomeIcon,
  PaintbrushIcon,
} from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface AppNavItem {
  label: string
  to?: string
  icon: Component
  available: boolean
  settingsTo?: string
}

const powderCoatingPath = '/powder-coating'
const powderCoatingSetupPath = '/powder-coating/setup'
const powderCoatingCalculationsPath = '/powder-coating/calculations'

const navItems: AppNavItem[] = [
  { label: 'Übersicht', to: '/', icon: HomeIcon, available: true },
  { label: 'Pulverbeschichtung', to: powderCoatingPath, icon: PaintbrushIcon, available: true, settingsTo: powderCoatingSetupPath },
  { label: 'Kalkulationen', to: powderCoatingCalculationsPath, icon: HistoryIcon, available: true },
]

const props = defineProps<{
  onNavigate?: () => void
}>()

const route = useRoute()

function isNavActive(item: AppNavItem): boolean {
  if (!item.to) {
    return false
  }
  if (item.to === '/') {
    return route.path === '/'
  }
  if (item.to === powderCoatingCalculationsPath) {
    return route.path === powderCoatingCalculationsPath
      || route.path.startsWith(`${powderCoatingCalculationsPath}/`)
  }
  if (item.to === powderCoatingPath) {
    return route.path === powderCoatingPath
      || (
        route.path.startsWith(`${powderCoatingPath}/`)
        && route.path !== powderCoatingSetupPath
        && !route.path.startsWith(powderCoatingCalculationsPath)
      )
  }
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

function isSettingsActive(settingsTo?: string): boolean {
  return Boolean(settingsTo && route.path === settingsTo)
}

function handleNavigate() {
  props.onNavigate?.()
}
</script>

<template>
  <nav class="space-y-1" aria-label="Prozesse">
    <template v-for="item in navItems" :key="item.label">
      <div v-if="item.available && item.to" class="flex items-center gap-1">
        <NuxtLink :to="item.to" :class="cn(
          'flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
          isNavActive(item)
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-muted',
        )" @click="handleNavigate">
          <component :is="item.icon" class="size-4 shrink-0 opacity-80" />
          <span class="truncate">{{ item.label }}</span>
        </NuxtLink>
        <NuxtLink v-if="item.settingsTo" :to="item.settingsTo" title="Einstellungen" aria-label="Einstellungen" :class="cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
          isSettingsActive(item.settingsTo)
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )" @click="handleNavigate">
          <CogIcon class="size-4" />
        </NuxtLink>
      </div>
      <span v-else class="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground">
        <span class="flex min-w-0 items-center gap-2.5">
          <component :is="item.icon" class="size-4 shrink-0 opacity-50" />
          <span class="truncate">{{ item.label }}</span>
        </span>
        <Badge variant="outline" class="shrink-0 text-[10px]">
          Bald
        </Badge>
      </span>
    </template>
  </nav>
</template>
