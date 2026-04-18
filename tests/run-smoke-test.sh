#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CACHE_ROOT="${TMPDIR:-/tmp}/speedrechner-playwright-cache"
PLAYWRIGHT_MODULE_PATH="$CACHE_ROOT/node_modules/playwright"

if [ ! -d "$PLAYWRIGHT_MODULE_PATH" ]; then
  mkdir -p "$CACHE_ROOT"
  npm install --prefix "$CACHE_ROOT" playwright >/dev/null
fi

export NODE_PATH="$CACHE_ROOT/node_modules"

cd "$REPO_ROOT"
node tests/playwright-smoke.cjs