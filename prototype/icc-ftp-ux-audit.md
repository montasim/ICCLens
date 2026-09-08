# ICC FTP Server UI Audit

Audit target: `http://10.16.100.244/`  
Audit date: 2026-08-31  
Prototype mode: visual overhaul with the current content structure preserved

## Design read

An internal media and file catalog for frequent users, with a calm, high-density utility language. The interface should optimize finding, evaluating, playing, and downloading files.

- Design variance: 5/10
- Motion intensity: 3/10
- Visual density: 7/10
- Brand direction: neutral zinc surfaces with one violet accent derived from the existing ICC logo
- Shape system: soft 12-16 px corners, with fully rounded type badges

## Complete page and state inventory

The live site has two HTML page templates, several important states, and one download endpoint:

| Surface               | Live route          | Variations found                                                                             |
| --------------------- | ------------------- | -------------------------------------------------------------------------------------------- |
| Dashboard and listing | `dashboard.php`     | Home/latest feed, 45 category views, search suggestions, infinite-loading state              |
| Player and detail     | `player.php`        | Single movie, multi-episode series, course/archive incorrectly treated as video              |
| Direct download       | `download.php`      | Used by software, games, books, and some courses; it is an endpoint rather than an HTML page |
| External links        | Separate news sites | BD Tech News and BD News are outside the FTP application                                     |

All 45 categories were inventoried:

- Movies: 18
- Games: 4
- Software: 11
- TV Shows: 9
- Others: 3

Representative category pages from every top-level library were inspected. They all reuse the same dashboard/listing template, so separate prototype pages for every category would duplicate the same interface. The prototype includes every category in one complete browse panel and changes the shared library-page heading and state.

## Main UX and implementation issues

1. **No page or category context.** Every page title is `ICC FTP SERVER`, category listings have no visible heading, and users cannot confirm where they are.

2. **The promotional carousel dominates every listing.** It repeats on home and category pages, pushes the requested category content down, and consumes most of the first mobile viewport.

3. **Search is hard to operate accessibly.** Results appear inside a visually positioned table without link, button, listbox, or option semantics. The search icon has no accessible name. The advanced-search modal exists but its body is empty.

4. **Card behavior is unpredictable.** Some posters open `player.php`; others immediately open `download.php`. The interface does not communicate whether a click will play, show details, or start a large download.

5. **Non-media files are sent to the video player.** A `.rar` course archive was emitted as a `video/mp4` source, leaving the player at `00:00 / 00:00`. File type must decide the UI and primary action.

6. **Episode selection is hidden.** A series exposes ten episode files through a small download dropdown. Ten `<source>` elements are also placed under one video element instead of being presented as an episode playlist.

7. **Infinite loading is opaque.** Listings start with 12 cards, append more when scrolling, and only show `Loading...`. There is no count, completion state, retry state, or explicit load-more control.

8. **The listing has excessive visual noise.** Repeated circular dates, dotted timelines, absolute-positioned masonry cards, fade-in effects, and the carousel compete with titles and actions.

9. **Metadata hierarchy is weak.** Age and hit counts are more prominent than content type, file format, quality, language, episode count, and file size.

10. **Mobile navigation removes essential tools.** Search and category navigation disappear behind an unlabelled menu button, while the oversized carousel and one-column posters delay the actual content.

11. **Player-page navigation loses session context.** Category and related-item links on inspected player pages contained an empty `session` value, unlike the dashboard links.

12. **Accessibility gaps are widespread.** Several icon-only controls lack names, current navigation state is not announced, and interaction targets rely heavily on hover and visual positioning.

## Prototype coverage

The prototype supplies three structurally different directions:

- **A - Catalog:** balanced poster grid, strong metadata, and conventional detail pages
- **B - Navigator:** persistent category sidebar and dense list-first browsing
- **C - Spotlight:** cinematic media presentation with the same functional controls

Every direction includes:

- Home/latest additions
- Shared category library covering all 45 categories
- Search and result state
- Single-movie player and detail page
- Multi-episode series player and episode list
- Direct-download file page for games, software, books, and archives
- Loading, empty, and server-error states
- Responsive desktop and mobile layouts

The prototype is intentionally read-only. Buttons demonstrate the intended navigation and action hierarchy without starting real downloads or changing the FTP server.

## Recommended direction

Start implementation from **Variant A - Catalog**. It is the strongest general-purpose extension UI and is easiest to map onto the current dashboard and player DOM. Borrow Variant B's dense list mode as an optional view for software, books, and courses. Keep Variant C as an optional media-focused home and player treatment rather than the default catalog.
