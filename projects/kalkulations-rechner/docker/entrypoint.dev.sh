#!/bin/sh
set -e

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  pnpm install
fi

exec pnpm dev --host 0.0.0.0
