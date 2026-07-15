#!/bin/sh
# Run on the production VPS from /opt/werkscode (or $DEPLOY_PATH).
# Used by GitHub Actions and manual deploys — see deploy/README.md.
set -e

DEPLOY_PATH="${DEPLOY_PATH:-/opt/werkscode}"
BRANCH="${DEPLOY_BRANCH:-main}"
HEALTH_URL="http://127.0.0.1:3000/api/health"

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
echo "Giving the app a few seconds to bind to port 3000..."
sleep 5

attempt=1
max_attempts=30
health_ok=0

# curl may fail while the container is still starting — do not use set -e here.
set +e
while [ "$attempt" -le "$max_attempts" ]; do
  if command -v curl >/dev/null 2>&1; then
    curl -sf "$HEALTH_URL" >/dev/null 2>&1
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- "$HEALTH_URL" >/dev/null 2>&1
  else
    echo "Health check failed: curl or wget required on the VPS"
    exit 1
  fi

  if [ $? -eq 0 ]; then
    health_ok=1
    break
  fi

  echo "Waiting for app... ($attempt/$max_attempts)"
  sleep 2
  attempt=$((attempt + 1))
done
set -e

if [ "$health_ok" -eq 1 ]; then
  echo "Deploy OK"
  exit 0
fi

echo "Health check failed after ${max_attempts} attempts"
$COMPOSE -f docker-compose.yml -f docker-compose.prod.yml ps app || true
$COMPOSE -f docker-compose.yml -f docker-compose.prod.yml logs --tail=50 app || true
exit 1
