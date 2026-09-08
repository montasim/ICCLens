import type { IccSitePort } from '../application/icc-site'
import {
  catalogActionForHref,
  isPlayableMediaHref,
  type CatalogItem,
  type CatalogPage,
  type CategoryGroup,
  type DetailMetadata,
  type IccPageParseResult,
  type MediaSource,
  type SearchSuggestion,
} from '../domain/icc-page'

type Fetcher = typeof fetch

interface ParseOptions {
  forcedSearchQuery?: string
}

interface SearchApiItem {
  id?: unknown
  image?: unknown
  name?: unknown
  type?: unknown
}

export class IccDomAdapter implements IccSitePort {
  constructor(
    private readonly sourceDocument: Document,
    private readonly locationHref: string,
    private readonly fetcher: Fetcher = (...args) => fetch(...args),
  ) {}

  readCurrentPage(): IccPageParseResult {
    return parseIccDocument(this.sourceDocument, this.locationHref)
  }

  async search(query: string): Promise<CatalogPage> {
    const form = this.sourceDocument.querySelector<HTMLFormElement>(
      'form#fproductlistsrch',
    )
    if (!form) throw new Error('The ICC search form is unavailable.')

    const action = normalizeHref(
      form.getAttribute('action') || this.locationHref,
      this.locationHref,
    )
    if (!action) throw new Error('The ICC search action is invalid.')

    const body = new FormData(form)
    body.set('psearch', query)
    const response = await this.fetcher(action, {
      method: (form.method || 'POST').toUpperCase(),
      body,
      credentials: 'include',
      redirect: 'follow',
    })
    if (!response.ok) {
      throw new Error(`The ICC search returned ${response.status}.`)
    }

    const parsedDocument = new DOMParser().parseFromString(
      await response.text(),
      'text/html',
    )
    const result = parseIccDocument(
      parsedDocument,
      response.url || this.locationHref,
      { forcedSearchQuery: query },
    )
    if (!result.ok || result.page.kind !== 'catalog') {
      throw new Error('ICC Lens could not read the returned search results.')
    }
    return result.page
  }

  submitNativeSearch(query: string): void {
    const form = this.sourceDocument.querySelector<HTMLFormElement>(
      'form#fproductlistsrch',
    )
    const input = form?.querySelector<HTMLInputElement>('input[name="psearch"]')
    if (!form || !input) return
    input.value = query
    if (typeof form.requestSubmit === 'function') form.requestSubmit()
    else form.submit()
  }

  async suggest(
    query: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> {
    const endpoint = normalizeHref('command.php', this.locationHref)
    if (!endpoint) return []

    const response = await this.fetcher(endpoint, {
      method: 'POST',
      body: new URLSearchParams({ cSearch: query }),
      credentials: 'include',
      signal,
    })
    if (!response.ok) return []

    const payload: unknown = await response.json()
    if (!Array.isArray(payload)) return []

    return payload
      .map((value): SearchSuggestion | null => {
        if (!value || typeof value !== 'object') return null
        const candidate = value as SearchApiItem
        const id = String(candidate.id ?? '').trim()
        const title = String(candidate.name ?? '').trim()
        if (!id || !title) return null

        const action = String(candidate.type) === '1' ? 'details' : 'download'
        const href = normalizeHref(
          action === 'details'
            ? `player.php?play=${encodeURIComponent(id)}`
            : `download.php?load=${encodeURIComponent(id)}`,
          this.locationHref,
        )
        if (!href) return null

        const imageName = String(candidate.image ?? '').trim()
        return {
          id,
          title,
          href,
          imageHref: imageName
            ? normalizeHref(`files/${encodeURI(imageName)}`, this.locationHref)
            : null,
          action,
        }
      })
      .filter((value): value is SearchSuggestion => value !== null)
      .slice(0, 8)
  }

  async loadMore(pageNumber: number): Promise<CatalogItem[]> {
    const endpoint = normalizeHref('command.php', this.locationHref)
    if (!endpoint) throw new Error('The ICC pagination endpoint is invalid.')

    const response = await this.fetcher(endpoint, {
      method: 'POST',
      body: new URLSearchParams({ cpage: String(pageNumber) }),
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error(`ICC pagination returned ${response.status}.`)
    }

    const parsedDocument = new DOMParser().parseFromString(
      await response.text(),
      'text/html',
    )
    return parseCatalogItems(parsedDocument.body, this.locationHref)
  }
}

export function parseIccDocument(
  sourceDocument: Document,
  locationHref: string,
  options: ParseOptions = {},
): IccPageParseResult {
  let currentUrl: URL
  try {
    currentUrl = new URL(locationHref)
  } catch {
    return { ok: false, reason: 'The current ICC URL is invalid.' }
  }

  const groups = parseCategoryGroups(sourceDocument, currentUrl.href)
  const homeHref = findHomeHref(sourceDocument, currentUrl.href)
  const pathname = currentUrl.pathname.toLowerCase()

  // Player pages also contain a `.load-post-body` for related titles. The
  // route is authoritative so that related catalog markup cannot turn the
  // entire media detail page into a catalog.
  if (
    pathname.endsWith('/player.php') ||
    sourceDocument.querySelector('video#video-id')
  ) {
    return parseDetailPage(sourceDocument, currentUrl.href, groups, homeHref)
  }

  if (
    pathname.endsWith('/dashboard.php') ||
    sourceDocument.querySelector('.load-post-body')
  ) {
    const items = parseCatalogItems(
      sourceDocument.querySelector('.load-post-body') ?? sourceDocument,
      currentUrl.href,
    )
    const categoryId = currentUrl.searchParams.get('category')
    const category = groups
      .flatMap((group) => group.categories)
      .find((candidate) => candidate.id === categoryId)
    const view = options.forcedSearchQuery
      ? 'search'
      : categoryId && categoryId !== '0'
        ? 'category'
        : 'latest'

    return {
      ok: true,
      page: {
        kind: 'catalog',
        view,
        title:
          view === 'search'
            ? `Results for “${options.forcedSearchQuery}”`
            : view === 'category'
              ? (category?.name ?? 'Category')
              : 'Latest additions',
        query: options.forcedSearchQuery ?? null,
        homeHref,
        groups,
        featuredItems: parseFeaturedItems(sourceDocument, currentUrl.href),
        items,
        hasMore: Boolean(sourceDocument.querySelector('.load-data')),
      },
    }
  }

  return {
    ok: false,
    reason: 'This ICC page does not match a supported catalog or detail page.',
  }
}

export function parseCatalogItems(
  root: ParentNode,
  locationHref: string,
): CatalogItem[] {
  const items = Array.from(root.querySelectorAll<HTMLElement>('.post'))
    .map((post): CatalogItem | null => {
      const anchor = post.querySelector<HTMLAnchorElement>('a.image[href]')
      if (!anchor) return null
      const href = normalizeHref(anchor.getAttribute('href'), locationHref)
      if (!href) return null

      const image = anchor.querySelector<HTMLImageElement>('img[src]')
      const title =
        cleanText(post.querySelector('.title')?.textContent) ||
        cleanText(image?.alt)
      if (!title) return null

      const url = new URL(href)
      return {
        id:
          url.searchParams.get('play') || url.searchParams.get('load') || href,
        title,
        href,
        imageHref: normalizeHref(image?.getAttribute('src'), locationHref),
        age: cleanText(post.querySelector('.day')?.textContent) || null,
        hits: cleanText(post.querySelector('.view')?.textContent) || null,
        action: catalogActionForHref(href),
      }
    })
    .filter((item): item is CatalogItem => item !== null)

  return [...new Map(items.map((item) => [item.href, item])).values()]
}

export function parseFeaturedItems(
  sourceDocument: Document,
  locationHref: string,
): CatalogItem[] {
  const carousel = sourceDocument.querySelector('#post-slider-multipost')
  if (!carousel) return []

  const originalSlides = carousel.querySelectorAll<HTMLAnchorElement>(
    '.owl-stage > .owl-item:not(.cloned) a[href]',
  )
  const anchors = originalSlides.length
    ? Array.from(originalSlides)
    : Array.from(carousel.querySelectorAll<HTMLAnchorElement>('a[href]'))

  const items = anchors
    .map((anchor): CatalogItem | null => {
      const href = normalizeHref(anchor.getAttribute('href'), locationHref)
      if (!href) return null

      const title = cleanText(
        anchor.querySelector('.title span, .title')?.textContent,
      )
      if (!title) return null

      const imageElement = anchor.querySelector<HTMLElement>('.image .img')
      const image = anchor.querySelector<HTMLImageElement>('.image img[src]')
      const imageHref =
        normalizeBackgroundImageHref(imageElement, locationHref) ??
        normalizeHref(image?.getAttribute('src'), locationHref)
      const url = new URL(href)

      return {
        id:
          url.searchParams.get('play') || url.searchParams.get('load') || href,
        title,
        href,
        imageHref,
        age: null,
        hits: null,
        action: catalogActionForHref(href),
      }
    })
    .filter((item): item is CatalogItem => item !== null)

  return [...new Map(items.map((item) => [item.href, item])).values()]
}

function parseDetailPage(
  sourceDocument: Document,
  locationHref: string,
  groups: CategoryGroup[],
  homeHref: string,
): IccPageParseResult {
  const detailsTable = Array.from(
    sourceDocument.querySelectorAll<HTMLTableElement>('main table.ewTable'),
  ).find((table) => table.querySelector('td[colspan] strong'))
  const title = cleanText(
    detailsTable?.querySelector('td[colspan] strong')?.textContent ??
      sourceDocument.querySelector('main b span')?.textContent,
  )
  if (!title) {
    return { ok: false, reason: 'The ICC detail title is missing.' }
  }

  const metadata: DetailMetadata[] = detailsTable
    ? Array.from(detailsTable.querySelectorAll('tr'))
        .map((row): DetailMetadata | null => {
          const cells = row.querySelectorAll('td')
          if (cells.length !== 2) return null
          const label = cleanText(cells[0]?.textContent).replace(/:$/u, '')
          const value = cleanText(cells[1]?.textContent)
          return label && value ? { label, value } : null
        })
        .filter((entry): entry is DetailMetadata => entry !== null)
    : []

  const poster =
    sourceDocument.querySelector<HTMLImageElement>(
      'main .row img[src*="files/"]',
    ) ??
    sourceDocument.querySelector<HTMLImageElement>('main img[src*="files/"]')
  const downloadAnchors = Array.from(
    sourceDocument.querySelectorAll<HTMLAnchorElement>(
      'main a[download][href]',
    ),
  )
  const downloadDetails = new Map<
    string,
    { label: string; size: string | null }
  >()
  for (const anchor of downloadAnchors) {
    const href = normalizeHref(anchor.getAttribute('href'), locationHref)
    if (!href) continue
    const size =
      cleanText(anchor.querySelector('.pull-right')?.textContent) ||
      cleanText(anchor.textContent).match(
        /\d+(?:\.\d+)?\s*(?:TB|GB|MB|KB)/iu,
      )?.[0] ||
      null
    const label = cleanText(anchor.textContent)
      .replace(/\bDOWNLOAD\b/giu, '')
      .replace(size ?? '', '')
      .trim()
    downloadDetails.set(href, { label, size })
  }

  const sources: MediaSource[] = []
  const seen = new Set<string>()
  for (const source of sourceDocument.querySelectorAll<HTMLSourceElement>(
    'video#video-id source[src]',
  )) {
    const href = normalizeHref(source.getAttribute('src'), locationHref)
    if (!href || seen.has(href)) continue
    seen.add(href)
    const download = downloadDetails.get(href)
    sources.push({
      id: `source-${sources.length + 1}`,
      label:
        cleanText(source.getAttribute('title')) ||
        download?.label ||
        fileLabelFromHref(href),
      href,
      mediaType: source.getAttribute('type'),
      size: download?.size ?? null,
      playable: isPlayableMediaHref(href),
    })
  }
  for (const [href, download] of downloadDetails) {
    if (seen.has(href)) continue
    sources.push({
      id: `source-${sources.length + 1}`,
      label: download.label || fileLabelFromHref(href),
      href,
      mediaType: null,
      size: download.size,
      playable: isPlayableMediaHref(href),
    })
  }

  const playableCount = sources.filter((source) => source.playable).length
  const contentKind =
    playableCount === 0
      ? 'file'
      : playableCount > 1 ||
          sources.some((source) => /S\d{1,2}E\d{1,2}/iu.test(source.label))
        ? 'series'
        : 'movie'
  const trailerButton = sourceDocument.querySelector<HTMLElement>(
    'main [data-theVideo]',
  )

  return {
    ok: true,
    page: {
      kind: 'detail',
      contentKind,
      title,
      posterHref: normalizeHref(poster?.getAttribute('src'), locationHref),
      homeHref,
      groups,
      metadata,
      sources,
      trailerHref: normalizeTrailerHref(
        trailerButton?.getAttribute('data-theVideo'),
        locationHref,
      ),
      related: parseCatalogItems(
        sourceDocument.querySelector('main .news-gallery') ?? sourceDocument,
        locationHref,
      ).slice(0, 12),
    },
  }
}

function parseCategoryGroups(
  sourceDocument: Document,
  locationHref: string,
): CategoryGroup[] {
  return Array.from(
    sourceDocument.querySelectorAll<HTMLElement>(
      '#navbar .navbar-nav > li.dropdown',
    ),
  )
    .map((listItem): CategoryGroup | null => {
      const heading = Array.from(listItem.children).find(
        (element) =>
          element instanceof HTMLAnchorElement &&
          element.classList.contains('dropdown-toggle'),
      )
      const name = cleanText(heading?.textContent)
      const categories = Array.from(
        listItem.querySelectorAll<HTMLAnchorElement>(
          '.dropdown-menu a[href*="category="]',
        ),
      )
        .map((anchor) => {
          const href = normalizeHref(anchor.getAttribute('href'), locationHref)
          if (!href) return null
          const url = new URL(href)
          const id = url.searchParams.get('category')
          const categoryName = cleanText(anchor.childNodes[0]?.textContent)
          const countText = cleanText(
            anchor.querySelector('.badge')?.textContent,
          )
          if (!id || !categoryName) return null
          return {
            id,
            name: categoryName,
            count: countText ? Number(countText.replace(/,/gu, '')) : null,
            href,
          }
        })
        .filter((category): category is CategoryGroup['categories'][number] =>
          Boolean(category),
        )
      return name && categories.length ? { name, categories } : null
    })
    .filter((group): group is CategoryGroup => group !== null)
}

function findHomeHref(sourceDocument: Document, locationHref: string): string {
  const raw =
    sourceDocument
      .querySelector<HTMLAnchorElement>('a.logotype[href*="dashboard.php"]')
      ?.getAttribute('href') ?? 'dashboard.php?category=0'
  return normalizeHref(raw, locationHref) ?? locationHref
}

function normalizeHref(
  rawHref: string | null | undefined,
  locationHref: string,
): string | null {
  if (!rawHref) return null
  try {
    const current = new URL(locationHref)
    const target = new URL(rawHref, current)
    if (!['http:', 'https:'].includes(target.protocol)) return null

    const currentSession = current.searchParams.get('session')
    if (
      currentSession &&
      target.hostname === '10.16.100.244' &&
      /\/(?:dashboard|player)\.php$/iu.test(target.pathname) &&
      !target.searchParams.get('session')
    ) {
      target.searchParams.set('session', currentSession)
    }
    return target.href
  } catch {
    return null
  }
}

function normalizeBackgroundImageHref(
  element: HTMLElement | null,
  locationHref: string,
): string | null {
  const backgroundImage = element?.style.backgroundImage ?? ''
  const match = backgroundImage.match(/url\((['"]?)(.*?)\1\)/u)
  return normalizeHref(match?.[2], locationHref)
}

function normalizeTrailerHref(
  rawHref: string | null | undefined,
  locationHref: string,
): string | null {
  const href = normalizeHref(rawHref, locationHref)
  if (!href) return null
  try {
    const url = new URL(href)
    const match = url.pathname.match(/\/embed\/([^/]+)/u)
    return match?.[1]
      ? `https://www.youtube.com/watch?v=${encodeURIComponent(match[1])}`
      : href
  } catch {
    return href
  }
}

function cleanText(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/\s+/gu, ' ')
    .trim()
}

function fileLabelFromHref(href: string): string {
  try {
    const lastSegment = new URL(href).pathname.split('/').pop() || 'Download'
    return decodeURIComponent(lastSegment)
  } catch {
    return 'Download'
  }
}
