# ICC Lens UI audit

Audit date: 2026-08-31

Scope: latest catalog, category, server search, suggestions, browse dialog,
infinite loading, empty catalog, pagination failure, search failure, movie,
series, archive/file, related media, unsupported-page fallback, extension popup,
desktop, and mobile layouts.

## Baseline score

16/20 — Good

| Dimension        | Score | Evidence                                                                                                                                   |
| ---------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Accessibility    |   3/4 | Automated axe checks passed, but the browse dialog had incomplete keyboard behavior and several controls were below the 44px target floor. |
| Performance      |   3/4 | Catalog images were generally lazy, but every featured slide was eagerly loaded.                                                           |
| Responsive       |   3/4 | Catalog grids adapted correctly, but mobile detail pages delayed the title and metadata until after a large poster.                        |
| Theming          |   4/4 | The intentionally light-only Design A token system was applied consistently across owned surfaces.                                         |
| Design integrity |   3/4 | New UI ownership and legacy restoration worked, but metadata rows and microtype drifted from the system.                                   |

## Findings

| Priority | Finding                                                                                      | Baseline evidence                                      | Status   |
| -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------- |
| P1       | Browse dialog did not trap keyboard focus or return focus to Browse.                         | Browser focus-cycle test                               | Resolved |
| P2       | Multiple controls were below the 44px target floor.                                          | Computed bounding-box audit on page and popup controls | Resolved |
| P2       | Mobile details put the poster before the title, plot, and metadata.                          | 390×844 geometry assertion                             | Resolved |
| P2       | An odd metadata count left a visually broken half-empty row.                                 | Desktop computed-grid assertion                        | Resolved |
| P2       | Every featured image loaded eagerly, including off-screen slides.                            | Sixth-slide `loading` assertion                        | Resolved |
| P2       | Reduced-motion CSS suppressed every transition globally.                                     | Source audit of `src/styles.css`                       | Resolved |
| P2       | Search suggestions claimed combobox/listbox semantics without arrow-key behavior.            | Semantic and keyboard source audit                     | Resolved |
| P2       | A failed search immediately reopened its suggestion overlay on top of the error recovery UI. | Screenshot review and state assertion                  | Resolved |
| P2       | Important route and transient states lacked browser coverage.                                | Test inventory gap                                     | Resolved |
| P3       | Four labels used undocumented 10–11px microtype.                                             | Automated mechanical detector                          | Resolved |

## Permanent regression coverage

The Playwright suite owns the automated audit. It checks:

- extension ownership and complete concealment of the replaced legacy page;
- axe accessibility results on representative owned and fallback surfaces;
- 44px minimum pointer targets for visible links and buttons;
- dialog focus trapping and focus restoration;
- desktop and mobile information order;
- category, search, suggestion, loading, empty, error, detail, file, fallback,
  and popup states;
- lazy loading beyond the first visible carousel page; and
- optional full-page screenshots with `UI_AUDIT_CAPTURE=1 pnpm test:e2e`.

## Final score

20/20 — Excellent

| Dimension        | Score | Final evidence                                                                                                                          |
| ---------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------- |
| Accessibility    |   4/4 | Axe, focus cycle, focus restoration, truthful semantics, and computed 44px target checks pass.                                          |
| Performance      |   4/4 | Only the first visible carousel page is eager; off-screen and catalog artwork is lazy and asynchronously decoded.                       |
| Responsive       |   4/4 | Desktop and 390px mobile geometry checks pass, with media details before the poster on mobile.                                          |
| Theming          |   4/4 | The intentional light-only Design A token system remains consistent.                                                                    |
| Design integrity |   4/4 | Every supported route is extension-owned, fallback is explicit, metadata rows are complete, and microtype follows the documented scale. |

Final automated verification: `pnpm check:release` and the screenshot matrix pass.
