# ICC Lens

> A clearer Chrome interface for one local media server, with a public product website and a privacy-first permission boundary.

[![CI](https://github.com/montasim/ICCLens/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/ICCLens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Chrome 120+](https://img.shields.io/badge/Chrome-120%2B-4285F4?logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)

ICC Lens replaces the legacy pages at `http://10.16.100.244/` with a responsive interface for browsing, searching, playback, series episodes, archives, and downloads. It runs only for people who already have access to that private server, sends no analytics or page data elsewhere, and keeps the original interface one action away.

[Download the latest extension](https://github.com/montasim/ICCLens/releases/latest) · [Read the privacy policy](privacy-policy.md) · [Get support](SUPPORT.md)

![ICC Lens series details with playback, metadata, season selection, and episode cards](apps/web/public/screenshots/series-detail.png)

## What it improves

- Poster-first home, category, and search grids with consistent sorting and navigation.
- Context-aware category changes: movies stay with movies, series with TV shows, and files with Games, Software, E-Books, and other non-video groups.
- Movie and series details with clear metadata, playback, season selection, episode downloads, and related titles.
- Modern file pages for single downloads, multi-file collections, and information-only content.
- An immersive player with keyboard controls, click-anywhere play/pause, resume history, and deliberate error states.
- A popup switch and an always-reachable route back to the original ICC page.

The extension does not host media, bypass network access, create accounts, proxy content, or broaden access to the server.

## Install the latest release

1. Open the [latest GitHub Release](https://github.com/montasim/ICCLens/releases/latest).
2. Download the Chrome ZIP and unzip it.
3. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
4. Select the unzipped extension folder.
5. Visit `http://10.16.100.244/` while connected to the ICC network.

The matching `.sha256` file can be used to verify the downloaded ZIP. ICC Lens is not currently distributed through the Chrome Web Store.

## Repository layout

```text
ICCLens/
├── apps/
│   ├── extension/   WXT + React Chrome extension
│   └── web/         TanStack Start product website
├── docs/            architecture, quality, release, and security contracts
├── prototype/       approved functional UI prototypes
├── scripts/         workspace and artifact verification
├── .output/         generated unpacked extension, ZIP, and checksum
└── netlify.toml     website deployment contract
```

The extension keeps its domain/application/infrastructure direction inside `apps/extension`. The web app is independent: it contains public product copy and sanitized screenshots, and has no route into the extension or private ICC server.

## Develop locally

### Requirements

- Node.js 24
- pnpm 11
- Chrome 120 or later for unpacked-extension testing

```sh
git clone https://github.com/montasim/ICCLens.git
cd ICCLens
pnpm install --frozen-lockfile
```

Run the extension development workflow:

```sh
pnpm dev
```

Run the landing page at `http://localhost:3000`:

```sh
pnpm dev:web
```

There are no environment variables, external services, accounts, or secrets to configure.

## Build outputs

```sh
pnpm build:extension
pnpm build:web
```

- The unpacked Chrome extension is written directly to the repository-root `.output/` directory.
- The TanStack Start client is written to `apps/web/dist/client`; its Netlify server function is generated alongside the web build.
- `pnpm build` builds both applications.

## Deploy the website to Netlify

The root [`netlify.toml`](netlify.toml) is ready for a repository-based Netlify deployment. It runs `pnpm build:web`, publishes `apps/web/dist/client`, and uses the Netlify TanStack Start Vite integration for request handling. The site deliberately says **Download latest** and links to GitHub Releases rather than embedding a release version.

This repository prepares the deployment contract but does not create or modify a remote Netlify site.

## Release the extension

The [release workflow](.github/workflows/release.yml) runs for tags matching `v*`. It checks that the tag matches `apps/extension/package.json`, runs the full release suite, and publishes the verified Chrome ZIP plus its SHA-256 checksum to GitHub Releases.

```sh
pnpm check:release
git tag vX.Y.Z
git push origin vX.Y.Z
```

Tagging and pushing are human-authorized release actions. Local builds never publish automatically.

## Privacy and permissions

The packaged extension requests only:

- Chrome `storage`, for enabled state, theme, and bounded local watch history.
- A static content script on the exact `http://10.16.100.244/*` origin.

It requests no wildcard hosts, tabs, scripting, cookies, downloads, history, clipboard, unlimited storage, telemetry, remote code, or third-party API access. If parsing or rendering fails, ICC Lens leaves or restores the original page.

See the [permission ledger](permission-ledger.md), [privacy policy](privacy-policy.md), and [threat model](docs/THREAT_MODEL.md) for the complete boundary.

## Quality checks

| Command              | What it proves                                                                   |
| -------------------- | -------------------------------------------------------------------------------- |
| `pnpm check:fast`    | Formatting, approved prototype, toolchain, lint, types, and unit/UI behavior     |
| `pnpm test:e2e`      | Real unpacked-extension behavior in Chromium                                     |
| `pnpm check`         | Fast checks, extension artifact audit, browser journey, and web production build |
| `pnpm check:release` | Exact release ZIP contents and checksum, in addition to all checks above         |

GitHub Actions runs the project checks on pull requests and `main`. The [quality ladder](docs/QUALITY.md) and [release checklist](docs/RELEASE_CHECKLIST.md) define completion beyond code existing.

## Documentation

- [Product contract](PRODUCT.md)
- [Design system](DESIGN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Prototype coverage](prototype/coverage.md)
- [Quality levels](docs/QUALITY.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Surface contract](docs/SURFACE_CONTRACT.md)
- [Contributing](CONTRIBUTING.md)

## Support and security

Use [SUPPORT.md](SUPPORT.md) for usage questions and reproducible defects. Report vulnerabilities through [SECURITY.md](SECURITY.md), not a public issue; never include credentials, browsing history, private media URLs, or copied server data.

Built and maintained by [Montasim](https://github.com/montasim). Licensed under the [MIT License](LICENSE).
