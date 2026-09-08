export interface LensPreferences {
  enabled: boolean
}

export const DEFAULT_PREFERENCES: LensPreferences = {
  enabled: true,
}

export function normalizePreferences(value: unknown): LensPreferences {
  if (!value || typeof value !== 'object') return DEFAULT_PREFERENCES

  const candidate = value as Partial<LensPreferences>
  return {
    enabled:
      typeof candidate.enabled === 'boolean'
        ? candidate.enabled
        : DEFAULT_PREFERENCES.enabled,
  }
}
