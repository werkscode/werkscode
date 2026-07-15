# Public Repository Standards

This repository is **public from day one**. Every file, comment, commit message, and doc must be safe for strangers to read. These standards apply to all contributions — not only at publish time.

## Never commit or write

- `.env`, credentials, API keys, real `DATABASE_URL`, production hostnames
- Real company, customer, employee, or supplier names
- References to private manufacturing apps, ERP/RPS internals, or internal schemas
- Private local paths in committed files (e.g. personal project directories)

## Always safe

- **WERKSCODE** as the public brand
- "A small metal manufacturing company" / "my shopfloor" (anonymized)
- Placeholder values in `.env.example` files only
- English in commit messages and code comments (German OK in `i18n/` and `content/de/`)

## Git hygiene (every commit)

- `.gitignore` must cover: `.env`, `.env.*` (except examples), `.pnpm-store`, `.nuxt`, `node_modules`, build outputs
- One logical change per commit — history is permanent
- Scan `git diff` for secrets and private references before staging
- Never stage `.env`, credentials, or `.pnpm-store`

If secrets ever land in history: stop, warn the author, and use `git filter-repo` before any public push (destructive — ask first).

## Open-source readiness (maintain continuously)

- README describes the project without private app or business names
- No secrets in the working tree
- LICENSE is added only when the author requests it

## AI transparency

AI tools (mainly Cursor) assist with code and content in this repository. The author edits, verifies, and takes responsibility for what ships.

- **Policy:** [`AI-USAGE.md`](../AI-USAGE.md) — tools, principles, structured disclosure
- **Site:** `/transparency` — reader-facing summary (EN + DE)
- **Content metadata:** optional `ai_assist` frontmatter on blog/portfolio entries (see `content.config.ts`)
- **Commits:** optional `Assisted-by: Cursor` trailer when AI assistance was substantial

Never paste secrets, customer names, or internal system details into AI chat. Project rules in `.cursor/` apply to assistants too.

## Conventional Commits

Commit messages in English, imperative mood:

```
<type>(<scope>): <short summary>

[optional body — WHY, not a file list]

[optional trailers]
Assisted-by: Cursor
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `build`, `db`
Scopes: `i18n`, `content`, `blog`, `ui`, `api`, `db`, `docker`, `deps`, `cursor`

See the `git-commit` skill for the full workflow.
