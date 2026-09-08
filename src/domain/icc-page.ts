export type CatalogAction = 'details' | 'download'

export interface Category {
  id: string
  name: string
  count: number | null
  href: string
}

export interface CategoryGroup {
  name: string
  categories: Category[]
}

export interface CatalogItem {
  id: string
  title: string
  href: string
  imageHref: string | null
  age: string | null
  hits: string | null
  action: CatalogAction
}

export interface SearchSuggestion {
  id: string
  title: string
  href: string
  imageHref: string | null
  action: CatalogAction
}

export interface CatalogPage {
  kind: 'catalog'
  view: 'latest' | 'category' | 'search'
  title: string
  query: string | null
  homeHref: string
  groups: CategoryGroup[]
  featuredItems: CatalogItem[]
  items: CatalogItem[]
  hasMore: boolean
}

export interface MediaSource {
  id: string
  label: string
  href: string
  mediaType: string | null
  size: string | null
  playable: boolean
}

export interface DetailMetadata {
  label: string
  value: string
}

export interface DetailPage {
  kind: 'detail'
  contentKind: 'movie' | 'series' | 'file'
  title: string
  posterHref: string | null
  homeHref: string
  groups: CategoryGroup[]
  metadata: DetailMetadata[]
  sources: MediaSource[]
  trailerHref: string | null
  related: CatalogItem[]
}

export type IccPage = CatalogPage | DetailPage

export type IccPageParseResult =
  { ok: true; page: IccPage } | { ok: false; reason: string }

const PLAYABLE_EXTENSIONS = new Set(['mp4', 'm4v', 'mov', 'ogg', 'ogv', 'webm'])

export function isPlayableMediaHref(href: string): boolean {
  const pathname = href.split(/[?#]/u, 1)[0]?.toLowerCase() ?? ''
  const extension = pathname.split('.').pop() ?? ''
  return PLAYABLE_EXTENSIONS.has(extension)
}

export function catalogActionForHref(href: string): CatalogAction {
  return /(?:^|\/)download\.php(?:[?#]|$)/iu.test(href) ? 'download' : 'details'
}
