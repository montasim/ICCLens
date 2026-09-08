import {
  Download04Icon,
  Film01Icon,
  FolderDownloadIcon,
  PlayIcon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons'
import { useMemo, useState } from 'react'

import { createEpisodeDownloadList } from '../../application/episode-download-list'
import { HugeIcon } from '../../components/ui/huge-icon'
import type { DetailPage, MediaSource } from '../../domain/icc-page'
import { CatalogCard } from './catalog-card'
import { ImmersiveMediaPlayer } from './immersive-media-player'
import { PageBreadcrumb } from './page-breadcrumb'

export function DetailView({ page }: { page: DetailPage }) {
  const firstPlayable = page.sources.find((source) => source.playable) ?? null
  const [selectedSource, setSelectedSource] = useState<MediaSource | null>(
    firstPlayable,
  )
  const [playRequest, setPlayRequest] = useState(0)
  const plot = page.metadata.find(
    (entry) => entry.label.toLowerCase() === 'plot',
  )
  const compactMetadata = page.metadata.filter(
    (entry) => entry.label.toLowerCase() !== 'plot',
  )

  const totalSize = useMemo(() => {
    const sizes = page.sources.map((source) => source.size).filter(Boolean)
    return sizes.length === 1 ? (sizes[0] ?? null) : null
  }, [page.sources])

  return (
    <main id="icc-lens-main" tabIndex={-1} className="pb-16">
      <PageBreadcrumb homeHref={page.homeHref} currentLabel={page.title} />

      <section className="mx-auto max-w-[1512px] px-4 pb-6 pt-2 sm:px-6 lg:px-8 lg:pb-8 lg:pt-4">
        {page.contentKind === 'file' ? (
          <FileDetail page={page} totalSize={totalSize} />
        ) : (
          <MediaDetail
            page={page}
            selectedSource={selectedSource}
            playRequest={playRequest}
          />
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-12">
          <div className="order-2 flex flex-col items-center gap-4 lg:order-1 lg:items-start">
            {page.trailerHref ? (
              <a
                href={page.trailerHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-800 transition hover:border-red-300 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-100"
              >
                <HugeIcon icon={YoutubeIcon} className="size-5" />
                Watch trailer
              </a>
            ) : null}
            {page.posterHref ? (
              <img
                src={page.posterHref}
                alt={`Poster for ${page.title}`}
                className="mx-auto aspect-[2/3] w-full max-w-sm rounded-2xl object-cover shadow-[0_18px_44px_rgba(24,24,27,0.14)] lg:mx-0"
              />
            ) : (
              <div className="mx-auto grid aspect-[2/3] w-full max-w-sm place-items-center rounded-2xl bg-violet-100 text-violet-700 lg:mx-0">
                <HugeIcon
                  icon={
                    page.contentKind === 'file'
                      ? FolderDownloadIcon
                      : Film01Icon
                  }
                  className="size-16"
                />
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
              {page.contentKind === 'series'
                ? `${page.sources.length} episodes`
                : page.contentKind === 'file'
                  ? 'Downloadable file'
                  : 'Movie'}
            </span>
            <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-[1.08] tracking-[-0.025em] text-zinc-900 text-balance [overflow-wrap:anywhere] sm:text-4xl">
              {page.title}
            </h1>
            {plot ? (
              <p className="mt-5 max-w-[65ch] text-sm font-medium leading-6 text-zinc-600 sm:text-base sm:leading-7">
                {plot.value}
              </p>
            ) : null}

            {compactMetadata.length ? (
              <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-zinc-200 sm:grid-cols-2">
                {compactMetadata.map((entry, index) => (
                  <div
                    key={entry.label}
                    className={`bg-white px-5 py-4 ${
                      compactMetadata.length % 2 === 1 &&
                      index === compactMetadata.length - 1
                        ? 'sm:col-span-2'
                        : ''
                    }`}
                  >
                    <dt className="text-xs font-semibold text-zinc-600">
                      {entry.label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-semibold leading-6 text-zinc-800">
                      {entry.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>

        {page.contentKind === 'series' ? (
          <EpisodeList
            title={page.title}
            sources={page.sources}
            selectedSource={selectedSource}
            onSelect={(source) => {
              setSelectedSource(source)
              setPlayRequest((request) => request + 1)
            }}
          />
        ) : page.contentKind === 'movie' ? (
          <MovieDownloads sources={page.sources} />
        ) : null}

        {page.related.length ? (
          <section className="mt-16 border-t border-zinc-200 pt-10">
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900 sm:text-2xl">
              Related on ICC
            </h2>
            <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5 xl:grid-cols-6">
              {page.related.map((item) => (
                <CatalogCard key={`${item.action}-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  )
}

function MediaDetail({
  page,
  selectedSource,
  playRequest,
}: {
  page: DetailPage
  selectedSource: MediaSource | null
  playRequest: number
}) {
  if (selectedSource) {
    return (
      <ImmersiveMediaPlayer
        context={selectedSource.label}
        playRequest={playRequest}
        posterHref={page.posterHref}
        source={selectedSource}
        title={page.title}
      />
    )
  }

  return (
    <section className="mt-5 grid aspect-video place-items-center overflow-hidden rounded-2xl bg-zinc-950 px-6 text-center text-zinc-300 shadow-[0_22px_54px_rgba(24,24,27,0.18)]">
      <div>
        <HugeIcon icon={Film01Icon} className="mx-auto size-10" />
        <p className="mt-4 text-sm font-bold">
          ICC did not provide a browser-playable source.
        </p>
      </div>
    </section>
  )
}

function FileDetail({
  page,
  totalSize,
}: {
  page: DetailPage
  totalSize: string | null
}) {
  const source = page.sources[0]
  return (
    <section className="mt-5 overflow-hidden rounded-2xl bg-zinc-950 px-6 py-10 text-white sm:px-10 sm:py-14">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-violet-500 text-white">
          <HugeIcon icon={FolderDownloadIcon} className="size-8" />
        </span>
        <h2 className="mt-6 text-2xl font-extrabold leading-tight tracking-[-0.025em] sm:text-3xl">
          This item is a file, not a video
        </h2>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-zinc-300">
          ICC Lens detected a non-video archive and removed the broken player.
          Download it directly from the server instead.
        </p>
        {source ? (
          <a
            href={source.href}
            download
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-violet-500 px-6 text-sm font-bold text-white shadow-[0_10px_28px_rgba(124,58,237,0.30)] transition hover:-translate-y-0.5 hover:bg-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-300 motion-reduce:transform-none"
          >
            <HugeIcon icon={Download04Icon} className="size-5" />
            Download{totalSize ? ` · ${totalSize}` : ''}
          </a>
        ) : (
          <p className="mt-7 rounded-xl bg-red-950 px-4 py-3 text-sm font-bold text-red-100">
            The server did not provide a download URL for this item.
          </p>
        )}
      </div>
    </section>
  )
}

function EpisodeList({
  title,
  sources,
  selectedSource,
  onSelect,
}: {
  title: string
  sources: MediaSource[]
  selectedSource: MediaSource | null
  onSelect(source: MediaSource): void
}) {
  const downloadList = useMemo(
    () => createEpisodeDownloadList(title, sources),
    [sources, title],
  )
  const exportLabel = `Export ${downloadList?.linkCount ?? 0} download ${
    downloadList?.linkCount === 1 ? 'link' : 'links'
  }`
  const episodeHeading = `${sources.length} ${
    sources.length === 1 ? 'Episode' : 'Episodes'
  }`

  return (
    <section className="mt-16 border-t border-zinc-200 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900 tabular-nums sm:text-2xl">
            {episodeHeading}
          </h2>
          <p className="mt-2 text-sm font-medium text-zinc-600">
            Choose an episode to play, or download it without opening a menu.
          </p>
        </div>
        {downloadList ? (
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(downloadList.contents)}`}
            download={downloadList.filename}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-800 transition hover:border-violet-300 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
          >
            <HugeIcon icon={Download04Icon} className="size-4" />
            {exportLabel}
          </a>
        ) : null}
      </div>

      <ol className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
        {sources.map((source, index) => {
          const active = selectedSource?.href === source.href
          return (
            <li
              key={source.href}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-200 text-sm font-bold tabular-nums text-zinc-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-bold text-zinc-900">
                  {source.label}
                </strong>
                <span className="mt-1 block text-xs font-semibold text-zinc-600">
                  {source.size ?? 'Size not supplied'}
                </span>
              </span>
              <div className="flex gap-2">
                {source.playable ? (
                  <button
                    type="button"
                    onClick={() => onSelect(source)}
                    aria-pressed={active}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-violet-100 ${
                      active
                        ? 'bg-violet-700 text-white'
                        : 'border border-zinc-300 bg-white text-zinc-800 hover:border-violet-300 hover:text-violet-700'
                    }`}
                  >
                    <HugeIcon icon={PlayIcon} className="size-4" />
                    {active ? 'Play selected' : 'Play'}
                  </button>
                ) : null}
                <a
                  href={source.href}
                  download
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-800 transition hover:border-violet-300 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
                >
                  <HugeIcon icon={Download04Icon} className="size-4" />
                  Download
                </a>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function MovieDownloads({ sources }: { sources: MediaSource[] }) {
  if (!sources.length) return null
  return (
    <section className="mt-12 border-t border-zinc-200 pt-8">
      <h2 className="text-lg font-extrabold tracking-[-0.015em] text-zinc-900 sm:text-xl">
        Available file
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {sources.map((source) => (
          <a
            key={source.href}
            href={source.href}
            download
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-800 transition hover:border-violet-300 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
          >
            <HugeIcon icon={Download04Icon} className="size-4" />
            {source.label}
            {source.size ? ` · ${source.size}` : ''}
          </a>
        ))}
      </div>
    </section>
  )
}
