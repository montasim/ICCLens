import '../../src/styles.css'

import {
  CheckmarkBadge02Icon,
  EyeIcon,
  EyeOffIcon,
  LinkSquare01Icon,
  LockKeyIcon,
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

  return (
    <main className="flex min-h-[500px] w-[360px] flex-col overflow-hidden bg-zinc-100 font-sans text-zinc-900 antialiased">
      <header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-5 py-4">
        <img src="/logo.svg" alt="" className="size-10 rounded-xl" />
        <div>
          <strong className="block text-base font-extrabold tracking-[-0.02em]">
            {product.name}
          </strong>
          <span className="mt-1 block text-xs font-semibold text-zinc-600">
            Catalog interface for ICC
          </span>
        </div>
        <span className="ml-auto rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">
          {product.releaseStatus}
        </span>
      </header>

      <section className="bg-violet-700 px-5 py-8 text-white">
        <span className="grid size-11 place-items-center rounded-xl bg-white/15">
          <HugeIcon
            icon={preferences.enabled ? EyeIcon : EyeOffIcon}
            className="size-5"
          />
        </span>
        <h1 className="mt-6 max-w-[11ch] text-4xl font-extrabold leading-[1.02] tracking-[-0.025em] text-balance">
          See the ICC library clearly.
        </h1>
        <p className="mt-5 max-w-[30ch] text-sm font-medium leading-6 text-violet-100">
          ICC Lens reshapes pages already loaded from the local server. It does
          not operate a second catalog.
        </p>
      </section>

      <section className="flex flex-1 flex-col px-5 py-5">
        <div className="flex items-center justify-between gap-5">
          <div>
            <strong className="text-sm font-bold">Use ICC Lens</strong>
            <p className="mt-1 text-xs font-semibold leading-5 text-zinc-600">
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
            className={`relative h-11 w-16 shrink-0 rounded-full border-2 transition focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-wait disabled:opacity-50 ${
              preferences.enabled
                ? 'border-violet-700 bg-violet-700'
                : 'border-zinc-400 bg-zinc-200'
            }`}
          >
            <span
              className={`absolute left-1 top-1/2 size-6 -translate-y-1/2 rounded-full bg-white shadow-[0_3px_9px_rgba(24,24,27,0.24)] transition-transform ${
                preferences.enabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p
          role={state === 'error' ? 'alert' : 'status'}
          className={`mt-4 min-h-5 text-xs font-bold ${
            state === 'error' ? 'text-red-700' : 'text-zinc-600'
          }`}
        >
          {status}
        </p>

        <a
          href={product.homepage}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white shadow-[0_8px_22px_rgba(24,24,27,0.18)] transition hover:-translate-y-0.5 hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 motion-reduce:transform-none"
        >
          <HugeIcon icon={LinkSquare01Icon} className="size-5" />
          Open ICC server
          <HugeIcon icon={CheckmarkBadge02Icon} className="ml-auto size-5" />
        </a>
      </section>

      <footer className="flex items-center gap-2 border-t border-zinc-200 bg-white px-5 py-3 text-xs font-bold leading-5 text-zinc-600">
        <HugeIcon
          icon={LockKeyIcon}
          className="size-4 shrink-0 text-violet-700"
        />
        Exact ICC host only · Preference stored locally · No telemetry
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
