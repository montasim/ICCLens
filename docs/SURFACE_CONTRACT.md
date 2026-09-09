# ICC Lens surface contract

## Mode

Browse. The user visits the existing ICC server and gets a faster, more legible catalog without learning a separate destination or losing access to the original UI.

## Form

Approved Prototype Design A: a warm cream canvas, compact surface top bar, amber identity/action color, dark featured editorial card, dense-but-readable catalog cards, and restrained rounded geometry. Manrope, Space Grotesk, and IBM Plex Mono are packaged locally; no remote font or stylesheet is needed.

## First viewport

Search and browsing remain visible. The latest catalog leads with the original server's featured titles in a compact responsive carousel, followed by the scannable grid; category and search pages lead directly with their requested content and use the same responsive poster-card language. Detail pages lead with the actual primary action: player for playable video, episode rows for series, and preserved descriptive copy plus ordered download actions for non-video files. A file page with no server-provided download stays owned and says so explicitly.

The navbar Browse control always exposes every server category. A category page's Change category control is context-aware: Movies, TV Series, and non-video Files each expose only their own relevant server groups. All contextual category choosers use three columns on wide screens and collapse responsively for narrower viewports.

## User path

Visit ICC URL → parse legacy page → browse the featured rail or catalog → scroll to load more → open a detail or download → optionally restore the original site or disable ICC Lens from the popup.

## Signature interaction

The **Browse** control opens a complete category sheet containing all 45 server categories, grouped exactly as Movies, Games, Software, TV Series, and Others.

## Motion grammar

Only short opacity, color, shadow, and position transitions reinforce hover, focus, dialogs, and search suggestions. Reduced-motion users receive immediate state changes.

## Quality bar

The approved HTML/Tailwind prototype is the visual authority. Production must cover dashboard/category/search, movie, series, file/archive, direct-download navigation, empty/error/end states, narrow layouts, keyboard navigation, and a one-action path back to the original server.
