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

```bash
# Configure .env from .env.production.example
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile migrate up migrate
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Production binds the app to `127.0.0.1:3000` for use behind a reverse proxy.

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
content/              # Blog and portfolio markdown
  blog/
  portfolio/
server/               # Nitro server
  api/                # API routes
  db/                 # Drizzle schema
drizzle/              # SQL migrations
```

## Content

- **Blog** — add markdown files to `content/blog/`
- **Portfolio** — add markdown files to `content/portfolio/`
- Placeholder files are included; replace with real content later.

## API

- `GET /api/health` — health check
- `POST /api/contact` — contact form submission (stores in PostgreSQL)

## Environment variables

See `.env.example` for all variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NUXT_DATABASE_URL` | Same, for Nuxt runtime config |
| `NUXT_PUBLIC_APP_URL` | Public site URL |
