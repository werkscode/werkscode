---
name: add-portfolio-entry
description: Creates bilingual portfolio markdown files in the correct content paths with valid frontmatter. Use when the user asks to add a portfolio entry, project write-up, or save a portfolio case study to the site.
disable-model-invocation: true
---

# Add Portfolio Entry

## Checklist

```
- [ ] Choose slug (kebab-case, e.g. shopfloor-status-board)
- [ ] Create EN file: content/portfolio/<slug>.md
- [ ] Create DE file: content/de/portfolio/<slug>.md (only after EN approved and author asks)
- [ ] Set draft: true unless author says publish
- [ ] Verify listing filters drafts
```

## Frontmatter (portfolio collection)

```yaml
---
title: Project Title
description: One-line summary for listings and SEO
date: 2026-07-13
tech:
  - Nuxt
  - TypeScript
featured: false
draft: true
link: https://example.com
---
```

Required fields per `content.config.ts`: `date`. Optional: `description`, `tech`, `featured`, `link`, `draft`.

`link` must be a valid URL if present — omit for internal-only projects.

## Filename

Prefer `slug.md` or `YYYY-MM-DD-slug.md`. Use the same basename in EN and DE.

## Draft behavior

`app/pages/portfolio/index.vue` filters with `.where('draft', '<>', true)`. Entries with `draft: true` are hidden from the listing. Always set `draft: true` for work-in-progress; set `draft: false` or remove the field to publish.

## Content queries

Listing uses `useLocalizedContentPath()`:

- EN entries live under `/portfolio/...`
- DE entries live under `/de/portfolio/...`

## Author workflow

Per [`content-session`](../content-session/SKILL.md):

1. Save EN only when author explicitly approves
2. Save DE only after German adaptation is approved
3. Publish only when author says "publish"

## After creating files

- Journey-style voice? → use [`write-portfolio-entry`](../write-portfolio-entry/SKILL.md)
- New UI strings needed? → use `add-i18n-strings` skill

## Verify

```bash
make dev
# Visit /portfolio and /de/portfolio — draft entries should not appear
# Direct URL to draft file may still work; listing hides drafts
```

## Public repo

Never commit entries with real names or private business details — even with `draft: true`. Content in git is public-facing. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
