#!/bin/sh
# Run on the production VPS from /opt/werkscode (or $DEPLOY_PATH).
# Used by GitHub Actions and manual deploys — see deploy/README.md.
set -e

DEPLOY_PATH="${DEPLOY_PATH:-/opt/werkscode}"
BRANCH="${DEPLOY_BRANCH:-main}"

cd "$DEPLOY_PATH"

echo "==> Fetch ${BRANCH}"
git fetch origin "$BRANCH"
git reset --hard "origin/${BRANCH}"

echo "==> Migrate database"
make prod-migrate

echo "==> Build production image"
make prod-build

echo "==> Restart app container"
COMPOSE="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE="docker-compose"
fi

$COMPOSE -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate app

echo "==> Health check"
curl -sf http://127.0.0.1:3000/api/health >/dev/null
echo "Deploy OK"
