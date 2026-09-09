---
name: ICC Lens
description: A warm amber and teal media catalog for the ICC local server, with light and dark themes.
colors:
  amber-brand: '#fbbf24'
  amber-action: '#fbbf24'
  amber-action-hover: '#f59e0b'
  amber-on-surface: '#854d0e'
  action-foreground: '#ffffff'
  teal-support: '#55d6be'
  light-canvas: '#f7f3ea'
  light-surface: '#fffaf0'
  dark-canvas: '#12110f'
  dark-surface: '#1d1b17'
  danger: '#991b1b'
typography:
  display:
    fontFamily: 'Space Grotesk Variable, sans-serif'
    fontSize: 'clamp(1.875rem, 4vw, 2.25rem)'
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: '-0.025em'
  popup-display:
    fontFamily: 'Space Grotesk Variable, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Space Grotesk Variable, sans-serif'
    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)'
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'Manrope Variable, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: '-0.01em'
  body:
    fontFamily: 'Manrope Variable, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: 'IBM Plex Mono, monospace'
    fontSize: '0.75rem'
    fontWeight: 600
    lineHeight: 1.25
rounded:
  control: '8px'
  compact: '12px'
  surface: '16px'
  pill: '9999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  2xl: '32px'
components:
  button-primary:
    backgroundColor: '{colors.working-ink}'
    textColor: '{colors.action-foreground}'
    typography: '{typography.body}'
    rounded: '{rounded.compact}'
    padding: '12px 16px'
    height: '48px'
  button-accent:
    backgroundColor: '{colors.amber-action}'
    textColor: '{colors.action-foreground}'
    typography: '{typography.body}'
    rounded: '{rounded.compact}'
    padding: '12px 20px'
  card-poster:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.surface}'
  field-search:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.compact}'
    padding: '10px 12px'
    height: '44px'
---

# Design System: ICC Lens

## Overview

**Creative North Star: "The Warm Local Cinema"**

ICC Lens treats a local file server like a compact editorial catalog. Warm neutral surfaces frame poster-led content, amber marks primary actions across both the catalog and cinema player, and teal supports utility actions. The same semantic hierarchy is available in user-selected light and dark themes.

Density serves scanning. Headlines are confident without overpowering the catalog, metadata stays compact and legible, and the layout spends its largest areas on actual titles, posters, players, and episode rows. The approved Design A hierarchy is the authority; decoration never outranks the catalog or the path back to the original server.

**Key Characteristics:**

- Poster-first catalog scanning on a warm neutral canvas.
- A 1656px shared container, compact page spacing, and compact metadata.
- Local Continue Watching with explicit clearing and no remote media data.
- A 70/30 detail layout: player at left, download information at right, followed by details, episodes, and related titles.
- One amber action voice paired with softened ink utility controls.
- A role-based Archivo hierarchy with restrained headline scale and legible operational labels.
- Clear differences between details, play, episode selection, and download.
- Responsive stacking that keeps search and recovery actions available at narrow widths.

## Brand Mark

The ICC Lens mark is the prototype's compact amber ICC tile with a teal diagonal edge. Its simple lettering and high-contrast silhouette stay recognizable at the 16px Chrome toolbar size, while the amber and teal connect the browser icon, popup, and injected catalog header to one identity.

## Colors

The palette is neutral and editorial, using amber as a scarce interactive signal rather than an ambient wash.

### Primary

- **Signal Amber:** The bright yellow-gold action and identity color for primary navigation, focused emphasis, active controls, and player transport state. Text and icons on solid amber controls use white, following the approved visual treatment without darkening the yellow surface.

### Neutral

- **Catalog Ink:** The highest-contrast text, dark media planes, and primary utility actions.
- **Working Ink:** Strong text and routine dark controls without pure-black harshness.
- **Muted Ink:** Supporting metadata and explanatory copy that still clears AA contrast.
- **Cool Paper:** The light zinc page canvas that separates the extension from the original server without feeling like a floating dashboard.
- **Field White:** Headers, feature utilities, dialogs, metadata cells, and controls that need a clean working surface.
- **Amber Wash:** Focus rings, icon wells, selected context, and other low-intensity accent states.
- **Recovery Red:** Search and pagination failure copy only; it never competes with amber during normal use.

**The Amber Is a Verb Rule.** Amber marks an action, selection, focus, or product identity. Do not turn entire routine sections into amber decoration.

**The Contrast Is Evidence Rule.** Metadata must use a neutral dark enough for AA contrast on both paper and white surfaces; subtlety never depends on washed-out gray.

### Text Roles

- **Zinc 900:** Strong page, detail, and section headings on light surfaces.
- **Zinc 800:** Primary data, control labels, and high-value working text on light surfaces.
- **Zinc 600:** Supporting copy, metadata, timestamps, counts, and secondary context on light surfaces.
- **White / Zinc 300:** Primary and secondary player text respectively on near-black media surfaces.

The light interface uses browser black for strong text and routine labels. Near-black is reserved for media planes and fallback notices, while pure black belongs to video playback. Primary controls, focus indicators, progress tracks, volume tracks, and play controls all use Signal Amber (`#fbbf24`) through the shared action token.

## Typography

**Display Font:** Archivo Variable (with Arial Narrow and sans-serif fallbacks)

**Body Font:** Archivo Variable (with Arial Narrow and sans-serif fallbacks)

**Character:** One bundled variable family creates a confident editorial voice through a role-based scale, weight, and color hierarchy rather than ornamental font pairing. Major statements remain decisive; body copy and metadata stay direct, compact, and readable.

### Hierarchy

- **Page / Detail Headline** (500, fluid 24–30px, 1.08, -0.025em): Catalog and detail-page titles.
- **Popup Display** (700, 36px, 1.02, -0.025em): The fixed 360px popup statement, balanced for a compact surface.
- **Section Title** (500, fluid 20–24px, approximately 1.2, -0.02em): Catalog sections, episode groups, and supporting page headings.
- **Card Title** (600, 15px, 1.3, -0.01em): Catalog card titles at readable desktop widths.
- **Body** (500, 14px, 1.5): Dense explanations, descriptions, and trust copy; reading prose may grow responsively to 16px and is capped at 65ch.
- **Label / Metadata** (600, 12px minimum, 1.25): Metadata, counts, timestamps, release status, compact markers, and control support.

Weight communicates role consistently: 500 for page and section titles, selects, and heading-row actions; 600 for card titles, metadata, and supporting labels; and 500 for prose. Size and spacing preserve hierarchy without relying on heavy weight. Do not use 800 or 900 as a broad default.

**The Headline Earns the Width Rule.** Large type belongs to the current title or promise, never to generic section chrome.

**The Compact Does Not Mean Faint Rule.** Reduce metadata with size and space, not weak weight or insufficient contrast.

## Layout

The catalog uses a centered container capped at 1656px with 16px narrow padding, 24px medium padding, and 32px wide padding. Every owned page begins with a compact breadcrumb on that same container, followed by the page's primary content. The server-authored feature rail shows one, two, three, four, or five cards as usable width grows; home, category, and search results share the same poster-card grid, growing from two columns to three, four, five, and finally six. Category and search pages begin directly with the compact catalog heading and actions; they do not repeat that context in a separate banner or switch to a row-only result treatment. Detail pages reserve their widest area for the player or primary file action, then use a poster-and-metadata split. Starting a playable movie or episode replaces that framed detail surface with an edge-to-edge near-black screening room.

At narrow widths, the brand and essential browse/recovery actions remain on the first header row and search receives a full second row. The featured rail exposes one nearly full-width card with touch scrolling, catalog cards remain a two-column scan, and episode actions wrap without hiding play or download. Player transport controls reflow without collisions, preserve every essential action, and keep interactive targets at least 44px. The popup is a deliberate 360px fixed surface; the injected page supports 320px and wider.

**The Content Owns the Viewport Rule.** Extra width goes to the feature, grid, or player—not to settings cards or decorative side rails.

## Elevation & Depth

ICC Lens is flat by default and uses tonal separation, borders, and poster contrast for structure. Shadows are reserved for media, floating suggestion/dialog layers, and primary actions that need to detach from the paper canvas.

### Shadow Vocabulary

- **Poster Rest** (`0 8px 24px rgba(24,24,27,0.08)`): Low ambient separation under catalog artwork.
- **Poster Hover** (`0 18px 36px rgba(24,24,27,0.16)`): The card's restrained upward response.
- **Floating Layer** (`0 18px 44px rgba(24,24,27,0.16)`): Search suggestions and elevated overlays.
- **Dialog Layer** (`0 28px 80px rgba(0,0,0,0.35)`): The category browser above its dark scrim.

**The Flat Until Useful Rule.** A shadow must explain interaction or layering. Routine white sections stay border-separated and flat.

## Shapes

Controls use compact 8–12px corners; product surfaces, artwork, dialogs, media frames, and error panels use 16px corners. Pills are limited to short category/status markers. Thin zinc borders separate neutral surfaces, while dark media planes rely on clipping rather than nested outlines.

**The Two-Radius Rule.** Default to 12px for controls and 16px for content surfaces; introduce a different radius only when size or circular geometry requires it.

## Components

### Buttons

- **Shape:** Compact curved controls (12px) with a minimum 44px target in every player and narrow-screen context.
- **Primary:** Working Ink for universal actions and amber for catalog-specific emphasis; both use semibold 14px labels.
- **Hover / Focus:** A small upward response where elevation is useful, a color shift toward amber, and a visible four-pixel amber-wash ring.
- **Secondary / Ghost:** White bordered controls for alternate actions; quiet text buttons are reserved for Home and original-site recovery.

### Chips

- **Style:** Short pill labels use dark translucent media ink or amber fill with high-contrast 12px text.
- **State:** A chip names content type or current context; it never acts as unexplained decoration.

### Cards / Containers

- **Corner Style:** Artwork and feature surfaces use 16px clipping.
- **Background:** Catalog cards are visually open on paper; utility and metadata containers use white.
- **Shadow Strategy:** Artwork lifts, while card copy remains flat and aligned to the grid.
- **Internal Padding:** Feature and utility surfaces use 24–40px according to viewport size.

### Inputs / Fields

- **Style:** The search field is a 44px paper surface with a one-pixel zinc border and 12px corners.
- **Focus:** Border, white fill, and an amber-wash ring change together.
- **Error / Disabled:** Disabled actions retain their label and lower opacity; search failures appear in a separate red recovery strip with the native-search action named.

### Navigation

The sticky white header carries product identity, search, the five server-provided category groups, an icon-only theme control (toggling between the ISPCine-derived light and dark themes), and original-site recovery. Navbar Browse opens the complete inventory in one grouped modal sheet. The page-level **Change category** action reuses that browser with a narrower scope: only Movies on movie pages, only TV Series on series pages, and Games, Software, Others, plus future non-media groups on file pages. Contextual choosers maintain a three-column desktop rhythm: a single Movies or TV Series group spans the modal and distributes its categories across three columns, while File assigns its three server groups one column each. Beneath the header, a quiet **Home › Current page** breadcrumb appears on catalog, category, search, empty, and detail views; every breadcrumb label uses medium (500) weight, Home is a 44px link, the current label truncates safely, and `aria-current="page"` preserves its meaning for assistive technology. Every action keeps an accessible name.

### Catalog Poster Card

The artwork is a fixed 3:4 scan target with a bottom gradient carrying only its title. Titles stay on one ellipsized line at rest, then reveal their complete wrapped text inside the fixed poster overlay on pointer hover or keyboard focus. Media, file, and series badges are intentionally omitted because the surrounding catalog and title already provide enough context. When ICC omits an image or its URL fails to load, the card replaces the broken browser image with the amber default poster and the appropriate media or file icon. Age and popularity stay below the artwork, so useful metadata remains readable without cluttering the poster.

### Catalog Sorting

The main grid places a themed **Sort by** menu in the section's right-side action group, immediately before Browse or Change category. Its trigger and options use equal left and right padding, while selected, hover, and keyboard-focus states stay within the amber and neutral system instead of inheriting operating-system blue. The selected value and menu options use medium weight so this utility control stays visually subordinate to the section heading and primary action. It preserves the server sequence by default and can sort loaded items by popularity in either direction or by name from A–Z and Z–A. Popularity is derived from the server's numeric Hits label; missing hit counts remain last. Sorting never changes the featured carousel's server-authored order and automatically reapplies when infinite loading adds items.

### Featured Carousel

The home catalog preserves the original ICC carousel's unique titles, images, links, and order while removing Owl's cloned slides. It presents five cards on wide screens and progressively fewer on smaller screens, with five-second automatic page advancement, touch scrolling, wraparound arrows, page indicators, keyboard focus, and reduced-motion-safe movement. Automatic advancement wraps continuously, pauses during hover or keyboard focus, stops while the document is hidden, and provides an explicit pause control; reduced-motion users keep manual navigation without automatic movement. Category and search views omit the rail and the former context banner so requested content begins immediately.

### Media Detail

Before playback, playable video uses a wide dark frame beside a consolidated Details panel. For series, that panel owns metadata, season selection, and series export actions so metadata is not repeated below the player. Explicit episode rows follow the primary 70/30 layout, with related titles after them. The export saves a UTF-8 text file with one absolute server-provided episode URL per line; individual episode downloads remain visible. File pages use a poster-and-reading layout that preserves the server's descriptive copy. Single archives and multi-file collections expose ordered amber download actions with their formats and sizes; information-only pages show a deliberate no-download state instead of restoring the legacy interface.

### Immersive Media Player

Starting a playable movie or selected episode opens an edge-to-edge near-black screening room. The top control group keeps **Exit player**, the title, and selected source or episode context visible together. The bottom transport groups a scrubber, play/pause, 10-second rewind and forward, mute and volume, time, keyboard help, and fullscreen without collisions at narrow widths.

Clicking the unobstructed video surface toggles play and pause. Player controls, episode navigation, dialogs, and sliders retain their own actions and never trigger the surface toggle through event bubbling.

Space or K toggles play/pause; Left and Right seek 10 seconds; Up and Down change volume; M toggles mute; F toggles fullscreen; ? opens help; and Escape closes help before exiting the player. These shortcuts work throughout the player, while a focused progress or volume range retains its native arrow-key behavior. Help is a true modal: focus stays inside it, returns to its invoker on close, and returns to the launch action when the player exits.

Controls auto-hide only during active playback. Pointer movement, focus, and keyboard actions reveal them; focused controls and an open shortcut dialog keep them visible. Paused, ended, buffering, and playback-error states remain explicit, with replay, retry, and exit-to-details paths as appropriate. Motion-dependent fades, scaling, and spinners yield to reduced-motion preferences.

A finite positive duration enables the normal timeline and remaining-time display. Unknown, `NaN`, or infinite duration produces a disabled neutral timeline, elapsed time only, and an accessible “duration unavailable” description; the interface never invents a remaining time. The visual language stays Manrope and Space Grotesk over near-black, with white transport controls and amber reserved for progress, volume, play, action, and focus. Playback begins only after a user action and adds no permission, telemetry, or network dependency.

## Do's and Don'ts

### Do:

- **Do** preserve the server-authored featured rail followed by the approved Design A poster grid.
- **Do** keep search, direct category navigation on wide screens, compact Browse on narrower screens, and original-site recovery reachable at every supported width.
- **Do** name whether an action opens details, plays media, selects an episode, or starts a download.
- **Do** keep focus rings, AA contrast, reduced-motion behavior, and minimum touch targets intact.
- **Do** let file, movie, and series details use visibly different primary surfaces.
- **Do** preserve native arrow-key behavior on focused range inputs while keeping player shortcuts available elsewhere.
- **Do** keep controls visible whenever playback is not active, a control has focus, or the shortcut dialog is open.

### Don't:

- **Don't** let featured auto-advance continue during hover, keyboard focus, an explicit pause, a hidden document, or reduced motion; don't repeat the carousel on category/search views or let it dominate the first mobile viewport.
- **Don't** scatter amber across routine containers or add a second accent color for normal actions.
- **Don't** hide episode selection or download behind unlabeled icon-only controls.
- **Don't** place every section in a floating card or give every neutral surface a shadow.
- **Don't** remove the path back to the original server or visually disguise server-provided links.
- **Don't** show fabricated remaining time when duration is unavailable or non-finite.
- **Don't** let focus escape the shortcut modal, trap it after the modal closes, or lose the return target when the player exits.
