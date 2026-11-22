# WERKSCODE — Agent Guide

Personal site under the name **WERKSCODE**. English at `/`, German at `/de`.

**This repository is public from day one.** Write code, comments, commits, and docs as if published today. See [`.cursor/public-repo-standards.md`](.cursor/public-repo-standards.md).

## Site copy

AI may suggest wording in chat. The author types every reader-facing word that lands in the repo.

Exceptions: titles, and functional UI only (nav, buttons, form labels, placeholders, errors, loading, short status labels).

Longer than two sentences or twenty words is manual — including meta descriptions, alt text, empty states, footer lines, card blurbs, trust copy, about text, and SEO descriptions. Agents do not translate. An empty German string stays empty. Agents do not fill a scaffold because a page looks bare.

See [`.cursor/rules/human-prose.mdc`](.cursor/rules/human-prose.mdc). Author queue: [`WRITING.md`](WRITING.md).

- **Code**: AI-assisted. Optional `Assisted-by: Cursor` on code commits. Never on commits that only change author-written prose.
- Local private notes (gitignored, if present): `author/raw/` — never paste raw detail into `content/`, commits, or other tracked files

## Quick commands

```bash
make dev              # Docker dev stack (WERKSCODE site)
make dev-rebuild      # After package.json changes
pnpm dev              # Host dev (with make db-up)
pnpm db:migrate       # Apply Drizzle migrations
make crowdsec-up      # Optional CrowdSec + local Caddy bouncer
make crowdsec-prod-up # Optional CrowdSec engine on the production stack
```

## Rules (`.cursor/rules/`)

| Rule | When it applies |
|------|-----------------|
| `werkscode-project.mdc` | Always — stack, privacy, public posture |
| `human-prose.mdc` | Always — author types reader-facing copy |
| `frontend.mdc` | `app/**` — i18n, routing, components |
| `content-privacy.mdc` | `content/**` — layout + anonymization |
| `server-api.mdc` | `server/**`, `drizzle/**` — API + DB patterns |
| `docker.mdc` | Docker/Makefile files |

## Skills (`.cursor/skills/`)

Invoke by name when starting a task:

| Skill | Use for |
|-------|---------|
| `add-blog-post` | Empty blog markdown scaffolds (no body prose) |
| `add-i18n-strings` | Add EN/DE UI keys (titles and functional labels only) |
| `add-shadcn-component` | Add shadcn-vue UI components |
| `add-api-route` | New Nitro API endpoints |
| `git-commit` | Conventional Commits, privacy-safe messages |

## Key conventions

- UI copy → `i18n/locales/en.json` + `de.json` (author owns anything past a title or a short functional label)
- Links → `localePath()`; content paths → `useLocalizedContentPath()`
- Blog EN: `content/blog/`; DE: `content/de/blog/`
- Pages EN: `content/pages/`; DE: `content/de/pages/`
- API: Zod validate → Drizzle via `useDb()`
- Commits: Conventional Commits in English; scan for secrets before staging
