import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  PauseIcon,
  PlayIcon,
} from '@hugeicons/core-free-icons'
import { useCallback, useEffect, useRef, useState } from 'react'

import { HugeIcon } from '../../components/ui/huge-icon'
import type { CatalogItem } from '../../domain/icc-page'
import { CatalogCard } from './catalog-card'

interface FeaturedCarouselProps {
  items: CatalogItem[]
}

const AUTO_ADVANCE_DELAY_MS = 5_000

export function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [visibleSlides, setVisibleSlides] = useState(() =>
    slidesForWidth(typeof window === 'undefined' ? 1280 : window.innerWidth),
  )
  const [activePage, setActivePage] = useState(0)
  const [isInteractionPaused, setIsInteractionPaused] = useState(false)
  const [isUserPaused, setIsUserPaused] = useState(false)
  const [isDocumentHidden, setIsDocumentHidden] = useState(() =>
    typeof document === 'undefined'
      ? false
      : document.visibilityState === 'hidden',
  )
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window === 'undefined' || typeof window.matchMedia !== 'function'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const pageCount = Math.max(1, Math.ceil(items.length / visibleSlides))
  const currentPage = Math.min(activePage, pageCount - 1)

  useEffect(() => {
    const track = trackRef.current
    if (!track || typeof ResizeObserver === 'undefined') return

    const updateVisibleSlides = () => {
      setVisibleSlides(slidesForWidth(track.clientWidth))
    }
    updateVisibleSlides()
    const observer = new ResizeObserver(updateVisibleSlides)
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateVisibility = () => {
      setIsDocumentHidden(document.visibilityState === 'hidden')
    }

    document.addEventListener('visibilitychange', updateVisibility)
    return () =>
      document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const updateMotionPreference = () => {
      setPrefersReducedMotion(motionPreference.matches)
    }

    updateMotionPreference()
    motionPreference.addEventListener('change', updateMotionPreference)
    return () =>
      motionPreference.removeEventListener('change', updateMotionPreference)
  }, [])

  const goToPage = useCallback(
    (requestedPage: number) => {
      const nextPage = (requestedPage + pageCount) % pageCount
      const track = trackRef.current
      if (track) {
        const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth)
        track.scrollTo({
          left: Math.min(nextPage * track.clientWidth, maxScrollLeft),
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        })
      }
      setActivePage(nextPage)
    },
    [pageCount, prefersReducedMotion],
  )

  useEffect(() => {
    if (
      pageCount <= 1 ||
      isInteractionPaused ||
      isUserPaused ||
      isDocumentHidden ||
      prefersReducedMotion
    ) {
      return
    }

    const timer = window.setTimeout(() => {
      goToPage(currentPage + 1)
    }, AUTO_ADVANCE_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [
    currentPage,
    goToPage,
    isDocumentHidden,
    isInteractionPaused,
    isUserPaused,
    pageCount,
    prefersReducedMotion,
  ])

  if (!items.length) return null

  return (
    <section
      aria-labelledby="icc-lens-featured-title"
      aria-roledescription="carousel"
      className="icc-container pt-5"
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsInteractionPaused(false)
        }
      }}
    >
      <h1 id="icc-lens-featured-title" className="sr-only">
        Featured on ICC
      </h1>
      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const track = event.currentTarget
            if (!track.clientWidth) return
            const maxScrollLeft = Math.max(
              0,
              track.scrollWidth - track.clientWidth,
            )
            let nearestPage = 0
            let nearestDistance = Number.POSITIVE_INFINITY

            for (let index = 0; index < pageCount; index += 1) {
              const pageOffset = Math.min(
                index * track.clientWidth,
                maxScrollLeft,
              )
              const distance = Math.abs(track.scrollLeft - pageOffset)
              if (distance < nearestDistance) {
                nearestPage = index
                nearestDistance = distance
              }
            }

            setActivePage(nearestPage)
          }}
        >
          {items.map((item, index) => (
            <div
              key={`${item.action}-${item.id}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${items.length}`}
              className="min-w-0 shrink-0 basis-[86%] snap-start sm:basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)] xl:basis-[calc((100%-4rem)/5)]"
            >
              <CatalogCard
                item={item}
                imageLoading={index < visibleSlides ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {pageCount > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Previous featured titles"
              className="absolute left-0 top-1/2 z-10 grid size-12 -translate-x-1 -translate-y-1/2 place-items-center rounded-r-lg bg-action text-action-foreground shadow-[0_10px_24px_var(--player-shadow-28)] transition hover:bg-action-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/45 sm:-translate-x-2"
            >
              <HugeIcon icon={ArrowLeft02Icon} className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Next featured titles"
              className="absolute right-0 top-1/2 z-10 grid size-12 translate-x-1 -translate-y-1/2 place-items-center rounded-l-lg bg-action text-action-foreground shadow-[0_10px_24px_var(--player-shadow-28)] transition hover:bg-action-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/45 sm:translate-x-2"
            >
              <HugeIcon icon={ArrowRight02Icon} className="size-6" />
            </button>
          </>
        ) : null}
      </div>

      {pageCount > 1 ? (
        <div
          className="mt-2 flex items-center justify-center gap-1"
          aria-label="Featured carousel pages"
        >
          {!prefersReducedMotion ? (
            <button
              type="button"
              onClick={() => setIsUserPaused((isPaused) => !isPaused)}
              aria-label={
                isUserPaused
                  ? 'Resume automatic featured scrolling'
                  : 'Pause automatic featured scrolling'
              }
              className="grid size-11 place-items-center rounded-lg text-xs font-semibold text-content transition hover:bg-surface-muted hover:text-content focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/45"
            >
              <HugeIcon
                icon={isUserPaused ? PlayIcon : PauseIcon}
                className="size-4"
              />
            </button>
          ) : null}
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToPage(index)}
              aria-label={`Go to featured page ${index + 1}`}
              aria-current={currentPage === index ? 'true' : undefined}
              className="grid size-11 place-items-center rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/45"
            >
              <span
                className={`h-2 rounded-full transition-[width,background-color] ${
                  currentPage === index ? 'w-6 bg-action' : 'w-2 bg-divider'
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}

      <span className="sr-only" aria-live="polite">
        Featured page {currentPage + 1} of {pageCount}
      </span>
    </section>
  )
}

function slidesForWidth(width: number): number {
  if (width >= 1280) return 5
  if (width >= 1024) return 4
  if (width >= 768) return 3
  if (width >= 640) return 2
  return 1
}
