# Contributing

ICC Lens is a permission-minimal, private-network Chrome extension. Changes should preserve the exact-host boundary, original-page recovery path, and approved Design A experience.

## Before changing code

- Read `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `permission-ledger.md`, and `privacy-policy.md`.
- Open an issue for a significant architecture, dependency, permission, browser-support, data, or release-contract change.
- Never commit credentials, production data, browsing history, customer content, or copied product claims.

## Development workflow

1. Create a focused branch from `main`.
2. Install with `pnpm install --frozen-lockfile` using Node.js 24 and pnpm 11.
3. Keep the DOM adapter, manifest, permission ledger, privacy copy, product config, generated assets, tests, and documentation aligned.
4. Run `pnpm check` before opening a pull request.
5. Run `pnpm check:release` before handing off a distributable ZIP.

Pull requests should explain the user-visible outcome, intended boundaries, verification commands, and any effect on the observed legacy markup, permissions, stored data, network behavior, dependencies, accessibility, or packaging. Include wide/narrow catalog screenshots and a popup screenshot when a visible surface changes.

Report vulnerabilities through [SECURITY.md](SECURITY.md), not an issue.
