import {
  LensPreferencesService,
  type LensPreferencesPort,
} from '../src/application/preferences'
import {
  DEFAULT_PREFERENCES,
  WATCH_HISTORY_LIMIT,
  WATCH_HISTORY_RETENTION_MS,
  normalizePageIdentity,
  normalizeWatchHistory,
  type WatchHistoryEntry,
} from '../src/domain/preferences'

const NOW = 2_000_000_000_000
const entry = (
  overrides: Partial<WatchHistoryEntry> = {},
): WatchHistoryEntry => ({
  pageIdentity: '/player.php',
  title: 'Mousetrap',
  context: 'Season 1 · Episode 3',
  season: 1,
  episode: 3,
  currentTime: 600,
  duration: 1800,
  updatedAt: NOW,
  ...overrides,
})

function memoryPort(): LensPreferencesPort & {
  enabled: unknown
  theme: unknown
  history: unknown
} {
  return {
    enabled: undefined,
    theme: undefined,
    history: undefined,
    async loadEnabled() {
      return this.enabled
    },
    async saveEnabled(value) {
      this.enabled = value
    },
    async loadTheme() {
      return this.theme
    },
    async saveTheme(value) {
      this.theme = value
    },
    async loadWatchHistory() {
      return this.history
    },
    async saveWatchHistory(value) {
      this.history = value
    },
    async clearWatchHistory() {
      this.history = undefined
    },
  }
}

describe('ICC Lens preferences', () => {
  it('defaults to enabled and the approved light theme', async () => {
    expect(await new LensPreferencesService(memoryPort()).load()).toEqual(
      DEFAULT_PREFERENCES,
    )
  })

  it('updates fields independently', async () => {
    const service = new LensPreferencesService(memoryPort())
    await service.saveTheme('dark')
    expect(await service.save({ enabled: false })).toEqual({
      enabled: false,
      theme: 'dark',
    })
  })

  it('normalizes malformed fields and surfaces storage failures', async () => {
    const port = memoryPort()
    port.enabled = 'yes'
    port.theme = 'system'
    expect(await new LensPreferencesService(port).load()).toEqual(
      DEFAULT_PREFERENCES,
    )
    port.saveTheme = async () => {
      throw new Error('storage unavailable')
    }
    await expect(
      new LensPreferencesService(port).saveTheme('dark'),
    ).rejects.toThrow('storage unavailable')
  })
})

describe('watch history rules', () => {
  it('keeps only the stable media id from a same-origin page', () => {
    expect(
      normalizePageIdentity(
        'http://10.16.100.244/player.php?session=secret&play=45608&q=private#time',
      ),
    ).toBe('/player.php?play=45608')
    expect(normalizePageIdentity('https://media.example/video.mp4')).toBeNull()
  })

  it('drops malformed, barely watched, completed, and expired entries', () => {
    expect(
      normalizeWatchHistory(
        [
          entry({ currentTime: Number.NaN }),
          entry({ currentTime: 9 }),
          entry({ currentTime: 1710 }),
          entry({ currentTime: 1771 }),
          entry({ updatedAt: NOW - WATCH_HISTORY_RETENTION_MS - 1 }),
        ],
        NOW,
      ),
    ).toEqual([])
  })

  it('trims values, strips extra data, deduplicates newest-first, and caps at 20', () => {
    const values = Array.from({ length: WATCH_HISTORY_LIMIT + 5 }, (_, index) =>
      entry({
        pageIdentity: `/title-${index}.php`,
        title: index === 0 ? '  Mousetrap  ' : `Title ${index}`,
        updatedAt: NOW - index,
      }),
    ) as Array<WatchHistoryEntry & Record<string, unknown>>
    values[0]!.poster = 'https://external.example/poster.jpg'
    values[0]!.mediaUrl = 'https://external.example/video.mp4'
    values.push({
      ...entry({ title: 'older duplicate', updatedAt: NOW - 100 }),
    })

    const normalized = normalizeWatchHistory(values, NOW)
    expect(normalized).toHaveLength(WATCH_HISTORY_LIMIT)
    expect(normalized[0]?.title).toBe('Mousetrap')
    expect(normalized[0]).not.toHaveProperty('poster')
    expect(normalized[0]).not.toHaveProperty('mediaUrl')
    expect(normalized.some((item) => item.title === 'older duplicate')).toBe(
      false,
    )
  })

  it('clamps finite times and optional episode numbers', () => {
    expect(
      normalizeWatchHistory(
        [entry({ currentTime: 500, season: 1.9, episode: 100_000 })],
        NOW,
      )[0],
    ).toMatchObject({ currentTime: 500, season: 1, episode: 9999 })
  })
})

describe('watch history service', () => {
  it('upserts by page and episode and removes completed media', async () => {
    const service = new LensPreferencesService(memoryPort())
    await service.upsertWatchHistory(entry(), NOW)
    expect(
      await service.upsertWatchHistory(
        entry({ currentTime: 900, updatedAt: NOW + 1 }),
        NOW + 1,
      ),
    ).toEqual([entry({ currentTime: 900, updatedAt: NOW + 1 })])
    expect(
      await service.upsertWatchHistory(
        entry({ currentTime: 1771, updatedAt: NOW + 2 }),
        NOW + 2,
      ),
    ).toEqual([])
  })

  it('keeps episodes distinct and supports remove and clear', async () => {
    const service = new LensPreferencesService(memoryPort())
    await service.upsertWatchHistory(entry(), NOW)
    await service.upsertWatchHistory(entry({ episode: 4 }), NOW)
    expect(await service.loadWatchHistory(NOW)).toHaveLength(2)
    await service.removeWatchHistory(
      { pageIdentity: '/player.php', season: 1, episode: 3 },
      NOW,
    )
    expect(await service.loadWatchHistory(NOW)).toHaveLength(1)
    await service.clearWatchHistory()
    expect(await service.loadWatchHistory(NOW)).toEqual([])
  })
})
