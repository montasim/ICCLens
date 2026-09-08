import {
  LensPreferencesService,
  type LensPreferencesPort,
} from '../src/application/preferences'
import {
  DEFAULT_PREFERENCES,
  type LensPreferences,
} from '../src/domain/preferences'

function createMemoryPort(): LensPreferencesPort & {
  current: LensPreferences
} {
  return {
    current: DEFAULT_PREFERENCES,
    async load() {
      return this.current
    },
    async save(preferences) {
      this.current = preferences
    },
  }
}

describe('ICC Lens preferences', () => {
  it('defaults to enabled and saves only the extension toggle', async () => {
    const port = createMemoryPort()
    const service = new LensPreferencesService(port)

    expect(await service.load()).toEqual({ enabled: true })
    expect(await service.save({ enabled: false })).toEqual({ enabled: false })
    expect(port.current).toEqual({ enabled: false })
  })

  it('normalizes malformed stored data without preserving page content', async () => {
    const port: LensPreferencesPort = {
      async load() {
        return { enabled: 'yes', query: 'private title' }
      },
      async save() {},
    }
    const service = new LensPreferencesService(port)

    expect(await service.load()).toEqual(DEFAULT_PREFERENCES)
  })
})
