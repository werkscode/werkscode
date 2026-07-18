# WERKSCODE — Agent Guide

Public blog and portfolio for **WERKSCODE** (*WERKSCODE works*). A managing director of a small metal manufacturing company shares the journey of learning to code on the job — with AI tools — to inspire self-employed people in Germany and beyond.

**This repository is public from day one.** Write code, comments, commits, and docs as if published today. See [`.cursor/public-repo-standards.md`](.cursor/public-repo-standards.md).

## Author context

- Biography / themes (public-safe): [`.cursor/author-foundation.md`](.cursor/author-foundation.md)
- Planned blog angles: [`.cursor/content-backlog.md`](.cursor/content-backlog.md)
- Deeper local notes (gitignored, if present): `author/raw/` — never paste raw detail into `content/`, commits, or other tracked files

## Quick commands

```bash
make dev              # Docker dev stack (WERKSCODE site)
make dev-rebuild      # After package.json changes
pnpm dev              # Host dev (with make db-up)
pnpm db:migrate       # Apply Drizzle migrations

make kalkulator-dev   # Powder-coating calculator (projects/kalkulations-rechner) on :3100
```

## Sub-projects (`projects/`)

Self-contained apps with their own `package.json`, Docker Compose, and deploy story. Not part of the root Nuxt app — intended for subdomain hosting. See [`projects/kalkulations-rechner/README.md`](projects/kalkulations-rechner/README.md).

## Rules (`.cursor/rules/`)

| Rule | When it applies |
|------|-----------------|
| `werkscode-project.mdc` | Always — mission, stack, privacy, public posture |
| `frontend.mdc` | `app/**` — i18n, routing, components |
| `content-privacy.mdc` | `content/**` — blog/portfolio + anonymization |
| `server-api.mdc` | `server/**`, `drizzle/**` — API + DB patterns |
| `docker.mdc` | Docker/Makefile files |

## Skills (`.cursor/skills/`)

Invoke by name when starting a task:

| Skill | Use for |
|-------|---------|
| `content-session` | Start blog/portfolio collaboration — intake, EN-first, chat before files |
| `write-journey-post` | Draft blog posts in author voice |
| `write-portfolio-entry` | Draft portfolio case studies (anonymized projects) |
| `add-blog-post` | Create blog markdown files in content paths |
| `add-portfolio-entry` | Create portfolio markdown files in content paths |
| `add-i18n-strings` | Add EN/DE UI translations |
| `add-shadcn-component` | Add shadcn-vue UI components |
| `add-api-route` | New Nitro API endpoints |
| `git-commit` | Conventional Commits, privacy-safe messages |

## Key conventions

- UI copy → `i18n/locales/en.json` + `de.json`
- Links → `localePath()`; content paths → `useLocalizedContentPath()`
- Blog EN: `content/blog/`; DE: `content/de/blog/`
- Portfolio EN: `content/portfolio/`; DE: `content/de/portfolio/`
- API: Zod validate → Drizzle via `useDb()`
- Commits: Conventional Commits in English; scan for secrets before staging
