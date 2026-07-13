---
name: write-portfolio-entry
description: Drafts WERKSCODE portfolio case studies about anonymized shopfloor/software projects. Use when the user asks to write a portfolio entry, project write-up, or case study for the portfolio collection.
disable-model-invocation: true
---

# Write Portfolio Entry

## Before writing

1. Run intake from [`content-session`](../content-session/SKILL.md) (portfolio branch)
2. Confirm **anonymization** — no real company, customer, employee, or private app names
3. Draft **English only** in chat unless author has already approved EN and asked for DE

## Privacy checklist

Before finalizing, verify the draft contains **none** of:

- [ ] Real company or brand names (including private manufacturing apps)
- [ ] Customer, supplier, or employee names
- [ ] Production figures, revenue, or identifiable locations
- [ ] Internal ERP/RPS terminology or schemas

Replace specifics with: "a small metal manufacturing company", "my shopfloor", "an internal tool".

## Entry structure

Case study, not a tutorial. 300–600 words per language.

1. **Problem** — what hurt on the shopfloor or in daily operations
2. **Constraints** — time, skills, budget, legacy tools (anonymized)
3. **Approach** — what you built and how AI tools helped (honest, not magic)
4. **Result** — outcome in plain language (time saved, fewer errors, better visibility)
5. **Lesson** — one takeaway for Selbstständige considering their own small build

## Frontmatter template

```yaml
---
title: ...
description: ...
date: YYYY-MM-DD
tech:
  - Nuxt
  - PostgreSQL
featured: false
draft: true
link: https://example.com  # optional — public demo/repo only
---
```

Omit `link` for internal-only projects.

## Bilingual workflow

- EN first in chat → author approves → save EN file
- DE adaptation in chat → author approves → save DE file
- Same slug in both locales: `content/portfolio/<slug>.md` and `content/de/portfolio/<slug>.md`
- Adapt for German audience (informal "du"); do not machine-translate

## Voice reference

See [voice-guide.md](../write-journey-post/voice-guide.md) for tone. Portfolio entries are shorter and more outcome-focused than blog posts.

## What to avoid

- Step-by-step install guides (save for a blog post if needed)
- Naming real tools from the private manufacturing stack
- Humble-bragging about revenue or team size
- Corporate buzzwords

## After drafting

Point the author to [`add-portfolio-entry`](../add-portfolio-entry/SKILL.md) when they say to save files.

## Public repo

Drafts must pass the privacy checklist before saving to `content/`. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
