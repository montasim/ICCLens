import {
  ArrowDown01Icon,
  Cancel01Icon,
  EyeIcon,
  Home01Icon,
  Menu01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { useEffect, useRef, useState, type RefObject } from 'react'

import { HugeIcon } from '../../components/ui/huge-icon'
import type { CategoryGroup, SearchSuggestion } from '../../domain/icc-page'

interface LensHeaderProps {
  groups: CategoryGroup[]
  homeHref: string
  logoUrl: string
  query: string
  searchBusy: boolean
  suggestions: SearchSuggestion[]
  browseOpen: boolean
  onBrowseChange(open: boolean): void
  onQueryChange(query: string): void
  onSearch(): void
  onRestoreOriginal(): void
}

export function LensHeader({
  groups,
  homeHref,
  logoUrl,
  query,
  searchBusy,
  suggestions,
  browseOpen,
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
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <button
          type="button"
          onClick={focusMainContent}
          className="fixed left-4 top-3 z-[90] -translate-y-24 rounded-xl bg-violet-700 px-4 py-3 text-sm font-bold text-white transition-transform focus:translate-y-0 focus:outline-none focus:ring-4 focus:ring-violet-300 motion-reduce:transition-none"
        >
          Skip to catalog
        </button>
        <div className="mx-auto flex min-h-20 max-w-[1512px] flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-6 lg:h-20 lg:flex-nowrap lg:gap-5 lg:px-8 lg:py-0">
          <a
            href={homeHref}
            className="flex min-h-11 shrink-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-200"
            aria-label="ICC Lens home"
          >
            <img src={logoUrl} alt="" className="size-10 rounded-xl" />
            <span className="leading-none">
              <strong className="block text-sm font-extrabold tracking-[-0.02em] text-zinc-900">
                ICC Lens
              </strong>
              <span className="mt-1 hidden text-xs font-semibold text-zinc-600 min-[360px]:block">
                Clearer local catalog
              </span>
            </span>
          </a>

          <form
            className="relative order-3 flex w-full min-w-0 basis-full lg:order-none lg:ml-auto lg:max-w-sm lg:flex-none lg:basis-auto xl:max-w-[19rem] 2xl:max-w-sm"
            onSubmit={(event) => {
              event.preventDefault()
              onSearch()
            }}
          >
            <label htmlFor="icc-lens-search" className="sr-only">
              Search the ICC catalog
            </label>
            <div className="flex min-h-12 w-full items-center rounded-xl border border-zinc-300 bg-zinc-50 transition focus-within:border-violet-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
              <HugeIcon
                icon={Search01Icon}
                className="ml-3 size-5 shrink-0 text-zinc-600"
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
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm font-semibold text-zinc-800 caret-violet-600 outline-none placeholder:font-medium placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={searchBusy || !query.trim()}
                className="m-0.5 min-h-11 shrink-0 rounded-lg bg-zinc-900 px-4 text-sm font-bold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {searchBusy ? 'Searching…' : 'Search'}
              </button>
            </div>
            {suggestions.length ? (
              <ul
                id={suggestionId}
                aria-label="Search suggestions"
                className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_18px_44px_rgba(24,24,27,0.16)]"
              >
                {suggestions.map((suggestion) => (
                  <li key={`${suggestion.action}-${suggestion.id}`}>
                    <a
                      href={suggestion.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-violet-50 focus:outline-none focus:ring-4 focus:ring-violet-100"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-100 text-sm font-bold text-violet-800">
                        {suggestion.title.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm font-bold text-zinc-900">
                          {suggestion.title}
                        </strong>
                        <span className="mt-0.5 block text-xs font-semibold text-zinc-600">
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

          <DesktopCategoryNav groups={groups} />

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <a
              href={homeHref}
              className="hidden min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-100 sm:flex xl:hidden"
            >
              <HugeIcon icon={Home01Icon} className="size-4" />
              Home
            </a>
            <button
              ref={browseButtonRef}
              type="button"
              onClick={() => onBrowseChange(true)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-800 transition hover:border-violet-300 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100 xl:hidden"
            >
              <HugeIcon icon={Menu01Icon} className="size-4" />
              Browse
            </button>
            <button
              type="button"
              onClick={onRestoreOriginal}
              className="flex size-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-100 xl:w-auto xl:px-3"
              title="Show the original site until this page reloads"
              aria-label="Show original site"
            >
              <HugeIcon icon={EyeIcon} className="size-4" />
              <span className="hidden xl:inline">Original site</span>
            </button>
          </div>
        </div>
      </header>

      <BrowseDrawer
        groups={groups}
        open={browseOpen}
        onClose={() => onBrowseChange(false)}
        returnFocusRef={browseButtonRef}
      />
    </>
  )
}

function DesktopCategoryNav({ groups }: { groups: CategoryGroup[] }) {
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([])
  const menuRefs = useRef<Array<HTMLElement | null>>([])

  useEffect(() => {
    if (openGroupIndex === null) return
    const nav = navRef.current
    if (!nav) return
    const root = nav.getRootNode()

    const closeWhenClickingElsewhere = (event: Event) => {
      if (event.target instanceof Node && !nav.contains(event.target)) {
        setOpenGroupIndex(null)
      }
    }

    root.addEventListener('pointerdown', closeWhenClickingElsewhere)
    return () => {
      root.removeEventListener('pointerdown', closeWhenClickingElsewhere)
    }
  }, [openGroupIndex])

  function focusFirstCategory(groupIndex: number) {
    window.requestAnimationFrame(() => {
      menuRefs.current[groupIndex]
        ?.querySelector<HTMLAnchorElement>('a[href]')
        ?.focus()
    })
  }

  return (
    <nav
      ref={navRef}
      aria-label="Catalog categories"
      className="hidden shrink-0 items-center gap-0.5 xl:flex"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget
        if (
          nextTarget instanceof Node &&
          event.currentTarget.contains(nextTarget)
        )
          return
        setOpenGroupIndex(null)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || openGroupIndex === null) return
        event.preventDefault()
        const trigger = triggerRefs.current[openGroupIndex]
        setOpenGroupIndex(null)
        trigger?.focus()
      }}
    >
      {groups.map((group, groupIndex) => {
        const open = openGroupIndex === groupIndex
        const menuId = `icc-lens-category-menu-${groupIndex}`
        const alignment =
          groupIndex === 0
            ? 'left-0'
            : groupIndex === groups.length - 1
              ? 'right-0'
              : 'left-1/2 -translate-x-1/2'

        return (
          <div key={group.name} className="relative">
            <button
              ref={(element) => {
                triggerRefs.current[groupIndex] = element
              }}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={() => {
                setOpenGroupIndex((current) =>
                  current === groupIndex ? null : groupIndex,
                )
              }}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowDown') return
                event.preventDefault()
                setOpenGroupIndex(groupIndex)
                focusFirstCategory(groupIndex)
              }}
              className={`flex min-h-11 items-center gap-1 rounded-xl px-2.5 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-violet-100 ${
                open
                  ? 'bg-violet-50 text-violet-800'
                  : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
              }`}
            >
              <span>{group.name}</span>
              <HugeIcon
                icon={ArrowDown01Icon}
                className={`size-3.5 transition-transform motion-reduce:transition-none ${
                  open ? 'rotate-180 text-violet-700' : 'text-zinc-500'
                }`}
              />
            </button>

            {open ? (
              <section
                ref={(element) => {
                  menuRefs.current[groupIndex] = element
                }}
                id={menuId}
                aria-label={`${group.name} categories`}
                className={`absolute top-[calc(100%+0.5rem)] z-40 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_44px_rgba(24,24,27,0.16)] ${alignment}`}
              >
                <div className="flex items-baseline justify-between gap-4 border-b border-zinc-200 px-4 py-3">
                  <strong className="text-sm font-extrabold text-zinc-950">
                    {group.name}
                  </strong>
                  <span className="text-xs font-semibold tabular-nums text-zinc-600">
                    {group.categories.length}{' '}
                    {group.categories.length === 1 ? 'category' : 'categories'}
                  </span>
                </div>
                <ul className="max-h-[min(34rem,70vh)] overflow-y-auto p-2">
                  {group.categories.map((category) => (
                    <li key={category.id}>
                      <a
                        href={category.href}
                        onClick={() => setOpenGroupIndex(null)}
                        className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-violet-950 transition hover:bg-violet-50 hover:text-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-100"
                      >
                        <span>{category.name}</span>
                        {category.count === null ? null : (
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-zinc-600">
                            {category.count.toLocaleString()}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}

function BrowseDrawer({
  groups,
  open,
  onClose,
  returnFocusRef,
}: {
  groups: CategoryGroup[]
  open: boolean
  onClose(): void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)

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
      className="fixed inset-0 z-[80] overflow-y-auto bg-zinc-950/65 p-3 backdrop-blur-sm sm:p-6 lg:p-10"
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
        className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start justify-between gap-6 border-b border-zinc-200 px-5 py-5 sm:px-7">
          <div>
            <h2
              id="icc-lens-browse-title"
              className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900 sm:text-2xl"
            >
              Browse the full library
            </h2>
            <p className="mt-2 text-sm font-medium text-zinc-600">
              {groups.reduce(
                (count, group) => count + group.categories.length,
                0,
              )}{' '}
              categories, organized exactly as the server provides them.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-zinc-300 text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-100"
            aria-label="Close category browser"
          >
            <HugeIcon icon={Cancel01Icon} className="size-5" />
          </button>
        </div>

        <div className="grid gap-px bg-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <section key={group.name} className="bg-white p-5 sm:p-6">
              <h3 className="text-sm font-bold tracking-[-0.01em] text-zinc-900">
                {group.name}
              </h3>
              <ul className="mt-3 space-y-1">
                {group.categories.map((category) => (
                  <li key={category.id}>
                    <a
                      href={category.href}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-violet-950 transition hover:bg-violet-50 hover:text-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-100"
                    >
                      <span>{category.name}</span>
                      {category.count === null ? null : (
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-zinc-600">
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
