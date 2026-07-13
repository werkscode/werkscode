<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const { t } = useI18n()
const THEME_KEY = 'werkscode-theme'

const isDark = ref(false)

onMounted(() => {
  const stored = localStorage.getItem(THEME_KEY)
  isDark.value = stored === 'dark'
    || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
})

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :aria-label="t('theme.toggle')"
    @click="toggleTheme"
  >
    <Sun v-if="isDark" class="size-4" />
    <Moon v-else class="size-4" />
  </Button>
</template>
