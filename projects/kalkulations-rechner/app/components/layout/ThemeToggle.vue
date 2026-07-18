<script setup lang="ts">
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ThemePreference } from '@/composables/useTheme'

const { preference, setTheme } = useTheme()

const options: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Hell', icon: SunIcon },
  { value: 'dark', label: 'Dunkel', icon: MoonIcon },
  { value: 'auto', label: 'System', icon: MonitorIcon },
]

const activeIcon = computed(() => {
  if (preference.value === 'dark') {
    return MoonIcon
  }
  if (preference.value === 'light') {
    return SunIcon
  }
  return MonitorIcon
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon-sm" aria-label="Darstellung wechseln">
        <component :is="activeIcon" class="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-40">
      <DropdownMenuItem
        v-for="option in options"
        :key="option.value"
        class="cursor-pointer"
        @click="setTheme(option.value)"
      >
        <component :is="option.icon" class="size-4" />
        <span>{{ option.label }}</span>
        <CheckIcon
          v-if="preference === option.value"
          class="ml-auto size-4"
        />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
