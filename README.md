# ICC Lens

ICC Lens is a Chrome extension that replaces the legacy interface at `http://10.16.100.244/` with the approved Design A catalog experience. It preserves the server's existing pages and endpoints while making categories, search, media details, series episodes, archives, downloads, and recovery actions easier to use.

The extension is private-network specific: its content script matches only that literal HTTP origin. It sends no analytics or page data anywhere and stores only whether the enhanced interface is enabled.

## What it covers

- Dashboard, category, and search-result catalogs
- All 45 observed categories across Movies, Games, Software, TV Series, and Others
- Movie detail/player pages
- TV series pages with visible episode play/download rows
- Software, game, archive, and other file pages without false video players
- Original featured-carousel content, native search fallback, server-driven suggestions, automatic pagination, and empty/error/end states
- One-action access to the original page and an extension popup enable/disable switch
- Responsive desktop/mobile layouts and keyboard-accessible search/browse controls

The observed page contract and design approval are recorded in [prototype/coverage.md](prototype/coverage.md), [PRODUCT.md](PRODUCT.md), and [DESIGN.md](DESIGN.md).

## Requirements

- Node.js 24
- pnpm 11 (the repository pins `pnpm@11.7.0`)
- Chrome 120 or later
- Network access to `http://10.16.100.244/`

## Develop

```sh
pnpm install --frozen-lockfile
pnpm dev
```

WXT launches the development extension. Visit the ICC server to see the enhanced interface. Click the ICC Lens toolbar icon to disable or re-enable it for all ICC pages in the current Chrome profile.

## Build and install locally

```sh
pnpm build
```

Open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select `.output/chrome-mv3`.

For a verified distributable:

```sh
pnpm check:release
```

The command creates one ZIP and an adjacent SHA-256 checksum in `.output/`. Publication or Chrome Web Store submission is intentionally not automated.

## Architecture

```text
legacy ICC DOM/fetch ─> ICC DOM adapter ─> normalized page model
                                               │
                                               v
popup ─> local enabled preference ─> shadow-root React interface
```

The legacy selectors and endpoint behavior live behind `IccDomAdapter`. Domain code classifies catalog/detail content without Chrome dependencies; the content entrypoint owns page lifecycle and fallback. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).

## Privacy and permissions

The packaged extension requests only Chrome's `storage` permission and a static content script for `http://10.16.100.244/*`. It does not request cookies, tabs, scripting, downloads, history, broad host access, or `<all_urls>`.

See [permission-ledger.md](permission-ledger.md) and [privacy-policy.md](privacy-policy.md) for the complete data and failure behavior.

## Quality commands

| Command                          | Purpose                                                                  |
| -------------------------------- | ------------------------------------------------------------------------ |
| `pnpm check:fast`                | Formatting, lint, toolchain, types, and unit/UI tests                    |
| `pnpm test:e2e`                  | Unpacked-Chromium catalog, toggle, responsive, and accessibility journey |
| `pnpm check`                     | Fast checks plus MV3 build and browser verification                      |
| `pnpm check:release`             | Release configuration, ZIP inspection, and checksum                      |
| `pnpm verify:prototype:approved` | Confirm the approved HTML/Tailwind prototype gate                        |

## Known boundaries

- Chrome is the only configured browser target.
- ICC Lens depends on the legacy server's rendered HTML and endpoints; if they change, it keeps or restores the original UI instead of guessing.
- The server, linked media, download safety, availability, authentication, and content are outside the extension's control.
- The exact private IP is intentional. A different host requires an explicit manifest, privacy, threat-model, and test update.

## License

Licensed under the [MIT License](LICENSE).
