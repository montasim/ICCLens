# Quality ladder

Choose and name a level in each task contract.

## Prototype gate — before production entrypoints

New extensions, user journeys, surfaces, and material redesigns must complete `docs/PROTOTYPING.md` before Level 1 implementation begins. The functional simulator covers every user-visible requirement, extension surface, and meaningful state with HTML, Tailwind CSS 4 utilities, and mocked Chrome behavior; explicit human approval is recorded in `prototype/coverage.md`.

Proof: `pnpm verify:prototype:approved`

## Level 1 — Draft

An entrypoint runs and the interaction can be reviewed. Demo identity and temporary state are allowed; do not distribute.

Proof: `pnpm check:fast`

## Level 2 — Functional

The vertical slice crosses UI, message, application, and adapter boundaries; loading, saved, denied, and failed states are intentional; permissions and privacy claims match behavior.

Proof: `pnpm check`

## Level 3 — Release candidate

No starter placeholders remain. The manifest is minimal, the exact ZIP contents and checksum are verified, store copy is truthful, and the release checklist is complete.

Proof: `pnpm check:release`

## Level 4 — Observed release

The store-installed artifact has been smoke tested, permission prompts and support feedback have been reviewed, and first-week outcomes are recorded.

Proof: store smoke test plus `docs/SCORECARD.md`

## Always required

- Reproducible Node 24/pnpm 11 install and Chrome MV3 build
- Independently reproducible extension and website builds from their workspace packages
- Root `.output` extension artifact and `apps/web/dist/client` Netlify publish artifact
- Packaged behavior matches approved prototype coverage or records an approved deviation
- Pure domain and application tests plus real-extension browser proof for the main slice
- Keyboard use, focus visibility, high-zoom/narrow-panel behavior, and no serious/critical axe violations
- No unexplained permission, host access, remote call, data category, secret, or debug artifact
- Explicit owner and follow-up date for every intentional exception

## Workspace proof

| Command                | Evidence                                                 |
| ---------------------- | -------------------------------------------------------- |
| `pnpm dev`             | Runs the WXT Chrome development workflow.                |
| `pnpm dev:web`         | Runs the TanStack Start landing page locally.            |
| `pnpm build:extension` | Produces the unpacked extension at root `.output/`.      |
| `pnpm build:web`       | Produces the Netlify-ready web output.                   |
| `pnpm check:release`   | Verifies both apps and the exact extension ZIP/checksum. |
