# AI Usage Policy

This repository is **public from day one**. This document explains how AI tools are used on WERKSCODE — honestly, without pretending every word or line was written without help.

The live summary for readers is on the site: **[/transparency](https://werkscode.de/transparency)** (German: `/de/transparency`).

Source code: **[github.com/werkscode/werkscode](https://github.com/werkscode/werkscode)**

## Tools

| Tool | Role |
|------|------|
| **Cursor** | Primary assistant for code, refactoring, debugging, and content drafting in this repo |
| **Large language models** (via Cursor) | Research, wording suggestions, EN → DE translation |

When this list changes, update this file and the Transparency page content.

## Principles

1. **AI is a tool, not a ghostwriter.** The author decides what ships, edits for voice, and takes responsibility for published content.
2. **Personal and authentic.** AI drafts are rewritten until they sound like a shopfloor CEO — not generic marketing copy.
3. **Same privacy rules as everything else.** AI assistants follow [`.cursor/public-repo-standards.md`](.cursor/public-repo-standards.md). Never paste secrets, customer names, or internal system details into chat.
4. **Transparency by default.** Structured metadata records how AI helped; significant AI-assisted commits may include an `Assisted-by:` trailer.

## What AI typically helps with

| Label | Meaning |
|-------|---------|
| `drafting` | First versions of blog posts, portfolio text, or page copy |
| `editing` | Grammar, structure, tightening sentences, tone checks |
| `translation` | German versions based on an approved English draft |
| `code` | Scaffolding, boilerplate, refactors, debugging sessions |
| `research` | API docs, framework patterns, unfamiliar tooling |
| `images` | AI-generated or assisted visuals — only when noted on a specific piece |

## What the author still does

- Decides what to publish and what stays draft
- Edits until the voice is personal and accurate
- Verifies facts, links, and privacy boundaries
- Provides the business context behind stories (anonymized)
- Takes responsibility for errors and tone

## Structured disclosure in content

Blog and portfolio markdown may include optional frontmatter:

```yaml
ai_assist:
  - drafting
  - editing
```

Allowed values: `drafting`, `editing`, `translation`, `code`, `research`, `images`.

Validated in [`content.config.ts`](content.config.ts). Not rendered on every post yet — but recorded in git for anyone who wants to check.

## Git commits

When AI meaningfully assisted with a commit, add an optional trailer:

```
feat(content): add transparency page

Document how Cursor assists with code and copy.

Assisted-by: Cursor
```

This is optional, not mandatory for every AI touch — use it when the assistance was substantial (e.g. scaffolding a feature, drafting a long post).

See the [`git-commit`](.cursor/skills/git-commit/SKILL.md) skill for the full workflow.

## Related documents

- [`.cursor/public-repo-standards.md`](.cursor/public-repo-standards.md) — privacy, git hygiene, commit format
- [`.cursor/rules/content-privacy.mdc`](.cursor/rules/content-privacy.mdc) — content anonymization rules
- [`content/pages/transparency.md`](content/pages/transparency.md) — reader-facing transparency page (EN)
- [`AGENTS.md`](AGENTS.md) — agent guide for this repository
