#!/usr/bin/env bash
# Run from your machine (sub-project root) to prepare a remote host before the first push.
#
#   ./deploy/bootstrap-remote.sh user@your-server
#
# Then (use an absolute path — git does not expand ~ in remote URLs):
#   git remote add deploy user@your-server:/home/user/repositories/kalkulations-rechner
#   git push deploy main

set -euo pipefail

REMOTE="${1:?Usage: $0 user@your-server}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

APP_NAME="kalkulations-rechner"
REPO_DIR="repositories/${APP_NAME}"
NGINX_CONF_DIR="repositories/nginx/conf"
NGINX_CONF_NAME="kalkulator.werkscode.example.conf"

echo "==> Bootstrapping $APP_NAME on $REMOTE"

ssh "$REMOTE" "mkdir -p ~/${REPO_DIR} ~/${NGINX_CONF_DIR}"

ssh "$REMOTE" "
  if [[ ! -d ~/${REPO_DIR}/.git ]]; then
    git init ~/${REPO_DIR}
  fi
  cd ~/${REPO_DIR}
  git config receive.denyCurrentBranch updateInstead
"

scp "$REPO_ROOT/deploy/hooks/post-receive" \
  "$REMOTE:~/${REPO_DIR}/.git/hooks/post-receive"
ssh "$REMOTE" "chmod +x ~/${REPO_DIR}/.git/hooks/post-receive"

scp "$REPO_ROOT/deploy/nginx/${NGINX_CONF_NAME}" \
  "$REMOTE:~/${NGINX_CONF_DIR}/${NGINX_CONF_NAME}"

if ssh "$REMOTE" "test -f ~/${REPO_DIR}/.env"; then
  echo "==> ~/${REPO_DIR}/.env already exists (skipped)"
else
  PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
  ssh "$REMOTE" "cat > ~/${REPO_DIR}/.env" <<EOF
NUXT_HOST=0.0.0.0
NUXT_PORT=3000
POSTGRES_USER=kalkulation
POSTGRES_PASSWORD=${PASSWORD}
POSTGRES_DB=kalkulation
DATABASE_URL=postgres://kalkulation:${PASSWORD}@db:5432/kalkulation
EOF
  ssh "$REMOTE" "chmod 600 ~/${REPO_DIR}/.env"
  echo "==> Created ~/${REPO_DIR}/.env with generated POSTGRES_PASSWORD"
fi

echo ""
REMOTE_HOME="$(ssh "$REMOTE" 'printf %s "$HOME"')"
GIT_REMOTE="${REMOTE}:${REMOTE_HOME}/${REPO_DIR}"

echo "==> Server ready. Next:"
echo "   git remote add deploy ${GIT_REMOTE}"
echo "   git push deploy main"
echo ""
echo "Edit nginx server_name + SSL on the host, then reload nginx."
