---
name: write-journey-post
description: Drafts bilingual WERKSCODE blog posts about learning to code as a manufacturing CEO with AI tools. Use when the user asks to write a blog post, journey story, or content to inspire entrepreneurs and Selbstständige.
disable-model-invocation: true
---

# Write Journey Post

## Before writing

1. Ask for **topic** and **key lesson** (1–2 sentences from the author)
2. Confirm **anonymization** — no real company, customer, or employee names
3. Draft **English first** in chat unless the author has already approved EN and asked for DE

## Privacy checklist

Before finalizing, verify the draft contains **none** of:

- [ ] Real company or brand names (including private manufacturing apps)
- [ ] Customer, supplier, or employee names
- [ ] Production figures, revenue, or identifiable locations
- [ ] Internal ERP/RPS terminology or schemas

Replace specifics with: "a small metal manufacturing company", "my shopfloor", "a customer project".

## Post structure

1. **Hook** — relatable moment from running a business (not a tech tutorial opener)
2. **Struggle** — what went wrong or felt impossible without code
3. **What you tried** — including dead ends and false starts
4. **What worked** — honest role of AI tools (Cursor, ChatGPT, etc.) as multiplier, not magic
5. **Takeaway** — one actionable insight for Selbstständige who wonder if coding is for them

Length: 600–1200 words per language. Conversational, not academic.

## Frontmatter template

```yaml
---
title: ...
description: ...
date: YYYY-MM-DD
tags:
  - learning
  - ai-tools
draft: true
---
```

Add `manufacturing`, `entrepreneurship`, or `german-business` tags when relevant.

## Bilingual workflow

- EN first in chat → author approves → save EN file
- DE adaptation in chat → author approves → save DE file
- EN → `content/blog/<slug>.md`
- DE → `content/de/blog/<slug>.md` (adapt, don't machine-translate — German "du" form)
- Same slug in both locales for mental pairing

See [`content-session`](../content-session/SKILL.md) for the full collaboration flow.

## After drafting

Point the user to the `add-blog-post` skill if files need to be created in the repo.

## Voice reference

See [voice-guide.md](voice-guide.md) for tone examples.

## Public repo

This repo is public from day one. Drafts must pass the privacy checklist before saving to `content/`. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
