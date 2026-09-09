import {
  CheckmarkCircle03Icon,
  InboxIcon,
  RefreshIcon,
  Search01Icon,
  TriangleAlertIcon,
} from '@hugeicons/core-free-icons'
import { useEffect, useMemo, useRef, useState } from 'react'

import { HugeIcon } from '../../components/ui/huge-icon'
import { sortCatalogItems, type CatalogSort } from '../../domain/catalog-sort'
import type { CatalogPage } from '../../domain/icc-page'
import type { WatchHistoryEntry } from '../../domain/preferences'
import { CatalogCard } from './catalog-card'
import { CatalogSortMenu } from './catalog-sort-menu'
import { FeaturedCarousel } from './featured-carousel'
import { ContinueWatching } from './continue-watching'
import { PageBreadcrumb } from './page-breadcrumb'

interface CatalogViewProps {
  page: CatalogPage
  loadingMore: boolean
  loadMoreError: string | null
  onBrowse(): void
  onLoadMore(): void
  watchHistory?: WatchHistoryEntry[]
  onClearWatchHistory?(): void
}

export function CatalogView({
  page,
  loadingMore,
  loadMoreError,
  onBrowse,
  onLoadMore,
  watchHistory = [],
  onClearWatchHistory,
}: CatalogViewProps) {
  const [sort, setSort] = useState<CatalogSort>('server')
  const sortedItems = useMemo(
    () => sortCatalogItems(page.items, sort),
    [page.items, sort],
  )
  const hasFeaturedCarousel =
    page.view === 'latest' && page.featuredItems.length > 0
  const CatalogTitle = hasFeaturedCarousel ? 'h2' : 'h1'
  const breadcrumbLabel =
    page.view === 'latest' ? 'Newest additions' : page.title

  return (
    <main id="icc-lens-main" tabIndex={-1}>
      <PageBreadcrumb homeHref={page.homeHref} currentLabel={breadcrumbLabel} />

      {hasFeaturedCarousel ? (
        <FeaturedCarousel items={page.featuredItems} />
      ) : null}

      {hasFeaturedCarousel && watchHistory.length ? (
        <div className="icc-container">
          <ContinueWatching
            history={watchHistory}
            items={[...page.featuredItems, ...page.items]}
            onClear={onClearWatchHistory ?? (() => undefined)}
          />
        </div>
      ) : null}

      <section
        className={`icc-container pb-32 ${
          hasFeaturedCarousel ? 'pt-6' : 'pt-5'
        }`}
      >
        {page.items.length ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <CatalogTitle
                  className={`font-display font-medium text-content ${
                    hasFeaturedCarousel
                      ? 'text-2xl tracking-[-0.025em]'
                      : 'text-2xl tracking-[-0.03em] sm:text-3xl'
                  }`}
                >
                  {page.view === 'latest' ? 'Newest additions' : page.title}
                </CatalogTitle>
                <p className="mt-2 max-w-[65ch] text-sm leading-6 text-content-muted">
                  {page.view === 'latest'
                    ? 'Clear metadata, predictable actions, no date-timeline clutter.'
                    : `${page.items.length} items currently shown. Actions explain whether a click opens details or starts a download.`}
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
                {page.items.length > 1 ? (
                  <CatalogSortMenu
                    pageView={page.view}
                    value={sort}
                    onChange={setSort}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={onBrowse}
                  className="min-h-11 flex-1 rounded-xl border border-divider bg-surface px-4 py-2.5 text-sm font-medium text-content transition hover:border-action hover:text-action-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action sm:flex-none"
                >
                  {page.view === 'latest'
                    ? 'Browse library'
                    : 'Change category'}
                </button>
              </div>
            </div>

            <section
              aria-label="Catalog items"
              className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            >
              {sortedItems.map((item) => (
                <CatalogCard key={`${item.action}-${item.id}`} item={item} />
              ))}
            </section>
            <span className="sr-only" aria-live="polite">
              {page.items.length} items sorted by {sortLabel(sort)}.
            </span>
          </>
        ) : (
          <EmptyCatalog
            page={page}
            headingLevel={hasFeaturedCarousel ? 2 : 1}
            onBrowse={onBrowse}
          />
        )}

        {loadMoreError ? (
          <PaginationError message={loadMoreError} onRetry={onLoadMore} />
        ) : null}

        {page.hasMore && page.items.length && !loadMoreError ? (
          <InfiniteLoadTrigger loading={loadingMore} onLoadMore={onLoadMore} />
        ) : page.items.length && !loadMoreError ? (
          <CollectionComplete page={page} />
        ) : null}
      </section>
    </main>
  )
}

function sortLabel(sort: CatalogSort): string {
  switch (sort) {
    case 'popularity-desc':
      return 'popularity, high to low'
    case 'popularity-asc':
      return 'popularity, low to high'
    case 'name-asc':
      return 'name, A to Z'
    case 'name-desc':
      return 'name, Z to A'
    default:
      return 'the server order'
  }
}

function InfiniteLoadTrigger({
  loading,
  onLoadMore,
}: {
  loading: boolean
  onLoadMore(): void
}) {
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger || loading || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore()
      },
      { rootMargin: '320px 0px' },
    )
    observer.observe(trigger)
    return () => observer.disconnect()
  }, [loading, onLoadMore])

  return (
    <div
      ref={triggerRef}
      className="mt-10 flex min-h-20 items-center justify-center"
      aria-live="polite"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2 text-sm font-bold text-content">
          <HugeIcon icon={RefreshIcon} className="size-4 animate-spin" />
          Loading more items…
        </span>
      ) : (
        <span className="sr-only">
          More items load automatically as you scroll.
        </span>
      )}
    </div>
  )
}

function EmptyCatalog({
  page,
  headingLevel,
  onBrowse,
}: CatalogStateProps & { headingLevel: 1 | 2 }) {
  const isSearch = page.view === 'search'
  const EmptyTitle = headingLevel === 1 ? 'h1' : 'h2'
  const title = isSearch
    ? page.query
      ? `No results for “${page.query}”`
      : 'No matching titles were found'
    : page.view === 'latest'
      ? 'No recent additions are available'
      : `No titles are available in ${page.title}`
  const description = isSearch
    ? 'Check the spelling, try fewer words, or browse the catalog by category.'
    : page.view === 'latest'
      ? 'The ICC server returned no items for the latest feed. Browse another category or check again later.'
      : 'The ICC server returned this category without any titles. Choose another category or check again later.'

  return (
    <section
      aria-labelledby="icc-lens-empty-title"
      aria-live="polite"
      className="mx-auto mt-4 flex max-w-2xl flex-col items-center rounded-2xl border border-divider bg-surface px-6 py-12 text-center shadow-sm sm:px-10 sm:py-16"
    >
      <span className="grid size-16 place-items-center rounded-2xl bg-surface-muted text-content">
        <HugeIcon
          icon={isSearch ? Search01Icon : InboxIcon}
          className="size-7"
        />
      </span>
      <EmptyTitle
        id="icc-lens-empty-title"
        className="mt-6 max-w-xl font-display text-2xl font-medium tracking-[-0.025em] text-content [overflow-wrap:anywhere]"
      >
        {title}
      </EmptyTitle>
      <p className="mt-3 max-w-[58ch] text-sm leading-6 text-content-muted">
        {description}
      </p>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-7 min-h-11 rounded-xl bg-action px-5 py-3 text-sm font-medium text-action-foreground transition hover:bg-action-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/45"
      >
        {isSearch ? 'Browse categories' : 'Choose another category'}
      </button>
    </section>
  )
}

function CollectionComplete({ page }: { page: CatalogPage }) {
  const count = page.items.length
  const titleCount = `${count} ${count === 1 ? 'title' : 'titles'}`
  const resultCount = `${count} ${count === 1 ? 'result' : 'results'}`
  const additionCount = `${count} latest ${count === 1 ? 'addition' : 'additions'}`
  const title =
    page.view === 'latest'
      ? 'You’re up to date'
      : page.view === 'search'
        ? 'Every matching title is shown'
        : 'The full category is shown'
  const description =
    page.view === 'latest'
      ? `All ${additionCount} currently available from ICC are shown above.`
      : page.view === 'search' && page.query
        ? `All ${resultCount} for “${page.query}” are shown above.`
        : `All ${titleCount} currently available in ${page.title} are shown above.`

  return (
    <section
      aria-labelledby="icc-lens-complete-title"
      className="mt-12 border-y border-divider py-6"
    >
      <div className="mx-auto flex max-w-2xl items-start gap-4 sm:items-center">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-muted text-support">
          <HugeIcon icon={CheckmarkCircle03Icon} className="size-5" />
        </span>
        <div className="min-w-0">
          <h2
            id="icc-lens-complete-title"
            className="text-sm font-bold text-content"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-content-muted">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}

function PaginationError({
  message,
  onRetry,
}: {
  message: string
  onRetry(): void
}) {
  return (
    <section
      role="alert"
      aria-labelledby="icc-lens-pagination-error-title"
      className="mx-auto mt-10 flex max-w-2xl flex-col gap-5 rounded-2xl border border-danger/30 bg-danger/10 px-5 py-5 text-danger sm:flex-row sm:items-center sm:px-6"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-danger/15 text-danger">
        <HugeIcon icon={TriangleAlertIcon} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="icc-lens-pagination-error-title" className="text-sm font-bold">
          More titles couldn’t be loaded
        </h2>
        <p className="mt-1 text-sm leading-6 [overflow-wrap:anywhere]">
          {message} Everything already shown remains available.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-danger px-4 text-sm font-bold text-surface transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger/30"
      >
        <HugeIcon icon={RefreshIcon} className="size-4" />
        Retry loading
      </button>
    </section>
  )
}

interface CatalogStateProps {
  page: CatalogPage
  onBrowse(): void
}
