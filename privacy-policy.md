# ICC Lens privacy policy

Effective date: August 31, 2026

ICC Lens changes the interface of the private-network site at `http://10.16.100.244/`. When that site is open, the extension reads the page's visible catalog and detail information—such as titles, categories, links, metadata, poster addresses, and media addresses—so it can render the approved ICC Lens interface in that tab.

ICC Lens does not collect, transmit, sell, or share page information. It has no analytics, telemetry, advertising, account, synchronization service, or developer-operated server. Page data stays in the current tab except for the bounded local watch-history fields described below.

Persisted values include the enabled/disabled preference, visual theme selection, and up to 20 recent local watch records. A watch record contains a same-origin ICC page identity, title, optional season and episode, playback position, duration, and update time. Records expire after 90 days; nearly unstarted and completed items are omitted, and users can clear history. External media URLs, posters, search queries, and general page contents are not stored. These values remain only in Chrome's local extension storage and are not synchronized by ICC Lens.

Opening a poster, stream, trailer, or download follows a link supplied by the ICC site. The destination server and Chrome then handle that request under their own policies. ICC Lens does not proxy or copy the media.

The extension is limited to the literal HTTP origin `http://10.16.100.244/*`. It does not read browsing history, cookies, credentials, form input, or pages on other sites. If the server UI cannot be understood safely, ICC Lens leaves the original page available.

Questions or privacy reports can be filed through the ICC Lens repository at <https://github.com/montasim/ICCLens> without including credentials, private URLs, or browsing data.
