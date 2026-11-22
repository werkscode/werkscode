# AI Usage Policy

This repository is **public from day one**. This document explains how AI tools are used on WERKSCODE.

The live page for readers is **[/transparency](https://werkscode.de/transparency)** (German: `/de/transparency`). The author writes that page.

Source code: **[github.com/werkscode/werkscode](https://github.com/werkscode/werkscode)**

## What AI is for

AI is for code and technical docs. It is not for site text.

| Domain | Who |
|--------|-----|
| **Site text** — blog posts, page bodies, translations, and any reader-facing string past a title or a short functional label | The author types it. No AI drafting, editing, polish, or translation in the repo. |
| **Code** — app, config, scaffolding, Docker, technical docs in this repo (including this file) | Built with AI tools, mainly Cursor. |

## Tools

| Tool | Role |
|------|------|
| **Cursor** | Coding, refactoring, debugging, scaffolding, and maintaining technical docs |
| **Large language models** (via Cursor) | Code and technical documentation only — not site text |

When this list changes, update this file. The author updates the Transparency page.

## Principles

1. **The author types site text.** AI may suggest wording in chat. Anything a reader sees in the repo, past titles and functional UI, is typed by the author. Longer than two sentences or twenty words is manual.
2. **Agents may scaffold content files** (frontmatter, title, empty markers). They must not fill in body prose, and must not fill a scaffold because a page looks bare.
3. **Agents do not translate.** An empty locale string stays empty.
4. **Same privacy rules as everything else.** AI assistants follow [`.cursor/public-repo-standards.md`](.cursor/public-repo-standards.md). Never paste secrets, customer names, or internal system details into chat.
5. **Commits stay honest about assistance.** Significant AI-assisted **code** commits may include an `Assisted-by:` trailer. Prose-only commits do not.

## What the author still does

- Types all site text (EN and DE)
- Decides what to publish and what stays draft
- Verifies facts, links, and privacy boundaries
- Takes responsibility for errors and tone

## Git commits

When AI meaningfully assisted with a **code** commit, add an optional trailer:

```
feat(api): add contact form rate limiting

Assisted-by: Cursor
```

Do **not** add `Assisted-by: Cursor` on commits that only change author-written prose under `content/` or reader-facing copy the author wrote.

See the [`git-commit`](.cursor/skills/git-commit/SKILL.md) skill for the full workflow.

## Related documents

- [`WRITING.md`](WRITING.md) — author-owned writing queue
- [`.cursor/rules/human-prose.mdc`](.cursor/rules/human-prose.mdc) — agent guardrail
- [`.cursor/public-repo-standards.md`](.cursor/public-repo-standards.md) — privacy, git hygiene, commit format
- [`.cursor/rules/content-privacy.mdc`](.cursor/rules/content-privacy.mdc) — content anonymization rules
- [`content/pages/transparency.md`](content/pages/transparency.md) — reader-facing transparency page (EN), author-written
- [`AGENTS.md`](AGENTS.md) — agent guide for this repository
