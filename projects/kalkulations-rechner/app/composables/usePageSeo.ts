/**
 * Applies title, description, Open Graph, canonical URL, and optional robots meta.
 */
export function usePageSeo(options: {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  path: MaybeRefOrGetter<string>
  robots?: MaybeRefOrGetter<string | undefined>
}) {
  const config = useRuntimeConfig()

  const canonical = computed(() => {
    const base = (config.public.appUrl as string) || 'https://kalkulator.werkscode.de'
    const path = toValue(options.path)
    const normalized = !path || path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`
    return `${base.replace(/\/$/, '')}${normalized === '/' ? '/' : normalized}`
  })

  useHead(() => ({
    link: [
      {
        rel: 'canonical',
        href: canonical.value,
      },
    ],
  }))

  useSeoMeta({
    title: () => toValue(options.title),
    description: () => toValue(options.description),
    ogTitle: () => toValue(options.title),
    ogDescription: () => toValue(options.description),
    ogUrl: () => canonical.value,
    ogType: 'website',
    ...(options.robots
      ? { robots: () => toValue(options.robots) }
      : {}),
  })
}
