---
name: add-i18n-strings
description: Adds matching keys to en.json and de.json for titles and functional UI. Stops at the length gate. Does not translate or draft narrative copy. Use when adding nav, buttons, form labels, placeholders, errors, loading states, or short status labels.
disable-model-invocation: true
---

# Add i18n Strings

## Checklist

```
- [ ] Add key to i18n/locales/en.json
- [ ] Add same nested key to i18n/locales/de.json
- [ ] Use t('key') in Vue (never hardcode copy)
- [ ] Add seo.* title keys if it's page meta; leave narrative seo descriptions empty
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

## Length gate

Stop at titles and functional labels: nav, buttons, form labels, placeholders, errors, loading, short status labels.

If a string is longer than two sentences or twenty words, do not write it. Leave the value as `""` in both locales. That includes `seo.*.description`, alt text, empty states, footer lines, card blurbs, trust copy, and about text.

Do not translate. Write a German value only when the author supplied the words. An empty German string stays empty.

Short functional German labels use informal **du**. Do not rewrite existing sentences to change Sie or du.

Keep key names in English.

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

No private business names in locale values. The name WERKSCODE may appear. Narrative values stay empty until the author writes them. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
