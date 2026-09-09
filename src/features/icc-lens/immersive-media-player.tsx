import {
  Alert02Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  FitToScreenIcon,
  GoBackward10SecIcon,
  GoForward10SecIcon,
  KeyboardIcon,
  Loading03Icon,
  PauseIcon,
  PlayIcon,
  Refresh01Icon,
  VolumeHighIcon,
  VolumeMute01Icon,
} from '@hugeicons/core-free-icons'
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { HugeIcon } from '../../components/ui/huge-icon'
import { SelectMenu } from '../../components/ui/select-menu'
import type { MediaSource } from '../../domain/icc-page'

export interface PlayerProgressUpdate {
  source: MediaSource
  seconds: number
  duration: number
}

export interface ImmersiveMediaPlayerProps {
  context: string
  playRequest: number
  posterHref: string | null
  source: MediaSource
  title: string
  episodes?: MediaSource[]
  currentEpisodeIndex?: number
  initialResumeSeconds?: number
  onProgress?: (update: PlayerProgressUpdate) => void
  onSelectEpisode?: (source: MediaSource, index: number) => void
}

type PlaybackStatus =
  | { kind: 'idle' }
  | { kind: 'buffering' }
  | { kind: 'playing' }
  | { kind: 'paused' }
  | { kind: 'ended' }
  | { kind: 'error'; message: string }

const CONTROLS_TIMEOUT_MS = 3200
const TOAST_TIMEOUT_MS = 1400

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds)
    ? Math.max(0, Math.floor(seconds))
    : 0
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainder = safeSeconds % 60

  return hours > 0
    ? [hours, minutes, remainder]
        .map((part) => String(part).padStart(2, '0'))
        .join(':')
    : [minutes, remainder]
        .map((part) => String(part).padStart(2, '0'))
        .join(':')
}

export function ImmersiveMediaPlayer({
  context,
  playRequest,
  posterHref,
  source,
  title,
  episodes = [],
  currentEpisodeIndex = -1,
  initialResumeSeconds = 0,
  onProgress,
  onSelectEpisode,
}: ImmersiveMediaPlayerProps) {
  const rootRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const launchButtonRef = useRef<HTMLButtonElement>(null)
  const shortcutsCloseRef = useRef<HTMLButtonElement>(null)
  const shortcutReturnFocusRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const previousOverflowRef = useRef<string | null>(null)
  const controlsTimerRef = useRef<number | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const handledPlayRequestRef = useRef(0)
  const resumeAppliedRef = useRef<string | null>(null)
  const initialSourceHrefRef = useRef(source.href)

  const [immersive, setImmersive] = useState(false)
  const [status, setStatus] = useState<PlaybackStatus>({ kind: 'idle' })
  const [controlsVisible, setControlsVisible] = useState(true)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [previousVolume, setPreviousVolume] = useState(1)
  const [liveMessage, setLiveMessage] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [episodeListOpen, setEpisodeListOpen] = useState(false)
  const [drawerSeason, setDrawerSeason] = useState(source.seasonNumber ?? 1)
  const episodeSeasons = useMemo(
    () =>
      [...new Set(episodes.map((episode) => episode.seasonNumber ?? 1))].sort(
        (left, right) => left - right,
      ),
    [episodes],
  )
  const drawerEpisodes = episodes
    .map((episode, index) => ({ episode, index }))
    .filter(({ episode }) => (episode.seasonNumber ?? 1) === drawerSeason)

  const clearControlsTimer = useCallback(() => {
    if (controlsTimerRef.current !== null) {
      window.clearTimeout(controlsTimerRef.current)
      controlsTimerRef.current = null
    }
  }, [])

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
  }, [])

  const scheduleControls = useCallback(() => {
    clearControlsTimer()
    if (!immersive || status.kind !== 'playing' || shortcutsOpen) return

    controlsTimerRef.current = window.setTimeout(() => {
      const activeElement = rootRef.current?.getRootNode()
      const focused =
        typeof ShadowRoot !== 'undefined' && activeElement instanceof ShadowRoot
          ? activeElement.activeElement
          : document.activeElement
      if (
        focused instanceof HTMLElement &&
        focused.closest('[data-player-controls]')
      ) {
        return
      }
      setControlsVisible(false)
    }, CONTROLS_TIMEOUT_MS)
  }, [clearControlsTimer, immersive, shortcutsOpen, status.kind])

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    scheduleControls()
  }, [scheduleControls])

  const announce = useCallback(
    (message: string) => {
      setLiveMessage(message)
      setToast(message)
      revealControls()
      clearToastTimer()
      toastTimerRef.current = window.setTimeout(
        () => setToast(null),
        TOAST_TIMEOUT_MS,
      )
    },
    [clearToastTimer, revealControls],
  )

  const play = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    setStatus({ kind: 'buffering' })
    try {
      await video.play()
      setStatus({ kind: 'playing' })
      announce('Playing')
    } catch {
      setStatus({
        kind: 'error',
        message:
          'The media host did not respond. Retry here or return to the file details to download from ICC.',
      })
    }
  }, [announce])

  const playRef = useRef(play)
  useEffect(() => {
    playRef.current = play
  }, [play])

  const enterPlayer = useCallback(() => {
    const rootNode = rootRef.current?.getRootNode()
    const activeElement =
      typeof ShadowRoot !== 'undefined' && rootNode instanceof ShadowRoot
        ? rootNode.activeElement
        : document.activeElement
    previousFocusRef.current =
      activeElement instanceof HTMLElement
        ? activeElement
        : launchButtonRef.current
    setImmersive(true)
    setControlsVisible(true)
    window.requestAnimationFrame(() => {
      rootRef.current?.focus()
      void play()
    })
  }, [play])

  const exitPlayer = useCallback(() => {
    const video = videoRef.current
    if (video) {
      onProgress?.({
        source,
        seconds: video.currentTime,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
      })
    }
    video?.pause()
    setStatus({ kind: 'paused' })
    setShortcutsOpen(false)
    setImmersive(false)
    clearControlsTimer()
    if (document.fullscreenElement) void document.exitFullscreen()
    window.requestAnimationFrame(() => {
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus()
      } else {
        launchButtonRef.current?.focus()
      }
    })
  }, [clearControlsTimer, onProgress, source])

  const selectEpisode = useCallback(
    (index: number) => {
      const next = episodes[index]
      if (!next || !onSelectEpisode) return
      const video = videoRef.current
      if (video) {
        onProgress?.({
          source,
          seconds: video.currentTime,
          duration: Number.isFinite(video.duration) ? video.duration : 0,
        })
      }
      setEpisodeListOpen(false)
      onSelectEpisode(next, index)
    },
    [episodes, onProgress, onSelectEpisode, source],
  )

  const togglePlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (!immersive) {
      enterPlayer()
      return
    }
    if (status.kind === 'playing' || status.kind === 'buffering') {
      video.pause()
      setStatus({ kind: 'paused' })
      announce('Paused')
    } else {
      void play()
    }
  }, [announce, enterPlayer, immersive, play, status.kind])

  const handlePlaybackSurfaceClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const target = event.target
      if (
        status.kind === 'error' ||
        (target instanceof Element &&
          target.closest(
            'a, button, input, select, textarea, [data-player-controls], [data-player-shortcuts-dialog], aside',
          ))
      ) {
        return
      }

      rootRef.current?.focus()
      togglePlayback()
    },
    [status.kind, togglePlayback],
  )

  const seek = useCallback(
    (seconds: number) => {
      const video = videoRef.current
      if (!video) return
      const endpoint = Number.isFinite(video.duration)
        ? video.duration
        : Number.POSITIVE_INFINITY
      const next = Math.min(endpoint, Math.max(0, video.currentTime + seconds))
      video.currentTime = next
      setCurrentTime(next)
      announce(seconds > 0 ? 'Forward 10 seconds' : 'Back 10 seconds')
    },
    [announce],
  )

  const changeVolume = useCallback(
    (nextVolume: number) => {
      const video = videoRef.current
      const clamped = Math.min(1, Math.max(0, nextVolume))
      if (video) {
        video.volume = clamped
        video.muted = clamped === 0
      }
      setVolume(clamped)
      if (clamped > 0) setPreviousVolume(clamped)
      announce(clamped === 0 ? 'Muted' : `Volume ${Math.round(clamped * 100)}%`)
    },
    [announce],
  )

  const toggleMute = useCallback(() => {
    if (volume === 0) changeVolume(previousVolume || 1)
    else {
      setPreviousVolume(volume)
      changeVolume(0)
    }
  }, [changeVolume, previousVolume, volume])

  const toggleFullscreen = useCallback(async () => {
    const root = rootRef.current
    if (!root) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else {
        if (typeof root.requestFullscreen !== 'function') {
          announce('Fullscreen is unavailable')
          return
        }
        await root.requestFullscreen()
      }
      announce(document.fullscreenElement ? 'Fullscreen' : 'Windowed view')
    } catch {
      announce('Fullscreen is unavailable')
    }
  }, [announce])

  const openShortcuts = useCallback(() => {
    const rootNode = rootRef.current?.getRootNode()
    const activeElement =
      typeof ShadowRoot !== 'undefined' && rootNode instanceof ShadowRoot
        ? rootNode.activeElement
        : document.activeElement
    shortcutReturnFocusRef.current =
      activeElement instanceof HTMLElement ? activeElement : rootRef.current
    clearControlsTimer()
    setControlsVisible(true)
    setShortcutsOpen(true)
  }, [clearControlsTimer])

  const closeShortcuts = useCallback(() => {
    setShortcutsOpen(false)
    window.requestAnimationFrame(() => {
      if (shortcutReturnFocusRef.current?.isConnected) {
        shortcutReturnFocusRef.current.focus()
      } else {
        rootRef.current?.focus()
      }
    })
  }, [])

  const retryPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    rootRef.current?.focus()
    video.load()
    void play()
  }, [play])

  const trapFocus = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return false
      const focusRoot = shortcutsOpen
        ? rootRef.current?.querySelector<HTMLElement>(
            '[data-player-shortcuts-dialog]',
          )
        : rootRef.current
      if (!focusRoot) return false
      const focusable = Array.from(
        focusRoot.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.closest('[inert]'))
      if (!focusable.length) return false

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const shadowRoot = rootRef.current?.getRootNode()
      const active =
        typeof ShadowRoot !== 'undefined' && shadowRoot instanceof ShadowRoot
          ? shadowRoot.activeElement
          : document.activeElement

      if (active === focusRoot || active === rootRef.current) {
        event.preventDefault()
        ;(event.shiftKey ? last : first)?.focus()
        revealControls()
        return true
      }
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last?.focus()
        return true
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first?.focus()
        return true
      }
      return false
    },
    [revealControls, shortcutsOpen],
  )

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (trapFocus(event.nativeEvent)) return
      const target = event.target
      if (
        target instanceof HTMLInputElement &&
        [
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          'End',
          'PageUp',
          'PageDown',
        ].includes(event.key)
      ) {
        return
      }

      if (shortcutsOpen && event.key === 'Escape') {
        event.preventDefault()
        closeShortcuts()
        return
      }
      if (event.key === 'Escape') {
        if (!document.fullscreenElement) exitPlayer()
        return
      }

      const key = event.key.toLowerCase()
      if (
        (key === ' ' && !(target instanceof HTMLButtonElement)) ||
        key === 'k'
      ) {
        event.preventDefault()
        togglePlayback()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        seek(-10)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        seek(10)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        changeVolume(volume + 0.05)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        changeVolume(volume - 0.05)
      } else if (key === 'm') {
        event.preventDefault()
        toggleMute()
      } else if (key === 'f') {
        event.preventDefault()
        void toggleFullscreen()
      } else if (event.key === '?') {
        event.preventDefault()
        openShortcuts()
      }
    },
    [
      changeVolume,
      closeShortcuts,
      exitPlayer,
      openShortcuts,
      seek,
      shortcutsOpen,
      toggleFullscreen,
      toggleMute,
      togglePlayback,
      trapFocus,
      volume,
    ],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(0)
    setDuration(0)
    setStatus({ kind: 'idle' })
    video.load()
    resumeAppliedRef.current = null
    setDrawerSeason(source.seasonNumber ?? 1)
  }, [source.href, source.seasonNumber])

  useEffect(() => {
    if (playRequest === 0 || playRequest <= handledPlayRequestRef.current) {
      return
    }
    handledPlayRequestRef.current = playRequest

    const rootNode = rootRef.current?.getRootNode()
    const activeElement =
      typeof ShadowRoot !== 'undefined' && rootNode instanceof ShadowRoot
        ? rootNode.activeElement
        : document.activeElement
    previousFocusRef.current =
      activeElement instanceof HTMLElement
        ? activeElement
        : launchButtonRef.current
    setImmersive(true)
    setControlsVisible(true)
    window.requestAnimationFrame(() => {
      rootRef.current?.focus()
      void playRef.current()
    })
  }, [playRequest])

  useEffect(() => {
    if (!immersive) return
    previousOverflowRef.current = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow =
        previousOverflowRef.current ?? ''
      previousOverflowRef.current = null
    }
  }, [immersive])

  useEffect(() => {
    if (!immersive) return
    scheduleControls()
  }, [immersive, scheduleControls, status.kind])

  useEffect(() => {
    if (!shortcutsOpen) return
    window.requestAnimationFrame(() => shortcutsCloseRef.current?.focus())
  }, [shortcutsOpen])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === rootRef.current)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(
    () => () => {
      clearControlsTimer()
      clearToastTimer()
    },
    [clearControlsTimer, clearToastTimer],
  )

  const hasKnownDuration = Number.isFinite(duration) && duration > 0
  const remaining = hasKnownDuration
    ? Math.max(0, duration - currentTime)
    : null
  const isPlaying = status.kind === 'playing' || status.kind === 'buffering'
  const playerLabel = `${title}${context ? `, ${context}` : ''}`

  return (
    <section
      ref={rootRef}
      tabIndex={immersive ? -1 : undefined}
      role={immersive ? 'dialog' : undefined}
      aria-modal={immersive ? true : undefined}
      aria-label={immersive ? `Playing ${playerLabel}` : undefined}
      onKeyDown={immersive ? handleKeyDown : undefined}
      onClick={immersive ? handlePlaybackSurfaceClick : undefined}
      onMouseMove={immersive ? revealControls : undefined}
      onPointerDown={immersive ? revealControls : undefined}
      onFocusCapture={immersive ? revealControls : undefined}
      className={
        immersive
          ? 'fixed inset-0 z-[2147483647] h-dvh overflow-hidden bg-player-backdrop text-player-white outline-none'
          : 'relative aspect-video overflow-hidden rounded-2xl bg-player-panel'
      }
    >
      <div
        inert={shortcutsOpen ? true : undefined}
        className={immersive ? 'relative h-full' : 'relative aspect-video'}
      >
        <video
          ref={videoRef}
          key={source.href}
          preload="metadata"
          poster={posterHref ?? undefined}
          aria-label={playerLabel}
          className={`h-full w-full bg-player-backdrop ${immersive ? 'cursor-pointer object-contain' : 'object-cover opacity-30 blur-sm'}`}
          onLoadedMetadata={(event) => {
            setDuration(event.currentTarget.duration)
            setVolume(
              event.currentTarget.muted ? 0 : event.currentTarget.volume,
            )
            if (
              resumeAppliedRef.current !== source.href &&
              source.href === initialSourceHrefRef.current &&
              initialResumeSeconds > 0
            ) {
              const endpoint = Number.isFinite(event.currentTarget.duration)
                ? Math.max(0, event.currentTarget.duration - 1)
                : initialResumeSeconds
              event.currentTarget.currentTime = Math.min(
                endpoint,
                initialResumeSeconds,
              )
              setCurrentTime(event.currentTarget.currentTime)
              resumeAppliedRef.current = source.href
            }
          }}
          onDurationChange={(event) =>
            setDuration(event.currentTarget.duration)
          }
          onTimeUpdate={(event) => {
            const seconds = event.currentTarget.currentTime
            const mediaDuration = Number.isFinite(event.currentTarget.duration)
              ? event.currentTarget.duration
              : 0
            setCurrentTime(seconds)
            onProgress?.({ source, seconds, duration: mediaDuration })
          }}
          onPlay={() => {
            setStatus({ kind: 'playing' })
            setToast(null)
          }}
          onPause={(event) => {
            if (!event.currentTarget.ended) setStatus({ kind: 'paused' })
          }}
          onWaiting={() => setStatus({ kind: 'buffering' })}
          onStalled={() => setStatus({ kind: 'buffering' })}
          onCanPlay={(event) =>
            setStatus({
              kind: event.currentTarget.paused ? 'paused' : 'playing',
            })
          }
          onEnded={() => setStatus({ kind: 'ended' })}
          onError={() =>
            setStatus({
              kind: 'error',
              message:
                'The media host did not respond. Retry here or return to the file details to download from ICC.',
            })
          }
        >
          <source src={source.href} type={source.mediaType ?? undefined} />
          Your browser cannot play this media. Use the download action below.
        </video>

        {!immersive ? (
          <div className="absolute inset-0 grid place-items-center">
            <button
              ref={launchButtonRef}
              type="button"
              onClick={enterPlayer}
              className="group grid size-16 place-items-center rounded-full bg-player text-action-foreground shadow-[0_12px_34px_var(--player-accent)] transition hover:scale-105 hover:bg-player-hover active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-player"
              aria-label={`Play ${title}`}
            >
              <HugeIcon icon={PlayIcon} className="ml-1 size-7" />
            </button>
          </div>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-player-black-90 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-player-black to-player-black-80 to-transparent" />

            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-7 lg:p-10">
              <header
                data-player-controls
                className={`flex items-start justify-between gap-4 transition-opacity duration-300 motion-reduce:transition-none ${
                  controlsVisible
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                  <button
                    type="button"
                    onClick={exitPlayer}
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-player-black-45 text-player-white transition hover:bg-player-white hover:text-player-black focus:outline-none focus:ring-4 focus:ring-player"
                    aria-label="Exit player"
                  >
                    <HugeIcon icon={ArrowLeft02Icon} className="size-6" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-medium tracking-[-0.02em] sm:text-xl">
                      {title}
                    </h2>
                    <p className="mt-1 truncate text-xs font-semibold text-player-white-70 sm:text-sm">
                      {context}
                    </p>
                  </div>
                </div>
                {episodes.length > 1 ? (
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={currentEpisodeIndex <= 0}
                      onClick={() => selectEpisode(currentEpisodeIndex - 1)}
                      className="grid size-11 place-items-center rounded-full bg-player-black-45 text-player-white transition hover:bg-player-white hover:text-player-black disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-player"
                      aria-label="Previous episode"
                    >
                      <HugeIcon icon={ArrowLeft02Icon} className="size-5" />
                    </button>
                    <button
                      type="button"
                      disabled={
                        currentEpisodeIndex < 0 ||
                        currentEpisodeIndex >= episodes.length - 1
                      }
                      onClick={() => selectEpisode(currentEpisodeIndex + 1)}
                      className="grid size-11 place-items-center rounded-full bg-player-black-45 text-player-white transition hover:bg-player-white hover:text-player-black disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-player"
                      aria-label="Next episode"
                    >
                      <HugeIcon icon={ArrowRight02Icon} className="size-5" />
                    </button>
                  </div>
                ) : (
                  <span className="hidden rounded-full bg-player-black-50 px-3 py-1.5 text-xs font-bold text-player-white-70 sm:inline-flex">
                    ICC playback
                  </span>
                )}
              </header>

              <div className="pointer-events-none grid place-items-center">
                {status.kind === 'buffering' ? (
                  <div className="pointer-events-auto rounded-2xl bg-player-black-75 px-6 py-5 text-center shadow-[0_20px_60px_var(--player-shadow-45)]">
                    <HugeIcon
                      icon={Loading03Icon}
                      className="mx-auto size-10 animate-spin text-player motion-reduce:animate-none"
                    />
                    <p className="mt-4 text-base font-bold">
                      Waiting for the ICC server…
                    </p>
                    <p className="mt-1 text-xs font-semibold text-player-white-70">
                      Your place is preserved.
                    </p>
                  </div>
                ) : status.kind === 'error' ? (
                  <div className="pointer-events-auto max-w-sm rounded-2xl bg-player-panel px-6 py-6 text-center shadow-[0_20px_60px_var(--player-shadow-50)]">
                    <HugeIcon
                      icon={Alert02Icon}
                      className="mx-auto size-8 text-danger"
                    />
                    <h2 className="mt-4 text-xl font-bold tracking-[-0.025em]">
                      Playback stopped
                    </h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-player-white-70">
                      {status.message}
                    </p>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <button
                        type="button"
                        onClick={retryPlayback}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-player-white px-5 text-sm font-bold text-player-black transition hover:bg-player-white-70 focus:outline-none focus:ring-4 focus:ring-player"
                      >
                        <HugeIcon icon={Refresh01Icon} className="size-4" />
                        Try again
                      </button>
                      <button
                        type="button"
                        onClick={exitPlayer}
                        className="min-h-11 rounded-xl border border-player-white/20 px-5 text-sm font-bold text-player-white transition hover:bg-player-white/10 focus:outline-none focus:ring-4 focus:ring-player"
                      >
                        Exit to file details
                      </button>
                    </div>
                  </div>
                ) : !isPlaying ? (
                  <button
                    type="button"
                    onClick={() => {
                      rootRef.current?.focus()
                      togglePlayback()
                    }}
                    className="pointer-events-auto grid size-20 place-items-center rounded-full bg-player text-action-foreground shadow-[0_16px_48px_var(--player-accent)] transition hover:bg-player-hover focus:outline-none focus:ring-4 focus:ring-player motion-reduce:transform-none"
                    aria-label={status.kind === 'ended' ? 'Play again' : 'Play'}
                  >
                    <HugeIcon icon={PlayIcon} className="ml-1 size-9" />
                  </button>
                ) : null}
              </div>

              <div
                data-player-controls
                className={`transition-opacity duration-300 motion-reduce:transition-none ${
                  controlsVisible
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0'
                }`}
              >
                {toast ? (
                  <div className="mb-4 w-fit rounded-xl bg-player-black-75 px-4 py-2 text-sm font-bold text-player-white">
                    {toast}
                  </div>
                ) : null}
                <label htmlFor="icc-player-progress" className="sr-only">
                  Playback position
                </label>
                <input
                  id="icc-player-progress"
                  type="range"
                  min={0}
                  max={hasKnownDuration ? duration : 1}
                  step={0.1}
                  value={hasKnownDuration ? Math.min(currentTime, duration) : 0}
                  disabled={!hasKnownDuration}
                  aria-valuetext={
                    hasKnownDuration
                      ? `${formatTime(currentTime)} of ${formatTime(duration)}`
                      : `${formatTime(currentTime)} elapsed; duration unavailable`
                  }
                  onChange={(event) => {
                    const next = Number(event.currentTarget.value)
                    if (videoRef.current) videoRef.current.currentTime = next
                    setCurrentTime(next)
                    announce(`Position ${formatTime(next)}`)
                  }}
                  className="h-2 w-full cursor-pointer accent-player focus:outline-none focus:ring-4 focus:ring-player disabled:cursor-default disabled:opacity-60"
                />

                <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="grid size-12 place-items-center rounded-full bg-player text-action-foreground transition hover:bg-player-hover focus:outline-none focus:ring-4 focus:ring-player"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    <HugeIcon
                      icon={isPlaying ? PauseIcon : PlayIcon}
                      className={isPlaying ? 'size-6' : 'ml-0.5 size-6'}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => seek(-10)}
                    className="grid size-11 place-items-center rounded-xl bg-player-white/10 text-player-white transition hover:bg-player-white/20 focus:outline-none focus:ring-4 focus:ring-player"
                    aria-label="Rewind 10 seconds"
                  >
                    <HugeIcon icon={GoBackward10SecIcon} className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => seek(10)}
                    className="grid size-11 place-items-center rounded-xl bg-player-white/10 text-player-white transition hover:bg-player-white/20 focus:outline-none focus:ring-4 focus:ring-player"
                    aria-label="Forward 10 seconds"
                  >
                    <HugeIcon icon={GoForward10SecIcon} className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="grid size-11 place-items-center rounded-xl text-player-white transition hover:bg-player-white/10 focus:outline-none focus:ring-4 focus:ring-player"
                    aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                  >
                    <HugeIcon
                      icon={volume === 0 ? VolumeMute01Icon : VolumeHighIcon}
                      className="size-6"
                    />
                  </button>
                  <label htmlFor="icc-player-volume" className="sr-only">
                    Volume
                  </label>
                  <input
                    id="icc-player-volume"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(event) =>
                      changeVolume(Number(event.currentTarget.value))
                    }
                    className="hidden h-2 w-24 cursor-pointer accent-player focus:outline-none focus:ring-4 focus:ring-player sm:block"
                  />
                  <span className="ml-1 text-xs font-bold tabular-nums text-player-white sm:text-sm">
                    {formatTime(currentTime)}
                    {remaining === null ? '' : ` · −${formatTime(remaining)}`}
                  </span>

                  <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    {episodes.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setEpisodeListOpen((open) => !open)}
                          className="grid size-11 place-items-center rounded-xl text-player-white transition hover:bg-player-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-player"
                          aria-expanded={episodeListOpen}
                          aria-label="Open episode list"
                        >
                          <HugeIcon icon={KeyboardIcon} className="size-5" />
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={openShortcuts}
                      className="hidden min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-player-white-70 transition hover:bg-player-white/10 hover:text-player-white focus:outline-none focus:ring-4 focus:ring-player sm:inline-flex"
                      aria-label="Show keyboard shortcuts"
                    >
                      <HugeIcon icon={KeyboardIcon} className="size-5" />
                      <span>Shortcuts</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleFullscreen()}
                      className="grid size-11 place-items-center rounded-xl text-player-white transition hover:bg-player-white/10 focus:outline-none focus:ring-4 focus:ring-player"
                      aria-label={
                        isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                      }
                    >
                      <HugeIcon icon={FitToScreenIcon} className="size-6" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 hidden text-xs font-bold text-player-white-70 sm:block">
                  Space play/pause · ←/→ seek · ↑/↓ volume · M mute · F
                  fullscreen · ? shortcuts
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {immersive && episodeListOpen ? (
        <>
          <button
            type="button"
            aria-label="Dismiss episode list"
            onClick={() => setEpisodeListOpen(false)}
            className="absolute inset-0 z-20 bg-player-black-40"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Episodes"
            className="absolute inset-y-0 right-0 z-30 flex w-[min(26.25rem,92vw)] flex-col overflow-hidden border-l border-player-white/10 bg-player-panel/96 p-5 text-player-white shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-['Space_Grotesk_Variable'] text-2xl font-medium">
                  Episodes
                </h3>
                <p className="mt-1 text-sm font-semibold text-player-white-70">
                  {title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEpisodeListOpen(false)}
                aria-label="Close episode list"
                className="grid size-11 place-items-center rounded-lg border border-player-white/10 bg-player-white/5 text-player-white-70 hover:bg-player-white/10 hover:text-player-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-player"
              >
                <HugeIcon icon={Cancel01Icon} className="size-5" />
              </button>
            </div>
            {episodeSeasons.length > 1 ? (
              <SelectMenu
                ariaLabel="Select season"
                className="mt-4 w-full"
                options={episodeSeasons.map((season) => ({
                  value: String(season),
                  label: `Season ${season}`,
                }))}
                tone="player"
                value={String(drawerSeason)}
                onValueChange={(value) => setDrawerSeason(Number(value))}
              />
            ) : null}
            <ol className="mt-5 flex-1 divide-y divide-player-white/10 overflow-y-auto border-y border-player-white/10">
              {drawerEpisodes.map(({ episode, index }) => (
                <li
                  key={episode.href}
                  className={
                    index === currentEpisodeIndex
                      ? 'bg-player-white/[0.07]'
                      : 'hover:bg-player-white/[0.045]'
                  }
                >
                  <button
                    type="button"
                    onClick={() => selectEpisode(index)}
                    aria-current={
                      index === currentEpisodeIndex ? 'true' : undefined
                    }
                    className="grid min-h-20 w-full min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 px-1 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player sm:grid-cols-[8rem_minmax(0,1fr)] sm:px-3"
                  >
                    <span className="relative aspect-video overflow-hidden rounded-md bg-player-white/5">
                      {posterHref ? (
                        <img
                          src={posterHref}
                          alt=""
                          className="size-full object-cover opacity-75"
                        />
                      ) : null}
                      <span className="absolute inset-0 grid place-items-center bg-player-black-25">
                        <span className="grid size-8 place-items-center rounded-full border border-player-white/70 bg-player-black-35">
                          <HugeIcon icon={PlayIcon} className="size-4" />
                        </span>
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-player-white-90">
                        Episode{' '}
                        {String(episode.episodeNumber ?? index + 1).padStart(
                          2,
                          '0',
                        )}
                        {index === currentEpisodeIndex ? ' · Playing' : ''}
                      </span>
                      <span className="mt-1 block text-xs text-player-white-55">
                        Season {episode.seasonNumber ?? drawerSeason}
                        {episode.size ? ` · ${episode.size}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </>
      ) : null}

      <div className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </div>

      {immersive && shortcutsOpen ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-player-black-70 p-4">
          <section
            data-player-shortcuts-dialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="icc-player-shortcuts-title"
            className="w-full max-w-lg rounded-2xl bg-player-panel p-5 text-player-white shadow-[0_28px_80px_var(--player-shadow-50)] sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2
                  id="icc-player-shortcuts-title"
                  className="text-xl font-medium tracking-[-0.02em] sm:text-2xl"
                >
                  Keyboard controls
                </h2>
                <p className="mt-2 text-sm font-semibold text-player-white-70">
                  Everything needed without reaching for the mouse.
                </p>
              </div>
              <button
                ref={shortcutsCloseRef}
                type="button"
                onClick={closeShortcuts}
                className="grid size-11 shrink-0 place-items-center rounded-xl text-player-white-70 transition hover:bg-player-white/10 hover:text-player-white focus:outline-none focus:ring-4 focus:ring-player"
                aria-label="Close keyboard shortcuts"
              >
                <HugeIcon icon={Cancel01Icon} className="size-6" />
              </button>
            </div>

            <dl className="mt-6 divide-y divide-white/10">
              <ShortcutRow action="Play or pause" keys="Space / K" />
              <ShortcutRow action="Seek 10 seconds" keys="← / →" />
              <ShortcutRow action="Change volume" keys="↑ / ↓" />
              <ShortcutRow action="Mute or unmute" keys="M" />
              <ShortcutRow action="Enter or exit fullscreen" keys="F" />
              <ShortcutRow
                action="Close this panel or exit player"
                keys="Esc"
              />
            </dl>
          </section>
        </div>
      ) : null}
    </section>
  )
}

function ShortcutRow({ action, keys }: { action: string; keys: string }) {
  return (
    <div className="flex items-center justify-between gap-5 py-3">
      <dt className="text-sm font-semibold text-player-white">{action}</dt>
      <dd>
        <kbd className="inline-flex min-w-10 justify-center rounded-lg border border-player-white/15 bg-player-white/10 px-2.5 py-1.5 text-xs font-bold text-player-white shadow-sm">
          {keys}
        </kbd>
      </dd>
    </div>
  )
}
