# ICC Lens architecture

ICC Lens is a Manifest V3 content-script extension. The server remains authoritative for navigation and files; the extension parses each rendered page into a small domain model, then renders the approved Design A interface in an isolated shadow root.

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

- `src/domain/` owns normalized page, category, item, media, and preference types plus pure classification rules. It imports no browser or UI module.
- `src/application/` owns the narrow site and preference ports used by the interface.
- `src/infrastructure/icc-dom-adapter.ts` is the anti-corruption layer around the legacy HTML, original featured carousel, search endpoint, suggestions, and pagination.
- `src/infrastructure/chrome-preferences.ts` owns Chrome storage serialization.
- `src/features/icc-lens/` renders catalog and detail views from normalized models; it does not query the legacy DOM.
- `entrypoints/icc.content/` owns the WXT lifecycle, isolated shadow-root mounting, safe fallback, and restoration of the original document.
- `entrypoints/popup/` exposes the one persisted preference and a direct link to the server.
- `entrypoints/background.ts` is intentionally empty; correctness does not depend on service-worker state.

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
5. Store only the enabled boolean. Page contents, searches, media links, and credentials never enter extension storage.
6. Model layout drift, malformed endpoints, storage failure, and service-worker restart as recoverable states.

See [THREAT_MODEL.md](THREAT_MODEL.md) and the root [permission ledger](../permission-ledger.md) for the exact trust and access boundaries.

## Completion proof

- `pnpm check:fast` proves formatting, lint, types, parser classification, application behavior, and UI states.
- `pnpm check` adds the MV3 build audit and an unpacked-Chromium catalog, accessibility, responsive, and fallback journey.
- `pnpm check:release` inspects the actual ZIP contents and writes its SHA-256 checksum.

An architecture change is complete only when the packaged manifest, documentation, tests, and UI behavior continue to describe the same product.
