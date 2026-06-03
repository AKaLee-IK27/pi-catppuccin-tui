# Progress Log — pi-catppuccin-tui

## 2026-06-02 — Harness bootstrap

Created the AI-agent harness for this repo (no source-code changes):

- `AGENTS.md` — knowledge base: repo is a Pi package (4 generated Catppuccin
  themes + opt-in `/catppuccin-tui` extension), structure, where-to-look table,
  build/validate flow, conventions.
- `CLAUDE.md` — workflow: startup (read SESSION_HANDOFF + AGENTS), generated-not-
  hand-edited rule, token-contract sync, verification commands, definition of done.
- `feature_list.json` — 3 done (themes, generator/validator, extension toggles),
  2 pending (manual in-Pi visual pass, npm publish + pi.dev discoverability).
- `init.sh` — read-only baseline (`npm run validate` + `jq empty` on theme JSON).
- `progress.md` — this log.

### Verified

- `npm run validate` → "Validated 4 themes with 51 Pi color tokens each." (clean)
- `./init.sh` → passes; confirmed it does not modify `themes/*.json` (no churn).

### Repo state observed

- Single commit on `main`: `d28fe40 feat: initial release with Catppuccin TUI polish`.
- Pre-existing uncommitted edits (NOT made by this harness): `package.json`
  (version 0.1.0 → 0.1.1) and `extensions/catppuccin-tui.ts`. Left untouched.

## 2026-06-03 — Footer theme token crash fix

Fixed a `/catppuccin-tui footer on` crash where the custom footer called
`theme.fg()` with Catppuccin palette variable names (`subtext0`, `overlay1`,
`overlay0`). Pi only accepts semantic theme color tokens in `theme.fg()`, so the
footer no longer passes palette variable names to Pi's theme API.

### Verified

- `npm run validate` → "Validated 4 themes with 51 Pi color tokens each."
- Static scan → all literal `theme.fg()` calls in `extensions/catppuccin-tui.ts`
  use Pi color tokens.
- Mock footer render with a token-checking theme completed without
  `Unknown theme color`.

## 2026-06-03 — Color-coded useful footer pass

Updated the optional status/footer so the lower status area shows useful runtime
telemetry instead of the theme name:

- Status entry: phase (`ready` / `working`) plus current model.
- Footer left: shortened model plus git branch.
- Footer right: input tokens, output tokens, and cost.
- Visual treatment: Catppuccin mauve / blue / green / lavender / peach segments
  instead of one muted run.
- Responsive treatment: full, compact, and mini footer shapes so narrow terminals
  keep the useful metrics instead of truncating only from the right.

### Verified

- `npm run validate` → "Validated 4 themes with 51 Pi color tokens each."
- Static scan → all literal `theme.fg()` calls in `extensions/catppuccin-tui.ts`
  use Pi color tokens.
- Source scan → no theme-name labels remain in `extensions/catppuccin-tui.ts`.
- Mock status/footer render → no theme name, width-safe at 100, 60, 40, and 24 columns.

## 2026-06-03 — Persist Catppuccin TUI toggles across reload

Persisted `/catppuccin-tui` opt-in state to the current session branch so users
who enabled footer/status/indicator do not need to turn them on again after
`/reload`:

- Toggles append `catppuccin-tui-state` custom entries with `indicator`, `status`,
  and `footer` booleans.
- `session_start` restores the latest saved toggle state, including reloads.
- `session_tree` restores the latest saved toggle state for the selected branch.
- Sessions with no saved state still default to all enhancements off.

### Verified

- `npm run validate` → "Validated 4 themes with 51 Pi color tokens each."
- Static scan → persistence custom type, `pi.appendEntry`, `session_start`, and
  `session_tree` restore hooks are present.
- Source scan → no theme-name labels remain in `extensions/catppuccin-tui.ts`.
- Mock persistence restore → saved toggles survive simulated reload, and restored
  footer remains width-safe at 100, 60, 40, and 24 columns.

## 2026-06-03 — Review docs/package surface

`/check` found one safe documentation drift: README still described the footer as
showing the theme name. Updated README so it matches the current footer behavior
(model, git branch, token counts, cost) and documents `/reload` persistence.

### Verified

- `npm run validate` → "Validated 4 themes with 51 Pi color tokens each."
- `npm pack --dry-run --json` → 11 package files, including README, extension,
  scripts, and all 4 themes.
- Mock persistence restore → saved toggles survive simulated reload, and restored
  footer remains width-safe at 100, 60, 40, and 24 columns.

## 2026-06-03 — Publish 0.1.2

Published the package after the user confirmed the manual in-Pi visual pass was
complete.

### Verified

- `npm whoami` → `rowlet17`.
- `npm view pi-catppuccin-tui version --json` before publish → `"0.1.1"`.
- `npm version 0.1.2 --no-git-tag-version` updated `package.json`.
- `npm run validate` → "Validated 4 themes with 51 Pi color tokens each."
- `npm pack --dry-run --json` → `pi-catppuccin-tui@0.1.2`, 11 package files.
- Mock persistence restore → saved toggles survive simulated reload, and restored
  footer remains width-safe at 100, 60, 40, and 24 columns.
- `npm publish` initially required browser/OTP auth; after user completed it,
  `npm view pi-catppuccin-tui version --json` → `"0.1.2"`.
- `npm view pi-catppuccin-tui@0.1.2 name version dist-tags dist.tarball --json`
  → latest is `0.1.2` with registry tarball.
- pi.dev package catalog search for `pi-catppuccin-tui` returned 1 result with
  install command `$ pi install npm:pi-catppuccin-tui`.

### Next

- Optional: create and push a `v0.1.2` git tag if desired.
- Optional: monitor pi.dev/npm for install feedback.
