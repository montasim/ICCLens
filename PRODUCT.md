# ICC Lens product brief

<!-- impeccable:product-schema 1 -->

## Platform

- Chrome 120+ Manifest V3 extension
- Public product website

## Stack

pnpm monorepo with a WXT/React extension and a TanStack Start/React website. Both applications use TypeScript, Tailwind CSS 4, Shadcn-style primitives, and Huge Icons.

## Users

People who already have access to the ICC local media server and need to find, evaluate, play, or download its catalog from Chrome. This audience is inferred from the audited server and confirmed workflow.

## Product Purpose

ICC Lens replaces the hard-to-scan ICC server presentation with the approved Catalog interface while preserving the server's existing navigation, search, media, session, and download behavior. Success means users can understand where they are, distinguish play from download, select series episodes, and recover to the original interface at any time.

## Positioning

ICC Lens does not operate a second catalog or scrape data into a remote service. It adapts the ICC page already loaded in the browser into a clearer local interface.

## Operating Context

- Target: `http://10.16.100.244/*`
- HTML routes: `dashboard.php` and `player.php`
- Download endpoint: `download.php`
- Catalog: 45 categories across movies, games, software, TV shows, and other resources
- The server and its internal media hosts remain authoritative for content, authentication, availability, and download behavior.

## Capabilities and Constraints

- The public website explains the product, presents checked-in extension screenshots, and points to the latest GitHub Release without displaying a hard-coded version number.
- The website is independently buildable and deployable to Netlify; it does not connect to, proxy, or receive data from the private ICC server.

- Automatically runs only on the exact ICC HTTP host.
- Covers home/latest, category, search, movie, series, episode, archive, file-information, multi-file download, direct-download, loading, empty, and failure states.
- File pages preserve the server-provided title, artwork, descriptive copy, ordered download links, and sizes. Information-only file pages remain in the owned interface and clearly state when ICC supplied no download.
- “Change category” stays within the current content type: Movies exposes only movie categories, Series only TV-series categories, and File combines Games, Software, Others, and future non-media groups. Every contextual chooser keeps a consistent three-column desktop layout, while Navbar Browse remains the complete server category inventory.
- Search results use the same responsive poster-card grid as category and home catalogs, preserving familiar artwork, title, age, popularity, and action behavior instead of switching to a separate row layout.
- The consolidated series Details panel can export the server-provided episode URLs as a local UTF-8 text file, one absolute URL per line, while retaining each episode's individual download action.
- Uses the existing page DOM and same-origin server actions; it does not add accounts, bypass authentication, upload files, or modify server data.
- Preserves original URLs and session parameters when the server supplies them and repairs empty player-page session parameters from the current URL when possible.
- Stores whether ICC Lens is enabled, the active theme preference, and up to 20 recent local watch-history records for 90 days. Watch records contain a same-origin page identity, title, optional season/episode context, playback position, duration, and update time; completed records are removed and users can clear history. External media URLs, posters, page contents, and search queries are not persisted.
- No analytics, telemetry, advertising, third-party API, remote executable code, or background synchronization.
- Does not launch, control, or exchange data with external download managers; users import the generated text file themselves.
- If parsing or mounting fails, the original page remains visible.
- Chrome Web Store submission, signing, and remote repository creation remain human-authorized operations.

## Brand Commitments

- Product name: ICC Lens.
- The approved single Catalog prototype is the binding visual and interaction reference.
- The approved ISPCine-derived direction uses warm cream and navy/near-black surfaces, one signal amber action color across catalog and player controls, teal support, poster-led browsing, explicit metadata, and 12–16px control corners.
- Manrope is the body face, Space Grotesk is the display face, and IBM Plex Mono is reserved for compact measurements and labels; every production font is bundled.
- Production interface components use Tailwind utilities and Huge Icons; no second icon family is introduced.

## Evidence on Hand

- `prototype/index.html`: approved functional prototype with Design A selected.
- `prototype/landing.html`: approved functional landing-page prototype.
- `apps/web/public/screenshots/`: sanitized screenshots of the current extension interface used by the landing page.
- `prototype/icc-ftp-ux-audit.md`: live-site page, category, state, and issue inventory captured on 2026-08-31.
- Sanitized DOM fixtures and adapter tests cover the server templates without packaging user sessions or media files.

## Product Principles

- Preserve server truth; improve only its presentation and interaction.
- Make play, episode selection, and download consequences explicit.
- Keep access and stored data as narrow as the product promise.
- Never replace a working original page with a broken enhancement.
- Treat all page-derived content as untrusted input.

## Accessibility & Inclusion

The primary journey must remain operable by keyboard, expose visible focus, use semantic controls and status messages, avoid serious or critical axe violations, and remain usable at narrow widths and 200% zoom.

## Proof of Completion

- `pnpm verify:prototype:approved`
- `pnpm check`
- `pnpm check:release` after public support and repository metadata are confirmed
- `pnpm build:web` and the root `netlify.toml` deployment contract
- Manual unpacked-extension smoke test against the live ICC server
