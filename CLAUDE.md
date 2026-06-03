# CLAUDE.md

Project harness for **pi-catppuccin-tui** — a Pi package shipping four exact
Catppuccin themes plus an optional `/catppuccin-tui` TUI-polish extension. See
`README.md` for the user-facing overview and `AGENTS.md` for the knowledge base.

## Startup Workflow

Before working:

1. `pwd` — confirm you're in `~/Repos/pi-catppuccin-tui`
2. Read this file and `AGENTS.md`
3. Read `SESSION_HANDOFF.md` (goal, scope, references, verification plan, risk
   boundaries) and `feature_list.json` + `progress.md` (what's done / pending)
4. `git log --oneline -5` and `git status` — note any pre-existing uncommitted
   changes are NOT yours; leave them untouched unless asked
5. Run `npm run validate` (or `./init.sh`) to confirm the baseline is green

If validation is failing, fix that before adding new scope.

## Working Rules

- **Themes are generated, not hand-edited.** To change colors or tokens, edit
  `scripts/generate-themes.mjs` (the `palette` and `colorTokens` objects), then
  run `npm run build:themes`. Never edit `themes/*.json` directly — they get
  overwritten.
- **Keep the token contract in sync.** `generate-themes.mjs` and
  `validate-themes.mjs` must agree (51 tokens, 4 exact theme names). Change one,
  change the other, then re-validate.
- **Enhancements stay opt-in.** The extension ships all features off. Never make
  an enhancement default-on (SESSION_HANDOFF risk boundary).
- **Use official Catppuccin palette values**, not invented colors.
- **Stay in scope.** Touch only what the task names; don't refactor adjacent code
  or bump versions unless asked.
- **Evidence before "done".** Run the verification command for what you changed
  and paste the result into `feature_list.json` `evidence`.

## Verification Commands

```bash
# Baseline structural check (fast, read-only) — the default loop
npm run validate

# Rebuild theme JSON from the generator (writes themes/*.json — only when
# you intentionally changed the palette or tokens)
npm run build:themes

# Confirm every theme file is valid JSON
find themes -name '*.json' -print0 | xargs -0 jq empty

# Preview publish contents against the package.json `files` allowlist
npm pack --dry-run --json
```

`./init.sh` runs the read-only baseline (`npm run validate`).

After theme or extension changes, also walk the **manual in-Pi visual pass**
described in `README.md` and `SESSION_HANDOFF.md`: `pi install <abs path>`,
select each theme in `/settings`, inspect editor/footer/markdown/tool boxes/
diffs/thinking colors, and toggle `/catppuccin-tui`.

## Definition of Done

A change is done only when:

- [ ] Target behavior is implemented (generator/validator/extension as relevant)
- [ ] `npm run validate` passes; if the palette/tokens changed, `npm run build:themes`
      was run and the regenerated `themes/*.json` are consistent
- [ ] Publish-shape changes → `npm pack --dry-run --json` checked
- [ ] User-visible theme/extension change → manual in-Pi visual pass walked
- [ ] Evidence pasted into `feature_list.json`
- [ ] `progress.md` updated

## End of Session

1. Update `progress.md` (what changed, what's next, blockers)
2. Update `feature_list.json` status + evidence
3. Update `SESSION_HANDOFF.md` if scope/decisions changed
4. Leave the working tree clean or note intentional changes (do not commit or
   publish unless the user asks)

## Escalation

- **Publish / pi.dev discoverability** → do NOT publish until local install +
  manual visual pass pass (SESSION_HANDOFF). Confirm with the user first.
- **Token contract drift** (generate vs validate mismatch) → see
  `validate-themes.mjs` `requiredTokens`; fix both sides.
- **Repeated validation failures** → flag in `progress.md`, stop and ask.
