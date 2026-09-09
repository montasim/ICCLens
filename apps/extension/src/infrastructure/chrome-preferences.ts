import type { LensPreferencesPort } from '../application/preferences'
import type { LensTheme, WatchHistoryEntry } from '../domain/preferences'

/** Legacy object key retained only as an enabled-preference migration source. */
export const LENS_PREFERENCES_KEY = 'icc-lens:preferences'
export const LENS_ENABLED_KEY = 'icc-lens:enabled'
export const LENS_THEME_KEY = 'icc-lens:theme'
export const LENS_WATCH_HISTORY_KEY = 'icc-lens:watch-history'

export class ChromeLensPreferencesAdapter implements LensPreferencesPort {
  async loadEnabled(): Promise<unknown> {
    const stored = await chrome.storage.local.get([
      LENS_ENABLED_KEY,
      LENS_PREFERENCES_KEY,
    ])
    if (stored[LENS_ENABLED_KEY] !== undefined) return stored[LENS_ENABLED_KEY]
    const legacy = stored[LENS_PREFERENCES_KEY]
    return isRecord(legacy) ? legacy.enabled : undefined
  }

  async saveEnabled(enabled: boolean): Promise<void> {
    await chrome.storage.local.set({ [LENS_ENABLED_KEY]: enabled })
  }

  async loadTheme(): Promise<unknown> {
    return (await chrome.storage.local.get(LENS_THEME_KEY))[LENS_THEME_KEY]
  }

  async saveTheme(theme: LensTheme): Promise<void> {
    await chrome.storage.local.set({ [LENS_THEME_KEY]: theme })
  }

  async loadWatchHistory(): Promise<unknown> {
    return (await chrome.storage.local.get(LENS_WATCH_HISTORY_KEY))[
      LENS_WATCH_HISTORY_KEY
    ]
  }

  async saveWatchHistory(history: WatchHistoryEntry[]): Promise<void> {
    await chrome.storage.local.set({ [LENS_WATCH_HISTORY_KEY]: history })
  }

  async clearWatchHistory(): Promise<void> {
    await chrome.storage.local.remove(LENS_WATCH_HISTORY_KEY)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
