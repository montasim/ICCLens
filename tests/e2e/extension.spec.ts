import AxeBuilder from '@axe-core/playwright'
import { mkdir, readFile } from 'node:fs/promises'

import { expect, test } from './fixtures'

type AuditPage = import('@playwright/test').Page

const categoryGroups = [
  [
    'Movies',
    [
      '3D',
      '4K',
      'Animated',
      'Anime',
      'Chinese Movies',
      'Documentaries',
      'Dual Audio',
      'English Movies',
      'Exclusive Full-HD',
      'Hindi Movies',
      'Indonesian Movies',
      'Japanese Movies',
      'Korean Movies',
      'Other Foreign Movie',
      'Pakistani Movies',
      'Punjabi Movies',
      'South Indian (Hindi Dubbed)',
      'South Indian Movies',
    ],
  ],
  ['Games', ['Android Games', 'Kids Games', 'Racing Games', 'Strategy Games']],
  [
    'Software',
    [
      'Adobe Collection',
      'Anti Virus',
      'Bangla Software',
      'Browser',
      'Developer Tools',
      'Internet Software',
      'Microsoft Office',
      'Multimedia Software',
      'OS',
      'Others Software',
      'Utility Software',
    ],
  ],
  [
    'TV Series',
    [
      'Awards',
      'Serials (Animation)',
      'Serials (Anime)',
      'Serials (Documentaries)',
      'Serials (Dual Audio)',
      'Serials (English)',
      'Serials (Hindi)',
      'Serials (Others)',
      'WWE',
    ],
  ],
  ['Others', ['E-Books', 'Kids (Cartoon)', 'Learning']],
] as const

const navigation = `
  <a class="logotype" href="dashboard.php?session=e2e&category=0">FTP SERVER</a>
  <nav id="navbar"><ul class="navbar-nav">
    ${categoryGroups
      .map(
        ([group, categories], groupIndex) => `
          <li class="dropdown">
            <a class="dropdown-toggle">${group}</a>
            <ul class="dropdown-menu">
              ${categories
                .map(
                  (name, categoryIndex) =>
                    `<li><a href="dashboard.php?session=&category=${groupIndex + 1}${categoryIndex + 1}">${name}<b class="badge">${categoryIndex + 2}</b></a></li>`,
                )
                .join('')}
            </ul>
          </li>`,
      )
      .join('')}
  </ul></nav>
`

const catalogItem = (
  id: string,
  title: string,
  action: 'details' | 'download' = 'details',
  hits = '63 Hits',
  imageHref = `files/${id}.svg`,
) => `
  <article class="post">
    <a class="image" href="${
      action === 'details'
        ? `player.php?session=&play=${id}`
        : `download.php?load=${id}`
    }"><img src="${imageHref}" alt="${title}" /></a>
    <span class="day">3 hours ago</span><span class="view">${hits}</span>
    <div class="title">${title}</div>
  </article>
`

const featuredItem = (id: string, title: string) => `
  <div class="owl-item">
    <a href="player.php?session=&play=featured-${id}">
      <div class="item">
        <div class="image"><div class="img" style="background-image: url('files/featured-${id}.svg')"></div></div>
        <div class="content"><div class="title"><span>${title}</span></div></div>
      </div>
    </a>
  </div>
`

function catalogDocument({
  empty = false,
  hasMore = true,
}: {
  empty?: boolean
  hasMore?: boolean
} = {}) {
  return documentShell(`
    <div id="legacy"><h1>Legacy ICC catalog</h1></div>
    ${navigation}
    <form id="fproductlistsrch" action="dashboard.php?session=e2e" method="post">
      <input name="token" value="token" /><input name="psearch" />
    </form>
    <div id="post-slider-multipost" class="owl-carousel owl-loaded">
      <div class="owl-stage">
        <div class="owl-item cloned">${featuredItem('clone', 'Cloned title')}</div>
        ${featuredItem('1', 'Awarapan 2')}
        ${featuredItem('2', 'Vishwanath and Sons')}
        ${featuredItem('3', 'Operation Safed Sagar')}
        ${featuredItem('4', 'Toxic')}
        ${featuredItem('5', 'Ohh My Dog')}
        ${featuredItem('6', 'The Odyssey')}
      </div>
    </div>
    <main><div class="load-post-body"><div class="content news-gallery">
      ${
        empty
          ? ''
          : [
              catalogItem(
                '1',
                'Mushoku Tensei Jobless Reincarnation Season 02 Completed',
                'details',
                '178 Hits',
              ),
              catalogItem('2', 'The Last Signal', 'details', '158 Hits'),
              catalogItem(
                '3',
                'Adobe Creative Collection',
                'download',
                '115 Hits',
              ),
              catalogItem(
                '4',
                'North by Morning',
                'details',
                '321 Hits',
                'files/missing-poster.jpg',
              ),
              catalogItem('5', 'The Quiet Archive', 'details', '150 Hits'),
              catalogItem('6', 'Orbit City', 'details', '75 Hits'),
            ].join('')
      }
    </div>${hasMore ? '<div class="load-data">More</div>' : ''}</div></main>
  `)
}

function detailDocument(playId: string | null) {
  if (playId === 'series') {
    return documentShell(`
      <div id="legacy"><h1>Legacy series page</h1></div>${navigation}
      <main>
        <video id="video-id">
          <source src="http://10.16.100.212/show/S01E01.mp4" title="S01E01" type="video/mp4" />
          <source src="http://10.16.100.212/show/S01E02.mp4" title="S01E02" type="video/mp4" />
        </video>
        <table class="ewTable"><tr><td colspan="2"><strong>Example Series Season 01</strong></td></tr><tr><td>Year:</td><td>2026</td></tr></table>
        <a href="http://10.16.100.212/show/S01E01.mp4" download>S01E01 <span class="pull-right">1.20 GB</span></a>
        <a href="http://10.16.100.212/show/S01E02.mp4" download>S01E02 <span class="pull-right">1.18 GB</span></a>
      </main>
    `)
  }
  if (playId === 'archive') {
    return documentShell(`
      <div id="legacy"><h1>Legacy archive page</h1></div>${navigation}
      <main>
        <video id="video-id"><source src="http://10.16.100.212/course.rar" title="All in One" type="video/mp4" /></video>
        <table class="ewTable"><tr><td colspan="2"><strong>GraphQL Bootcamp</strong></td></tr><tr><td>Type:</td><td>Course archive</td></tr></table>
        <a href="http://10.16.100.212/course.rar" download><strong>DOWNLOAD</strong> 8.87 GB</a>
      </main>
    `)
  }
  return documentShell(`
    <div id="legacy"><h1>Legacy movie page</h1></div>${navigation}
    <main>
      <video id="video-id"><source src="http://10.16.100.212/movie.mp4" title="1080p WEBRip" type="video/mp4" /></video>
      <div class="row"><img src="files/movie.svg" /></div>
      <table class="ewTable"><tr><td colspan="2"><strong>Example Movie</strong></td></tr><tr><td>Year:</td><td>2026</td></tr><tr><td>Plot:</td><td>A clear, synthetic test story.</td></tr></table>
      <button data-theVideo="https://www.youtube.com/watch?v=example">TRAILER</button>
      <a href="http://10.16.100.212/movie.mp4" download><strong>DOWNLOAD</strong> 2.62 GB</a>
      <div class="load-post-body"><div class="content news-gallery">
        ${catalogItem('related-movie', 'Related Movie')}
      </div></div>
    </main>
  `)
}

function documentShell(body: string) {
  return `<!doctype html><html lang="en"><head><title>ICC FTP</title><style>html{font-size:10px}html,body{margin:0}</style></head><body>${body}</body></html>`
}

const poster = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#18181b"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>
    <rect width="600" height="800" fill="url(#g)"/><circle cx="455" cy="180" r="140" fill="#ddd6fe" opacity=".22"/>
    <path d="M80 600L285 300l235 300v120H80z" fill="#f4f4f5" opacity=".18"/>
  </svg>
`

async function expectLensOwnsPage(page: AuditPage) {
  await expect(page.locator('body')).toHaveAttribute(
    'data-icc-lens-active',
    'true',
  )

  const visibleOriginals = await page
    .locator('body > :not(icc-lens-root)')
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const node = element as HTMLElement
          const style = getComputedStyle(node)
          return (
            !node.hidden &&
            node.getAttribute('aria-hidden') !== 'true' &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
          )
        })
        .map((element) => {
          const node = element as HTMLElement
          return `${node.tagName.toLowerCase()}#${node.id}`
        }),
    )

  expect(visibleOriginals).toEqual([])
}

async function expectNoAxeViolations(page: AuditPage) {
  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])
}

async function expectNoUndersizedTargets(page: AuditPage) {
  const undersized = await page
    .locator('button:visible, a:visible')
    .evaluateAll((elements) =>
      elements
        .map((element) => {
          const box = element.getBoundingClientRect()
          const label =
            element.getAttribute('aria-label') ||
            element.textContent?.replace(/\s+/g, ' ').trim() ||
            element.tagName.toLowerCase()
          return {
            label: label.slice(0, 80),
            width: Math.round(box.width),
            height: Math.round(box.height),
          }
        })
        .filter(({ width, height }) => width < 44 || height < 44),
    )

  expect(undersized).toEqual([])
}

async function captureAudit(page: AuditPage, name: string) {
  if (!process.env.UI_AUDIT_CAPTURE) return
  await mkdir('.impeccable/review/ui-audit', { recursive: true })
  await page.screenshot({
    path: `.impeccable/review/ui-audit/${name}.png`,
    fullPage: true,
  })
}

test('the unpacked extension replaces the catalog and preserves instant fallback', async ({
  context,
  extensionId,
}) => {
  const page = await context.newPage()
  await installIccRoutes(page)
  await page.setViewportSize({ width: 1920, height: 1000 })
  await page.goto('http://10.16.100.244/dashboard.php?session=e2e&category=0')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Featured on ICC',
    }),
  ).toBeVisible()
  const featured = page.getByRole('region', { name: 'Featured on ICC' })
  expect(Math.round((await featured.boundingBox())?.width ?? 0)).toBe(1512)
  const featuredCard = featured.getByRole('link', { name: /Awarapan 2/ })
  await expect(featuredCard).toBeVisible()
  await expect(featuredCard.getByText('Media', { exact: true })).toHaveCount(0)
  await expect(featuredCard.getByText('Recently added')).toBeVisible()
  const homeBreadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(homeBreadcrumb.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(homeBreadcrumb.getByText('Newest additions')).toHaveAttribute(
    'aria-current',
    'page',
  )
  const fileCard = page.getByRole('link', {
    name: /Adobe Creative Collection/,
  })
  await expect(fileCard.getByText('File', { exact: true })).toHaveCount(0)
  const missingArtworkCard = page.getByRole('link', {
    name: /North by Morning/,
  })
  await expect(missingArtworkCard.locator('img')).toHaveCount(0)
  await expect(
    missingArtworkCard.locator('[data-icc-lens-poster-placeholder]'),
  ).toBeVisible()
  const longTitleCard = page.getByRole('link', {
    name: /Mushoku Tensei Jobless Reincarnation Season 02 Completed/,
  })
  const longTitle = longTitleCard.locator('strong')
  await expect(longTitle).toHaveCSS('font-weight', '600')
  await page.mouse.move(0, 0)
  const restingTitleHeight = await longTitle.evaluate(
    (title) => title.getBoundingClientRect().height,
  )
  expect(
    await longTitle.evaluate((title) => title.scrollHeight),
  ).toBeGreaterThan(restingTitleHeight)
  await longTitleCard.hover()
  await expect
    .poll(() =>
      longTitle.evaluate((title) => title.getBoundingClientRect().height),
    )
    .toBeGreaterThan(restingTitleHeight)
  const sort = page.getByRole('button', { name: /^Sort by,/ })
  const catalogItems = page.getByRole('region', { name: 'Catalog items' })
  const newestHeading = page.getByRole('heading', {
    level: 2,
    name: 'Newest additions',
  })
  await expect(newestHeading).toHaveCSS('font-weight', '700')
  await expect(newestHeading).toHaveCSS('color', 'rgb(39, 39, 42)')
  await expect(page.getByRole('button', { name: 'Search' })).toHaveCSS(
    'background-color',
    'rgb(39, 39, 42)',
  )
  await expect(sort.locator('strong')).toHaveCSS('font-weight', '600')
  await sort.focus()
  await page.keyboard.press('ArrowDown')
  const newestOption = page.getByRole('menuitemradio', { name: 'Newest' })
  await expect(newestOption).toBeFocused()
  await expect(newestOption).toHaveCSS('font-weight', '500')
  await page.keyboard.press('ArrowDown')
  await expect(
    page.getByRole('menuitemradio', { name: 'Popularity: High to low' }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(sort).toBeFocused()
  await sort.click()
  await page
    .getByRole('menuitemradio', { name: 'Popularity: High to low' })
    .click()
  await expect(catalogItems.getByRole('link').first()).toHaveAccessibleName(
    /North by Morning/,
  )
  await sort.click()
  await page.getByRole('menuitemradio', { name: 'Name: A–Z' }).click()
  await expect(catalogItems.getByRole('link').first()).toHaveAccessibleName(
    /Adobe Creative Collection/,
  )
  await sort.click()
  await page.getByRole('menuitemradio', { name: 'Name: Z–A' }).click()
  await expect(catalogItems.getByRole('link').first()).toHaveAccessibleName(
    /The Quiet Archive/,
  )
  await sort.click()
  await page.getByRole('menuitemradio', { name: 'Newest' }).click()
  await page.mouse.move(0, 0)
  await longTitleCard.focus()
  await expect
    .poll(() =>
      longTitle.evaluate((title) => title.getBoundingClientRect().height),
    )
    .toBeGreaterThan(restingTitleHeight)
  const featuredCardBox = await featuredCard.evaluate((card) => ({
    height: card.getBoundingClientRect().height,
    width: card.getBoundingClientRect().width,
  }))
  expect(featuredCardBox.height / featuredCardBox.width).toBeGreaterThan(1.35)
  await expect(featured.getByText('Cloned title')).toHaveCount(0)
  await expect(
    featured.getByRole('button', { name: 'Next featured titles' }),
  ).toBeVisible()
  const featuredTrack = featured.locator('[class*="overflow-x-auto"]')
  await expect
    .poll(() => featuredTrack.evaluate((track) => track.scrollLeft), {
      timeout: 6_500,
    })
    .toBeGreaterThan(0)
  await page.waitForTimeout(100)
  expect(
    await featured
      .getByRole('button', { name: 'Go to featured page 2' })
      .getAttribute('aria-current'),
  ).toBe('true')
  await expect(page.locator('#legacy')).toBeHidden()
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).fontSize,
    ),
  ).toBe('16px')

  await page.evaluate(() => {
    const lateLegacyContent = document.createElement('section')
    lateLegacyContent.id = 'late-legacy'
    lateLegacyContent.textContent = 'Copyright © 2018 Softin Technology Ltd.'
    document.body.append(lateLegacyContent)
  })
  await expect(page.locator('#late-legacy')).toBeHidden()

  await expect(
    page.getByRole('button', { name: 'Load more items' }),
  ).toHaveCount(0)
  await expect(page.getByText('Loaded from the next page')).toBeVisible()
  const logo = page.getByRole('link', { name: 'ICC Lens home' }).locator('img')
  await expect(logo).toHaveJSProperty('complete', true)
  expect(
    await logo.evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0)

  const categoryNav = page.getByRole('navigation', {
    name: 'Catalog categories',
  })
  for (const categoryName of [
    'Movies',
    'Games',
    'Software',
    'TV Series',
    'Others',
  ]) {
    await expect(
      categoryNav.getByRole('button', { name: categoryName, exact: true }),
    ).toBeVisible()
  }
  await categoryNav.getByRole('button', { name: 'Movies', exact: true }).click()
  const moviesMenu = page.getByRole('region', {
    name: 'Movies categories',
  })
  await expect(moviesMenu).toBeVisible()
  await expect(moviesMenu.getByRole('link')).toHaveCount(18)
  await expect(
    moviesMenu.getByRole('link', { name: /English Movies/ }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(moviesMenu).toHaveCount(0)

  await expectNoAxeViolations(page)

  const popup = await context.newPage()
  await popup.setViewportSize({ width: 360, height: 540 })
  await popup.goto(`chrome-extension://${extensionId}/popup.html`)
  const toggle = popup.getByRole('switch', {
    name: 'Use ICC Lens on the ICC site',
  })
  const popupHeading = popup.getByRole('heading', {
    level: 1,
    name: 'See the ICC library clearly.',
  })
  await expect(popupHeading).toHaveCSS('font-weight', '700')
  await expect(popupHeading.locator('..')).toHaveCSS(
    'background-color',
    'rgb(111, 76, 195)',
  )
  await expect(toggle).toHaveAttribute('aria-checked', 'true')

  await expectNoAxeViolations(popup)

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await expect(page.locator('#legacy')).toBeVisible()
  await expect(page.locator('#late-legacy')).toBeVisible()
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).fontSize,
    ),
  ).toBe('10px')
  await expect(page.getByText('ICC Lens · Design A — Catalog')).toHaveCount(0)

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'true')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Featured on ICC',
    }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).fontSize,
    ),
  ).toBe('16px')

  if (process.env.REVIEW_CAPTURE) {
    await mkdir('.impeccable/review', { recursive: true })
    await page.setViewportSize({ width: 1920, height: 1000 })
    await sort.click()
    await page.getByRole('menuitemradio', { name: 'Name: A–Z' }).hover()
    await page.screenshot({
      path: '.impeccable/review/sort-menu.png',
      fullPage: true,
    })
    await page.keyboard.press('Escape')
    await longTitleCard.hover()
    await page.screenshot({
      path: '.impeccable/review/title-hover.png',
      fullPage: true,
    })
    await page.mouse.move(0, 0)
    await page.screenshot({
      path: '.impeccable/review/desktop.png',
      fullPage: true,
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({
      path: '.impeccable/review/mobile.png',
      fullPage: true,
    })
    await popup.screenshot({
      path: '.impeccable/review/popup.png',
      fullPage: true,
    })
  }
})

test('search submits the ICC server form from the packaged extension', async ({
  context,
}) => {
  const page = await context.newPage()
  const requests = await installIccRoutes(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('http://10.16.100.244/dashboard.php?session=e2e&category=56')

  const search = page.getByRole('searchbox', {
    name: 'Search the ICC catalog',
  })
  await search.fill('wwe')
  const suggestions = page.getByRole('list', { name: 'Search suggestions' })
  await expect(suggestions).toBeVisible()
  await page.getByRole('button', { name: 'Search', exact: true }).click()

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Results for “wwe”',
    }),
  ).toBeVisible()
  expect(requests.searchPostBodies).toHaveLength(1)
  expect(requests.searchPostBodies[0]).toContain('wwe')
  await page.waitForTimeout(300)
  await expect(suggestions).toHaveCount(0)
  await expect(page.getByText(/Illegal invocation/)).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Load more items' }),
  ).toHaveCount(0)
})

test('movie, series, and archive pages receive purpose-built detail views', async ({
  context,
}) => {
  const page = await context.newPage()
  await installIccRoutes(page)
  await page.setViewportSize({ width: 1280, height: 900 })

  await page.goto('http://10.16.100.244/player.php?session=e2e&play=movie')
  await expectLensOwnsPage(page)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Example Movie' }),
  ).toBeVisible()
  await expect(
    page
      .getByRole('navigation', { name: 'Breadcrumb' })
      .getByText('Example Movie'),
  ).toHaveAttribute('aria-current', 'page')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Latest additions' }),
  ).toHaveCount(0)
  await expect(page.locator('#legacy')).toBeHidden()
  const moviePlayer = page.locator(
    'video[aria-label="Example Movie, 1080p WEBRip"]',
  )
  const movieTitle = page.getByRole('heading', {
    level: 1,
    name: 'Example Movie',
  })
  await expect(moviePlayer).toBeVisible()
  const [playerTop, titleTop] = await Promise.all([
    moviePlayer.evaluate((player) => player.getBoundingClientRect().top),
    movieTitle.evaluate((title) => title.getBoundingClientRect().top),
  ])
  expect(playerTop).toBeLessThan(titleTop)
  expect(playerTop).toBeLessThan(240)
  const trailerLink = page.getByRole('link', { name: 'Watch trailer' })
  const posterImage = page.getByAltText('Poster for Example Movie')
  await expect(trailerLink).toBeVisible()
  const [trailerTop, posterTop] = await Promise.all([
    trailerLink.evaluate((trailer) => trailer.getBoundingClientRect().top),
    posterImage.evaluate((poster) => poster.getBoundingClientRect().top),
  ])
  expect(trailerTop).toBeLessThan(posterTop)

  const metadataCell = page.locator('dl > div').last()
  await expect(metadataCell).toHaveCSS('grid-column-end', 'span 2')

  await page.setViewportSize({ width: 390, height: 844 })
  const [mobileTitleTop, mobileTrailerTop, mobilePosterTop] = await Promise.all(
    [
      movieTitle.evaluate((title) => title.getBoundingClientRect().top),
      trailerLink.evaluate((trailer) => trailer.getBoundingClientRect().top),
      posterImage.evaluate(
        (posterElement) => posterElement.getBoundingClientRect().top,
      ),
    ],
  )
  expect(mobileTitleTop).toBeLessThan(mobilePosterTop)
  expect(mobileTrailerTop).toBeLessThan(mobilePosterTop)
  await expectNoAxeViolations(page)
  await page.setViewportSize({ width: 1280, height: 900 })

  if (process.env.REVIEW_CAPTURE) {
    await mkdir('.impeccable/review', { recursive: true })
    await page.screenshot({
      path: '.impeccable/review/detail-desktop.png',
      fullPage: true,
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({
      path: '.impeccable/review/detail-mobile.png',
      fullPage: true,
    })
    await page.setViewportSize({ width: 1280, height: 900 })
  }

  await page.getByRole('button', { name: 'Play Example Movie' }).click()
  const immersivePlayer = page.getByRole('dialog', {
    name: 'Playing Example Movie, 1080p WEBRip',
  })
  await expect(immersivePlayer).toBeVisible()
  await expect(immersivePlayer).toBeFocused()

  // The synthetic ICC host intentionally cannot stream media. Move the real
  // video element into its playing state so the keyboard transport can be
  // proven independently from that expected network failure.
  await moviePlayer.evaluate((video) => {
    Object.defineProperty(video, 'duration', {
      configurable: true,
      value: 120,
    })
    ;(video as HTMLVideoElement).currentTime = 30
    video.dispatchEvent(new Event('loadedmetadata'))
    video.dispatchEvent(new Event('timeupdate'))
    video.dispatchEvent(new Event('play'))
  })
  await expect(
    immersivePlayer.getByRole('button', { name: 'Pause' }),
  ).toBeVisible()

  await page.keyboard.press('ArrowRight')
  expect(
    await moviePlayer.evaluate(
      (video) => (video as HTMLVideoElement).currentTime,
    ),
  ).toBe(40)
  await expect(
    immersivePlayer.getByRole('slider', { name: 'Playback position' }),
  ).toBeDisabled()
  await expect(
    immersivePlayer.getByText('00:40', { exact: true }),
  ).toBeVisible()
  await expect(immersivePlayer.getByText(/−00:00/)).toHaveCount(0)
  await expect(
    immersivePlayer
      .locator('[data-player-controls]')
      .getByText('Forward 10 seconds'),
  ).toBeVisible()

  await page.keyboard.press('k')
  await expect(
    immersivePlayer.getByRole('button', { name: 'Play' }),
  ).toHaveCount(2)
  await page.keyboard.type('?')
  const shortcuts = page.getByRole('dialog', { name: 'Keyboard controls' })
  await expect(shortcuts).toBeVisible()
  await expect(shortcuts.getByText('Space / K')).toBeVisible()
  await expectNoAxeViolations(page)

  if (process.env.REVIEW_CAPTURE) {
    await page.screenshot({
      path: '.impeccable/review/player-shortcuts.png',
    })
  }

  await page.keyboard.press('Escape')
  await expect(shortcuts).toHaveCount(0)
  await moviePlayer.evaluate((video) => video.dispatchEvent(new Event('play')))

  if (process.env.REVIEW_CAPTURE) {
    await page.screenshot({
      path: '.impeccable/review/player-desktop.png',
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({
      path: '.impeccable/review/player-mobile.png',
    })
    await page.setViewportSize({ width: 1280, height: 900 })
  }

  await immersivePlayer.focus()
  await page.keyboard.press('Escape')
  await expect(immersivePlayer).toHaveCount(0)

  await page.goto('http://10.16.100.244/player.php?session=e2e&play=series')
  await expectLensOwnsPage(page)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Example Series Season 01',
    }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: '2 Episodes' })).toBeVisible()
  const exportDownloadPromise = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Export 2 download links' }).click()
  const exportDownload = await exportDownloadPromise
  expect(exportDownload.suggestedFilename()).toBe(
    'Example Series Season 01-download-links.txt',
  )
  const exportPath = await exportDownload.path()
  expect(exportPath).not.toBeNull()
  expect(await readFile(exportPath!, 'utf8')).toBe(
    'http://10.16.100.212/show/S01E01.mp4\r\n' +
      'http://10.16.100.212/show/S01E02.mp4\r\n',
  )
  if (process.env.REVIEW_CAPTURE) {
    await page.screenshot({
      path: '.impeccable/review/series-detail-desktop.png',
      fullPage: true,
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({
      path: '.impeccable/review/series-detail-mobile.png',
      fullPage: true,
    })
    await page.setViewportSize({ width: 1280, height: 900 })
  }
  await expect(page.getByRole('button', { name: 'Play selected' })).toHaveCount(
    1,
  )
  await expect(
    page.getByRole('link', { name: 'Download', exact: true }),
  ).toHaveCount(3)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(
    page.locator('video[aria-label="Example Series Season 01, S01E02"]'),
  ).toBeVisible()
  await expect(
    page.getByRole('dialog', {
      name: 'Playing Example Series Season 01, S01E02',
    }),
  ).toBeVisible()

  await page.goto('http://10.16.100.244/player.php?session=e2e&play=archive')
  await expectLensOwnsPage(page)
  await expect(
    page.getByRole('heading', {
      name: 'This item is a file, not a video',
    }),
  ).toBeVisible()
  await expect(page.locator('video:visible')).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: /Download · 8.87 GB/ }),
  ).toBeVisible()
})

test('legacy detail UI stays hidden when server scripts reveal it after mount', async ({
  context,
}) => {
  const page = await context.newPage()
  await installIccRoutes(page)
  await page.goto('http://10.16.100.244/player.php?session=e2e&play=movie')
  await expectLensOwnsPage(page)

  const legacyUi = page.locator('#legacy')
  await expect(legacyUi).toBeHidden()

  await legacyUi.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      throw new Error('Expected the legacy UI root to be an HTML element.')
    }
    element.hidden = false
    element.removeAttribute('aria-hidden')
    element.style.removeProperty('display')
  })

  await expect(legacyUi).toBeHidden()
})

test('automated UI audit covers every owned route, fallback, and transient state', async ({
  context,
  extensionId,
}) => {
  test.setTimeout(90_000)
  const latest = await context.newPage()
  await installIccRoutes(latest)
  await latest.setViewportSize({ width: 1440, height: 1000 })
  await latest.goto('http://10.16.100.244/dashboard.php?session=e2e&category=0')
  await expectLensOwnsPage(latest)
  await expectNoAxeViolations(latest)

  const featured = latest.getByRole('region', { name: 'Featured on ICC' })
  await expect(featured.locator('img').nth(5)).toHaveAttribute(
    'loading',
    'lazy',
  )

  const moviesButton = latest
    .getByRole('navigation', { name: 'Catalog categories' })
    .getByRole('button', { name: 'Movies', exact: true })
  await moviesButton.focus()
  await latest.keyboard.press('ArrowDown')
  const moviesMenu = latest.getByRole('region', {
    name: 'Movies categories',
  })
  await expect(moviesMenu.getByRole('link').first()).toBeFocused()
  await captureAudit(latest, 'latest-desktop-categories')
  await latest.keyboard.press('Escape')
  await expect(moviesMenu).toHaveCount(0)
  await expect(moviesButton).toBeFocused()

  const search = latest.getByRole('searchbox', {
    name: 'Search the ICC catalog',
  })
  await search.fill('ex')
  await expect(
    latest.getByRole('list', { name: 'Search suggestions' }),
  ).toBeVisible()
  await expectNoUndersizedTargets(latest)
  await captureAudit(latest, 'latest-desktop')
  await search.fill('')
  await latest.setViewportSize({ width: 390, height: 844 })
  const browseButton = latest.getByRole('button', {
    name: 'Browse',
    exact: true,
  })
  await expect(browseButton).toBeVisible()
  await browseButton.click()
  const dialog = latest.getByRole('dialog', { name: 'Browse the full library' })
  const closeButton = dialog.getByRole('button', {
    name: 'Close category browser',
  })
  const lastCategory = dialog.getByRole('link').last()
  await expect(closeButton).toBeFocused()
  await latest.keyboard.press('Shift+Tab')
  await expect(lastCategory).toBeFocused()
  await latest.keyboard.press('Tab')
  await expect(closeButton).toBeFocused()
  await closeButton.click()
  await expect(browseButton).toBeFocused()
  await expectNoUndersizedTargets(latest)
  await captureAudit(latest, 'latest-mobile')

  const category = await context.newPage()
  await installIccRoutes(category)
  await category.setViewportSize({ width: 1280, height: 900 })
  await category.goto(
    'http://10.16.100.244/dashboard.php?session=e2e&category=21',
  )
  await expectLensOwnsPage(category)
  await expect(
    category.getByRole('heading', { level: 1, name: 'Android Games' }),
  ).toBeVisible()
  await expect(
    category
      .getByRole('navigation', { name: 'Breadcrumb' })
      .getByText('Android Games'),
  ).toHaveAttribute('aria-current', 'page')
  await expect(
    category.getByText(
      'A focused category view without the repeated promotional carousel.',
    ),
  ).toHaveCount(0)
  await expect(
    category.getByRole('button', { name: 'Browse another category' }),
  ).toHaveCount(0)
  await expectNoAxeViolations(category)
  await captureAudit(category, 'category')

  const empty = await context.newPage()
  await installIccRoutes(empty, { mode: 'empty' })
  await empty.setViewportSize({ width: 390, height: 844 })
  await empty.goto('http://10.16.100.244/dashboard.php?session=e2e&category=21')
  await expectLensOwnsPage(empty)
  await expect(
    empty.getByRole('heading', {
      name: 'No titles are available in Android Games',
    }),
  ).toBeVisible()
  await expect(
    empty.getByRole('button', { name: 'Browse another category' }),
  ).toHaveCount(0)
  await expectNoAxeViolations(empty)
  await captureAudit(empty, 'empty-mobile')

  const notFound = await context.newPage()
  await installIccRoutes(notFound, { mode: 'empty' })
  await notFound.setViewportSize({ width: 390, height: 844 })
  await notFound.goto(
    'http://10.16.100.244/dashboard.php?session=e2e&category=0',
  )
  await notFound
    .getByRole('searchbox', { name: 'Search the ICC catalog' })
    .fill('missing title')
  await notFound.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(
    notFound.getByRole('heading', {
      name: 'No results for “missing title”',
    }),
  ).toBeVisible()
  await expectNoAxeViolations(notFound)
  await captureAudit(notFound, 'not-found-mobile')

  const loading = await context.newPage()
  await installIccRoutes(loading, { mode: 'slow-load' })
  await loading.setViewportSize({ width: 1280, height: 900 })
  await loading.goto(
    'http://10.16.100.244/dashboard.php?session=e2e&category=0',
  )
  await expectLensOwnsPage(loading)
  await expect(loading.getByText('Loading more items…')).toBeVisible()
  await captureAudit(loading, 'loading')

  const loadError = await context.newPage()
  await installIccRoutes(loadError, { mode: 'load-error' })
  await loadError.setViewportSize({ width: 1280, height: 900 })
  await loadError.goto(
    'http://10.16.100.244/dashboard.php?session=e2e&category=0',
  )
  await expectLensOwnsPage(loadError)
  await expect(
    loadError.getByRole('alert').filter({
      hasText: 'ICC pagination returned 500.',
    }),
  ).toBeVisible()
  await expect(
    loadError.getByRole('heading', {
      name: 'More titles couldn’t be loaded',
    }),
  ).toBeVisible()
  await expect(
    loadError.getByRole('heading', { name: 'You’re up to date' }),
  ).toHaveCount(0)
  await expectNoAxeViolations(loadError)
  await captureAudit(loadError, 'pagination-error')

  const searchError = await context.newPage()
  await installIccRoutes(searchError, { mode: 'search-error' })
  await searchError.setViewportSize({ width: 1280, height: 900 })
  await searchError.goto(
    'http://10.16.100.244/dashboard.php?session=e2e&category=0',
  )
  await searchError
    .getByRole('searchbox', { name: 'Search the ICC catalog' })
    .fill('wwe')
  await searchError.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(
    searchError.getByRole('alert').filter({
      hasText: 'The ICC search returned 500.',
    }),
  ).toBeVisible()
  await expect(
    searchError.getByText('Search couldn’t be completed'),
  ).toBeVisible()
  await expect(
    searchError.getByRole('list', { name: 'Search suggestions' }),
  ).toHaveCount(0)
  await expectNoAxeViolations(searchError)
  await captureAudit(searchError, 'search-error')

  const unsupported = await context.newPage()
  await installIccRoutes(unsupported)
  await unsupported.setViewportSize({ width: 1280, height: 900 })
  await unsupported.goto('http://10.16.100.244/unsupported.php')
  await expect(unsupported.locator('body')).not.toHaveAttribute(
    'data-icc-lens-active',
    'true',
  )
  await expect(unsupported.locator('#unsupported-legacy')).toBeVisible()
  await expect(
    unsupported.getByText('ICC Lens kept the original page'),
  ).toBeVisible()
  await expectNoAxeViolations(unsupported)
  await captureAudit(unsupported, 'original-fallback')

  const popup = await context.newPage()
  await popup.setViewportSize({ width: 360, height: 540 })
  await popup.goto(`chrome-extension://${extensionId}/popup.html`)
  await expectNoAxeViolations(popup)
  await expectNoUndersizedTargets(popup)
  await captureAudit(popup, 'popup')
})

type IccRouteMode =
  'normal' | 'empty' | 'load-error' | 'slow-load' | 'search-error'

async function installIccRoutes(
  page: import('@playwright/test').Page,
  { mode = 'normal' }: { mode?: IccRouteMode } = {},
) {
  let loadMoreRequestCount = 0
  const searchPostBodies: string[] = []
  await page.route('http://10.16.100.244/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (url.pathname.endsWith('.svg')) {
      await route.fulfill({ body: poster, contentType: 'image/svg+xml' })
      return
    }
    if (url.pathname.endsWith('/command.php')) {
      const body = request.postData() ?? ''
      if (body.includes('cSearch=')) {
        await route.fulfill({
          body: JSON.stringify([
            {
              id: 'movie',
              image: 'movie.svg',
              name: 'Example Movie',
              type: '1',
            },
          ]),
          contentType: 'application/json',
        })
        return
      }
      if (mode === 'load-error') {
        await route.fulfill({ status: 500, body: 'Pagination failed' })
        return
      }
      if (mode === 'slow-load') {
        await new Promise((resolve) => setTimeout(resolve, 750))
      }
      loadMoreRequestCount += 1
      await route.fulfill({
        body:
          loadMoreRequestCount === 1
            ? catalogItem('7', 'Loaded from the next page')
            : '',
        contentType: 'text/html',
      })
      return
    }
    if (url.pathname.endsWith('/player.php')) {
      await route.fulfill({
        body: detailDocument(url.searchParams.get('play')),
        contentType: 'text/html',
      })
      return
    }
    if (
      url.pathname.endsWith('/dashboard.php') &&
      request.method() === 'POST'
    ) {
      searchPostBodies.push(request.postData() ?? '')
      if (mode === 'search-error') {
        await route.fulfill({ status: 500, body: 'Search failed' })
        return
      }
    }
    if (url.pathname.endsWith('/unsupported.php')) {
      await route.fulfill({
        body: documentShell(
          '<main id="unsupported-legacy"><h1>Original unsupported page</h1></main>',
        ),
        contentType: 'text/html',
      })
      return
    }
    await route.fulfill({
      body: catalogDocument({
        empty: mode === 'empty',
        hasMore: mode !== 'empty',
      }),
      contentType: 'text/html',
    })
  })
  return { searchPostBodies }
}
