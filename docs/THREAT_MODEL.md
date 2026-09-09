# ICC Lens threat model

## Protected properties

- ICC Lens cannot observe pages outside the exact ICC origin.
- Page data is rendered locally and is not transmitted. Only the approved bounded watch-history fields are persisted locally.
- A malformed or changed legacy page cannot replace the user's recovery path with a blank surface.
- Page-controlled values cannot become executable markup or arbitrary URL schemes in the extension UI.
- The packaged extension requests no capability beyond its single-origin content script and local preference storage.

## Trust boundaries

The ICC server, its HTML, its command endpoints, and every media URL it returns are untrusted inputs. Chrome extension storage is trusted to persist local preferences (`enabled`, `theme`) and bounded `watchHistory`. React, WXT's isolated shadow root, and the extension package are trusted code boundaries. Destination media servers are outside ICC Lens and receive requests only after normal page navigation or explicit user action.

## Threats and mitigations

| Threat                                                          | Mitigation                                                                                                                                                                                            | Evidence                                             |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Legacy markup changes or is incomplete                          | Parse before hiding anything; show a local notice or keep/restore the original page on failure                                                                                                        | DOM adapter fixtures and unpacked browser fallback   |
| Page text contains markup or script                             | Render strings through React text nodes; never use `dangerouslySetInnerHTML`                                                                                                                          | Source review and lint                               |
| Page links use `javascript:`, `data:`, or another unsafe scheme | Resolve and keep only HTTP(S) URLs at the adapter boundary                                                                                                                                            | Parser tests and source review                       |
| Server mislabels an archive as video                            | Determine playability from a strict media-extension allowlist instead of MIME alone                                                                                                                   | Archive and media allowlist tests                    |
| Extension begins observing unrelated browsing                   | Build verifier requires the literal `http://10.16.100.244/*` content-script match and rejects host permissions                                                                                        | `verify-build.mjs` and `verify-package.mjs`          |
| Page/search/media data leaks through persistence or telemetry   | Persist only enabled, theme, and 20 normalized watch records for at most 90 days; exclude external media URLs and posters, remove completed entries, provide clear-history, and use no remote service | Storage tests, dependency review, and privacy policy |
| A UI replacement traps the user                                 | Provide **Original site**, restore-original, and popup disable controls; unmount restores title and element state                                                                                     | UI and unpacked browser tests                        |
| Background lifecycle causes data loss                           | Background has no product state; the content script reconstructs everything from the document and local preference                                                                                    | Architecture review                                  |

## Explicit non-goals

ICC Lens does not secure, authenticate, encrypt, scan, proxy, or correct content served by the ICC server. It does not guarantee the safety, availability, or legality of linked downloads. It improves presentation while preserving the server as the source of truth.

Revisit this model before adding a new origin, broad permission, account, remote API, analytics, credential handling, page-world script, or data persistence.
