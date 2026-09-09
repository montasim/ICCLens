import {
  ChromeLensPreferencesAdapter,
  LENS_ENABLED_KEY,
  LENS_PREFERENCES_KEY,
  LENS_THEME_KEY,
  LENS_WATCH_HISTORY_KEY,
} from '../src/infrastructure/chrome-preferences'

describe('Chrome preferences adapter', () => {
  const values: Record<string, unknown> = {}
  const set = vi.fn(async (items: Record<string, unknown>) => {
    Object.assign(values, items)
  })
  const remove = vi.fn(async (key: string) => {
    delete values[key]
  })

  beforeEach(() => {
    for (const key of Object.keys(values)) delete values[key]
    set.mockClear()
    remove.mockClear()
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn(async (keys: string | string[]) => {
            const requested = Array.isArray(keys) ? keys : [keys]
            return Object.fromEntries(
              requested.map((key) => [key, values[key]]),
            )
          }),
          set,
          remove,
        },
      },
    })
  })

  it('reads the legacy enabled object until the independent key exists', async () => {
    values[LENS_PREFERENCES_KEY] = { enabled: false }
    const adapter = new ChromeLensPreferencesAdapter()
    expect(await adapter.loadEnabled()).toBe(false)

    values[LENS_ENABLED_KEY] = true
    expect(await adapter.loadEnabled()).toBe(true)
  })

  it('writes each field to its own key', async () => {
    const adapter = new ChromeLensPreferencesAdapter()
    const history = [
      {
        pageIdentity: '/player.php',
        title: 'Mousetrap',
        context: '',
        currentTime: 30,
        duration: 300,
        updatedAt: 1,
      },
    ]
    await adapter.saveEnabled(false)
    await adapter.saveTheme('dark')
    await adapter.saveWatchHistory(history)

    expect(set).toHaveBeenNthCalledWith(1, { [LENS_ENABLED_KEY]: false })
    expect(set).toHaveBeenNthCalledWith(2, { [LENS_THEME_KEY]: 'dark' })
    expect(set).toHaveBeenNthCalledWith(3, {
      [LENS_WATCH_HISTORY_KEY]: history,
    })
    expect(values[LENS_PREFERENCES_KEY]).toBeUndefined()
    expect(await adapter.loadTheme()).toBe('dark')
    expect(await adapter.loadWatchHistory()).toEqual(history)
  })

  it('clears only watch history', async () => {
    values[LENS_ENABLED_KEY] = false
    values[LENS_WATCH_HISTORY_KEY] = [{}]
    await new ChromeLensPreferencesAdapter().clearWatchHistory()
    expect(remove).toHaveBeenCalledWith(LENS_WATCH_HISTORY_KEY)
    expect(values[LENS_ENABLED_KEY]).toBe(false)
    expect(values[LENS_WATCH_HISTORY_KEY]).toBeUndefined()
  })
})
