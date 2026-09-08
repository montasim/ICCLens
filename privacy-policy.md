# ICC Lens privacy policy

Effective date: August 31, 2026

ICC Lens changes the interface of the private-network site at `http://10.16.100.244/`. When that site is open, the extension reads the page's visible catalog and detail information—such as titles, categories, links, metadata, poster addresses, and media addresses—so it can render the approved ICC Lens interface in that tab.

ICC Lens does not collect, transmit, sell, share, or retain that page information. It has no analytics, telemetry, advertising, account, synchronization service, or developer-operated server. Page data stays in the current tab and is discarded when the page closes or navigates.

Persisted values include the enabled/disabled preference, visual theme selection, and local watch-history (title, episode, and playback timestamp to resume media). These are stored in Chrome's local extension storage and remain in the Chrome profile until the user clears extension data, clears watch history, or removes ICC Lens. They are not treated as sensitive data and are not synchronized by the extension.

Opening a poster, stream, trailer, or download follows a link supplied by the ICC site. The destination server and Chrome then handle that request under their own policies. ICC Lens does not proxy or copy the media.

The extension is limited to the literal HTTP origin `http://10.16.100.244/*`. It does not read browsing history, cookies, credentials, form input, or pages on other sites. If the server UI cannot be understood safely, ICC Lens leaves the original page available.

Questions or privacy reports can be filed through the ICC Lens repository at <https://github.com/montasim/ICCLens> without including credentials, private URLs, or browsing data.
