---
name: content-session
description: Master workflow for WERKSCODE blog and portfolio content with the author. Use when the user wants to write a post, start a content session, draft portfolio entry, or collaborate on new markdown content.
disable-model-invocation: true
---

# Content Session

Entry point for collaborating with the author on blog posts and portfolio entries.

## Author preferences (default)

- **Portfolio scope:** anonymized shopfloor/software projects — no private app names
- **Languages:** English first → author approves → then German adaptation (not machine translation)
- **Repo:** draft in chat only until the author explicitly says to save files

## Before intake / drafting

1. Skim [`.cursor/author-foundation.md`](../../author-foundation.md) for biography and themes.
2. If `author/raw/` exists locally, treat Ergüsse as **source material only** — not draft posts. Do not copy raw names, hostnames, or identifying detail into site copy.
3. When the author shares a new Erguss: save under `author/raw/` (gitignored) and propose a small scrubbed update to `author-foundation.md`; only commit the distillate when asked.

## When to use

Invoke when the user says things like:

- "New blog post" / "content session" / "let's write a post"
- "New portfolio entry" / "add a project to portfolio"
- "Draft German" / "save EN" / "publish"

## Session flow

```
1. Intake questions (below) — do not skip
2. Draft EN in chat only
3. Privacy scan with author
4. Revise until author approves EN
5. Save EN files only when author says "save EN" / "create the files"
6. Author previews in make dev (optional)
7. Draft DE adaptation in chat when author says "draft German"
8. Save DE when author approves
9. Publish (draft: false) only when author says "publish"
10. Commit only when author asks — use git-commit skill
```

## Intake — every session

Ask before writing:

1. **Type** — blog post or portfolio entry?
2. **Working title** — rough is fine
3. **One-sentence lesson** — what should a Selbstständiger take away?
4. **Audience** — craftspeople, German entrepreneurs, developers curious about manufacturing, or all?
5. **Anonymization** — anything to avoid or composite? Flag risky details
6. **Publish intent** — evergreen, tied to a date, or not sure yet

Then branch to blog or portfolio intake below.

## Intake — blog only

7. **Hook moment** — real shopfloor/business scene (anonymized)
8. **Struggle + dead ends** — what failed before AI/tools helped
9. **Tags** — e.g. `learning`, `ai-tools`, `manufacturing`
10. **Length** — default 600–1200 words unless author wants otherwise

→ Use [`write-journey-post`](../write-journey-post/SKILL.md) for voice and structure.

## Intake — portfolio only

7. **Problem** — pain on the shopfloor or in the business
8. **What you built** — outcome in plain language (no private stack names)
9. **Tech stack** — public-safe list for frontmatter `tech:`
10. **Featured?** — highlight on portfolio grid
11. **External link?** — live demo/repo if public; omit if internal-only

→ Use [`write-portfolio-entry`](../write-portfolio-entry/SKILL.md) for voice and structure.

## Trigger phrases

| Author says | Agent does |
|-------------|------------|
| "New blog post" / "content session" | Run intake, draft EN in chat |
| "New portfolio entry" | Portfolio intake, draft EN in chat |
| "Looks good — save EN" / "create the files" | `add-blog-post` or `add-portfolio-entry` with `draft: true` (EN only) |
| "Draft German" | Adapt DE in chat (informal "du", not translation) |
| "Save DE" | Create DE file with `draft: true` |
| "Publish" | Set `draft: false` on both locales after final OK |
| "Commit" | `git-commit` skill with privacy-safe message |

## Saving files

- Blog → [`add-blog-post`](../add-blog-post/SKILL.md)
- Portfolio → [`add-portfolio-entry`](../add-portfolio-entry/SKILL.md)
- Always `draft: true` until author says publish
- Never save to repo without explicit author approval

## Privacy

Before any save or publish, verify against [`.cursor/public-repo-standards.md`](../../public-repo-standards.md) and [`content-privacy.mdc`](../../rules/content-privacy.mdc).

Content in git is public-facing — including `draft: true`.

## Related skills

| Skill | When |
|-------|------|
| `write-journey-post` | Blog voice, structure, privacy checklist |
| `write-portfolio-entry` | Portfolio case-study voice and structure |
| `add-blog-post` | Create blog markdown files |
| `add-portfolio-entry` | Create portfolio markdown files |
| `git-commit` | Commit after author asks |
