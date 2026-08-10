# AI Usage Policy

This repository is **public from day one**. This document explains how AI tools are used on WERKSCODE.

The live summary for readers is on the site: **[/transparency](https://werkscode.de/transparency)** (German: `/de/transparency`).

Source code: **[github.com/werkscode/werkscode](https://github.com/werkscode/werkscode)**

## The split

| Domain | Who |
|--------|-----|
| **Prose** — blog posts, portfolio case studies, about/transparency body text, first-person UI copy, translations | The author only. No AI drafting, editing, polish, or translation. |
| **Code** — app, config, scaffolding, Docker, technical docs in this repo (including this file) | Built with AI tools, mainly Cursor. |

That split is the point of the public project: a CEO using AI for software, while the words stay human.

## Tools

| Tool | Role |
|------|------|
| **Cursor** | Coding, refactoring, debugging, scaffolding, and maintaining technical docs |
| **Large language models** (via Cursor) | Code and technical documentation only — not site prose |

When this list changes, update this file and the Transparency page content.

## Principles

1. **AI builds code, not voice.** The author writes every first-person sentence a reader sees.
2. **Agents may scaffold content files** (frontmatter, headings, empty markers). They must not fill in body prose.
3. **Same privacy rules as everything else.** AI assistants follow [`.cursor/public-repo-standards.md`](.cursor/public-repo-standards.md). Never paste secrets, customer names, or internal system details into chat.
4. **Transparency by default.** This policy and the Transparency page state the rule. Significant AI-assisted **code** commits may include an `Assisted-by:` trailer.

## What the author still does

- Writes all site prose by hand (EN and DE)
- Decides what to publish and what stays draft
- Verifies facts, links, and privacy boundaries
- Takes responsibility for errors and tone

## Git commits

When AI meaningfully assisted with a **code** commit, add an optional trailer:

```
feat(api): add contact form rate limiting

Assisted-by: Cursor
```

Do **not** add `Assisted-by: Cursor` on commits that only change author-written prose under `content/` or first-person UI copy the author wrote.

See the [`git-commit`](.cursor/skills/git-commit/SKILL.md) skill for the full workflow.

## Related documents

- [`WRITING.md`](WRITING.md) — author-owned writing queue and doctrine
- [`.cursor/rules/human-prose.mdc`](.cursor/rules/human-prose.mdc) — agent guardrail: no prose generation
- [`.cursor/public-repo-standards.md`](.cursor/public-repo-standards.md) — privacy, git hygiene, commit format
- [`.cursor/rules/content-privacy.mdc`](.cursor/rules/content-privacy.mdc) — content anonymization rules
- [`content/pages/transparency.md`](content/pages/transparency.md) — reader-facing transparency page (EN)
- [`AGENTS.md`](AGENTS.md) — agent guide for this repository
