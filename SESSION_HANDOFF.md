# Session Handoff: Pi Catppuccin TUI Package

## Goal

Create a reusable Pi package for public users, published through npm and discoverable on https://pi.dev/packages.

## Current decision

Do not build another plain Catppuccin theme copy. Similar packages already exist in the Pi package catalog:

- `@sherif-fanous/pi-catppuccin`
- `@ujjwalgrover/pi-catppuccin`
- `@ifi/oh-pi-themes`
- `@ineersa/my-pi-themes`
- `@ifiokjr/oh-pi-themes`
- `pi-catppuccin-footer`
- `@firstpick/pi-themes-bundle`

Recommended pivot: build a more polished package with exact Catppuccin themes plus optional TUI enhancements.

## Proposed v1 scope

Build `pi-catppuccin-tui` as a standalone package containing:

1. All four exact Catppuccin themes:
   - Latte
   - Frappé
   - Macchiato
   - Mocha
2. Optional extension features:
   - Catppuccin working indicator
   - Catppuccin status text
   - Optional compact footer, if it can stay low-risk and easy to disable
3. README with install, theme selection, and screenshots or preview image.
4. `package.json` with `keywords: ["pi-package"]` and a `pi` manifest.

## Visual direction

Macchiato is the signature flavor. The aesthetic should feel like a cozy terminal cockpit: layered dark surfaces, pastel status colors, compact density, and a focused mauve or blue accent.

## Official references already checked

- Pi theme docs: `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/themes.md`
- Pi package docs: `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/packages.md`
- Pi TUI docs: `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/tui.md`
- Catppuccin palette: `https://catppuccin.com/palette/`
- Catppuccin style guide: `https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md`

## Verification plan

- `jq` validates every theme JSON file.
- Script verifies every theme defines all 51 required Pi color tokens.
- `npm pack --dry-run --json` verifies publish contents.
- `pi install ./pi-catppuccin-tui` verifies local install.
- Manual check in Pi: select all four themes in `/settings`, then inspect editor, footer, tool call boxes, markdown, diffs, and thinking-level border colors.
- After publish: `npm view pi-catppuccin-tui` and search `https://pi.dev/packages`.

## Risk boundaries

- Do not publish until the local install and visual check pass.
- Do not add a mandatory extension that changes every user's Pi behavior by default.
- If extension behavior is included, make it command-toggleable or clearly documented.
- Avoid copying existing package code. Use Catppuccin palette values and Pi docs as sources.
