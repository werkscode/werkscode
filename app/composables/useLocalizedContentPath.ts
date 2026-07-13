export function useLocalizedContentPath() {
  const { locale } = useI18n()

  function localizedPath(path: string) {
    const normalized = path.startsWith('/') ? path : `/${path}`
    return locale.value === 'de' ? `/de${normalized}` : normalized
  }

  return { localizedPath }
}
