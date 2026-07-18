#!/usr/bin/env bash
# Rebuild and restart the production Docker stack.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

cd "$APP_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: $APP_DIR/.env is missing."
  echo "Copy deploy/env.production.example to .env and set POSTGRES_PASSWORD."
  exit 1
fi

missing=()
for key in POSTGRES_PASSWORD DATABASE_URL; do
  if ! grep -Eq "^${key}=.+" .env; then
    missing+=("$key")
  fi
done
if ((${#missing[@]} > 0)); then
  echo "ERROR: .env is missing required variables: ${missing[*]}"
  echo "Copy deploy/env.production.example to .env and set all POSTGRES_* values."
  echo "DATABASE_URL must use host \"db\", e.g.:"
  echo "  DATABASE_URL=postgres://kalkulation:YOUR_PASSWORD@db:5432/kalkulation"
  exit 1
fi

pg_user="$(grep '^POSTGRES_USER=' .env | cut -d= -f2- || true)"
pg_pass="$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2- || true)"
pg_db="$(grep '^POSTGRES_DB=' .env | cut -d= -f2- || true)"
pg_user="${pg_user:-kalkulation}"
pg_db="${pg_db:-kalkulation}"
expected_url="postgres://${pg_user}:${pg_pass}@db:5432/${pg_db}"

if ! grep -q "^DATABASE_URL=${expected_url}$" .env; then
  if grep -Eq '^DATABASE_URL=.*@localhost[:/]' .env; then
    echo "==> Fixing DATABASE_URL (localhost → db for Docker network)"
  else
    echo "==> Syncing DATABASE_URL from POSTGRES_* variables"
  fi
  if grep -q '^DATABASE_URL=' .env; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${expected_url}|" .env
  else
    echo "DATABASE_URL=${expected_url}" >> .env
  fi
fi

echo "==> Building and starting containers ($COMPOSE_FILE)"
docker compose --env-file .env -f "$COMPOSE_FILE" up -d --build --remove-orphans

echo "==> Waiting for health check"
deadline=$((SECONDS + 180))
while (( SECONDS < deadline )); do
  if curl -fsS http://127.0.0.1:8041/api/health >/dev/null 2>&1; then
    echo "==> App is healthy"
    docker compose --env-file .env -f "$COMPOSE_FILE" ps
    exit 0
  fi
  sleep 5
done

echo "WARNING: Health check timed out — inspect logs:"
docker compose --env-file .env -f "$COMPOSE_FILE" ps
docker compose --env-file .env -f "$COMPOSE_FILE" logs --tail=50 app
exit 1
