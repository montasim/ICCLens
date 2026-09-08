import {
  normalizePreferences,
  type LensPreferences,
} from '../domain/preferences'

export interface LensPreferencesPort {
  load(): Promise<unknown>
  save(preferences: LensPreferences): Promise<void>
}

export class LensPreferencesService {
  constructor(private readonly port: LensPreferencesPort) {}

  async load(): Promise<LensPreferences> {
    return normalizePreferences(await this.port.load())
  }

  async save(preferences: LensPreferences): Promise<LensPreferences> {
    const normalized = normalizePreferences(preferences)
    await this.port.save(normalized)
    return normalized
  }
}
