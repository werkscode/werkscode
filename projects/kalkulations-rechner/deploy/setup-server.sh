#!/usr/bin/env bash
# One-time server setup for git-push deploys.
#
# Run on the host that will serve this app:
#   cd /path/to/kalkulations-rechner
#   bash deploy/setup-server.sh
#
# Prerequisites: Docker, Docker Compose v2, git, curl

set -euo pipefail

APP_NAME="kalkulations-rechner"
REPO_DIR="${REPO_DIR:-$HOME/repositories/${APP_NAME}}"
NGINX_CONF_DIR="${NGINX_CONF_DIR:-$HOME/repositories/nginx/conf}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
NGINX_CONF_NAME="${NGINX_CONF_NAME:-kalkulator.werkscode.example.conf}"

if [[ -d "$REPO_DIR/.git" ]]; then
  REPO_DIR="$(cd "$REPO_DIR" && git rev-parse --show-toplevel)"
fi

echo "==> Setting up $APP_NAME"
echo "    Repo:       $REPO_DIR"
echo "    Nginx conf: $NGINX_CONF_DIR"
echo "    Branch:     $DEPLOY_BRANCH"

mkdir -p "$REPO_DIR" "$NGINX_CONF_DIR"

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "==> Initializing git repository at $REPO_DIR"
  git init "$REPO_DIR"
fi

cd "$REPO_DIR"
git config receive.denyCurrentBranch updateInstead

HOOK_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hooks/post-receive"
HOOK_DST="$REPO_DIR/.git/hooks/post-receive"
cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
echo "==> Installed post-receive hook"

NGINX_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/nginx/${NGINX_CONF_NAME}"
NGINX_DST="$NGINX_CONF_DIR/${NGINX_CONF_NAME}"
if [[ -f "$NGINX_DST" ]]; then
  echo "==> Nginx config already exists: $NGINX_DST"
else
  cp "$NGINX_SRC" "$NGINX_DST"
  echo "==> Installed nginx config: $NGINX_DST"
  echo "    Edit server_name and SSL paths, then reload nginx."
fi

if [[ ! -f "$REPO_DIR/.env" ]]; then
  ENV_EXAMPLE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/env.production.example"
  cp "$ENV_EXAMPLE" "$REPO_DIR/.env"
  chmod 600 "$REPO_DIR/.env"
  POSTGRES_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
  sed -i "s/CHANGE_ME_STRONG_PASSWORD/$POSTGRES_PASSWORD/" "$REPO_DIR/.env"
  echo "==> Created $REPO_DIR/.env with generated POSTGRES_PASSWORD"
else
  echo "==> $REPO_DIR/.env already exists (not overwritten)"
fi

echo ""
echo "==> Next steps"
echo ""
echo "1. Add a git remote from your machine and push:"
echo "   git remote add deploy user@your-server:$REPO_DIR"
echo "   git push deploy $DEPLOY_BRANCH"
echo ""
echo "2. Edit the nginx vhost (server_name + SSL), then reload nginx."
echo ""
echo "3. Open your public subdomain (see deploy/nginx/${NGINX_CONF_NAME})."
