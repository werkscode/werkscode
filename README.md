# WERKSCODE

Personal blog and portfolio website — *WERKSCODE works*. Built with Nuxt 4, shadcn-vue, Nuxt Content, and PostgreSQL.

## Stack

- **Nuxt 4** — full-stack Vue framework
- **shadcn-vue** — customizable UI components (Tailwind v4)
- **@nuxt/content** — file-based blog and portfolio collections
- **Drizzle ORM** — PostgreSQL for dynamic app data (contact form)
- **Docker** — dev, staging, and production environments

## Prerequisites

- Node.js 22+
- pnpm 9+ (or enable Corepack for pnpm 10)
- PostgreSQL 16 (or use Docker)

## Local development

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL (if using Docker)
docker compose up db -d

# Run database migrations
pnpm db:migrate

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker development

Full stack with hot reload:

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Docker staging

```bash
cp .env.staging.example .env
docker compose -f docker-compose.yml -f docker-compose.staging.yml --profile migrate up migrate
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

## Docker production

Production runs behind **Caddy** on the VPS with free **Let's Encrypt** HTTPS. Full guide: **[deploy/README.md](deploy/README.md)**.

```bash
# On the server — see deploy/README.md for DNS, Caddy, and first-time setup
cp .env.production.example .env   # edit secrets; never commit
make prod-build
make prod-migrate
make prod-up
```

- **Canonical URL:** `https://werkscode.de` (`.com` / `.dev` redirect via Caddy)
- App binds **`127.0.0.1:3000`** only — Caddy proxies `:443`
- **Updates:** `git pull`, `make prod-build`, recreate `app` (content is in the image)

Caddy configs live in [`deploy/caddy/`](deploy/caddy/).

## Deployment

Pushes to `main` deploy automatically via GitHub Actions (build + SSH to VPS). Setup: **[deploy/README.md](deploy/README.md)** § GitHub Actions.

Manual deploy on the server: `make prod-deploy`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm db:generate` | Generate Drizzle migrations from schema |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Push schema directly (dev only) |
| `pnpm db:studio` | Open Drizzle Studio |

## Project structure

```
app/                  # Nuxt 4 app directory
  assets/css/         # Tailwind + custom theme
  components/         # Layout + shadcn UI components
  pages/              # Routes
content/              # Blog, portfolio, and editorial pages
  blog/
  portfolio/
  pages/
server/               # Nitro server
  api/                # API routes
  db/                 # Drizzle schema
drizzle/              # SQL migrations
```

## Content

- **Blog** — markdown in `content/blog/` (EN) and `content/de/blog/` (DE)
- **Portfolio** — markdown in `content/portfolio/` and `content/de/portfolio/`
- **Editorial pages** — About and Transparency in `content/pages/` and `content/de/pages/`
- Set `draft: true` in frontmatter until ready to publish; listings hide drafts
- Placeholder files are included; replace with real content later

### AI transparency

This project uses AI tools (mainly Cursor) for code and content. The author edits, verifies, and takes responsibility for what ships.

- **Site:** [/transparency](https://werkscode.de/transparency) — reader-facing summary (EN + DE)
- **Policy:** [AI-USAGE.md](AI-USAGE.md) — tools, principles, structured `ai_assist` metadata
- **Standards:** [`.cursor/public-repo-standards.md`](.cursor/public-repo-standards.md) — privacy + optional `Assisted-by: Cursor` commit trailer

### Writing content with Cursor

This repo is **public from day one** — never commit real company, customer, or employee names, even in drafts.

1. Start a chat with **"content session"** or **"new blog post"** / **"new portfolio entry"**
2. Answer intake questions; the assistant drafts **English in chat first**
3. Say **"save EN"** when happy → files land in `content/` with `draft: true`
4. Preview with `make dev`, then **"draft German"** → **"save DE"** when approved
5. Say **"publish"** to remove drafts from listings; **"commit"** when ready to git

See [`.cursor/skills/content-session/SKILL.md`](.cursor/skills/content-session/SKILL.md) for the full workflow.

## API

- `GET /api/health` — health check
- `POST /api/contact` — contact form (stores in PostgreSQL, optional Resend email)
- `GET /api/admin/contact-messages` — list contact messages (Bearer token)
- `PATCH /api/admin/contact-messages/:id` — mark message as read (Bearer token)

## Contact form

Submissions are stored in PostgreSQL. Optional email notifications via [Resend](https://resend.com). Spam protection uses a honeypot field and IP rate limiting (5 requests per 15 minutes).

**Admin inbox:** bookmark `/admin/messages` (not linked in navigation). Sign in with `NUXT_CONTACT_ADMIN_TOKEN`.

**Production checklist:**

1. Verify `werkscode.de` in [Resend Domains](https://resend.com/domains) (DNS records at your domain provider)
2. Create a Resend API key and set contact env vars (see below)
3. Generate a long random `NUXT_CONTACT_ADMIN_TOKEN`
4. Run `make prod-migrate` after deploy to apply schema changes

**CLI fallback:** `make prod-messages` lists the last 20 submissions on the production database.

## Environment variables

See `.env.example` for all variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NUXT_DATABASE_URL` | Same, for Nuxt runtime config |
| `NUXT_PUBLIC_APP_URL` | Public site URL |
| `NUXT_RESEND_API_KEY` | Resend API key for contact notifications |
| `NUXT_CONTACT_FROM_EMAIL` | Sender address (e.g. `contact@werkscode.de`) |
| `NUXT_CONTACT_NOTIFY_EMAIL` | Inbox that receives notifications |
| `NUXT_CONTACT_ADMIN_TOKEN` | Bearer token for `/admin/messages` |
