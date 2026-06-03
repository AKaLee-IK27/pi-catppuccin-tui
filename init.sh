#!/usr/bin/env bash
# Read-only baseline verification for pi-catppuccin-tui.
#
# Runs only safe, non-mutating checks. It does NOT regenerate themes
# (`npm run build:themes` rewrites themes/*.json), install, or publish.
#
# Recorded result of `npm run validate` on 2026-06-02:
#   > node scripts/validate-themes.mjs
#   Validated 4 themes with 51 Pi color tokens each.
#
# See CLAUDE.md for build:themes / pack / manual visual-pass steps.

set -euo pipefail
cd "$(dirname "$0")"

echo "==> Validating theme token contract (npm run validate)"
npm run validate

echo "==> Checking every theme file is valid JSON (jq)"
find themes -name '*.json' -print0 | xargs -0 jq empty
echo "All theme JSON parsed cleanly."

echo "==> Baseline OK."
