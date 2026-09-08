import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useEffect, useId, useRef, useState } from 'react'

import { HugeIcon } from '../../components/ui/huge-icon'
import type { CatalogSort } from '../../domain/catalog-sort'
import type { CatalogPage } from '../../domain/icc-page'

interface CatalogSortMenuProps {
  pageView: CatalogPage['view']
  value: CatalogSort
  onChange(value: CatalogSort): void
}

const SORT_OPTIONS: ReadonlyArray<{
  value: Exclude<CatalogSort, 'server'>
  label: string
}> = [
  { value: 'popularity-desc', label: 'Popularity: High to low' },
  { value: 'popularity-asc', label: 'Popularity: Low to high' },
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'name-desc', label: 'Name: Z–A' },
]

export function CatalogSortMenu({
  pageView,
  value,
  onChange,
}: CatalogSortMenuProps) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const options: ReadonlyArray<{ value: CatalogSort; label: string }> = [
    {
      value: 'server',
      label: pageView === 'latest' ? 'Newest' : 'Default order',
    },
    ...SORT_OPTIONS,
  ]
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const selectedLabel =
    options[selectedIndex]?.label ??
    (pageView === 'latest' ? 'Newest' : 'Default order')

  useEffect(() => {
    if (!open) return
    const root = rootRef.current
    if (!root) return
    const rootNode = root.getRootNode()

    const closeWhenClickingElsewhere = (event: Event) => {
      if (event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false)
      }
    }

    rootNode.addEventListener('pointerdown', closeWhenClickingElsewhere)
    return () => {
      rootNode.removeEventListener('pointerdown', closeWhenClickingElsewhere)
    }
  }, [open])

  function openAndFocusSelected() {
    setOpen(true)
    window.requestAnimationFrame(() =>
      optionRefs.current[selectedIndex]?.focus(),
    )
  }

  function activeOptionIndex(): number {
    const rootNode = rootRef.current?.getRootNode()
    const activeElement =
      rootNode instanceof ShadowRoot
        ? rootNode.activeElement
        : document.activeElement
    return optionRefs.current.findIndex((option) => option === activeElement)
  }

  return (
    <div
      ref={rootRef}
      className="relative flex-1 sm:w-64 sm:flex-none"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget
        if (
          nextTarget instanceof Node &&
          event.currentTarget.contains(nextTarget)
        )
          return
        setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          setOpen(false)
          triggerRef.current?.focus()
          return
        }
        if (
          !open ||
          !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
        )
          return

        event.preventDefault()
        const currentIndex = activeOptionIndex()
        const lastIndex = options.length - 1
        const nextIndex =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? lastIndex
              : event.key === 'ArrowDown'
                ? (Math.max(0, currentIndex) + 1) % options.length
                : (currentIndex <= 0 ? options.length : currentIndex) - 1
        optionRefs.current[nextIndex]?.focus()
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Sort by, ${selectedLabel}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          if (open) {
            setOpen(false)
          } else {
            openAndFocusSelected()
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          openAndFocusSelected()
        }}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-zinc-300 bg-white px-3 text-left transition hover:border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-4 focus:ring-violet-100"
      >
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-xs font-medium text-zinc-600">
            Sort by
          </span>
          <strong className="truncate text-sm font-semibold text-zinc-800">
            {selectedLabel}
          </strong>
        </span>
        <HugeIcon
          icon={ArrowDown01Icon}
          className={`size-4 shrink-0 text-zinc-600 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Sort catalog"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-full min-w-64 rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_18px_44px_rgba(24,24,27,0.16)]"
        >
          {options.map((option, index) => {
            const selected = option.value === value
            return (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element
                }}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition focus:outline-none ${
                  selected
                    ? 'bg-violet-100 text-violet-900 hover:bg-violet-100 focus:bg-violet-200'
                    : 'text-violet-900 hover:bg-violet-50 focus:bg-violet-100'
                }`}
              >
                <span>{option.label}</span>
                <HugeIcon
                  icon={Tick02Icon}
                  className={`size-4 shrink-0 text-violet-700 ${selected ? 'opacity-100' : 'opacity-0'}`}
                />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
