# ICC Lens architecture

ICC Lens is a pnpm monorepo with two independently built applications. The Manifest V3 extension enhances the private ICC server; the TanStack Start website is a public, static-content product surface that links visitors to the latest GitHub Release.

```text
apps/
├── extension/   WXT extension, Chrome entrypoints, domain and UI
└── web/         TanStack Start landing page

.output/         unpacked extension build, release ZIP and checksum
```

The applications share product identity and design intent, but no runtime state. The website cannot access the ICC server and the extension never depends on the website.

## Dependency direction

```text
popup ────────────────> Chrome local preference adapter
                                  │
                                  v
ICC content entrypoint ──> application services ──> domain types/rules
          │                         ^                     ^
          │                         │                     │
          └────────────── ICC DOM adapter ───────────────┘
                                  │
                                  v
                         original ICC document/fetch
```

- `apps/extension/src/domain/` owns normalized page, category, item, media, and preference types plus pure classification rules. It imports no browser or UI module.
- `apps/extension/src/application/` owns the narrow site and preference ports used by the interface.
- `apps/extension/src/infrastructure/icc-dom-adapter.ts` is the anti-corruption layer around legacy HTML and endpoints.
- `apps/extension/src/infrastructure/chrome-preferences.ts` owns Chrome storage serialization.
- `apps/extension/src/features/icc-lens/` renders catalog and detail views from normalized models; it does not query the legacy DOM.
- `apps/extension/entrypoints/` owns WXT lifecycle, isolated shadow-root mounting, safe fallback, popup UI, and original-page restoration.
- `apps/web/src/routes/` owns the public TanStack Start routes. It uses only bundled assets and public GitHub links.
- Root scripts own cross-workspace verification and the `.output` release contract.

Dependencies point inward. Domain-to-browser imports, application-to-adapter imports, direct Chrome calls from reusable UI, and legacy selector logic outside the adapter fail review.

## Page lifecycle

1. WXT starts the content script only on `http://10.16.100.244/*` at `document_idle`.
2. The preference adapter loads the local `enabled` boolean. Disabled pages stay completely original.
3. The DOM adapter parses the current document before any original content is hidden.
4. A successful parse mounts ICC Lens in a shadow root, changes the document title, then enforces a direct-body ownership boundary that hides every non-ICC Lens child, including late nodes and legacy roots restyled by server scripts.
5. Search, suggestions, bottom-of-list automatic pagination, and navigation call the same ICC endpoints or links used by the original UI.
6. Disable, restore-original, teardown, or a rendering failure stops the body observer and restores every captured hidden, ARIA, and inline-display state plus the previous title.

This order is deliberate: parsing and rendering are additive until success is known. The original server is the recovery surface, not a blank error page.

## Security and MV3 constraints

1. Keep the static content-script match exact. Do not broaden it to `<all_urls>`, an IP range, HTTPS, or a hostname without an explicit product and privacy decision.
2. Treat all page-derived strings and URLs as untrusted. React owns text escaping; the adapter accepts only HTTP(S) navigation URLs and never injects page HTML.
3. Classify playable media by a known extension allowlist. Do not trust the server's MIME declaration—the archive page currently labels a `.rar` file as video.
4. Package every executable dependency. Remote code, `eval`, dynamically downloaded scripts, and page-world injection are outside the contract.
5. Store only the enabled boolean, theme enum, and bounded watch-history contract. Watch history keeps same-origin page identity, title, optional season/episode context, position, duration, and update time; it excludes external media URLs, posters, searches, page contents, and credentials.
6. Model layout drift, malformed endpoints, storage failure, and service-worker restart as recoverable states.

## Build and deployment boundaries

- `pnpm build:extension` writes the unpacked Chrome artifact directly to the repository-root `.output/` directory.
- `pnpm zip` adds the release ZIP to `.output/`; the package verifier writes and validates its SHA-256 checksum there.
- `pnpm build:web` produces the TanStack Start client at `apps/web/dist/client` and its Netlify server function.
- Root `netlify.toml` is the website deployment authority. It builds only the web workspace and publishes the client directory; the official Netlify TanStack Start Vite integration provides request handling.
- Version tags matching `v*` run the release workflow, verify that the tag matches the extension package version, and publish the verified ZIP and checksum to GitHub Releases.

See [THREAT_MODEL.md](THREAT_MODEL.md) and the root [permission ledger](../permission-ledger.md) for the exact trust and access boundaries.

## Completion proof

- `pnpm check:fast` proves formatting, lint, types, parser classification, application behavior, and UI states.
- `pnpm check` adds the MV3 build audit, an unpacked-Chromium catalog journey, and the production website build.
- `pnpm check:release` inspects the actual ZIP contents and writes its SHA-256 checksum.

An architecture change is complete only when the packaged manifest, documentation, tests, and UI behavior continue to describe the same product.
