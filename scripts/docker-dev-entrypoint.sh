#!/bin/sh
set -e

# Rebuild native module against the container's Node (anonymous node_modules volume).
pnpm rebuild better-sqlite3

# Regenerate Nuxt types and @nuxt/content indexes after bind-mount changes.
pnpm nuxt prepare

exec pnpm dev --host 0.0.0.0
