import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { IccSiteService, type IccSitePort } from '../src/application/icc-site'
import {
  LensPreferencesService,
  type LensPreferencesPort,
} from '../src/application/preferences'
import type {
  CatalogPage,
  CategoryGroup,
  DetailPage,
} from '../src/domain/icc-page'
import { CatalogCard } from '../src/features/icc-lens/catalog-card'
import { CatalogView } from '../src/features/icc-lens/catalog-view'
import { DetailView } from '../src/features/icc-lens/detail-view'
import { LensApp } from '../src/features/icc-lens/lens-app'

const catalog: CatalogPage = {
  kind: 'catalog',
  view: 'latest',
  title: 'Latest additions',
  query: null,
  homeHref: 'http://10.16.100.244/dashboard.php?session=test&category=0',
  groups: [
    {
      name: 'Movies',
      categories: [
        {
          id: '19',
          name: 'English Movies',
          count: 16224,
          href: 'http://10.16.100.244/dashboard.php?session=test&category=19',
        },
      ],
    },
  ],
  featuredItems: [
    {
      id: 'featured-1',
      title: 'Original Featured Title',
      href: 'http://10.16.100.244/player.php?session=test&play=featured-1',
      imageHref: null,
      age: null,
      hits: null,
      action: 'details',
    },
  ],
  items: [
    {
      id: '1',
      title: 'A Sad and Beautiful World',
      href: 'http://10.16.100.244/player.php?session=test&play=1',
      imageHref: null,
      age: '3 hours ago',
      hits: '63 Hits',
      action: 'details',
    },
  ],
  hasMore: false,
}

const categoryGroupSeeds = [
  ['Movies', '19', 'English Movies'],
  ['Games', '21', 'Android Games'],
  ['Software', '31', 'Developer Tools'],
  ['TV Series', '48', 'English Series'],
  ['Others', '51', 'E-Books'],
] as const

const allCategoryGroups: CategoryGroup[] = categoryGroupSeeds.map(
  ([name, id, categoryName]) => ({
    name,
    categories: [
      {
        id,
        name: categoryName,
        count: 12,
        href: `http://10.16.100.244/dashboard.php?session=test&category=${id}`,
      },
    ],
  }),
)

const moviePage: DetailPage = {
  kind: 'detail',
  contentKind: 'movie',
  title: 'Example Movie',
  posterHref: null,
  homeHref: catalog.homeHref,
  groups: catalog.groups,
  metadata: [],
  description: [],
  trailerHref: null,
  related: [],
  sources: [
    {
      id: 'source-movie',
      label: '1080p WEBRip',
      href: 'http://10.16.100.212/movie.mp4',
      mediaType: 'video/mp4',
      size: '2.62 GB',
      playable: true,
    },
  ],
}

function preferencesFor() {
  let enabled = true
  let theme: 'light' | 'dark' = 'light'
  let history: unknown = []
  const port: LensPreferencesPort = {
    loadEnabled: async () => enabled,
    saveEnabled: async (value) => {
      enabled = value
    },
    loadTheme: async () => theme,
    saveTheme: async (value) => {
      theme = value
    },
    loadWatchHistory: async () => history,
    saveWatchHistory: async (value) => {
      history = value
    },
    clearWatchHistory: async () => {
      history = []
    },
  }
  return new LensPreferencesService(port)
}

function mockMediaPlayback() {
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('pause'))
  })
}

function serviceFor(page: CatalogPage = catalog): IccSiteService {
  const port: IccSitePort = {
    readCurrentPage: () => ({ ok: true, page }),
    search: async () => ({ ...page, view: 'search', title: 'Results' }),
    submitNativeSearch: vi.fn(),
    suggest: async () => [],
    loadMore: async () => [],
  }
  return new IccSiteService(port)
}

describe('ICC Lens application UI', () => {
  it('uses the default poster when catalog artwork is absent or fails', () => {
    const brokenArtworkItem = {
      ...catalog.items[0]!,
      title: 'Broken poster title',
      imageHref: 'http://10.16.100.244/files/missing-poster.jpg',
    }
    const { rerender } = render(<CatalogCard item={brokenArtworkItem} />)
    const brokenArtworkCard = screen.getByRole('link', {
      name: /Broken poster title/,
    })
    const image = brokenArtworkCard.querySelector('img')

    expect(image).not.toBeNull()
    fireEvent.error(image!)
    expect(brokenArtworkCard.querySelector('img')).not.toBeInTheDocument()
    expect(
      brokenArtworkCard.querySelector('[data-icc-lens-poster-placeholder]'),
    ).toBeVisible()

    rerender(
      <CatalogCard
        item={{
          ...brokenArtworkItem,
          title: 'No poster title',
          imageHref: null,
        }}
      />,
    )
    expect(
      screen
        .getByRole('link', { name: /No poster title/ })
        .querySelector('[data-icc-lens-poster-placeholder]'),
    ).toBeVisible()
  })

  it('distinguishes completed, not-found, empty, and pagination-error catalog states', async () => {
    const retry = vi.fn()
    const browse = vi.fn()
    const categoryPage: CatalogPage = {
      ...catalog,
      view: 'category',
      title: 'English Movies',
      featuredItems: [],
    }
    const { rerender } = render(
      <CatalogView
        page={categoryPage}
        loadingMore={false}
        loadMoreError={null}
        onBrowse={browse}
        onLoadMore={retry}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'The full category is shown' }),
    ).toBeVisible()
    const categoryBreadcrumb = screen.getByRole('navigation', {
      name: 'Breadcrumb',
    })
    expect(
      within(categoryBreadcrumb).getByRole('link', { name: 'Home' }),
    ).toHaveAttribute('href', catalog.homeHref)
    const currentBreadcrumb =
      within(categoryBreadcrumb).getByText('English Movies')
    expect(currentBreadcrumb).toHaveAttribute('aria-current', 'page')
    expect(currentBreadcrumb).toHaveClass('font-medium')
    expect(currentBreadcrumb).not.toHaveClass('font-semibold', 'font-bold')
    expect(
      screen.getAllByRole('heading', { name: 'English Movies' }),
    ).toHaveLength(1)
    expect(
      screen.queryByText(
        'A focused category view without the repeated promotional carousel.',
      ),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Browse another category' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/All 1 title.*English Movies/)).toBeVisible()

    rerender(
      <CatalogView
        page={{
          ...categoryPage,
          view: 'search',
          title: 'Results for “missing”',
          query: 'missing',
          items: [],
        }}
        loadingMore={false}
        loadMoreError={null}
        onBrowse={browse}
        onLoadMore={retry}
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'No results for “missing”' }),
    ).toBeVisible()

    rerender(
      <CatalogView
        page={{ ...categoryPage, items: [] }}
        loadingMore={false}
        loadMoreError={null}
        onBrowse={browse}
        onLoadMore={retry}
      />,
    )
    expect(
      screen.getByRole('heading', {
        name: 'No titles are available in English Movies',
      }),
    ).toBeVisible()

    rerender(
      <CatalogView
        page={{ ...categoryPage, hasMore: true }}
        loadingMore={false}
        loadMoreError="ICC pagination returned 500."
        onBrowse={browse}
        onLoadMore={retry}
      />,
    )
    expect(
      screen.getByRole('heading', {
        name: 'More titles couldn’t be loaded',
      }),
    ).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'The full category is shown' }),
    ).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry loading' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('renders direct category navigation, keeps compact browsing, and restores the original page', async () => {
    const restore = vi.fn()
    const user = userEvent.setup()
    render(
      <LensApp
        initialPage={catalog}
        logoUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
        service={serviceFor()}
        preferences={preferencesFor()}
        pageHref={catalog.homeHref}
        onRestoreOriginal={restore}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Featured on ICC' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Original Featured Title/ }),
    ).toHaveAttribute('href', expect.stringContaining('play=featured-1'))
    expect(screen.getByRole('link', { name: 'Movie' })).toHaveAttribute(
      'href',
      expect.stringContaining('category=9'),
    )
    const primaryNav = screen.getByRole('navigation', { name: 'Primary pages' })
    expect(
      within(primaryNav).getByRole('link', { name: 'Home' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      within(primaryNav).getByRole('link', { name: 'Movie' }),
    ).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Series' })).toHaveAttribute(
      'href',
      expect.stringContaining('category=38'),
    )
    expect(screen.getByRole('link', { name: 'File' })).toHaveAttribute(
      'href',
      expect.stringContaining('category=68'),
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    expect(
      screen.getByRole('dialog', { name: 'Browse the full library' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /English Movies/ }),
    ).toHaveAttribute('href', expect.stringContaining('category=19'))

    await user.click(
      screen.getByRole('button', { name: 'Close category browser' }),
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await user.click(screen.getByRole('button', { name: 'Show original site' }))
    expect(restore).toHaveBeenCalledOnce()
  })

  it('selects the parent navbar menu for the current category', () => {
    const categoryPage: CatalogPage = {
      ...catalog,
      view: 'category',
      title: 'English Movies',
      featuredItems: [],
    }
    render(
      <LensApp
        initialPage={categoryPage}
        logoUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
        service={serviceFor(categoryPage)}
        preferences={preferencesFor()}
        pageHref="http://10.16.100.244/dashboard.php?session=test&category=19"
        onRestoreOriginal={vi.fn()}
      />,
    )

    const primaryNav = screen.getByRole('navigation', { name: 'Primary pages' })
    expect(
      within(primaryNav).getByRole('link', { name: 'Movie' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      within(primaryNav).getByRole('link', { name: 'Home' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('scopes page-level category changes while navbar Browse stays global', async () => {
    const user = userEvent.setup()
    const cases = [
      {
        id: '19',
        title: 'English Movies',
        dialog: 'Change movie category',
        visible: ['Movies'],
        hidden: ['Games', 'Software', 'TV Series', 'Others'],
      },
      {
        id: '48',
        title: 'English Series',
        dialog: 'Change TV series category',
        visible: ['TV Series'],
        hidden: ['Movies', 'Games', 'Software', 'Others'],
      },
      {
        id: '21',
        title: 'Android Games',
        dialog: 'Change file category',
        visible: ['Games', 'Software', 'Others'],
        hidden: ['Movies', 'TV Series'],
      },
    ]

    for (const scenario of cases) {
      const page: CatalogPage = {
        ...catalog,
        view: 'category',
        title: scenario.title,
        groups: allCategoryGroups,
        featuredItems: [],
      }
      const view = render(
        <LensApp
          initialPage={page}
          logoUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
          service={serviceFor(page)}
          preferences={preferencesFor()}
          pageHref={`http://10.16.100.244/dashboard.php?session=test&category=${scenario.id}`}
          onRestoreOriginal={vi.fn()}
        />,
      )

      await user.click(screen.getByRole('button', { name: 'Change category' }))
      const dialog = screen.getByRole('dialog', { name: scenario.dialog })
      for (const name of scenario.visible) {
        expect(within(dialog).getByRole('heading', { name })).toBeVisible()
      }
      const firstVisibleSection = within(dialog)
        .getByRole('heading', { name: scenario.visible[0] })
        .closest('section')
      if (scenario.visible.length === 1) {
        expect(firstVisibleSection).toHaveClass('lg:col-span-3')
        expect(firstVisibleSection?.querySelector('ul')).toHaveClass(
          'lg:grid-cols-3',
        )
      } else {
        expect(firstVisibleSection).not.toHaveClass('lg:col-span-3')
      }
      for (const name of scenario.hidden) {
        expect(
          within(dialog).queryByRole('heading', { name }),
        ).not.toBeInTheDocument()
      }
      view.unmount()
    }

    const homePage: CatalogPage = {
      ...catalog,
      groups: allCategoryGroups,
    }
    render(
      <LensApp
        initialPage={homePage}
        logoUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
        service={serviceFor(homePage)}
        preferences={preferencesFor()}
        pageHref={homePage.homeHref}
        onRestoreOriginal={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    const globalDialog = screen.getByRole('dialog', {
      name: 'Browse the full library',
    })
    for (const group of allCategoryGroups) {
      expect(
        within(globalDialog).getByRole('heading', { name: group.name }),
      ).toBeVisible()
    }
  })

  it('keeps search suggestions hidden after submitting the query', async () => {
    const suggestion = {
      id: 'wwe-result',
      title: 'WWE Smackdown Live',
      href: 'http://10.16.100.244/player.php?session=test&play=wwe-result',
      imageHref: null,
      action: 'details' as const,
    }
    const port: IccSitePort = {
      readCurrentPage: () => ({ ok: true, page: catalog }),
      search: async () => ({
        ...catalog,
        view: 'search',
        title: 'Results for “wwe”',
      }),
      submitNativeSearch: vi.fn(),
      suggest: vi.fn(async () => [suggestion]),
      loadMore: async () => [],
    }

    render(
      <LensApp
        initialPage={catalog}
        logoUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
        service={new IccSiteService(port)}
        preferences={preferencesFor()}
        pageHref={catalog.homeHref}
        onRestoreOriginal={vi.fn()}
      />,
    )

    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search the ICC catalog' }),
      { target: { value: 'wwe' } },
    )
    expect(
      await screen.findByRole('list', { name: 'Search suggestions' }),
    ).toBeVisible()

    fireEvent.click(
      within(
        screen
          .getByRole('searchbox', { name: 'Search the ICC catalog' })
          .closest('form')!,
      ).getByRole('button', { name: 'Search' }),
    )
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Results for “wwe”',
      }),
    ).toBeVisible()
    const results = screen.getByRole('region', { name: 'Catalog items' })
    expect(results).toHaveClass('grid-cols-2')
    expect(
      within(results).getByRole('link', {
        name: /A Sad and Beautiful World.*Opens details/,
      }),
    ).toBeVisible()
    expect(
      within(results).queryByRole('link', { name: 'Open result' }),
    ).not.toBeInTheDocument()
    await act(
      () =>
        new Promise((resolve) => {
          window.setTimeout(resolve, 300)
        }),
    )

    expect(port.suggest).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('list', { name: 'Search suggestions' }),
    ).not.toBeInTheDocument()
  })

  it('shows a file recovery surface instead of a video for archives', () => {
    const filePage: DetailPage = {
      kind: 'detail',
      contentKind: 'file',
      title: 'GraphQL Bootcamp',
      posterHref: null,
      homeHref: catalog.homeHref,
      groups: catalog.groups,
      metadata: [],
      description: [],
      trailerHref: null,
      related: [],
      sources: [
        {
          id: 'source-1',
          label: 'All in One',
          href: 'http://10.16.100.202/course.rar',
          mediaType: 'video/mp4',
          size: '8.87 GB',
          playable: false,
        },
      ],
    }

    render(<DetailView page={filePage} />)

    const fileBreadcrumb = screen.getByRole('navigation', {
      name: 'Breadcrumb',
    })
    expect(
      within(fileBreadcrumb).getByText('GraphQL Bootcamp'),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('heading', { name: 'This item is a file, not a video' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('video')).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Download · 8.87 GB/ }),
    ).toHaveAttribute('href', 'http://10.16.100.202/course.rar')
  })

  it('renders file collections with preserved descriptions and download rows', () => {
    const collectionPage: DetailPage = {
      kind: 'detail',
      contentKind: 'file',
      title: 'Cambridge IELTS Books',
      posterHref: 'http://10.16.100.244/files/ielts.jpg',
      homeHref: catalog.homeHref,
      groups: catalog.groups,
      metadata: [],
      description: ['Practice books with listening-test resources.'],
      trailerHref: null,
      related: [],
      sources: [
        {
          id: 'file-1',
          label: 'File 01',
          href: 'http://10.16.100.212/ielts/book-01.pdf',
          mediaType: null,
          size: '97.50 MB',
          playable: false,
        },
        {
          id: 'file-2',
          label: 'File 02',
          href: 'http://10.16.100.212/ielts/book-02.pdf',
          mediaType: null,
          size: '88.80 MB',
          playable: false,
        },
      ],
    }

    render(<DetailView page={collectionPage} />)

    expect(
      screen.getByText('Practice books with listening-test resources.'),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Files' })).toHaveAttribute(
      'href',
      'http://10.16.100.244/dashboard.php?session=test&category=68',
    )
    expect(screen.getByRole('heading', { name: 'Downloads' })).toBeVisible()
    expect(screen.getByText('2 files available')).toBeVisible()
    const downloads = screen.getByRole('list', { name: 'Downloads' })
    expect(downloads).toHaveClass('xl:grid-cols-5')
    expect(within(downloads).getAllByRole('listitem')).toHaveLength(2)
    expect(
      screen.getByRole('link', { name: 'Download File 01 · 97.50 MB' }),
    ).toHaveAttribute('href', 'http://10.16.100.212/ielts/book-01.pdf')
    expect(
      screen.getByRole('link', { name: 'Download File 02 · 88.80 MB' }),
    ).toHaveAttribute('href', 'http://10.16.100.212/ielts/book-02.pdf')
  })

  it('renders information-only file pages without inventing a download', () => {
    const informationPage: DetailPage = {
      kind: 'detail',
      contentKind: 'file',
      title: 'Paradoxical Sajid 1 & 2',
      posterHref: 'http://10.16.100.244/files/sajid.jpg',
      homeHref: catalog.homeHref,
      groups: catalog.groups,
      metadata: [],
      description: [
        'Two books that explore questions of belief and modern life.',
      ],
      trailerHref: null,
      related: [],
      sources: [],
    }

    render(<DetailView page={informationPage} />)

    expect(
      screen.getByText(
        'Two books that explore questions of belief and modern life.',
      ),
    ).toBeVisible()
    expect(
      screen.getByText('No downloadable file is listed on this ICC page.'),
    ).toBeVisible()
    expect(
      screen.queryByRole('link', { name: /Download/ }),
    ).not.toBeInTheDocument()
  })

  it('opens an immersive player with complete keyboard control and recovery', async () => {
    mockMediaPlayback()
    const user = userEvent.setup()
    render(<DetailView page={moviePage} />)

    await user.click(screen.getByRole('button', { name: 'Play Example Movie' }))
    const player = await screen.findByRole('dialog', {
      name: 'Playing Example Movie, 1080p WEBRip',
    })
    expect(player).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Forward 10 seconds' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    await user.click(player)
    expect(screen.getAllByRole('button', { name: 'Play' })).toHaveLength(2)
    await user.click(player)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    await user.keyboard('k')
    expect(screen.getAllByRole('button', { name: 'Play' })).toHaveLength(2)
    await user.keyboard('k')
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    const video = screen.getByLabelText(
      'Example Movie, 1080p WEBRip',
    ) as HTMLVideoElement
    const progress = screen.getByRole('slider', {
      name: 'Playback position',
    })
    expect(progress).toBeDisabled()
    Object.defineProperty(video, 'duration', {
      configurable: true,
      value: Number.POSITIVE_INFINITY,
    })
    fireEvent.durationChange(video)
    expect(progress).toBeDisabled()
    Object.defineProperty(video, 'duration', {
      configurable: true,
      value: 120,
    })
    fireEvent.loadedMetadata(video)
    expect(progress).toBeEnabled()
    video.currentTime = 30
    await user.keyboard('{ArrowRight}')
    expect(video.currentTime).toBe(40)
    expect(screen.getAllByText('Forward 10 seconds')).not.toHaveLength(0)
    await user.keyboard('m')
    expect(video.volume).toBe(0)
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument()
    await user.keyboard('m')
    expect(video.volume).toBe(1)

    fireEvent.keyDown(player, { key: '?' })
    expect(
      screen.getByRole('dialog', { name: 'Keyboard controls' }),
    ).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('dialog', { name: 'Keyboard controls' }),
    ).not.toBeInTheDocument()

    fireEvent.error(video)
    expect(
      screen.getByRole('heading', { name: 'Playback stopped' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    progress.focus()
    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('dialog', {
        name: 'Playing Example Movie, 1080p WEBRip',
      }),
    ).not.toBeInTheDocument()
    expect(document.documentElement.style.overflow).toBe('')
    expect(
      screen.getByRole('button', { name: 'Play Example Movie' }),
    ).toHaveFocus()
  })

  it('renders every series episode as a visible play and download card', async () => {
    mockMediaPlayback()
    const seriesPage: DetailPage = {
      kind: 'detail',
      contentKind: 'series',
      title: 'Mousetrap Season 01',
      posterHref: null,
      homeHref: catalog.homeHref,
      groups: catalog.groups,
      metadata: [],
      description: [],
      trailerHref: null,
      related: [],
      sources: ['S01E01', 'S01E02'].map((label, index) => ({
        id: `source-${index + 1}`,
        label,
        href: `http://10.16.100.212/${label}.mp4`,
        mediaType: 'video/mp4',
        size: '1.20 GB',
        playable: true,
      })),
    }

    render(<DetailView page={seriesPage} />)

    expect(screen.getByRole('heading', { name: 'Details' })).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Series details' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '2 Episodes' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('2 total')).not.toBeInTheDocument()
    const exportLink = screen.getByRole('link', {
      name: 'Export 2 download links',
    })
    expect(exportLink).toHaveAttribute(
      'download',
      'Mousetrap Season 01-download-links.txt',
    )
    expect(exportLink).toHaveAttribute(
      'href',
      'data:text/plain;charset=utf-8,http%3A%2F%2F10.16.100.212%2FS01E01.mp4%0D%0Ahttp%3A%2F%2F10.16.100.212%2FS01E02.mp4%0D%0A',
    )
    expect(screen.getAllByRole('link', { name: 'Download' })).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(
      await screen.findByRole('dialog', {
        name: 'Playing Mousetrap Season 01, S01E02',
      }),
    ).toBeInTheDocument()
  })
})
