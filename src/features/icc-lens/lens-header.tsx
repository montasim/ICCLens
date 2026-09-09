import {
  Cancel01Icon,
  EyeIcon,
  Menu01Icon,
  Search01Icon,
  Moon02Icon,
  Sun03Icon,
} from '@hugeicons/core-free-icons'
import { useEffect, useRef, type RefObject } from 'react'

import { HugeIcon } from '../../components/ui/huge-icon'
import {
  categoryHrefForId,
  filterCategoryGroups,
  PRIMARY_PAGE_CATEGORY_IDS,
  type CategoryScope,
} from '../../domain/category-scope'
import type { CategoryGroup, SearchSuggestion } from '../../domain/icc-page'
import type { LensTheme } from '../../domain/preferences'

export type PrimaryPage = 'home' | 'movie' | 'series' | 'file' | null

interface LensHeaderProps {
  groups: CategoryGroup[]
  homeHref: string
  activePage: PrimaryPage
  logoUrl: string
  query: string
  searchBusy: boolean
  suggestions: SearchSuggestion[]
  browseOpen: boolean
  browseScope: CategoryScope
  theme: LensTheme
  onThemeToggle(): void
  onBrowseChange(open: boolean): void
  onQueryChange(query: string): void
  onSearch(): void
  onRestoreOriginal(): void
}

export function LensHeader({
  groups,
  homeHref,
  activePage,
  logoUrl,
  query,
  searchBusy,
  suggestions,
  browseOpen,
  browseScope,
  theme,
  onThemeToggle,
  onBrowseChange,
  onQueryChange,
  onSearch,
  onRestoreOriginal,
}: LensHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const browseButtonRef = useRef<HTMLButtonElement>(null)
  const suggestionId = 'icc-lens-search-suggestions'

  function focusMainContent() {
    const root = inputRef.current?.getRootNode() as ParentNode | undefined
    const main = root?.querySelector<HTMLElement>('#icc-lens-main')
    main?.focus()
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-divider bg-surface/95 backdrop-blur">
        <button
          type="button"
          onClick={focusMainContent}
          className="fixed left-4 top-3 z-[90] -translate-y-24 rounded-lg bg-action px-4 py-3 text-sm font-bold text-action-foreground transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/45 motion-reduce:transition-none"
        >
          Skip to catalog
        </button>
        <div className="icc-container flex min-h-20 flex-wrap items-center gap-x-3 gap-y-3 py-3 lg:h-20 lg:flex-nowrap lg:gap-5 lg:py-0">
          <a
            href={homeHref}
            className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            aria-label="ICC Lens home"
          >
            <img
              src={logoUrl}
              alt=""
              className="size-10 rounded-md shadow-[0_8px_22px_var(--player-shadow-20)]"
            />
            <span className="leading-none">
              <strong className="block font-display text-base font-bold tracking-[-0.035em] text-content">
                ICC <span className="text-action-on-surface">Lens</span>
              </strong>
              <span className="mt-1 hidden font-mono text-xs uppercase tracking-[0.12em] text-content-muted min-[360px]:block">
                Local screening room
              </span>
            </span>
          </a>

          <form
            className="relative order-3 flex w-full min-w-0 basis-full lg:ml-auto lg:max-w-md lg:flex-none lg:basis-auto"
            onSubmit={(event) => {
              event.preventDefault()
              onSearch()
            }}
          >
            <label htmlFor="icc-lens-search" className="sr-only">
              Search the ICC catalog
            </label>
            <div className="flex min-h-12 w-full items-center rounded-xl border border-divider bg-surface p-1 shadow-sm transition focus-within:border-action focus-within:ring-2 focus-within:ring-action/20">
              <HugeIcon
                icon={Search01Icon}
                className="ml-2 size-5 shrink-0 text-content-muted"
              />
              <input
                ref={inputRef}
                id="icc-lens-search"
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                aria-controls={suggestions.length ? suggestionId : undefined}
                autoComplete="off"
                placeholder="Search movies, games, software…"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-content caret-action outline-none placeholder:text-content-muted"
              />
              <button
                type="submit"
                disabled={searchBusy || !query.trim()}
                className="min-h-[44px] shrink-0 rounded-lg bg-action px-4 text-sm font-semibold text-action-foreground transition hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action disabled:cursor-not-allowed disabled:opacity-45"
              >
                {searchBusy ? 'Searching…' : 'Search'}
              </button>
            </div>
            {suggestions.length ? (
              <ul
                id={suggestionId}
                aria-label="Search suggestions"
                className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-divider bg-surface p-2 shadow-2xl"
              >
                {suggestions.map((suggestion) => (
                  <li key={`${suggestion.action}-${suggestion.id}`}>
                    <a
                      href={suggestion.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-action text-sm font-bold text-action-foreground">
                        {suggestion.title.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm font-bold text-content">
                          {suggestion.title}
                        </strong>
                        <span className="mt-0.5 block text-xs text-content-muted">
                          {suggestion.action === 'download'
                            ? 'Starts a download'
                            : 'Opens details'}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>

          <PrototypePageNav homeHref={homeHref} activePage={activePage} />

          <div className="order-4 ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <button
              type="button"
              onClick={onThemeToggle}
              className="grid size-11 place-items-center rounded-xl border border-divider bg-surface text-content-secondary transition hover:border-action hover:bg-surface-muted hover:text-content focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/30"
              aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}
              title={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              <HugeIcon
                icon={theme === 'light' ? Moon02Icon : Sun03Icon}
                className="size-5"
              />
            </button>
            <button
              ref={browseButtonRef}
              type="button"
              onClick={() => onBrowseChange(true)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-divider bg-surface px-4 text-sm font-semibold text-content transition hover:border-action hover:text-action-on-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/30"
            >
              <HugeIcon icon={Menu01Icon} className="size-4" />
              Browse
            </button>
          </div>
        </div>
      </header>

      <BrowseDrawer
        groups={groups}
        scope={browseScope}
        open={browseOpen}
        onClose={() => onBrowseChange(false)}
        onRestoreOriginal={onRestoreOriginal}
        returnFocusRef={browseButtonRef}
      />
    </>
  )
}

function PrototypePageNav({
  homeHref,
  activePage,
}: {
  homeHref: string
  activePage: PrimaryPage
}) {
  const movieHref = categoryHrefForId(homeHref, PRIMARY_PAGE_CATEGORY_IDS.movie)
  const seriesHref = categoryHrefForId(
    homeHref,
    PRIMARY_PAGE_CATEGORY_IDS.series,
  )
  const fileHref = categoryHrefForId(homeHref, PRIMARY_PAGE_CATEGORY_IDS.file)
  const passive =
    'inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-content-secondary transition hover:bg-surface-muted hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action'
  const active =
    'inline-flex min-h-[44px] items-center rounded-lg bg-action px-3 py-2 text-sm font-medium text-action-foreground shadow-[0_8px_20px_var(--action-shadow-18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action'
  const pageLinkProps = (page: Exclude<PrimaryPage, null>) => ({
    className: activePage === page ? active : passive,
    'aria-current': activePage === page ? ('page' as const) : undefined,
  })
  return (
    <nav
      aria-label="Primary pages"
      className="order-2 hidden shrink-0 items-center gap-1 lg:flex"
    >
      <a href={homeHref} {...pageLinkProps('home')}>
        Home
      </a>
      {movieHref ? (
        <a href={movieHref} {...pageLinkProps('movie')}>
          Movie
        </a>
      ) : null}
      {seriesHref ? (
        <a href={seriesHref} {...pageLinkProps('series')}>
          Series
        </a>
      ) : null}
      {fileHref ? (
        <a href={fileHref} {...pageLinkProps('file')}>
          File
        </a>
      ) : null}
    </nav>
  )
}

function BrowseDrawer({
  groups,
  scope,
  open,
  onClose,
  onRestoreOriginal,
  returnFocusRef,
}: {
  groups: CategoryGroup[]
  scope: CategoryScope
  open: boolean
  onClose(): void
  onRestoreOriginal(): void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)
  const visibleGroups = filterCategoryGroups(groups, scope)
  const spreadSingleGroup = visibleGroups.length === 1
  const categoryCount = visibleGroups.reduce(
    (count, group) => count + group.categories.length,
    0,
  )
  const title =
    scope === 'global'
      ? 'Browse the full library'
      : scope === 'movie'
        ? 'Change movie category'
        : scope === 'series'
          ? 'Change TV series category'
          : 'Change file category'
  const description =
    scope === 'global'
      ? `${categoryCount} categories, organized exactly as the server provides them.`
      : `${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'} from ${visibleGroups.map((group) => group.name).join(', ')}.`

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const returnFocusTarget = returnFocusRef.current
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      if (!dialog) return
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      const first = focusable[0]
      const last = focusable.at(-1)
      const root = dialog.getRootNode()
      const activeElement =
        root instanceof ShadowRoot ? root.activeElement : document.activeElement

      if (event.shiftKey && activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    dialog?.addEventListener('keydown', onKeyDown)
    return () => {
      dialog?.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      returnFocusTarget?.focus({ preventScroll: true })
    }
  }, [open, returnFocusRef])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-player-panel/65 p-3 backdrop-blur-sm sm:p-6 lg:p-10"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="icc-lens-browse-title"
        className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-divider bg-surface text-content shadow-2xl"
      >
        <div className="flex items-start justify-between gap-6 border-b border-divider px-5 py-5 sm:px-7">
          <div>
            <h2
              id="icc-lens-browse-title"
              className="font-display text-lg font-medium tracking-[-0.025em] text-content"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-content-muted">{description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onRestoreOriginal}
              aria-label="Show original site"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-content-secondary transition hover:bg-surface-muted hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            >
              <HugeIcon icon={EyeIcon} className="size-4" />
              <span className="hidden sm:inline">Show original site</span>
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-divider text-content-muted transition hover:bg-surface-muted hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
              aria-label="Close category browser"
            >
              <HugeIcon icon={Cancel01Icon} className="size-5" />
            </button>
          </div>
        </div>

        <div
          data-category-groups
          className="grid gap-8 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visibleGroups.map((group) => (
            <section
              key={group.name}
              className={
                spreadSingleGroup ? 'sm:col-span-2 lg:col-span-3' : undefined
              }
            >
              <h3 className="mb-3 text-sm font-bold text-content">
                {group.name}
              </h3>
              <ul
                data-category-list
                className={`grid grid-cols-1 gap-x-8 ${
                  spreadSingleGroup ? 'sm:grid-cols-2 lg:grid-cols-3' : ''
                }`}
              >
                {group.categories.map((category) => (
                  <li key={category.id}>
                    <a
                      href={category.href}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content transition hover:bg-surface-muted hover:text-action-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                    >
                      <span>{category.name}</span>
                      {category.count === null ? null : (
                        <span className="shrink-0 font-mono text-xs tabular-nums text-content-muted">
                          {category.count.toLocaleString()}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
