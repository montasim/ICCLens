import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '../../lib/utils'
import { HugeIcon } from './huge-icon'

export interface SelectMenuOption<Value extends string> {
  value: Value
  label: string
}

export interface SelectMenuProps<Value extends string> {
  ariaLabel: string
  className?: string
  options: ReadonlyArray<SelectMenuOption<Value>>
  prefix?: string
  tone?: 'surface' | 'player'
  value: Value
  onValueChange(value: Value): void
}

/**
 * Shared select-only menu. It owns open state, focus movement, dismissal, and
 * equal horizontal spacing so callers only provide values and labels.
 */
export function SelectMenu<Value extends string>({
  ariaLabel,
  className,
  options,
  prefix,
  tone = 'surface',
  value,
  onValueChange,
}: SelectMenuProps<Value>) {
  const [open, setOpen] = useState(false)
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const selectedLabel = options[selectedIndex]?.label ?? ''

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
    return () =>
      rootNode.removeEventListener('pointerdown', closeWhenClickingElsewhere)
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

  const playerTone = tone === 'player'

  return (
    <div
      ref={rootRef}
      className={cn('relative', className)}
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
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openAndFocusSelected())}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          openAndFocusSelected()
        }}
        className={cn(
          'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2',
          playerTone
            ? 'border-player-white/10 bg-player-white/5 text-player-white hover:bg-player-white/10 focus-visible:ring-player'
            : 'border-divider bg-surface text-content hover:border-action hover:bg-surface-muted focus-visible:ring-action',
        )}
      >
        <span className="flex min-w-0 items-baseline gap-2">
          {prefix ? (
            <span
              className={cn(
                'shrink-0 text-xs font-medium',
                playerTone ? 'text-player-white-70' : 'text-content-muted',
              )}
            >
              {prefix}
            </span>
          ) : null}
          <strong className="truncate text-sm font-medium">
            {selectedLabel}
          </strong>
        </span>
        <HugeIcon
          icon={ArrowDown01Icon}
          className={cn(
            'size-4 shrink-0 transition-transform motion-reduce:transition-none',
            playerTone ? 'text-player-white-70' : 'text-content-muted',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            'absolute right-0 top-[calc(100%+0.5rem)] z-50 w-full min-w-44 rounded-xl border p-2 shadow-2xl',
            playerTone
              ? 'border-player-white/10 bg-player-panel text-player-white'
              : 'border-divider bg-surface text-content',
          )}
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
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onValueChange(option.value)
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className={cn(
                  'flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2',
                  selected
                    ? 'bg-action text-action-foreground focus-visible:ring-action-foreground'
                    : playerTone
                      ? 'text-player-white hover:bg-player-white/10 focus:bg-player-white/10 focus-visible:ring-player'
                      : 'text-content hover:bg-surface-muted focus:bg-surface-muted focus-visible:ring-action',
                )}
              >
                <span>{option.label}</span>
                <HugeIcon
                  icon={Tick02Icon}
                  className={cn(
                    'size-4 shrink-0 text-action-foreground',
                    selected ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
