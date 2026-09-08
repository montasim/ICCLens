# Prototype coverage

Prototype status: draft
Approved by: pending review
Approved on: pending review

## Requirements map

| Requirement                            | Surface                                 | Interaction or state                                                                             | Mock boundary                                                                            | Review evidence                                             |
| -------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Understand the catalog immediately     | Website content script                  | Catalog home and latest additions                                                                | Static demonstration content                                                             | Design A home view                                          |
| Browse the complete library            | Website content script                  | Browse panel containing all 45 categories                                                        | Category navigation changes prototype state                                              | Design A browse panel and library view                      |
| Search accessibly                      | Website content script                  | Query entry, suggestions, results, and empty recovery                                            | Search results are simulated locally                                                     | Design A search and states views                            |
| Switch between light and dark themes   | Website content script navbar           | A labeled theme control changes every owned surface while preserving focus and responsive layout | Theme preference is simulated in the URL; production local persistence requires approval | Design A catalog, detail, and state views at both themes    |
| Distinguish media from files           | Website content script                  | Movie, series, archive, and direct-download actions                                              | Play and download actions do not contact the server                                      | Design A movie, series, and file views                      |
| Select series episodes                 | Website content script                  | Ten visible episode rows with play and download actions                                          | Episode changes are simulated                                                            | Design A series view                                        |
| Export a series download list          | Website content script                  | “Export 10 download links” saves a UTF-8 text file with one absolute episode URL per line        | A local data URL creates the mock artifact; no server or download manager is contacted   | Design A series view; implementation requested by Montasim  |
| Control immersive playback             | Website content script media player     | Play/pause, seek, volume, mute, scrub, fullscreen, exit, auto-hiding controls, and shortcut help | Playback time and media frames are simulated; fullscreen uses the browser Fullscreen API | Design A movie and series play actions open the player      |
| Operate playback entirely by keyboard  | Website content script media player     | Space/K, arrow keys, M, F, Escape, and ? with visible focus and live status                      | Keys update local prototype state only                                                   | Player shortcut panel and keyboard walkthrough              |
| Recover from playback interruptions    | Website content script media player     | Buffering, retry, playback failure, and exit-to-file-details actions                             | Buffering and stream failure are simulated locally                                       | Prototype review switches inside keyboard controls          |
| Recover from server or parser problems | Website content script                  | Loading, empty, and server-error states                                                          | Failure outcomes are simulated                                                           | Design A states view                                        |
| Control the enhancement                | Action popup and website content script | Enabled state and restore-original behavior                                                      | Chrome storage is mocked by prototype state                                              | Approved production plan; popup uses the same visual system |
| Remain usable on small screens         | All visible surfaces                    | Responsive navigation, catalog, details, and overlay                                             | Browser viewport only                                                                    | Prototype reviewed at desktop and mobile widths             |

## Extension surface inventory

- Action popup: enable or disable ICC Lens and describe its exact privacy boundary.
- Website content script: approved Design A interface for catalog, search, details, series, files, and recovery states.
- Side panel: not included.
- Options or settings: not included.
- Onboarding: not included; the exact-host install warning supplies the permission decision.
- Permission request and denial: Chrome's install-time exact-host warning; denial leaves the ICC site unchanged.
- Browser lifecycle and persistence: enabled state is stored locally and applied on the next matching page load.

## Review notes

- Popup dimensions: 360px wide, content-height layout.
- Website widths: 320px minimum through wide desktop.
- Keyboard path: skip link, search, navigation, browse panel, content cards, open player, Space/K playback, arrow-key seek and volume, M mute, F fullscreen, ? help, Escape exit, download actions, and restore-original control.
- Loading, empty, denied, and failed states: represented in the states view and production fallback contract.
- Known prototype-only behavior: content, search, Chrome storage, theme persistence, downloads, media frames, playback time, buffering, stream failure, and server failures are simulated. Browser fullscreen is real when allowed.
- Approved deviations: production removes the A/B/C switcher and implements Design A only; popup controls were specified in the approved implementation plan.
- Approval extension: on 2026-08-31, Montasim explicitly requested implementation of the reviewed “Export N download links” text-file journey. It keeps individual episode downloads and adds no clipboard, downloads, host, storage, or native-manager integration.
