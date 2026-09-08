import { TriangleAlertIcon } from '@hugeicons/core-free-icons'
import { useEffect, useMemo, useState } from 'react'

import type { IccSiteService } from '../../application/icc-site'
import { HugeIcon } from '../../components/ui/huge-icon'
import type {
  CatalogPage,
  IccPage,
  SearchSuggestion,
} from '../../domain/icc-page'
import { CatalogView } from './catalog-view'
import { DetailView } from './detail-view'
import { LensHeader } from './lens-header'

interface LensAppProps {
  initialPage: IccPage
  logoUrl: string
  service: IccSiteService
  onRestoreOriginal(): void
}

type SearchState =
  { kind: 'idle' } | { kind: 'searching' } | { kind: 'error'; message: string }

export function LensApp({
  initialPage,
  logoUrl,
  service,
  onRestoreOriginal,
}: LensAppProps) {
  const [page, setPage] = useState<IccPage>(initialPage)
  const [query, setQuery] = useState('')
  const [searchState, setSearchState] = useState<SearchState>({ kind: 'idle' })
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [dismissedSuggestionQuery, setDismissedSuggestionQuery] = useState<
    string | null
  >(null)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [nextPageNumber, setNextPageNumber] = useState(2)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const groups = page.groups
  const homeHref = page.homeHref

  useEffect(() => {
    const normalizedQuery = query.trim()
    if (
      normalizedQuery.length < 2 ||
      searchState.kind !== 'idle' ||
      normalizedQuery === dismissedSuggestionQuery
    ) {
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      void service
        .suggest(query, controller.signal)
        .then(setSuggestions)
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return
          setSuggestions([])
        })
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [dismissedSuggestionQuery, query, searchState.kind, service])

  const itemCount = useMemo(
    () => (page.kind === 'catalog' ? page.items.length : page.sources.length),
    [page],
  )

  async function runSearch() {
    setDismissedSuggestionQuery(query.trim())
    setSearchState({ kind: 'searching' })
    setSuggestions([])
    try {
      const result = await service.search(query)
      setPage(result)
      setNextPageNumber(2)
      setLoadMoreError(null)
      setSearchState({ kind: 'idle' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSearchState({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'ICC search failed. You can retry with the original server form.',
      })
    }
  }

  async function loadMore() {
    if (page.kind !== 'catalog' || loadingMore) return
    setLoadingMore(true)
    setLoadMoreError(null)
    try {
      const incoming = await service.loadMore(nextPageNumber)
      const known = new Set(page.items.map((item) => item.href))
      const unique = incoming.filter((item) => !known.has(item.href))
      setPage({
        ...page,
        items: [...page.items, ...unique],
        hasMore: unique.length > 0,
      })
      if (unique.length) setNextPageNumber((value) => value + 1)
    } catch (error) {
      setLoadMoreError(
        error instanceof Error
          ? error.message
          : 'ICC Lens could not load the next page.',
      )
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="min-h-[100dvh] min-w-[320px] bg-zinc-50 font-sans text-zinc-900 antialiased">
      <LensHeader
        groups={groups}
        homeHref={homeHref}
        logoUrl={logoUrl}
        query={query}
        searchBusy={searchState.kind === 'searching'}
        suggestions={suggestions}
        browseOpen={browseOpen}
        onBrowseChange={setBrowseOpen}
        onQueryChange={(value) => {
          setQuery(value)
          setDismissedSuggestionQuery(null)
          if (value.trim().length < 2) setSuggestions([])
          if (searchState.kind === 'error') setSearchState({ kind: 'idle' })
        }}
        onSearch={() => void runSearch()}
        onRestoreOriginal={onRestoreOriginal}
      />

      {searchState.kind === 'error' ? (
        <div className="border-b border-red-200 bg-red-50">
          <div
            role="alert"
            className="mx-auto flex max-w-[1512px] flex-col gap-4 px-4 py-4 text-red-950 sm:flex-row sm:items-center sm:px-6 lg:px-8"
          >
            <HugeIcon
              icon={TriangleAlertIcon}
              className="size-5 shrink-0 text-red-900"
            />
            <div className="min-w-0 flex-1">
              <strong className="block text-sm font-bold">
                Search couldn’t be completed
              </strong>
              <p className="mt-1 text-sm font-medium leading-6 text-red-800 [overflow-wrap:anywhere]">
                {searchState.message} Your current catalog is still available.
              </p>
            </div>
            <button
              type="button"
              onClick={() => service.submitNativeSearch(query)}
              className="min-h-11 shrink-0 rounded-xl bg-red-900 px-4 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              Try original search
            </button>
          </div>
        </div>
      ) : null}

      {page.kind === 'catalog' ? (
        <CatalogView
          page={page}
          loadingMore={loadingMore}
          loadMoreError={loadMoreError}
          onBrowse={() => setBrowseOpen(true)}
          onLoadMore={() => void loadMore()}
        />
      ) : (
        <DetailView page={page} />
      )}

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1512px] flex-col gap-2 px-4 py-6 text-xs font-semibold text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>ICC Lens · Design A — Catalog</span>
          <span>
            {itemCount}{' '}
            {page.kind === 'catalog' ? 'items shown' : 'files found'} · No
            telemetry · Original server links preserved
          </span>
        </div>
      </footer>
    </div>
  )
}

export function appendCatalogItems(
  page: CatalogPage,
  incoming: CatalogPage['items'],
): CatalogPage {
  const known = new Set(page.items.map((item) => item.href))
  return {
    ...page,
    items: [...page.items, ...incoming.filter((item) => !known.has(item.href))],
    hasMore: incoming.length > 0,
  }
}
