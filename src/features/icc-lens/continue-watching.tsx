import { Delete02Icon, PlayIcon } from '@hugeicons/core-free-icons'

import { HugeIcon } from '../../components/ui/huge-icon'
import type { CatalogItem } from '../../domain/icc-page'
import {
  normalizePageIdentity,
  type WatchHistoryEntry,
} from '../../domain/preferences'

interface ContinueWatchingProps {
  history: WatchHistoryEntry[]
  items: CatalogItem[]
  onClear(): void
}

export function ContinueWatching({
  history,
  items,
  onClear,
}: ContinueWatchingProps) {
  const matches = history
    .map((entry) => ({
      entry,
      item: items.find(
        (item) => normalizePageIdentity(item.href) === entry.pageIdentity,
      ),
    }))
    .filter((match): match is { entry: WatchHistoryEntry; item: CatalogItem } =>
      Boolean(match.item),
    )

  if (!matches.length) return null

  return (
    <section aria-labelledby="icc-lens-continue-title" className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="icc-lens-continue-title" className="icc-section-title">
            Continue watching
          </h2>
          <p className="mt-2 text-sm text-content-muted">
            Pick up at the exact timestamp you left.
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-content transition hover:bg-surface-muted hover:text-content focus:outline-none focus:ring-4 focus:ring-action/35"
        >
          <HugeIcon icon={Delete02Icon} className="size-4" />
          Clear history
        </button>
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
        {matches.map(({ entry, item }) => {
          const remaining = Math.max(0, entry.duration - entry.currentTime)
          return (
            <article
              key={`${entry.pageIdentity}-${entry.season ?? ''}-${entry.episode ?? ''}`}
              className="min-w-[82%] snap-start sm:min-w-[22rem] lg:min-w-[25rem]"
            >
              <a
                href={item.href}
                aria-label={`Resume ${entry.title} at ${formatTime(entry.currentTime)}`}
                className="group block rounded-xl text-left focus:outline-none focus:ring-4 focus:ring-action/40"
              >
                <span className="relative block aspect-video overflow-hidden rounded-xl bg-player-panel">
                  {item.imageHref ? (
                    <img
                      src={item.imageHref}
                      alt=""
                      className="size-full object-cover opacity-75 transition duration-300 group-hover:scale-[1.025] group-hover:opacity-90 motion-reduce:transform-none"
                    />
                  ) : null}
                  <span className="absolute inset-0 grid place-items-center bg-player-black-10">
                    <span className="grid size-12 place-items-center rounded-full bg-action text-action-foreground shadow-[0_10px_24px_var(--player-shadow-24)] transition group-hover:scale-105 motion-reduce:transform-none">
                      <HugeIcon icon={PlayIcon} className="ml-0.5 size-5" />
                    </span>
                  </span>
                  <progress
                    max={entry.duration}
                    value={entry.currentTime}
                    aria-label={`${formatTime(entry.currentTime)} watched`}
                    className="icc-watch-progress absolute inset-x-0 bottom-0 h-1.5 w-full"
                  />
                </span>
                <span className="mt-3 flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <strong className="block truncate text-base font-semibold text-content">
                      {entry.title}
                    </strong>
                    <span className="mt-1 block truncate text-xs font-semibold text-content">
                      {entry.context}
                    </span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-xs font-semibold tabular-nums text-content">
                    <span className="block">
                      {formatTime(entry.currentTime)}
                    </span>
                    <span className="mt-1 block text-content-muted">
                      −{formatTime(remaining)}
                    </span>
                  </span>
                </span>
              </a>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainder = safeSeconds % 60
  return [hours, minutes, remainder]
    .map((part) => String(part).padStart(2, '0'))
    .join(':')
}
