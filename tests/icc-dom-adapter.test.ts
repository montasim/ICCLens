import { isPlayableMediaHref, type DetailPage } from '../src/domain/icc-page'
import {
  IccDomAdapter,
  groupMediaSeasons,
  parseIccDocument,
  parseEpisodeIdentity,
} from '../src/infrastructure/icc-dom-adapter'

const CATEGORY_GROUPS = [
  [
    'Movies',
    [
      ['9', '3D'],
      ['74', '4K'],
      ['33', 'Animated'],
      ['83', 'Anime'],
      ['76', 'Chinese Movies'],
      ['41', 'Documentaries'],
      ['43', 'Dual Audio'],
      ['19', 'English Movies'],
      ['44', 'Exclusive Full-HD'],
      ['2', 'Hindi Movies'],
      ['79', 'Indonesian Movies'],
      ['80', 'Japanese Movies'],
      ['75', 'Korean Movies'],
      ['64', 'Other Foreign Movie'],
      ['77', 'Pakistani Movies'],
      ['71', 'Punjabi Movies'],
      ['32', 'South Indian (Hindi Dubbed)'],
      ['73', 'South Indian Movies'],
    ],
  ],
  [
    'Games',
    [
      ['56', 'Android Games'],
      ['45', 'Kids Games'],
      ['58', 'Racing Games'],
      ['25', 'Strategy Games'],
    ],
  ],
  [
    'Software',
    [
      ['12', 'Adobe Collection'],
      ['3', 'Anti Virus'],
      ['13', 'Bangla Software'],
      ['6', 'Browser'],
      ['65', 'Developer Tools'],
      ['16', 'Internet Software'],
      ['11', 'Microsoft Office'],
      ['14', 'Multimedia Software'],
      ['4', 'OS'],
      ['17', 'Others Software'],
      ['15', 'Utility Software'],
    ],
  ],
  [
    'TV Show',
    [
      ['38', 'Awards'],
      ['82', 'Serials (Animation)'],
      ['78', 'Serials (Anime)'],
      ['81', 'Serials (Documentaries)'],
      ['72', 'Serials (Dual Audio)'],
      ['36', 'Serials (English)'],
      ['37', 'Serials (Hindi)'],
      ['70', 'Serials (Others)'],
      ['52', 'WWE'],
    ],
  ],
  [
    'Others',
    [
      ['68', 'E-Books'],
      ['66', 'Kids (Cartoon)'],
      ['53', 'Learning'],
    ],
  ],
] as const

const navigation = `
  <a class="logotype" href="dashboard.php?session=test-session&category=0">FTP SERVER</a>
  <nav id="navbar"><ul class="navbar-nav">
    ${CATEGORY_GROUPS.map(
      ([group, categories]) => `
        <li class="dropdown">
          <a class="dropdown-toggle">${group}</a>
          <ul class="dropdown-menu">
            ${categories
              .map(
                ([id, name], index) =>
                  `<li><a href="?session=test-session&category=${id}">${name}<b class="badge">${index + 1}</b></a></li>`,
              )
              .join('')}
          </ul>
        </li>`,
    ).join('')}
  </ul></nav>
`

const catalogItem = (href: string, title: string) => `
  <div class="post">
    <a class="image" href="${href}"><img src="files/poster.jpg" alt="${title}" /></a>
    <div class="day-views"><span class="day">3 hours ago</span><span class="view">63 Hits</span></div>
    <div class="title">${title}</div>
  </div>
`

const featuredItem = (href: string, title: string, image: string) => `
  <a href="${href}">
    <div class="item">
      <div class="image"><div class="img" style="background-image: url('${image}')"></div></div>
      <div class="content"><div class="title"><span>${title}</span></div></div>
    </div>
  </a>
`

function documentFor(body: string): Document {
  return new DOMParser().parseFromString(
    `<!doctype html><html lang="en"><body>${body}</body></html>`,
    'text/html',
  )
}

describe('ICC DOM adapter', () => {
  it('extracts season and episode identity from server labels and URLs', () => {
    expect(parseEpisodeIdentity('Mousetrap.S02E07.1080p.mp4')).toEqual({
      seasonNumber: 2,
      episodeNumber: 7,
    })
    expect(
      parseEpisodeIdentity(
        'http://media/show/Season%2003/Episode%2012/video.mp4',
      ),
    ).toEqual({ seasonNumber: 3, episodeNumber: 12 })
    expect(parseEpisodeIdentity('1080p WEBRip')).toEqual({
      seasonNumber: null,
      episodeNumber: null,
    })
  })

  it('groups and orders parsed episodes by season and episode', () => {
    const source = (seasonNumber: number, episodeNumber: number) => ({
      id: `${seasonNumber}-${episodeNumber}`,
      label: `S${seasonNumber}E${episodeNumber}`,
      href: `http://media/S${seasonNumber}E${episodeNumber}.mp4`,
      mediaType: 'video/mp4',
      size: null,
      playable: true,
      seasonNumber,
      episodeNumber,
    })
    const seasons = groupMediaSeasons([
      source(2, 2),
      source(1, 3),
      source(1, 1),
    ])
    expect(seasons.map((season) => season.number)).toEqual([1, 2])
    expect(
      seasons[0]?.episodes.map((episode) => episode.episodeNumber),
    ).toEqual([1, 3])
  })

  it('parses the shared dashboard template and all 45 category links', () => {
    const source = documentFor(`
      ${navigation}
      <form id="fproductlistsrch" action="dashboard.php?session=test-session" method="post">
        <input name="token" value="token" /><input name="psearch" />
      </form>
      <div id="post-slider-multipost" class="owl-carousel owl-loaded">
        <div class="owl-stage">
          <div class="owl-item cloned">${featuredItem('player.php?play=999', 'Cloned slide', 'files/cloned.jpg')}</div>
          <div class="owl-item">${featuredItem('player.php?play=701', 'Awarapan 2', 'files/awarapan-2.jpg')}</div>
          <div class="owl-item">${featuredItem('player.php?play=702', 'Vishwanath and Sons', 'files/vishwanath.jpg')}</div>
        </div>
      </div>
      <main><div class="load-post-body"><div class="content news-gallery">
        ${catalogItem('player.php?session=&play=45608', 'A Sad and Beautiful World')}
        ${catalogItem('download.php?load=45347', 'Adobe Collection')}
      </div><div class="load-data">Loading</div></div></main>
    `)

    const result = parseIccDocument(
      source,
      'http://10.16.100.244/dashboard.php?session=test-session&category=12',
    )

    expect(result.ok).toBe(true)
    if (!result.ok || result.page.kind !== 'catalog') return
    expect(result.page.view).toBe('category')
    expect(result.page.title).toBe('Adobe Collection')
    expect(
      result.page.groups.flatMap((group) => group.categories),
    ).toHaveLength(45)
    expect(result.page.items).toHaveLength(2)
    expect(result.page.items[0]?.href).toContain('session=test-session')
    expect(result.page.items[1]?.action).toBe('download')
    expect(result.page.featuredItems.map((item) => item.title)).toEqual([
      'Awarapan 2',
      'Vishwanath and Sons',
    ])
    expect(result.page.featuredItems[0]?.href).toContain('session=test-session')
    expect(result.page.featuredItems[0]?.imageHref).toBe(
      'http://10.16.100.244/files/awarapan-2.jpg',
    )
    expect(result.page.hasMore).toBe(true)
  })

  it('parses a movie with metadata and a playable download', () => {
    const source = documentFor(`
      ${navigation}
      <main>
        <video id="video-id"><source src="http://10.16.100.212/movie.mp4" title="1080p WEBRip" type="video/mp4" /></video>
        <div class="row"><img src="files/movie.jpg" /></div>
        <table class="ewTable"><tr><td colspan="2"><strong>Example Movie</strong></td></tr><tr><td>Year:</td><td>2026</td></tr><tr><td>Plot:</td><td>A test plot.</td></tr></table>
        <a href="http://10.16.100.212/movie.mp4" download><strong>DOWNLOAD</strong> 2.62 GB</a>
        <div class="load-post-body"><div class="content news-gallery">
          ${catalogItem('player.php?play=2', 'Related Movie')}
        </div></div>
      </main>
    `)
    const result = parseIccDocument(
      source,
      'http://10.16.100.244/player.php?session=test-session&play=1',
    )

    expect(result.ok).toBe(true)
    expect(result.ok && result.page.kind).toBe('detail')
    if (!result.ok || result.page.kind !== 'detail') return
    expect(result.page.contentKind).toBe('movie')
    expect(result.page.title).toBe('Example Movie')
    expect(result.page.sources[0]).toMatchObject({
      playable: true,
      size: '2.62 GB',
    })
    expect(result.page.metadata).toContainEqual({
      label: 'Plot',
      value: 'A test plot.',
    })
  })

  it('turns multiple source elements into a visible series episode model', () => {
    const source = documentFor(`
      ${navigation}
      <main>
        <video id="video-id">
          <source src="http://10.16.100.212/show/S01E01.mp4" title="S01E01" type="video/mp4" />
          <source src="http://10.16.100.212/show/S01E02.mp4" title="S01E02" type="video/mp4" />
        </video>
        <table class="ewTable"><tr><td colspan="2"><strong>Example Series Season 01</strong></td></tr></table>
        <a href="http://10.16.100.212/show/S01E01.mp4" download>S01E01 <span class="pull-right">1.20 GB</span></a>
        <a href="http://10.16.100.212/show/S01E02.mp4" download>S01E02 <span class="pull-right">1.18 GB</span></a>
      </main>
    `)
    const result = parseIccDocument(
      source,
      'http://10.16.100.244/player.php?session=test-session&play=2',
    )

    expect(result.ok).toBe(true)
    if (!result.ok || result.page.kind !== 'detail') return
    expect(result.page.contentKind).toBe('series')
    expect(result.page.sources.map((episode) => episode.label)).toEqual([
      'S01E01',
      'S01E02',
    ])
  })

  it('classifies an archive as a file instead of feeding it to video', () => {
    const source = documentFor(`
      ${navigation}
      <main>
        <video id="video-id"><source src="http://10.16.100.202/course.rar" title="All in One" type="video/mp4" /></video>
        <table class="ewTable"><tr><td colspan="2"><strong>GraphQL Bootcamp</strong></td></tr></table>
        <a href="http://10.16.100.202/course.rar" download><strong>DOWNLOAD</strong> 8.87 GB</a>
      </main>
    `)
    const result = parseIccDocument(
      source,
      'http://10.16.100.244/player.php?session=test-session&play=25207',
    )

    expect(result.ok).toBe(true)
    if (!result.ok || result.page.kind !== 'detail') return
    const page: DetailPage = result.page
    expect(page.contentKind).toBe('file')
    expect(page.sources[0]?.playable).toBe(false)
    expect(page.sources[0]?.size).toBe('8.87 GB')
  })

  it('parses a download collection page instead of leaving the original UI', () => {
    const source = documentFor(`
      ${navigation}
      <main>
        <div class="row">
          <div class="col-md-4"><img src="files/cambridge-ielts.jpg" /></div>
          <div class="col-md-8">
            <b><span>Cambridge IELTS Books (01-15) with Listening Tests</span></b>
            <p>Fifteen practice books with listening-test resources.</p>
            <a class="btn btn-info" href="http://10.16.100.212/ielts/book-01.pdf">1. Download <span class="pull-right">97.50 MB</span></a>
            <a class="btn btn-info" href="http://10.16.100.212/ielts/book-02.pdf">2. Download <span class="pull-right">88.80 MB</span></a>
          </div>
        </div>
      </main>
    `)

    const result = parseIccDocument(
      source,
      'http://10.16.100.244/download.php?session=test-session&load=ielts',
    )

    expect(result.ok).toBe(true)
    if (!result.ok || result.page.kind !== 'detail') return
    expect(result.page).toMatchObject({
      contentKind: 'file',
      title: 'Cambridge IELTS Books (01-15) with Listening Tests',
      posterHref: 'http://10.16.100.244/files/cambridge-ielts.jpg',
    })
    expect(result.page.sources).toEqual([
      expect.objectContaining({
        label: 'File 01',
        href: 'http://10.16.100.212/ielts/book-01.pdf',
        size: '97.50 MB',
        playable: false,
      }),
      expect.objectContaining({
        label: 'File 02',
        href: 'http://10.16.100.212/ielts/book-02.pdf',
        size: '88.80 MB',
        playable: false,
      }),
    ])
  })

  it('parses an informational download page with no file links', () => {
    const source = documentFor(`
      ${navigation}
      <main>
        <div class="row">
          <div class="col-md-4"><img src="files/paradoxical-sazid.jpg" /></div>
          <article class="col-md-8">
            <b><span>Paradoxical Sajid 1 &amp; 2</span></b>
            <p>Two books that explore questions of belief and modern life.</p>
            <p>This page contains descriptive information but no download link.</p>
          </article>
        </div>
      </main>
    `)

    const result = parseIccDocument(
      source,
      'http://10.16.100.244/download.php?session=test-session&load=sajid',
    )

    expect(result.ok).toBe(true)
    if (!result.ok || result.page.kind !== 'detail') return
    expect(result.page).toMatchObject({
      contentKind: 'file',
      title: 'Paradoxical Sajid 1 & 2',
      sources: [],
    })
  })

  it.each([
    {
      name: 'download collection',
      body: `
        <div class="container" id="legacy-download-detail">
          <div class="row">
            <div class="col-md-4"><img src="files/cambridge-ielts.jpg" /></div>
            <div class="col-md-8">
              <div class="panel panel-default">
                <div class="panel-heading"><b><span>CAMBRIDGE IELTS BOOKS (01-15) WITH LISTENING TESTS</span></b></div>
                <div class="panel-body">
                  <a class="btn btn-info" href="http://10.16.100.212/ielts/book-01.pdf">1. Download <span class="pull-right">97.50 MB</span></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      title: 'CAMBRIDGE IELTS BOOKS (01-15) WITH LISTENING TESTS',
      sourceCount: 1,
    },
    {
      name: 'information-only book',
      body: `
        <div class="container" id="legacy-download-detail">
          <div class="row">
            <div class="col-md-4"><img src="files/paradoxical-sazid.jpg" /></div>
            <div class="col-md-8">
              <div class="panel panel-default">
                <div class="panel-heading"><b>PARADOXICAL SAZID 1 &amp; 2</b></div>
                <div class="panel-body"><p>Two books that explore questions of belief and modern life.</p></div>
              </div>
            </div>
          </div>
        </div>
      `,
      title: 'PARADOXICAL SAZID 1 & 2',
      sourceCount: 0,
    },
  ])('parses a legacy $name page without a main element', (scenario) => {
    const source = documentFor(`${navigation}${scenario.body}`)
    const result = parseIccDocument(
      source,
      'http://10.16.100.244/download.php?session=test-session&load=legacy',
    )

    expect(result.ok).toBe(true)
    if (!result.ok || result.page.kind !== 'detail') return
    expect(result.page.title).toBe(scenario.title)
    expect(result.page.sources).toHaveLength(scenario.sourceCount)
  })

  it.each([
    {
      titleMarkup:
        '<div class="panel-body"><b>CAMBRIDGE IELTS BOOKS (01-15) WITH LISTENING TESTS</b></div>',
      title: 'CAMBRIDGE IELTS BOOKS (01-15) WITH LISTENING TESTS',
    },
    {
      titleMarkup:
        '<div class="detail-copy"><strong>PARADOXICAL SAZID 1 &amp; 2</strong></div>',
      title: 'PARADOXICAL SAZID 1 & 2',
    },
  ])(
    'parses a plain legacy detail heading from the poster content column',
    (scenario) => {
      const source = documentFor(`
        ${navigation}
        <div class="container">
          <div class="row">
            <div class="col-md-4"><img src="images/legacy-book.jpg" /></div>
            <div class="col-md-8">
              ${scenario.titleMarkup}
              <a class="btn btn-info" href="http://10.16.100.212/book.pdf">
                1. Download <span class="pull-right">2.31 MB</span>
              </a>
            </div>
          </div>
        </div>
      `)
      const result = parseIccDocument(
        source,
        'http://10.16.100.244/download.php?session=test-session&load=plain-heading',
      )

      expect(result.ok).toBe(true)
      if (!result.ok || result.page.kind !== 'detail') return
      expect(result.page.title).toBe(scenario.title)
    },
  )

  it('recognizes only browser-oriented video file extensions', () => {
    expect(isPlayableMediaHref('http://media/movie.mp4')).toBe(true)
    expect(isPlayableMediaHref('http://media/course.rar')).toBe(false)
    expect(isPlayableMediaHref('http://media/archive.zip?download=1')).toBe(
      false,
    )
  })

  it('uses the original search contract and parses the returned catalog', async () => {
    const source = documentFor(`
      ${navigation}
      <form id="fproductlistsrch" action="dashboard.php?session=test-session" method="post">
        <input name="token" value="server-token" /><input name="psearch" />
      </form>
    `)
    const fetcher = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        void input
        void init
        return new Response(
          documentFor(`
            ${navigation}
            <div class="load-post-body"><div class="news-gallery">
              ${catalogItem('player.php?play=55', 'Search Match')}
            </div></div>
          `).documentElement.outerHTML,
          { status: 200, headers: { 'content-type': 'text/html' } },
        )
      },
    )
    const adapter = new IccDomAdapter(
      source,
      'http://10.16.100.244/dashboard.php?session=test-session&category=0',
      fetcher as typeof fetch,
    )

    const page = await adapter.search('Search Match')

    expect(page.view).toBe('search')
    expect(page.title).toBe('Results for “Search Match”')
    expect(page.items[0]?.title).toBe('Search Match')
    const request = fetcher.mock.calls[0]
    expect(request?.[0]).toContain('session=test-session')
    expect(request?.[1]?.method).toBe('POST')
    expect((request?.[1]?.body as FormData).get('psearch')).toBe('Search Match')
    expect((request?.[1]?.body as FormData).get('token')).toBe('server-token')
  })

  it('normalizes suggestions and next-page fragments from command.php', async () => {
    const source = documentFor(`${navigation}`)
    const fetcher = vi
      .fn((input: RequestInfo | URL, init?: RequestInit) => {
        void input
        void init
        return Promise.resolve(new Response())
      })
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            { id: 7, name: 'Movie Result', image: 'movie.jpg', type: 1 },
            { id: 8, name: 'Software Result', image: '', type: 2 },
          ]),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(catalogItem('player.php?play=9', 'Next Result'), {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      )
    const adapter = new IccDomAdapter(
      source,
      'http://10.16.100.244/dashboard.php?session=test-session&category=0',
      fetcher as typeof fetch,
    )

    const suggestions = await adapter.suggest('result')
    const nextItems = await adapter.loadMore(2)

    expect(suggestions).toMatchObject([
      { title: 'Movie Result', action: 'details' },
      { title: 'Software Result', action: 'download' },
    ])
    expect(suggestions[0]?.href).toContain('player.php?play=7')
    expect(suggestions[0]?.href).toContain('session=test-session')
    expect(nextItems[0]?.title).toBe('Next Result')
    expect(fetcher.mock.calls[0]?.[1]?.body?.toString()).toBe('cSearch=result')
    expect(fetcher.mock.calls[1]?.[1]?.body?.toString()).toBe('cpage=2')
  })

  it('does not invoke the browser fetch function with the adapter as its receiver', async () => {
    const source = documentFor(`${navigation}`)
    const browserFetch = vi.fn(function (this: unknown) {
      if (this !== undefined) {
        throw new TypeError(
          "Failed to execute 'fetch' on 'Window': Illegal invocation",
        )
      }
      return Promise.resolve(
        new Response(catalogItem('player.php?play=10', 'Bound Fetch Result'), {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      )
    })
    vi.stubGlobal('fetch', browserFetch)

    try {
      const adapter = new IccDomAdapter(
        source,
        'http://10.16.100.244/dashboard.php?session=test-session&category=0',
      )

      await expect(adapter.loadMore(2)).resolves.toMatchObject([
        { title: 'Bound Fetch Result' },
      ])
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
