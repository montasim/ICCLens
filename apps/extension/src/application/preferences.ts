import {
  normalizeEnabled,
  normalizePageIdentity,
  normalizeTheme,
  normalizeWatchHistory,
  normalizeWatchHistoryEntry,
  watchHistoryIdentity,
  type LensPreferences,
  type LensTheme,
  type WatchHistoryEntry,
} from '../domain/preferences'

export interface LensPreferencesPort {
  loadEnabled(): Promise<unknown>
  saveEnabled(enabled: boolean): Promise<void>
  loadTheme(): Promise<unknown>
  saveTheme(theme: LensTheme): Promise<void>
  loadWatchHistory(): Promise<unknown>
  saveWatchHistory(history: WatchHistoryEntry[]): Promise<void>
  clearWatchHistory(): Promise<void>
}

export class LensPreferencesService {
  constructor(private readonly port: LensPreferencesPort) {}

  async load(): Promise<LensPreferences> {
    const [enabled, theme] = await Promise.all([
      this.port.loadEnabled(),
      this.port.loadTheme(),
    ])
    return { enabled: normalizeEnabled(enabled), theme: normalizeTheme(theme) }
  }

  async save(preferences: Partial<LensPreferences>): Promise<LensPreferences> {
    if (typeof preferences.enabled === 'boolean')
      await this.port.saveEnabled(preferences.enabled)
    if (preferences.theme === 'light' || preferences.theme === 'dark')
      await this.port.saveTheme(preferences.theme)
    return this.load()
  }

  async loadTheme(): Promise<LensTheme> {
    return normalizeTheme(await this.port.loadTheme())
  }

  async saveTheme(theme: LensTheme): Promise<LensTheme> {
    const normalized = normalizeTheme(theme)
    await this.port.saveTheme(normalized)
    return normalized
  }

  async loadWatchHistory(now = Date.now()): Promise<WatchHistoryEntry[]> {
    return normalizeWatchHistory(await this.port.loadWatchHistory(), now)
  }

  async upsertWatchHistory(
    value: WatchHistoryEntry,
    now = Date.now(),
  ): Promise<WatchHistoryEntry[]> {
    const current = await this.loadWatchHistory(now)
    const candidate = normalizeWatchHistoryEntry(value, now)
    const identity = watchHistoryIdentity({
      ...value,
      pageIdentity:
        normalizePageIdentity(value.pageIdentity) ?? value.pageIdentity,
    })
    const remaining = current.filter(
      (item) => watchHistoryIdentity(item) !== identity,
    )
    const next = normalizeWatchHistory(
      candidate ? [candidate, ...remaining] : remaining,
      now,
    )
    await this.port.saveWatchHistory(next)
    return next
  }

  async removeWatchHistory(
    identity: Pick<WatchHistoryEntry, 'pageIdentity' | 'season' | 'episode'>,
    now = Date.now(),
  ): Promise<WatchHistoryEntry[]> {
    const key = watchHistoryIdentity({
      ...identity,
      pageIdentity:
        normalizePageIdentity(identity.pageIdentity) ?? identity.pageIdentity,
    })
    const next = (await this.loadWatchHistory(now)).filter(
      (item) => watchHistoryIdentity(item) !== key,
    )
    await this.port.saveWatchHistory(next)
    return next
  }

  async clearWatchHistory(): Promise<void> {
    await this.port.clearWatchHistory()
  }
}
