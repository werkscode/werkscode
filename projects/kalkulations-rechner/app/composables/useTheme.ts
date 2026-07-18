import { useColorMode } from '@vueuse/core'

export type ThemePreference = 'light' | 'dark' | 'auto'

export function useTheme() {
  const colorMode = useColorMode({
    attribute: 'class',
    modes: {
      light: '',
      dark: 'dark',
    },
    storageKey: 'kalkulations-theme',
    initialValue: 'auto',
  })

  const preference = computed<ThemePreference>(() => {
    const value = colorMode.value
    if (value === 'light' || value === 'dark' || value === 'auto') {
      return value
    }
    return 'auto'
  })

  const isDark = computed(() => colorMode.value === 'dark')

  function setTheme(theme: ThemePreference) {
    colorMode.value = theme
  }

  return {
    preference,
    isDark,
    setTheme,
  }
}
