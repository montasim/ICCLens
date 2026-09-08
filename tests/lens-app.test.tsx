import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { IccSiteService, type IccSitePort } from '../src/application/icc-site'
import type { CatalogPage, DetailPage } from '../src/domain/icc-page'
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

const moviePage: DetailPage = {
  kind: 'detail',
  contentKind: 'movie',
  title: 'Example Movie',
  posterHref: null,
  homeHref: catalog.homeHref,
  groups: catalog.groups,
  metadata: [],
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
    expect(
      within(categoryBreadcrumb).getByText('English Movies'),
    ).toHaveAttribute('aria-current', 'page')
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
        onRestoreOriginal={restore}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Featured on ICC' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Original Featured Title/ }),
    ).toHaveAttribute('href', expect.stringContaining('play=featured-1'))
    await user.click(screen.getByRole('button', { name: 'Movies' }))
    expect(
      screen.getByRole('region', { name: 'Movies categories' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /English Movies/ }),
    ).toHaveAttribute('href', expect.stringContaining('category=19'))
    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('region', { name: 'Movies categories' }),
    ).not.toBeInTheDocument()

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
    await user.click(screen.getByRole('button', { name: 'Show original site' }))
    expect(restore).toHaveBeenCalledOnce()
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

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Results for “wwe”',
      }),
    ).toBeVisible()
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

  it('renders every series episode as a visible play and download row', async () => {
    mockMediaPlayback()
    const seriesPage: DetailPage = {
      kind: 'detail',
      contentKind: 'series',
      title: 'Mousetrap Season 01',
      posterHref: null,
      homeHref: catalog.homeHref,
      groups: catalog.groups,
      metadata: [],
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
