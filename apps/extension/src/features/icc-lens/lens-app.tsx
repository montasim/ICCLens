import { TriangleAlertIcon } from '@hugeicons/core-free-icons'
import { useEffect, useRef, useState } from 'react'

import type { IccSiteService } from '../../application/icc-site'
import type { LensPreferencesService } from '../../application/preferences'
import { HugeIcon } from '../../components/ui/huge-icon'
import {
  categoryScopeForGroupName,
  type CategoryScope,
} from '../../domain/category-scope'
import type {
  CatalogPage,
  IccPage,
  MediaSource,
  SearchSuggestion,
} from '../../domain/icc-page'
import {
  DEFAULT_PREFERENCES,
  normalizePageIdentity,
  type LensTheme,
  type WatchHistoryEntry,
} from '../../domain/preferences'
import { CatalogView } from './catalog-view'
import { DetailView } from './detail-view'
import { LensHeader, type PrimaryPage } from './lens-header'

interface LensAppProps {
  initialPage: IccPage
  logoUrl: string
  service: IccSiteService
  preferences: LensPreferencesService
  pageHref: string
  onRestoreOriginal(): void
}

type SearchState =
  { kind: 'idle' } | { kind: 'searching' } | { kind: 'error'; message: string }

export function LensApp({
  initialPage,
  logoUrl,
  service,
  preferences,
  pageHref,
  onRestoreOriginal,
}: LensAppProps) {
  const [page, setPage] = useState<IccPage>(initialPage)
  const [query, setQuery] = useState('')
  const [searchState, setSearchState] = useState<SearchState>({ kind: 'idle' })
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [dismissedSuggestionQuery, setDismissedSuggestionQuery] = useState<
    string | null
  >(null)
  const [browseScope, setBrowseScope] = useState<CategoryScope | null>(null)
  const [nextPageNumber, setNextPageNumber] = useState(2)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [theme, setTheme] = useState<LensTheme>(DEFAULT_PREFERENCES.theme)
  const [watchHistory, setWatchHistory] = useState<WatchHistoryEntry[]>([])
  const pendingProgress = useRef<WatchHistoryEntry | null>(null)
  const progressTimer = useRef<number | null>(null)

  useEffect(() => {
    let current = true
    const refresh = () => {
      void Promise.all([
        preferences.loadTheme(),
        preferences.loadWatchHistory(),
      ])
        .then(([storedTheme, storedHistory]) => {
          if (!current) return
          setTheme(storedTheme)
          setWatchHistory(storedHistory)
        })
        .catch(() => undefined)
    }
    refresh()
    window.addEventListener('icc-lens:preferences-changed', refresh)
    return () => {
      current = false
      window.removeEventListener('icc-lens:preferences-changed', refresh)
    }
  }, [preferences])

  useEffect(
    () => () => {
      if (progressTimer.current !== null)
        window.clearTimeout(progressTimer.current)
      if (pendingProgress.current)
        void preferences.upsertWatchHistory(pendingProgress.current)
    },
    [preferences],
  )

  const groups = page.groups
  const homeHref = page.homeHref
  const activePrimaryPage = resolveActivePrimaryPage(page, pageHref)
  const pageIdentity = normalizePageIdentity(pageHref)
  const resumeEntry =
    page.kind === 'detail' && pageIdentity
      ? watchHistory.find((entry) => entry.pageIdentity === pageIdentity)
      : undefined

  function toggleTheme() {
    const next: LensTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    void preferences.saveTheme(next).catch(() => setTheme(theme))
  }

  function recordProgress({
    source,
    seconds,
    duration,
  }: {
    source: MediaSource
    seconds: number
    duration: number
  }) {
    if (page.kind !== 'detail' || !pageIdentity) return
    pendingProgress.current = {
      pageIdentity,
      title: page.title,
      context: source.label,
      ...(source.seasonNumber ? { season: source.seasonNumber } : {}),
      ...(source.episodeNumber ? { episode: source.episodeNumber } : {}),
      currentTime: seconds,
      duration,
      updatedAt: Date.now(),
    }
    if (progressTimer.current !== null) return
    progressTimer.current = window.setTimeout(() => {
      const pending = pendingProgress.current
      pendingProgress.current = null
      progressTimer.current = null
      if (!pending) return
      void preferences
        .upsertWatchHistory(pending)
        .then(setWatchHistory)
        .catch(() => undefined)
    }, 2_000)
  }

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
    <div
      data-theme={theme}
      className="min-h-[100dvh] min-w-[320px] bg-canvas font-sans text-content antialiased"
    >
      <LensHeader
        groups={groups}
        homeHref={homeHref}
        activePage={activePrimaryPage}
        logoUrl={logoUrl}
        query={query}
        searchBusy={searchState.kind === 'searching'}
        suggestions={suggestions}
        browseOpen={browseScope !== null}
        browseScope={browseScope ?? 'global'}
        theme={theme}
        onThemeToggle={toggleTheme}
        onBrowseChange={(open) => setBrowseScope(open ? 'global' : null)}
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
        <div className="border-b border-danger/25 bg-danger/10">
          <div
            role="alert"
            className="icc-container flex flex-col gap-4 py-4 text-content sm:flex-row sm:items-center"
          >
            <HugeIcon
              icon={TriangleAlertIcon}
              className="size-5 shrink-0 text-danger"
            />
            <div className="min-w-0 flex-1">
              <strong className="block text-sm font-bold">
                Search couldn’t be completed
              </strong>
              <p className="mt-1 text-sm font-medium leading-6 text-content-secondary [overflow-wrap:anywhere]">
                {searchState.message} Your current catalog is still available.
              </p>
            </div>
            <button
              type="button"
              onClick={() => service.submitNativeSearch(query)}
              className="min-h-11 shrink-0 rounded-xl bg-danger px-4 text-sm font-semibold text-danger-foreground transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-danger/25"
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
          onBrowse={() =>
            setBrowseScope(
              activePrimaryPage === 'movie' ||
                activePrimaryPage === 'series' ||
                activePrimaryPage === 'file'
                ? activePrimaryPage
                : 'global',
            )
          }
          onLoadMore={() => void loadMore()}
          watchHistory={watchHistory}
          onClearWatchHistory={() => {
            void preferences
              .clearWatchHistory()
              .then(() => setWatchHistory([]))
              .catch(() => undefined)
          }}
        />
      ) : (
        <DetailView
          page={page}
          resumeEntry={resumeEntry}
          onPlaybackProgress={recordProgress}
        />
      )}
    </div>
  )
}

function resolveActivePrimaryPage(
  page: IccPage,
  pageHref: string,
): PrimaryPage {
  if (page.kind === 'detail') {
    return page.contentKind === 'movie'
      ? 'movie'
      : page.contentKind === 'series'
        ? 'series'
        : 'file'
  }
  if (page.view === 'latest') return 'home'
  if (page.view === 'search') return null

  let categoryId: string | null = null
  try {
    categoryId = new URL(pageHref).searchParams.get('category')
  } catch {
    return null
  }
  if (categoryId === '0') return 'home'
  const group = page.groups.find((candidate) =>
    candidate.categories.some((category) => category.id === categoryId),
  )
  if (group) return categoryScopeForGroupName(group.name)
  if (categoryId === '9') return 'movie'
  if (categoryId === '38') return 'series'
  if (categoryId === '68') return 'file'
  return null
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
