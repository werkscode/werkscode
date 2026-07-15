---
name: git-commit
description: Creates Conventional Commits with privacy-safe messages for a public repository. Use when the user asks to commit, write a commit message, review staged changes, or prepare a git commit.
disable-model-invocation: true
---

# Git Commit

This repository is **public from day one**. Every commit message and staged diff must be safe for strangers to read. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).

## Checklist

```
- [ ] Run git status, git diff, git log --oneline -10 (parallel)
- [ ] Stage only relevant files — never .env, credentials, .pnpm-store
- [ ] Public scan on staged diff and proposed message
- [ ] Draft Conventional Commit message (English, imperative)
- [ ] Commit only when user explicitly asks
- [ ] Verify with git status after commit
```

## Step 1 — Inspect

Run in parallel:

```bash
git status
git diff
git log --oneline -10
```

## Step 2 — Stage selectively

- Never stage `.env`, credentials, or `.pnpm-store`
- Warn if staging looks accidental (unrelated lockfile, debug files)
- `.cursor/` and `AGENTS.md` are fine to commit

## Step 3 — Public scan

Block the commit if staged diff or message contains:

- Secrets, API keys, real `DATABASE_URL`, production hostnames
- Real company, customer, employee, or supplier names
- Private manufacturing app names or ERP/RPS internals

## Step 4 — Message format

```
<type>(<scope>): <short summary>

[optional body — 1-3 sentences explaining WHY]

[optional trailers]
Assisted-by: Cursor
```

| Type | When |
|------|------|
| `feat` | New user-facing capability |
| `fix` | Bug fix |
| `docs` | README, AGENTS.md, content |
| `refactor` | Same behavior, restructured |
| `chore` | Tooling, deps, config |
| `build` | Docker, Makefile |
| `db` | Drizzle schema/migrations |

**Scopes**: `i18n`, `content`, `blog`, `ui`, `api`, `db`, `docker`, `deps`, `cursor`

Rules:
- English only; imperative mood ("add" not "added")
- Subject ≤ 72 chars; body explains **why**, not a file list
- One logical change per commit — suggest splitting mixed diffs
- Optional trailer `Assisted-by: Cursor` when AI meaningfully assisted (see [`AI-USAGE.md`](../../AI-USAGE.md))

## Step 5 — Commit

Only when the user explicitly asks:

```bash
git commit -m "$(cat <<'EOF'
feat(i18n): add German locale for blog pages

Default locale stays English; German routes use /de prefix.
EOF
)"
```

## Safety

- Never update git config
- Never `--no-verify` or force-push main
- Never amend unless all amend conditions are met (user rule)
- Never push unless user asks

## Examples

```
chore(cursor): add project rules and agent skills

Encode WERKSCODE conventions for Cursor agents; treat repo as public from day one.
```

```
fix(api): return flattened Zod errors on contact form validation
```

```
docs(content): add draft journey post about learning Docker
```
