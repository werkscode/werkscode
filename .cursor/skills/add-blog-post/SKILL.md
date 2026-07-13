---
name: add-blog-post
description: Creates bilingual blog markdown files in the correct content paths with valid frontmatter. Use when the user asks to add a blog post, new article, or publish a post to the site.
disable-model-invocation: true
---

# Add Blog Post

## Checklist

```
- [ ] Choose slug (kebab-case, e.g. learning-docker-on-the-shopfloor)
- [ ] Create EN file: content/blog/<slug>.md
- [ ] Create DE file: content/de/blog/<slug>.md
- [ ] Set draft: true unless author says publish
- [ ] Verify listing filters drafts
```

## Frontmatter (blog collection)

```yaml
---
title: Post Title
description: One-line summary for listings and SEO
date: 2026-07-13
tags:
  - learning
  - ai-tools
draft: true
---
```

Required fields per `content.config.ts`: `date`. Optional: `description`, `tags`, `draft`.

## Filename

Prefer `YYYY-MM-DD-slug.md` or `slug.md`. Use the same basename in EN and DE.

## Draft behavior

`app/pages/blog/index.vue` filters with `.where('draft', '<>', true)`. Only posts with `draft: true` are hidden. Always set `draft: true` for work-in-progress; remove or set `draft: false` to publish.

## Content queries

Listing uses `useLocalizedContentPath()`:
- EN posts live under `/blog/...`
- DE posts live under `/de/blog/...`

## After creating files

- New UI strings needed? → use `add-i18n-strings` skill
- Journey-style content? → use `write-journey-post` skill for voice/privacy

## Verify

```bash
pnpm dev
# Visit /blog and /de/blog — draft posts should not appear
```

## Public repo

Never commit posts with real names or private business details — even with `draft: true`. Content in git is public-facing. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
