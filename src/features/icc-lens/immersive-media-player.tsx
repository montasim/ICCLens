import {
  Alert02Icon,
  ArrowLeft02Icon,
  Cancel01Icon,
  Download04Icon,
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
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { HugeIcon } from '../../components/ui/huge-icon'
import type { MediaSource } from '../../domain/icc-page'

interface ImmersiveMediaPlayerProps {
  context: string
  playRequest: number
  posterHref: string | null
  source: MediaSource
  title: string
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
  }, [clearControlsTimer])

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
  }, [source.href])

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
      onMouseMove={immersive ? revealControls : undefined}
      onPointerDown={immersive ? revealControls : undefined}
      onFocusCapture={immersive ? revealControls : undefined}
      className={
        immersive
          ? 'fixed inset-0 z-[2147483647] h-dvh overflow-hidden bg-black text-white outline-none'
          : 'mt-5 overflow-hidden rounded-2xl bg-zinc-950 shadow-[0_22px_54px_rgba(24,24,27,0.18)]'
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
          className="h-full w-full bg-black object-contain"
          onClick={immersive ? revealControls : undefined}
          onLoadedMetadata={(event) => {
            setDuration(event.currentTarget.duration)
            setVolume(
              event.currentTarget.muted ? 0 : event.currentTarget.volume,
            )
          }}
          onDurationChange={(event) =>
            setDuration(event.currentTarget.duration)
          }
          onTimeUpdate={(event) =>
            setCurrentTime(event.currentTarget.currentTime)
          }
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
          <div className="absolute inset-0 grid place-items-center bg-black/5">
            <button
              ref={launchButtonRef}
              type="button"
              onClick={enterPlayer}
              className="grid size-20 place-items-center rounded-full bg-white text-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-violet-400 motion-reduce:transform-none"
              aria-label={`Play ${title}`}
            >
              <HugeIcon icon={PlayIcon} className="ml-1 size-9" />
            </button>
          </div>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/90 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black via-black/80 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-7 lg:p-10">
              <header
                data-player-controls
                className={`flex items-start justify-between gap-4 transition-opacity duration-300 motion-reduce:transition-none ${
                  controlsVisible
                    ? 'opacity-100'
                    : 'pointer-events-none opacity-0'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                  <button
                    type="button"
                    onClick={exitPlayer}
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-black/45 text-white transition hover:bg-white hover:text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-400"
                    aria-label="Exit player"
                  >
                    <HugeIcon icon={ArrowLeft02Icon} className="size-6" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-extrabold tracking-[-0.015em] sm:text-lg">
                      {title}
                    </h2>
                    <p className="mt-1 truncate text-xs font-semibold text-zinc-300 sm:text-sm">
                      {context}
                    </p>
                  </div>
                </div>
              </header>

              <div className="pointer-events-none grid place-items-center">
                {status.kind === 'buffering' ? (
                  <div className="pointer-events-auto rounded-2xl bg-black/75 px-6 py-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                    <HugeIcon
                      icon={Loading03Icon}
                      className="mx-auto size-10 animate-spin text-violet-400 motion-reduce:animate-none"
                    />
                    <p className="mt-4 text-base font-bold">
                      Waiting for the ICC server…
                    </p>
                    <p className="mt-1 text-xs font-semibold text-zinc-200">
                      Your place is preserved.
                    </p>
                  </div>
                ) : status.kind === 'error' ? (
                  <div className="pointer-events-auto max-w-sm rounded-2xl bg-zinc-950 px-6 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.50)]">
                    <HugeIcon
                      icon={Alert02Icon}
                      className="mx-auto size-8 text-red-300"
                    />
                    <h2 className="mt-4 text-lg font-extrabold tracking-[-0.015em] sm:text-xl">
                      Playback stopped
                    </h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-zinc-200">
                      {status.message}
                    </p>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <button
                        type="button"
                        onClick={retryPlayback}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-zinc-900 transition hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-violet-400"
                      >
                        <HugeIcon icon={Refresh01Icon} className="size-4" />
                        Try again
                      </button>
                      <button
                        type="button"
                        onClick={exitPlayer}
                        className="min-h-11 rounded-xl border border-white/20 px-5 text-sm font-bold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-violet-400"
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
                    className="pointer-events-auto grid size-20 place-items-center rounded-full bg-white text-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-violet-400 motion-reduce:transform-none"
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
                    ? 'opacity-100'
                    : 'pointer-events-none opacity-0'
                }`}
              >
                {toast ? (
                  <div className="mb-4 w-fit rounded-xl bg-black/75 px-4 py-2 text-sm font-bold text-white">
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
                  className="h-2 w-full cursor-pointer accent-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-400 disabled:cursor-default disabled:opacity-60"
                />

                <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="grid size-12 place-items-center rounded-full bg-white text-zinc-900 transition hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-violet-400"
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
                    className="grid size-11 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-violet-400"
                    aria-label="Rewind 10 seconds"
                  >
                    <HugeIcon icon={GoBackward10SecIcon} className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => seek(10)}
                    className="grid size-11 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-violet-400"
                    aria-label="Forward 10 seconds"
                  >
                    <HugeIcon icon={GoForward10SecIcon} className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="grid size-11 place-items-center rounded-xl text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-violet-400"
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
                    className="hidden h-2 w-24 cursor-pointer accent-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-400 sm:block"
                  />
                  <span className="ml-1 text-xs font-bold tabular-nums text-zinc-100 sm:text-sm">
                    {formatTime(currentTime)}
                    {remaining === null ? '' : ` · −${formatTime(remaining)}`}
                  </span>

                  <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={openShortcuts}
                      className="hidden min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-zinc-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-4 focus:ring-violet-400 sm:inline-flex"
                      aria-label="Show keyboard shortcuts"
                    >
                      <HugeIcon icon={KeyboardIcon} className="size-5" />
                      <span>Shortcuts</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleFullscreen()}
                      className="grid size-11 place-items-center rounded-xl text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-violet-400"
                      aria-label={
                        isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                      }
                    >
                      <HugeIcon icon={FitToScreenIcon} className="size-6" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 hidden text-xs font-bold text-zinc-300 sm:block">
                  Space play/pause · ←/→ seek · ↑/↓ volume · M mute · F
                  fullscreen · ? shortcuts
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {!immersive ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <strong className="block truncate text-sm font-bold text-white">
              {context}
            </strong>
            {source.size ? (
              <span className="mt-1 block text-xs font-semibold text-zinc-300">
                {source.size}
              </span>
            ) : null}
          </div>
          <a
            href={source.href}
            download
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-300"
          >
            <HugeIcon icon={Download04Icon} className="size-4" />
            Download
          </a>
        </div>
      ) : null}

      <div className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </div>

      {immersive && shortcutsOpen ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/70 p-4">
          <section
            data-player-shortcuts-dialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="icc-player-shortcuts-title"
            className="w-full max-w-lg rounded-2xl bg-zinc-950 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.50)] sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2
                  id="icc-player-shortcuts-title"
                  className="text-xl font-extrabold tracking-[-0.02em] sm:text-2xl"
                >
                  Keyboard controls
                </h2>
                <p className="mt-2 text-sm font-semibold text-zinc-300">
                  Everything needed without reaching for the mouse.
                </p>
              </div>
              <button
                ref={shortcutsCloseRef}
                type="button"
                onClick={closeShortcuts}
                className="grid size-11 shrink-0 place-items-center rounded-xl text-zinc-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-4 focus:ring-violet-400"
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
      <dt className="text-sm font-semibold text-zinc-100">{action}</dt>
      <dd>
        <kbd className="inline-flex min-w-10 justify-center rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm">
          {keys}
        </kbd>
      </dd>
    </div>
  )
}
