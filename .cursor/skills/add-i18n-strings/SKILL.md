---
name: add-i18n-strings
description: Adds matching translation keys to en.json and de.json for UI copy and SEO meta. Use when adding new UI text, translations, or editing Vue pages with user-facing strings.
disable-model-invocation: true
---

# Add i18n Strings

## Checklist

```
- [ ] Add key to i18n/locales/en.json
- [ ] Add same nested key to i18n/locales/de.json
- [ ] Use t('key') in Vue (never hardcode copy)
- [ ] Add seo.* keys if it's page meta
```

## Key structure

Mirror nesting in both files:

```json
// en.json
"blog": {
  "title": "Blog",
  "empty": "No posts yet."
}

// de.json
"blog": {
  "title": "Blog",
  "empty": "Noch keine Beiträge."
}
```

## Usage in components

```vue
const { t } = useI18n()

// template
{{ t('blog.title') }}

// SEO
useSeoMeta({
  title: () => t('seo.blog.title'),
  description: () => t('seo.blog.description'),
})
```

## German style

- Informal **du** for blog/audience-facing copy
- Professional but approachable — not stiff corporate German
- Keep key names in English; only values are translated

## Routing

Links use `localePath()`, not translated paths:

```vue
const localePath = useLocalePath()
<NuxtLink :to="localePath('/blog')">
```

## Config reference

- Default locale: `en`
- German prefix: `/de/...` (`prefix_except_default` in `nuxt.config.ts`)
- Locale files: `i18n/locales/en.json`, `i18n/locales/de.json`

## Public repo

No private business names in locale values. Use WERKSCODE or anonymized phrasing. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
