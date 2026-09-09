import '../../src/styles.css'

import {
  CheckmarkBadge02Icon,
  EyeIcon,
  EyeOffIcon,
  LinkSquare01Icon,
  LockKeyIcon,
  Moon02Icon,
  Sun03Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons'
import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { LensPreferencesService } from '../../src/application/preferences'
import { HugeIcon } from '../../src/components/ui/huge-icon'
import {
  DEFAULT_PREFERENCES,
  type LensPreferences,
} from '../../src/domain/preferences'
import { ChromeLensPreferencesAdapter } from '../../src/infrastructure/chrome-preferences'
import { product } from '../../src/product/product'

type PopupState = 'loading' | 'ready' | 'saving' | 'error'

export function Popup({
  service = new LensPreferencesService(new ChromeLensPreferencesAdapter()),
}: {
  service?: LensPreferencesService
}) {
  const [preferences, setPreferences] =
    useState<LensPreferences>(DEFAULT_PREFERENCES)
  const [state, setState] = useState<PopupState>('loading')

  useEffect(() => {
    void service
      .load()
      .then((loaded) => {
        setPreferences(loaded)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [service])

  const status = useMemo(() => {
    if (state === 'loading') return 'Checking local preference…'
    if (state === 'saving') return 'Updating ICC pages…'
    if (state === 'error') return 'Chrome could not save this preference.'
    return preferences.enabled
      ? 'Design A is active on the ICC site.'
      : 'The original ICC interface is active.'
  }, [preferences.enabled, state])

  async function toggle() {
    const next = { enabled: !preferences.enabled }
    setState('saving')
    try {
      setPreferences(await service.save(next))
      setState('ready')
    } catch {
      setState('error')
    }
  }

  async function toggleTheme() {
    const previous = preferences.theme
    const theme = previous === 'light' ? 'dark' : 'light'
    setPreferences((current) => ({ ...current, theme }))
    try {
      await service.saveTheme(theme)
    } catch {
      setPreferences((current) => ({ ...current, theme: previous }))
      setState('error')
    }
  }

  async function clearHistory() {
    setState('saving')
    try {
      await service.clearWatchHistory()
      setState('ready')
    } catch {
      setState('error')
    }
  }

  return (
    <main
      data-theme={preferences.theme}
      className="flex min-h-[500px] w-[360px] flex-col overflow-hidden bg-canvas font-sans text-content antialiased"
    >
      <header className="flex items-center gap-3 border-b border-divider bg-surface px-5 py-4">
        <img src="/logo.svg" alt="" className="size-10 rounded-xl" />
        <div className="min-w-0">
          <strong className="block truncate font-display text-base font-bold leading-none tracking-[-0.035em]">
            ICC <span className="text-action-on-surface">Lens</span>
          </strong>
          <span className="mt-1 block truncate font-mono text-xs uppercase tracking-[0.12em] text-content-muted">
            Local screening room
          </span>
        </div>
        <button
          type="button"
          onClick={() => void toggleTheme()}
          className="ml-auto grid size-[44px] shrink-0 place-items-center rounded-xl border border-divider bg-surface text-content-secondary transition hover:border-action/60 hover:bg-surface-muted hover:text-content focus:outline-none focus:ring-4 focus:ring-action/30"
          aria-label={`Use ${preferences.theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Use ${preferences.theme === 'light' ? 'dark' : 'light'} theme`}
        >
          <HugeIcon
            icon={preferences.theme === 'light' ? Moon02Icon : Sun03Icon}
            className="size-5"
          />
        </button>
      </header>

      <section className="bg-action px-5 py-8 text-action-foreground">
        <span className="grid size-11 place-items-center rounded-xl bg-player-white/15">
          <HugeIcon
            icon={preferences.enabled ? EyeIcon : EyeOffIcon}
            className="size-5"
          />
        </span>
        <h1 className="mt-6 max-w-[11ch] font-display text-4xl font-medium leading-[1.02] tracking-[-0.025em] text-balance">
          See the ICC library clearly.
        </h1>
        <p className="mt-5 max-w-[30ch] text-sm font-medium leading-6">
          ICC Lens reshapes pages already loaded from the local server. It does
          not operate a second catalog.
        </p>
      </section>

      <section className="flex flex-1 flex-col px-5 py-5">
        <div className="flex items-center justify-between gap-5">
          <div>
            <strong className="text-sm font-semibold">Use ICC Lens</strong>
            <p className="mt-1 text-xs font-semibold leading-5 text-content">
              Applies instantly to open ICC tabs.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.enabled}
            aria-label="Use ICC Lens on the ICC site"
            disabled={state === 'loading' || state === 'saving'}
            onClick={() => void toggle()}
            className={`relative h-[44px] w-16 shrink-0 rounded-full border-2 transition focus:outline-none focus:ring-4 focus:ring-action/30 disabled:cursor-wait disabled:opacity-50 ${
              preferences.enabled
                ? 'border-action bg-action'
                : 'border-divider bg-surface-muted'
            }`}
          >
            <span
              className={`absolute left-1 top-1/2 size-6 -translate-y-1/2 rounded-full bg-player-white shadow-[0_3px_9px_var(--player-shadow-18)] transition-transform ${
                preferences.enabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p
          role={state === 'error' ? 'alert' : 'status'}
          className={`mt-4 min-h-5 text-xs font-semibold ${
            state === 'error' ? 'text-danger' : 'text-content-muted'
          }`}
        >
          {status}
        </p>

        <a
          href={product.homepage}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-support px-4 text-sm font-semibold text-support-foreground shadow-[0_8px_22px_var(--player-shadow-18)] transition hover:-translate-y-0.5 hover:bg-support-hover focus:outline-none focus:ring-4 focus:ring-support/30 motion-reduce:transform-none"
        >
          <HugeIcon icon={LinkSquare01Icon} className="size-5" />
          Open ICC server
          <HugeIcon icon={CheckmarkBadge02Icon} className="ml-auto size-5" />
        </a>
        <button
          type="button"
          onClick={() => void clearHistory()}
          className="mt-3 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-divider bg-surface px-4 text-sm font-semibold text-content transition hover:border-action/60 hover:bg-surface-muted hover:text-content focus:outline-none focus:ring-4 focus:ring-action/30"
        >
          <HugeIcon icon={Delete02Icon} className="size-4" />
          Clear Continue Watching
        </button>
      </section>

      <footer className="flex items-center gap-2 border-t border-divider bg-surface px-5 py-3 text-xs font-semibold leading-5 text-content">
        <HugeIcon icon={LockKeyIcon} className="size-4 shrink-0 text-support" />
        Exact ICC host only · Settings and viewing progress stay local · No
        telemetry
      </footer>
    </main>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Popup />
    </StrictMode>,
  )
}
