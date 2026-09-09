import {
  Download04Icon,
  Film01Icon,
  FolderDownloadIcon,
  PlayIcon,
} from '@hugeicons/core-free-icons'
import { useMemo, useState } from 'react'
import { createEpisodeDownloadList } from '../../application/episode-download-list'
import { HugeIcon } from '../../components/ui/huge-icon'
import { SelectMenu } from '../../components/ui/select-menu'
import {
  categoryHrefForId,
  PRIMARY_PAGE_CATEGORY_IDS,
} from '../../domain/category-scope'
import type {
  DetailPage,
  MediaSeason,
  MediaSource,
} from '../../domain/icc-page'
import type { WatchHistoryEntry } from '../../domain/preferences'
import { CatalogCard } from './catalog-card'
import {
  ImmersiveMediaPlayer,
  type PlayerProgressUpdate,
} from './immersive-media-player'
import { PageBreadcrumb } from './page-breadcrumb'

export interface DetailViewProps {
  page: DetailPage
  initialResumeSeconds?: number
  resumeEntry?: WatchHistoryEntry
  onPlaybackProgress?: (update: PlayerProgressUpdate) => void
}

export function DetailView({
  page,
  initialResumeSeconds = 0,
  resumeEntry,
  onPlaybackProgress,
}: DetailViewProps) {
  const playable = page.sources.filter((source) => source.playable)
  const initialSource =
    playable.find(
      (source) =>
        source.seasonNumber === resumeEntry?.season &&
        source.episodeNumber === resumeEntry?.episode,
    ) ?? playable[0]
  const [selectedSource, setSelectedSource] = useState<MediaSource | null>(
    initialSource ?? null,
  )
  const [seasonNumber, setSeasonNumber] = useState(
    initialSource?.seasonNumber ?? page.seasons?.[0]?.number ?? 1,
  )
  const [playRequest, setPlayRequest] = useState(0)
  const play = (source: MediaSource) => {
    setSelectedSource(source)
    if (source.seasonNumber != null) {
      setSeasonNumber(source.seasonNumber)
    }
    setPlayRequest((value) => value + 1)
  }
  const selectedIndex = selectedSource
    ? playable.findIndex((source) => source.href === selectedSource.href)
    : -1
  const plot =
    page.metadata.find((entry) => entry.label.toLowerCase() === 'plot')
      ?.value ?? null
  const metadata = page.metadata.filter(
    (entry) => entry.label.toLowerCase() !== 'plot',
  )
  const section =
    page.contentKind === 'series'
      ? 'TV Shows'
      : page.contentKind === 'movie'
        ? 'Movies'
        : 'Files'
  const sectionCategoryId =
    page.contentKind === 'series'
      ? PRIMARY_PAGE_CATEGORY_IDS.series
      : page.contentKind === 'movie'
        ? PRIMARY_PAGE_CATEGORY_IDS.movie
        : PRIMARY_PAGE_CATEGORY_IDS.file
  const sectionHref = categoryHrefForId(page.homeHref, sectionCategoryId)

  return (
    <main id="icc-lens-main" tabIndex={-1} className="pb-16">
      <PageBreadcrumb
        homeHref={page.homeHref}
        section={{ label: section, href: sectionHref }}
        currentLabel={page.title}
      />
      <div className="mx-auto max-w-[1656px] px-4 pb-24 pt-3 sm:px-6 lg:px-8">
        {page.contentKind === 'file' ? (
          <FileDetail page={page} />
        ) : (
          <>
            <section className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:items-start">
              <div className="min-w-0">
                {selectedSource ? (
                  <ImmersiveMediaPlayer
                    title={page.title}
                    context={selectedSource.label}
                    source={selectedSource}
                    posterHref={page.posterHref}
                    playRequest={playRequest}
                    episodes={page.contentKind === 'series' ? playable : []}
                    currentEpisodeIndex={selectedIndex}
                    initialResumeSeconds={
                      resumeEntry?.currentTime ?? initialResumeSeconds
                    }
                    onProgress={onPlaybackProgress}
                    onSelectEpisode={play}
                  />
                ) : (
                  <div className="grid aspect-video place-items-center rounded-2xl bg-player-panel p-6 text-center text-player-white-70">
                    <div>
                      <HugeIcon icon={Film01Icon} className="mx-auto size-10" />
                      <p className="mt-4 text-sm font-bold">
                        ICC did not provide a browser-playable source.
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-content sm:text-3xl">
                    {page.title}
                  </h1>
                  {plot ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-content-secondary">
                      {plot}
                    </p>
                  ) : null}
                </div>
              </div>
              <DetailsPanel
                page={page}
                selectedSource={selectedSource}
                metadata={metadata}
                seasonNumber={seasonNumber}
                onSeasonChange={setSeasonNumber}
              />
            </section>
            {page.contentKind === 'series' ? (
              <SeriesEpisodes
                seasons={page.seasons ?? []}
                sources={page.sources}
                selectedSource={selectedSource}
                seasonNumber={seasonNumber}
                onSeasonChange={setSeasonNumber}
                onSelect={play}
              />
            ) : null}
          </>
        )}
        {page.related.length ? (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-medium tracking-[-0.025em] text-content">
              Related {page.contentKind === 'series' ? 'TV series' : 'on ICC'}
            </h2>
            <div
              className={`mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 ${page.contentKind === 'series' ? 'lg:grid-cols-5' : 'sm:grid-cols-4 lg:grid-cols-6'}`}
            >
              {page.related.map((item) => (
                <CatalogCard key={`${item.action}-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

function DetailsPanel({
  page,
  selectedSource,
  metadata,
  seasonNumber,
  onSeasonChange,
}: {
  page: DetailPage
  selectedSource: MediaSource | null
  metadata: DetailPage['metadata']
  seasonNumber: number
  onSeasonChange(seasonNumber: number): void
}) {
  const seasons = page.seasons ?? []
  const season =
    seasons.find((item) => item.number === seasonNumber) ?? seasons[0]
  const seasonList = useMemo(
    () =>
      season ? createEpisodeDownloadList(page.title, season.episodes) : null,
    [page.title, season],
  )
  const fullList = useMemo(
    () => createEpisodeDownloadList(page.title, page.sources),
    [page.sources, page.title],
  )
  return (
    <aside className="h-fit rounded-2xl border border-divider bg-surface p-6 shadow-sm lg:sticky lg:top-28">
      <h2 className="text-lg font-medium text-content">
        {page.contentKind === 'movie' ? 'File details' : 'Details'}
      </h2>
      {metadata.length ? (
        <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 text-sm">
          {metadata.map((entry) => (
            <div key={entry.label}>
              <dt className="text-xs text-content-muted">{entry.label}</dt>
              <dd className="mt-1 font-bold text-content">{entry.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {selectedSource && page.contentKind === 'movie' ? (
        <>
          <p className="mt-6 text-sm font-bold text-content">
            {selectedSource.label}
          </p>
          <p className="mt-1 text-xs font-semibold text-content">
            {selectedSource.size ?? 'Size not supplied by ICC'}
          </p>
          <a
            href={selectedSource.href}
            download
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-action px-4 text-sm font-medium text-action-foreground hover:bg-action-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/30"
          >
            <HugeIcon icon={Download04Icon} className="size-4" />
            Download file
          </a>
        </>
      ) : null}
      {page.contentKind === 'series' && fullList ? (
        <>
          {selectedSource ? (
            <a
              href={selectedSource.href}
              download
              aria-label="Download"
              className="sr-only"
            >
              Download selected episode
            </a>
          ) : null}
          <p className="mt-6 text-xs font-medium text-content">
            Download selection
          </p>
          {seasons.length ? (
            <SelectMenu
              ariaLabel="Download selection"
              className="mt-2 w-full"
              options={seasons.map((item) => ({
                value: String(item.number),
                label: `${item.label} · ${item.episodes.length} episodes`,
              }))}
              value={String(season?.number ?? seasonNumber)}
              onValueChange={(value) => onSeasonChange(Number(value))}
            />
          ) : null}
          <details className="relative mt-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl bg-action px-4 text-sm font-medium text-action-foreground transition hover:bg-action-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action">
              <HugeIcon icon={Download04Icon} className="size-4" /> Download
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-full space-y-1 rounded-xl border border-divider bg-surface p-1 shadow-[0_14px_35px_var(--player-shadow-18)]">
              {seasonList ? (
                <ListLink
                  list={seasonList}
                  label={`Export ${season?.label ?? 'selected season'}`}
                />
              ) : null}
              <ListLink list={fullList} label="Export full series" />
            </div>
          </details>
          <p className="mt-4 text-xs leading-5 text-content-muted">
            Downloads stay on the local network. Choose individual episodes
            below when needed.
          </p>
        </>
      ) : null}
    </aside>
  )
}

function ListLink({
  list,
  label,
}: {
  list: NonNullable<ReturnType<typeof createEpisodeDownloadList>>
  label: string
}) {
  const linkCountLabel = `Export ${list.linkCount} download ${list.linkCount === 1 ? 'link' : 'links'}`
  return (
    <a
      href={`data:text/plain;charset=utf-8,${encodeURIComponent(list.contents)}`}
      download={list.filename}
      aria-label={label === 'Export full series' ? linkCountLabel : label}
      className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-content hover:bg-surface-muted"
    >
      <HugeIcon icon={Download04Icon} className="size-4" />
      {label}
    </a>
  )
}

function SeriesEpisodes({
  seasons,
  sources,
  selectedSource,
  seasonNumber,
  onSeasonChange,
  onSelect,
}: {
  seasons: MediaSeason[]
  sources: MediaSource[]
  selectedSource: MediaSource | null
  seasonNumber: number
  onSeasonChange(seasonNumber: number): void
  onSelect(source: MediaSource): void
}) {
  const episodes =
    seasons.find((season) => season.number === seasonNumber)?.episodes ??
    sources
  return (
    <section className="mt-12">
      <h2 className="sr-only">
        {episodes.length} {episodes.length === 1 ? 'Episode' : 'Episodes'}
      </h2>
      <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-[-0.025em] text-content">
            Episodes
          </h2>
          <p className="mt-1 text-xs text-content-muted">
            Season {seasonNumber} · {episodes.length} episodes
          </p>
        </div>
        {seasons.length ? (
          <SelectMenu
            ariaLabel="Choose season"
            className="w-full sm:w-44"
            options={seasons.map((season) => ({
              value: String(season.number),
              label: season.label,
            }))}
            value={String(seasonNumber)}
            onValueChange={(value) => onSeasonChange(Number(value))}
          />
        ) : null}
      </div>
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {episodes.map((source, index) => (
          <li
            key={source.href}
            className={`group overflow-hidden rounded-2xl border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 ${
              selectedSource?.href === source.href
                ? 'border-action'
                : 'border-divider'
            }`}
          >
            <button
              type="button"
              disabled={!source.playable}
              onClick={() => onSelect(source)}
              aria-label={
                selectedSource?.href === source.href ? 'Play selected' : 'Play'
              }
              className="relative block aspect-video w-full overflow-hidden bg-player-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {source.playable && selectedSource ? (
                <video
                  src={source.href}
                  muted
                  preload="metadata"
                  className="size-full object-cover opacity-65 transition group-hover:opacity-80"
                />
              ) : null}
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-11 place-items-center rounded-full bg-action text-action-foreground shadow-[0_10px_30px_var(--action-shadow-18)] transition group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                  <HugeIcon icon={PlayIcon} className="ml-0.5 size-5" />
                </span>
              </span>
            </button>
            <div className="flex min-h-16 items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-bold text-content">
                  Episode{' '}
                  {String(source.episodeNumber ?? index + 1).padStart(2, '0')}
                </strong>
                <span className="mt-1 block text-xs text-content-muted">
                  {source.size ?? 'Size not supplied'}
                </span>
              </span>
              <a
                href={source.href}
                download
                aria-label="Download"
                title={`Download ${source.label}`}
                className="grid size-11 shrink-0 place-items-center rounded-lg text-content-muted hover:bg-surface-muted hover:text-action-on-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/30"
              >
                <HugeIcon icon={Download04Icon} className="size-5" />
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function FileDetail({ page }: { page: DetailPage }) {
  const hasDownloads = page.sources.length > 0
  return (
    <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      {page.posterHref ? (
        <img
          src={page.posterHref}
          alt=""
          className="aspect-[3/4] w-full rounded-2xl object-cover shadow-[0_25px_40px_var(--player-shadow-30)]"
        />
      ) : (
        <div className="grid aspect-[3/4] place-items-center rounded-2xl bg-surface-muted">
          <HugeIcon
            icon={FolderDownloadIcon}
            className="size-12 text-content-muted"
          />
        </div>
      )}
      <article className="min-w-0">
        <h2 className="sr-only">This item is a file, not a video</h2>
        <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-content sm:text-3xl">
          {page.title}
        </h1>
        {page.description.length ? (
          <div className="mt-5 max-w-4xl space-y-4 text-sm leading-7 text-content-secondary">
            {page.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}
        {page.metadata.length ? (
          <dl className="mt-8 grid gap-x-8 gap-y-5 border-y border-divider py-6 sm:grid-cols-2 lg:grid-cols-3">
            {page.metadata.map((entry) => (
              <div key={entry.label}>
                <dt className="text-xs text-content-muted">{entry.label}</dt>
                <dd className="mt-1 text-sm font-medium text-content">
                  {entry.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <section className="mt-10" aria-labelledby="file-downloads-heading">
          <div>
            <h2
              id="file-downloads-heading"
              className="font-display text-2xl font-medium tracking-[-0.025em] text-content"
            >
              Downloads
            </h2>
            <p className="mt-1 text-sm text-content-muted">
              {hasDownloads
                ? `${page.sources.length} ${page.sources.length === 1 ? 'file' : 'files'} available`
                : 'No downloadable file is listed on this ICC page.'}
            </p>
          </div>
          {hasDownloads ? (
            <ol
              aria-label="Downloads"
              className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            >
              {page.sources.map((source) => {
                const format = fileFormat(source.href)
                const ariaLabel =
                  page.sources.length === 1
                    ? `Download${source.size ? ` · ${source.size}` : ''}`
                    : `Download ${source.label}${source.size ? ` · ${source.size}` : ''}`
                return (
                  <li
                    key={source.href}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-divider bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0"
                  >
                    <div className="grid aspect-[16/7] place-items-center bg-surface-muted p-6">
                      <span className="grid size-14 place-items-center rounded-2xl bg-action/15 text-action-on-surface transition group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                        <HugeIcon
                          icon={FolderDownloadIcon}
                          className="size-6"
                        />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <span className="min-w-0">
                        <strong className="block truncate text-sm font-medium text-content">
                          {source.label}
                        </strong>
                        <span className="mt-1 block text-xs text-content-muted">
                          {[format, source.size].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <a
                        href={source.href}
                        download
                        aria-label={ariaLabel}
                        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-action px-5 text-sm font-medium text-action-foreground transition hover:bg-action-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/30"
                      >
                        <HugeIcon icon={Download04Icon} className="size-4" />
                        Download
                      </a>
                    </div>
                  </li>
                )
              })}
            </ol>
          ) : (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-divider bg-surface p-5 text-sm leading-6 text-content-secondary">
              <HugeIcon
                icon={FolderDownloadIcon}
                className="mt-0.5 size-5 shrink-0 text-content-muted"
              />
              <p>
                The information above is all that ICC supplied for this item.
              </p>
            </div>
          )}
        </section>
      </article>
    </div>
  )
}

function fileFormat(href: string): string {
  const extension = href
    .split(/[?#]/u)[0]
    ?.split('.')
    .pop()
    ?.trim()
    .toUpperCase()
  return extension && extension.length <= 8 ? extension : 'File'
}
