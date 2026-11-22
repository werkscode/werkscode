#!/bin/sh
set -e

# The repo is bind-mounted. Nuxt as root leaves .nuxt owned by root, and a
# later host `pnpm` fails with EACCES when it unlinks those files.
run_dev() {
  pnpm rebuild better-sqlite3
  pnpm nuxt prepare
  exec pnpm dev --host 0.0.0.0
}

if [ "$(id -u)" = "0" ]; then
  uid=$(stat -c '%u' /app)
  gid=$(stat -c '%g' /app)
  if [ "$uid" != "0" ] && id -u "$uid" >/dev/null 2>&1; then
    # .nuxt is often mixed: the directory can be the host user while files
    # inside are still root. Checking only the directory owner skips those.
    for path in /app/.nuxt /app/.output /app/.pnpm-store /app/.data; do
      if [ -e "$path" ]; then
        chown -R "$uid:$gid" "$path"
      fi
    done
    if [ -e /app/node_modules ] && [ "$(stat -c '%u' /app/node_modules)" != "$uid" ]; then
      chown -R "$uid:$gid" /app/node_modules
    fi
    exec su -s /bin/sh "$(id -un "$uid")" -c 'set -e
pnpm rebuild better-sqlite3
pnpm nuxt prepare
exec pnpm dev --host 0.0.0.0'
  fi
fi

run_dev
