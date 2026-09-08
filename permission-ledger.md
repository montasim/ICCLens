# Permission ledger

The build and package verifiers enforce this baseline. Update this file, the product brief, privacy policy, tests, and verifier together before changing it.

| Capability                                        | Required | User trigger                                                            | Product value                                                                               | Data exposed                                                                                          | Denial/failure behavior                                                                                                 | Proof                                                                           |
| ------------------------------------------------- | -------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `storage`                                         | Yes      | The user changes popup settings, theme, or plays media                  | Remembers ICC Lens enabled state, visual theme, and local watch-history for media resumption | Local properties for `enabled`, `theme`, and `watchHistory` (title, episode, timestamp); no search or directory data  | Extension falls back to default state (enabled, dark theme, no resume progress) and original server remains available   | Storage unit tests and unpacked-extension browser test                          |
| Static content script on `http://10.16.100.244/*` | Yes      | The user installs/enables ICC Lens and visits the ICC server            | Reads the server-rendered catalog/detail DOM and presents the approved accessible interface | Visible page titles, links, categories, metadata, poster URLs, and media URLs from this single origin | If parsing or rendering fails, the original page remains visible; the user can also restore it from the ICC Lens header | Manifest/package verifier, parser fixtures, and unpacked-extension browser test |

The content-script match is a manifest access boundary, not a separate `host_permissions` entry. It is limited to the literal private-network IP and HTTP scheme used by the server.

## Baseline exclusions

- No `host_permissions` or `optional_host_permissions`
- No wildcard network access, `<all_urls>`, HTTPS variant, hostname range, or other private-network address
- No `activeTab`, `tabs`, `scripting`, `cookies`, `history`, `webRequest`, clipboard, downloads, or unlimited storage permission
- No analytics, telemetry, remote API, account, synchronization, injected page-world script, or remotely hosted executable code

For every new capability, explain why a less-powerful capability is insufficient and whether a user-triggered optional grant can replace install-time access.
