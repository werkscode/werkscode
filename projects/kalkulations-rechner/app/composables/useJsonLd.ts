/**
 * Injects a schema.org JSON-LD graph into the document head.
 */
export function useJsonLd(
  graph: MaybeRefOrGetter<Record<string, unknown> | Record<string, unknown>[]>,
) {
  useHead(() => {
    const value = toValue(graph)
    const nodes = Array.isArray(value) ? value : [value]
    return {
      script: [
        {
          key: 'jsonld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': nodes,
          }),
        },
      ],
    }
  })
}
