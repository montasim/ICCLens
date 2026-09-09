import {
  ArrowRight01Icon,
  Download04Icon,
  GithubIcon,
  PlayIcon,
  Search01Icon,
  Shield01Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { HugeIcon } from '@/components/huge-icon'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: LandingPage })

const releaseUrl = 'https://github.com/montasim/ICCLens/releases/latest'
const repositoryUrl = 'https://github.com/montasim/ICCLens'

const previews = {
  catalog: {
    src: '/screenshots/catalog.png',
    alt: 'ICC Lens catalog with search, featured media, sorting, and a responsive poster grid',
    caption: 'Poster-first browsing makes the local catalog easier to scan.',
  },
  series: {
    src: '/screenshots/series-detail.png',
    alt: 'ICC Lens series page with a video area, details, season selection, and episode cards',
    caption: 'Series details keep playback and downloads together.',
  },
  player: {
    src: '/screenshots/player.png',
    alt: 'ICC Lens immersive player with playback, seeking, volume, and shortcut controls',
    caption:
      'Playback opens in a focused screening room with complete controls.',
  },
} as const

type PreviewName = keyof typeof previews

function LandingPage() {
  const [activePreview, setActivePreview] = useState<PreviewName>('series')
  const preview = previews[activePreview]

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-xl bg-[#181713] px-4 py-3 text-sm font-medium text-white transition focus:translate-y-0 focus:outline-none focus:ring-4 focus:ring-amber-300/45"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        <section
          id="top"
          className="mx-auto grid max-w-[1656px] gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-24"
        >
          <div className="max-w-[680px]">
            <h1 className="max-w-[13ch] font-display text-5xl font-medium leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              Your local media library, finally easy to see.
            </h1>
            <p className="mt-7 max-w-[60ch] text-base font-medium leading-7 text-[#5e584e] sm:text-lg">
              ICC Lens replaces the legacy ICC pages with a focused Chrome
              experience for browsing, searching, playing, and
              downloading—without sending your activity anywhere else.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="large">
                <a href={releaseUrl}>
                  <HugeIcon icon={Download04Icon} size={18} />
                  Download latest
                </a>
              </Button>
              <Button asChild size="large" variant="outline">
                <a href="#install">See how to install</a>
              </Button>
            </div>
          </div>

          <ProductPreview preview={preview} featured />
        </section>

        <section className="border-y border-[#ded4c1] bg-[#fffaf0]">
          <div className="mx-auto grid max-w-[1656px] divide-y divide-[#ded4c1] px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
            <Fact
              icon={ViewIcon}
              title="One private server"
              description="Runs only on the configured ICC address."
            />
            <Fact
              icon={Shield01Icon}
              title="No telemetry"
              description="Searches and page content stay in your browser."
              middle
            />
            <Fact
              icon={ArrowRight01Icon}
              title="Original page always reachable"
              description="Return to the server UI whenever you need it."
              last
            />
          </div>
        </section>

        <section
          id="experience"
          className="mx-auto max-w-[1656px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <h2 className="max-w-[13ch] font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                One interface from search to screening.
              </h2>
              <p className="mt-5 max-w-[55ch] text-base font-medium leading-7 text-[#665f53]">
                Browse a poster-first catalog, inspect a title, choose an
                episode, and play it without falling back into disconnected
                legacy screens.
              </p>
              <div
                className="mt-8 grid gap-2"
                role="tablist"
                aria-label="Preview ICC Lens surfaces"
              >
                <PreviewTab
                  active={activePreview === 'catalog'}
                  icon={Search01Icon}
                  onClick={() => setActivePreview('catalog')}
                >
                  Browse the catalog
                </PreviewTab>
                <PreviewTab
                  active={activePreview === 'series'}
                  icon={ViewIcon}
                  onClick={() => setActivePreview('series')}
                >
                  Choose a series episode
                </PreviewTab>
                <PreviewTab
                  active={activePreview === 'player'}
                  icon={PlayIcon}
                  onClick={() => setActivePreview('player')}
                >
                  Enter the player
                </PreviewTab>
              </div>
            </div>

            <ProductPreview preview={preview} />
          </div>
        </section>

        <section id="privacy" className="bg-[#12110f] text-white">
          <div className="mx-auto grid max-w-[1656px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
            <div>
              <h2 className="max-w-[13ch] font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                A better view, not another media service.
              </h2>
              <p className="mt-5 max-w-[62ch] text-base font-medium leading-7 text-[#d6d0c6]">
                ICC Lens reads the page already open on your private network and
                renders a clearer interface over it. It does not host the
                catalog, create accounts, upload media, or broaden access to the
                server.
              </p>
            </div>
            <dl className="grid gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-3">
              <PrivacyFact label="Accounts" value="None" />
              <PrivacyFact label="Analytics" value="None" />
              <PrivacyFact label="Remote code" value="None" />
            </dl>
          </div>
        </section>

        <section
          id="install"
          className="mx-auto max-w-[1656px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="grid overflow-hidden rounded-2xl bg-[#fffaf0] shadow-[0_24px_64px_rgba(42,34,22,0.14)] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 sm:p-10 lg:p-14">
              <h2 className="max-w-[15ch] font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
                Download the latest ICC Lens release.
              </h2>
              <p className="mt-5 max-w-[60ch] text-base font-medium leading-7 text-[#665f53]">
                GitHub Releases provides the current Chrome ZIP and checksum.
                This page always points to the latest release instead of
                displaying a version number.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="large">
                  <a href={releaseUrl}>
                    <HugeIcon icon={Download04Icon} size={18} />
                    Download latest
                  </a>
                </Button>
                <Button asChild size="large" variant="outline">
                  <a href={`${repositoryUrl}/releases`}>
                    <HugeIcon icon={GithubIcon} size={18} />
                    View release notes
                  </a>
                </Button>
              </div>
            </div>

            <ol className="grid divide-y divide-[#ded4c1] border-t border-[#ded4c1] bg-[#f1eadc] lg:border-l lg:border-t-0">
              <InstallStep number="01" title="Download and unzip">
                Get the latest Chrome package from GitHub.
              </InstallStep>
              <InstallStep number="02" title="Open Chrome extensions">
                Enable Developer mode in chrome://extensions.
              </InstallStep>
              <InstallStep number="03" title="Load unpacked">
                Choose the unzipped extension folder, then visit ICC.
              </InstallStep>
            </ol>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#ded4c1] bg-[#fffaf0]/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-[1656px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav
          className="hidden items-center gap-7 text-sm font-medium md:flex"
          aria-label="Main navigation"
        >
          <a className="underline-offset-4 hover:underline" href="#experience">
            Experience
          </a>
          <a className="underline-offset-4 hover:underline" href="#privacy">
            Privacy
          </a>
          <a className="underline-offset-4 hover:underline" href="#install">
            Install
          </a>
        </nav>
        <a className={buttonVariants()} href={releaseUrl}>
          <HugeIcon icon={Download04Icon} size={17} />
          Download latest
        </a>
      </div>
    </header>
  )
}

function Brand() {
  return (
    <a
      href="#top"
      aria-label="ICC Lens home"
      className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-300/45"
    >
      <img
        src="/brand/icc-lens.svg"
        alt=""
        className="h-11 w-11"
        width="44"
        height="44"
      />
      <span>
        <strong className="block text-sm font-semibold">ICC Lens</strong>
        <span className="block font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#665f53]">
          Local screening room
        </span>
      </span>
    </a>
  )
}

function ProductPreview({
  preview,
  featured = false,
}: {
  preview: (typeof previews)[PreviewName]
  featured?: boolean
}) {
  return (
    <figure className={cn('self-start', featured && 'relative lg:pl-4')}>
      {featured ? (
        <div className="absolute -inset-4 -z-10 rounded-[28px] bg-amber-400/20 sm:-inset-7" />
      ) : null}
      <div className="overflow-hidden rounded-2xl bg-[#12110f] shadow-[0_28px_80px_rgba(42,34,22,0.24)]">
        {featured ? (
          <div
            className="flex h-11 items-center gap-2 border-b border-white/10 px-4"
            aria-hidden="true"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="ml-3 h-5 flex-1 rounded-md bg-white/10" />
          </div>
        ) : null}
        <img
          src={preview.src}
          alt={preview.alt}
          className="aspect-[16/10] w-full object-cover object-top"
          width="1280"
          height="800"
          fetchPriority={featured ? 'high' : undefined}
        />
      </div>
      {featured ? (
        <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-[#5e584e]">
            {preview.caption}
          </span>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#854d0e]">
            Real extension interface
          </span>
        </figcaption>
      ) : null}
    </figure>
  )
}

function Fact({
  icon,
  title,
  description,
  middle = false,
  last = false,
}: {
  icon: typeof ViewIcon
  title: string
  description: string
  middle?: boolean
  last?: boolean
}) {
  return (
    <div
      className={cn(
        'flex gap-4 py-7',
        middle && 'md:px-8',
        !middle && !last && 'md:pr-8',
        last && 'md:pl-8',
      )}
    >
      <HugeIcon
        icon={icon}
        size={20}
        className="mt-0.5 shrink-0 text-[#854d0e]"
      />
      <p>
        <strong className="block text-sm font-semibold">{title}</strong>
        <span className="mt-1 block text-sm font-medium text-[#665f53]">
          {description}
        </span>
      </p>
    </div>
  )
}

function PreviewTab({
  active,
  icon,
  onClick,
  children,
}: {
  active: boolean
  icon: typeof ViewIcon
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      role="tab"
      aria-selected={active}
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
      className="min-h-14 justify-start px-5 text-left"
    >
      <HugeIcon icon={icon} size={19} />
      {children}
    </Button>
  )
}

function PrivacyFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1d1b17] p-6">
      <dt className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-amber-400">
        {label}
      </dt>
      <dd className="mt-7 font-display text-2xl font-medium">{value}</dd>
    </div>
  )
}

function InstallStep({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-4 p-7 sm:p-8">
      <span className="font-mono text-xs font-medium text-[#854d0e]">
        {number}
      </span>
      <p>
        <strong className="block text-sm font-semibold">{title}</strong>
        <span className="mt-1 block text-sm font-medium text-[#665f53]">
          {children}
        </span>
      </p>
    </li>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#ded4c1] bg-[#fffaf0]">
      <div className="mx-auto flex max-w-[1656px] flex-col gap-5 px-4 py-8 text-sm font-medium text-[#665f53] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>ICC Lens · A clearer interface for one local media server.</p>
        <nav className="flex flex-wrap gap-5" aria-label="Footer navigation">
          <a
            className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
            href={repositoryUrl}
          >
            <HugeIcon icon={GithubIcon} size={17} />
            GitHub
          </a>
          <a
            className="underline-offset-4 hover:underline"
            href={`${repositoryUrl}/blob/main/privacy-policy.md`}
          >
            Privacy
          </a>
          <a
            className="underline-offset-4 hover:underline"
            href={`${repositoryUrl}/issues`}
          >
            Support
          </a>
        </nav>
      </div>
    </footer>
  )
}
