# Release checklist

## Product truth and trust

- [ ] Product name, description, URLs, support contact, and privacy URL are real.
- [ ] Store claims describe the packaged behavior and supported Chrome version.
- [ ] Permission ledger and privacy policy match the manifest and runtime behavior.
- [ ] No metric, testimonial, security guarantee, or compatibility claim lacks evidence.

## Experience

- [ ] Approved prototype coverage includes every released surface, permission interaction, and meaningful state.
- [ ] Packaged behavior matches the approved prototype or every deviation has renewed approval.
- [ ] Install, update, popup, catalog/detail replacement, disable, original-site recovery, and parse-error paths were tested.
- [ ] Keyboard, visible focus, reduced motion, zoom, and narrow/wide page layouts were reviewed.
- [ ] Empty, loading, searching, pagination-end, disabled, and failed states use useful copy.
- [ ] Generated icon remains legible at 16, 32, 48, and 128 pixels.

## Engineering and package

- [ ] `pnpm install --frozen-lockfile` succeeds with Node 24 and pnpm 11.
- [ ] `pnpm check:release` passes from a clean copy.
- [ ] The ZIP manifest requests only `storage` and the exact `http://10.16.100.244/*` content-script match.
- [ ] The checksum matches the exact ZIP selected for manual install or upload.
- [ ] No source map, secret, debug flag, test fixture, or unintended remote call ships.
- [ ] `pnpm build:web` succeeds and `netlify.toml` publishes `apps/web/dist/client`.
- [ ] The website's **Download latest** actions resolve to the repository's latest GitHub Release and no release version is hard-coded in its interface.
- [ ] A `v*` tag matching `apps/extension/package.json` publishes the verified `.output` ZIP and checksum.

## Human handoff

- [ ] README, website, and store instructions match current commands and surfaces.
- [ ] The verified ZIP was installed manually in a clean Chrome profile.
- [ ] Known limitations and deferred work have an owner.
- [ ] Store upload, signing, and publication have explicit authorization.
- [ ] Scorecard baseline and postmortem date are recorded.
