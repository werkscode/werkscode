---
name: add-blog-post
description: Creates empty bilingual blog markdown scaffolds with valid frontmatter. Does not write body prose. Use when the user asks to scaffold a new blog post file.
disable-model-invocation: true
---

# Add Blog Post (scaffold only)

**Hard rule:** Create files, frontmatter, and section headings. Do **not** write body sentences, descriptions, or translations. Hand the empty scaffold back to the author. Do not fill a scaffold because the page looks bare. See [`human-prose.mdc`](../../rules/human-prose.mdc).

A reader-facing string longer than two sentences or twenty words is manual. Leave `description` empty unless the author supplied the text. Agents do not translate. Create a German file only when the author asks, and leave its body empty.

## Checklist

```
- [ ] Choose slug (kebab-case)
- [ ] Create EN file: content/blog/<slug>.md
- [ ] Create DE file: content/de/blog/<slug>.md (only if author asks for DE scaffold)
- [ ] Set draft: true
- [ ] Leave body as headings + <!-- write here --> only
- [ ] Stop — do not draft prose
```

## Frontmatter (blog collection)

```yaml
---
title: 
description: 
date: 2026-08-10
tags: []
draft: true
---
```

Required: `date`. Optional: `description`, `tags`, `draft`.

## Body template

```markdown
<!-- write here -->

# 

## 

<!-- write here -->
```

## Draft behavior

`app/pages/blog/index.vue` hides `draft: true`. Always scaffold as draft.

## Public repo

Never put real names or private business details in files — even drafts. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
