# Kalkulations-Rechner

Standalone Nuxt app for powder-coating quotes in a small metal manufacturing company. Focus: **Pulverbeschichtung** (surface area, powder consumption, hanging-cart layout, STEP upload).

Lives as a self-contained sub-project under the WERKSCODE monorepo (`projects/kalkulations-rechner/`). Intended to be hosted on its own subdomain.

## Demo vs local persistence

Controlled by **`NUXT_PUBLIC_PERSISTENCE_ENABLED`**.

| Mode | Flag | Where data lives |
|------|------|------------------|
| **Public demo** (production subdomain) | unset / `false` (default) | Save, setup, catalog, quotes, and history work in the **browser** via **Pinia + localStorage** (seeded from shared defaults). Server write APIs stay **403**; setup/quote no longer require a working Postgres. |
| **Local clone** | `true` | Same UI, but save/setup/history/catalog/quote go to **PostgreSQL**. |

### Public demo

Deploy with `NUXT_PUBLIC_PERSISTENCE_ENABLED=false` (see [`deploy/env.production.example`](deploy/env.production.example)). Visitors can save quotes in their own browser; clearing site data removes them. For a real shared database, clone and run locally (or set the flag `true` only on a private instance).

### Enable Postgres persistence locally

**Easiest** — Docker dev already turns it on:

```bash
# from monorepo root
make kalkulator-dev
# → http://localhost:3100
```

**Host pnpm** — copy env and enable the flag:

```bash
cd projects/kalkulations-rechner
cp .env.example .env
# set DATABASE_URL, then:
# NUXT_PUBLIC_PERSISTENCE_ENABLED=true
pnpm install
pnpm dev
```

Without the flag, a local run uses the same browser (Pinia) storage as the public demo.

## Tech Stack

- Nuxt 4 (full-stack with Nitro)
- PostgreSQL (optional; used when `NUXT_PUBLIC_PERSISTENCE_ENABLED=true`)
- Pinia + localStorage (browser save/setup/catalog when persistence is off)
- shadcn-vue + Tailwind CSS v4
- Three.js (3D hanging-cart layout + STEP preview)
- Zod (API validation)
- Python / pythonOCC (`step-converter/`) for STEP → GLB
- Docker (development & production)

## Prerequisites

- Docker & Docker Compose (recommended)
- Optional locally: Node.js 22+, pnpm 10+, PostgreSQL 16+

## Quick start (Docker)

### Development (hot reload)

From this directory:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Or from the monorepo root:

```bash
make kalkulator-dev
```

| Service | URL / port |
|---------|------------|
| App | [http://localhost:3100](http://localhost:3100) |
| PostgreSQL | `localhost:5433` (user/pass/db: `kalkulation`) |
| STEP converter | `localhost:8000` |

### Production (on a server)

Preferred path: deploy from the **monorepo** on the same VPS as WERKSCODE (GitHub Actions runs [`scripts/deploy-prod.sh`](../../scripts/deploy-prod.sh)).

```bash
# One-time on the VPS
cp deploy/env.production.example .env
# set a strong POSTGRES_PASSWORD (and matching DATABASE_URL with host "db")

# From monorepo root — also runs on every push to main via Actions:
make kalkulator-prod-deploy
# or: make prod-deploy
```

App binds to `127.0.0.1:8041`. Caddy site: [`deploy/caddy/sites/kalkulator.caddy`](../../deploy/caddy/sites/kalkulator.caddy). See [deploy/README.md](../../deploy/README.md).

Standalone git-push deploy (legacy): `./deploy/scripts/deploy.sh` with nginx template [`deploy/nginx/kalkulator.werkscode.example.conf`](deploy/nginx/kalkulator.werkscode.example.conf).

Healthcheck: `GET /api/health`

## Local development (without Docker)

Start PostgreSQL and set `DATABASE_URL`:

```bash
cp .env.example .env
# Enable saving: NUXT_PUBLIC_PERSISTENCE_ENABLED=true
pnpm install
pnpm dev
```

For STEP uploads, also run `step-converter/` (or point `NUXT_STEP_CONVERTER_URL` at a running instance).

## Powder coating

- Quote wizard: `/powder-coating`
- Setup (costs, cart size, powder types): `/powder-coating/setup`
- Saved calculations: `/powder-coating/calculations`
- API catalog: `GET /api/powder-coating/catalog`
- API setup: `GET/PUT /api/powder-coating/setup`
- API quote: `POST /api/powder-coating/quote`

Master data is migrated and seeded on first start when `DATABASE_URL` is set.

## Project layout

```
app/                    # Nuxt 4 frontend
server/
  api/                  # Nitro API routes
  domain/               # Domain logic
  db/                   # Migration, seed, pool
shared/lib/             # Shared calculation logic
step-converter/         # Python STEP → GLB service
deploy/                 # Prod env example, nginx template, deploy scripts
```

## Notes

- Default hanging cart dimensions live in setup; overridable per quote in the wizard.
- Further processes (laser, welding, CNC) are navigation placeholders only.
- UI is German-only for now.
