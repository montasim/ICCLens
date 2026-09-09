import '../../src/styles.css'

import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'

import { IccSiteService } from '../../src/application/icc-site'
import type { IccPageParseResult } from '../../src/domain/icc-page'
import { LensPreferencesService } from '../../src/application/preferences'
import { normalizeEnabled } from '../../src/domain/preferences'
import { FailureNotice } from '../../src/features/icc-lens/failure-notice'
import { LensApp } from '../../src/features/icc-lens/lens-app'
import { IccDomAdapter } from '../../src/infrastructure/icc-dom-adapter'
import {
  ChromeLensPreferencesAdapter,
  LENS_ENABLED_KEY,
  LENS_PREFERENCES_KEY,
  LENS_THEME_KEY,
  LENS_WATCH_HISTORY_KEY,
} from '../../src/infrastructure/chrome-preferences'

interface MountedLens {
  root: Root
  restoreOriginal(): void
  restoreRootTypography(): void
  restoreTitle(): void
}

const DIRECTION_CONTRACT = `
THESIS: ICC Lens turns the server page into a legible catalog and playable media into a focused, keyboard-first screening room.
OWN-WORLD: Warm light/dark surfaces, amber actions, teal utilities, poster-led content, a near-black amber-accented playback plane, precise 12–16px corners, and compact Manrope labels.
STORY: Users identify their library context, scan explicit play/download consequences, open the exact server resource, then control playback without reaching for a mouse.
FIRST VIEWPORT: Catalog pages lead with the compact tool header and server-authored feature rail; active playback becomes an edge-to-edge dark media plane with transport anchored below.
FORM: User-approved Design A catalog plus the immersive media player approved on 2026-08-31.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
`.trim()

export default defineContentScript({
  matches: ['http://10.16.100.244/*'],
  runAt: 'document_idle',
  cssInjectionMode: 'ui',
  noScriptStartedPostMessage: true,

  async main(ctx) {
    const preferences = new LensPreferencesService(
      new ChromeLensPreferencesAdapter(),
    )
    const site = new IccSiteService(
      new IccDomAdapter(document, window.location.href),
    )
    let currentUi: { mount(): void; remove(): void } | null = null

    const removeCurrentUi = () => {
      currentUi?.remove()
      currentUi = null
    }

    const mountForPreference = async (enabled: boolean) => {
      if (!enabled) {
        removeCurrentUi()
        return
      }
      if (currentUi) return

      const result = await readCurrentPageWhenReady(site)
      if (!result.ok) {
        const failureUi = await createShadowRootUi<Root>(ctx, {
          name: 'icc-lens-notice',
          position: 'overlay',
          anchor: 'body',
          isolateEvents: true,
          onMount(container) {
            const mountPoint = document.createElement('div')
            container.append(mountPoint)
            const root = createRoot(mountPoint)
            root.render(<FailureNotice reason={result.reason} />)
            return root
          },
          onRemove(root) {
            root?.unmount()
          },
        })
        currentUi = failureUi
        failureUi.mount()
        return
      }

      let mountedLens: MountedLens | null = null
      const ui = await createShadowRootUi<MountedLens>(ctx, {
        name: 'icc-lens-root',
        position: 'inline',
        anchor: 'body',
        append: 'first',
        isolateEvents: true,
        onMount(container, _shadow, shadowHost) {
          shadowHost.style.display = 'block'
          shadowHost.style.width = '100%'
          const contract = document.createComment(DIRECTION_CONTRACT)
          const mountPoint = document.createElement('div')
          container.append(contract, mountPoint)

          const previousTitle = document.title
          const root = createRoot(mountPoint)
          const restoreRootTypography = isolateRootTypography()
          try {
            flushSync(() => {
              root.render(
                <LensApp
                  initialPage={result.page}
                  logoUrl={chrome.runtime.getURL('logo.svg')}
                  service={site}
                  preferences={preferences}
                  pageHref={window.location.href}
                  onRestoreOriginal={removeCurrentUi}
                />,
              )
            })
          } catch (error) {
            restoreRootTypography()
            throw error
          }
          const restoreOriginal = concealOriginalPage(shadowHost)
          document.title = `${result.page.title} · ICC Lens`
          mountedLens = {
            root,
            restoreOriginal,
            restoreRootTypography,
            restoreTitle: () => {
              document.title = previousTitle
            },
          }
          return mountedLens
        },
        onRemove(lens) {
          const mounted = lens ?? mountedLens
          mounted?.root.unmount()
          mounted?.restoreOriginal()
          mounted?.restoreRootTypography()
          mounted?.restoreTitle()
          mountedLens = null
        },
      })
      currentUi = ui
      ui.mount()
    }

    const storageListener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== 'local') return
      const enabledChange = changes[LENS_ENABLED_KEY]
      const legacyChange = changes[LENS_PREFERENCES_KEY]
      if (enabledChange || legacyChange) {
        const enabled = enabledChange
          ? normalizeEnabled(enabledChange.newValue)
          : normalizeEnabled(
              legacyChange?.newValue &&
                typeof legacyChange.newValue === 'object' &&
                'enabled' in legacyChange.newValue
                ? legacyChange.newValue.enabled
                : undefined,
            )
        void mountForPreference(enabled)
      }
      if (changes[LENS_THEME_KEY] || changes[LENS_WATCH_HISTORY_KEY]) {
        window.dispatchEvent(new Event('icc-lens:preferences-changed'))
      }
    }
    chrome.storage.onChanged.addListener(storageListener)
    ctx.onInvalidated(() => {
      chrome.storage.onChanged.removeListener(storageListener)
      removeCurrentUi()
    })

    try {
      await mountForPreference((await preferences.load()).enabled)
    } catch {
      await mountForPreference(true)
    }
  },
})

const DETAIL_READY_TIMEOUT_MS = 5_000

async function readCurrentPageWhenReady(
  site: IccSiteService,
): Promise<IccPageParseResult> {
  const initial = site.readCurrentPage()
  if (initial.ok || !shouldWaitForDetailContent(initial)) return initial

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: IccPageParseResult) => {
      if (settled) return
      settled = true
      observer.disconnect()
      window.clearTimeout(timeout)
      resolve(result)
    }
    const readAgain = () => {
      const result = site.readCurrentPage()
      if (result.ok) finish(result)
    }
    const observer = new MutationObserver(readAgain)
    const timeout = window.setTimeout(
      () => finish(site.readCurrentPage()),
      DETAIL_READY_TIMEOUT_MS,
    )

    observer.observe(document.body, {
      characterData: true,
      childList: true,
      subtree: true,
    })
    readAgain()
  })
}

function shouldWaitForDetailContent(result: IccPageParseResult): boolean {
  if (result.ok || result.reason !== 'The ICC detail title is missing.') {
    return false
  }
  const pathname = window.location.pathname.toLowerCase()
  return pathname.endsWith('/download.php') || pathname.endsWith('/player.php')
}

function isolateRootTypography(): () => void {
  const root = document.documentElement
  const previousValue = root.style.getPropertyValue('font-size')
  const previousPriority = root.style.getPropertyPriority('font-size')

  // Bootstrap 3 sets html to 10px. Shadow DOM does not isolate rem units, so
  // Tailwind's spacing and type scale would otherwise render at 62.5% size.
  root.style.setProperty('font-size', '16px', 'important')

  return () => {
    if (previousValue) {
      root.style.setProperty('font-size', previousValue, previousPriority)
    } else {
      root.style.removeProperty('font-size')
    }
  }
}

function concealOriginalPage(shadowHost: HTMLElement): () => void {
  const concealmentStyle = document.createElement('style')
  concealmentStyle.textContent = `body[data-icc-lens-active="true"] > :not(icc-lens-root) { display: none !important; }`
  document.head.append(concealmentStyle)

  const originals = new Map<
    HTMLElement,
    {
      hidden: HTMLElement['hidden']
      ariaHidden: string | null
      display: string
      displayPriority: string
    }
  >()

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) conceal(node)
      }
    }
  })

  const conceal = (element: HTMLElement) => {
    if (element === shadowHost) return
    if (!originals.has(element)) {
      originals.set(element, {
        hidden: element.hidden,
        ariaHidden: element.getAttribute('aria-hidden'),
        display: element.style.getPropertyValue('display'),
        displayPriority: element.style.getPropertyPriority('display'),
      })
    }
    if (!element.hidden) element.hidden = true
    if (element.getAttribute('aria-hidden') !== 'true') {
      element.setAttribute('aria-hidden', 'true')
    }
    if (
      element.style.getPropertyValue('display') !== 'none' ||
      element.style.getPropertyPriority('display') !== 'important'
    ) {
      element.style.setProperty('display', 'none', 'important')
    }
  }

  for (const element of Array.from(document.body.children)) {
    if (element instanceof HTMLElement) conceal(element)
  }

  observer.observe(document.body, { childList: true })

  document.body.dataset.iccLensActive = 'true'

  return () => {
    observer.disconnect()
    concealmentStyle.remove()
    for (const [
      element,
      { hidden, ariaHidden, display, displayPriority },
    ] of originals) {
      element.hidden = hidden
      if (ariaHidden === null) element.removeAttribute('aria-hidden')
      else element.setAttribute('aria-hidden', ariaHidden)
      if (display) {
        element.style.setProperty('display', display, displayPriority)
      } else {
        element.style.removeProperty('display')
      }
    }
    delete document.body.dataset.iccLensActive
  }
}
