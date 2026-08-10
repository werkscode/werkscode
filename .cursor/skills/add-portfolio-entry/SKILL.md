---
name: add-portfolio-entry
description: Creates empty bilingual portfolio markdown scaffolds with valid frontmatter. Does not write body prose. Use when the user asks to scaffold a new portfolio entry file.
disable-model-invocation: true
---

# Add Portfolio Entry (scaffold only)

**Hard rule:** Create files, frontmatter, and section headings. Do **not** write body sentences. Hand the empty scaffold back to the author. See [`human-prose.mdc`](../../rules/human-prose.mdc).

## Checklist

```
- [ ] Choose slug (kebab-case)
- [ ] Create EN file: content/portfolio/<slug>.md
- [ ] Create DE file: content/de/portfolio/<slug>.md (only if author asks for DE scaffold)
- [ ] Set draft: true
- [ ] Leave body as headings + <!-- write here --> only
- [ ] Stop — do not draft prose
```

## Frontmatter (portfolio collection)

```yaml
---
title: 
description: 
date: 2026-08-10
tech: []
featured: false
draft: true
---
```

Required: `date`. Optional: `description`, `cover`, `tech`, `featured`, `link`, `draft`.

Omit `link` unless the author provides a public URL.

## Body template (EN)

```markdown
<!-- write here -->

# 

## Constraints

<!-- write here -->

## Approach

<!-- write here -->

## Result

<!-- write here -->

## Lesson

<!-- write here -->
```

## Draft behavior

`app/pages/portfolio/index.vue` hides `draft: true`. Always scaffold as draft.

## Public repo

Never put real names or private business details in files — even drafts. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
