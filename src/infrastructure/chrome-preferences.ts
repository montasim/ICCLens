import type { LensPreferencesPort } from '../application/preferences'
import type { LensPreferences } from '../domain/preferences'

export const LENS_PREFERENCES_KEY = 'icc-lens:preferences'

export class ChromeLensPreferencesAdapter implements LensPreferencesPort {
  async load(): Promise<unknown> {
    const stored = await chrome.storage.local.get(LENS_PREFERENCES_KEY)
    return stored[LENS_PREFERENCES_KEY]
  }

  async save(preferences: LensPreferences): Promise<void> {
    await chrome.storage.local.set({ [LENS_PREFERENCES_KEY]: preferences })
  }
}
