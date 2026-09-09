export type LensTheme = 'light' | 'dark'

export interface LensPreferences {
  enabled: boolean
  theme: LensTheme
}

export interface WatchHistoryEntry {
  pageIdentity: string
  title: string
  context: string
  season?: number
  episode?: number
  currentTime: number
  duration: number
  updatedAt: number
}

export const WATCH_HISTORY_LIMIT = 20
export const WATCH_HISTORY_RETENTION_MS = 90 * 24 * 60 * 60 * 1000
const MAX_TEXT_LENGTH = 300
const MAX_DURATION_SECONDS = 7 * 24 * 60 * 60
const ICC_ORIGIN = 'http://10.16.100.244'

export const DEFAULT_PREFERENCES: LensPreferences = {
  enabled: true,
  theme: 'light',
}

export function normalizeEnabled(value: unknown): boolean {
  return typeof value === 'boolean' ? value : DEFAULT_PREFERENCES.enabled
}

export function normalizeTheme(value: unknown): LensTheme {
  return value === 'dark' || value === 'light'
    ? value
    : DEFAULT_PREFERENCES.theme
}

export function normalizePreferences(value: unknown): LensPreferences {
  if (!isRecord(value)) return DEFAULT_PREFERENCES
  return {
    enabled: normalizeEnabled(value.enabled),
    theme: normalizeTheme(value.theme),
  }
}

/** Keeps only the server's stable media id; drops searches, sessions, and secrets. */
export function normalizePageIdentity(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null
  try {
    const url = new URL(value, ICC_ORIGIN)
    if (url.origin !== ICC_ORIGIN) return null
    const pathname = url.pathname.replace(/\/{2,}/g, '/')
    if (!pathname.startsWith('/') || pathname.length > 512) return null
    const play = url.searchParams.get('play')?.trim()
    if (!play || play.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(play)) {
      return pathname
    }
    return `${pathname}?play=${encodeURIComponent(play)}`
  } catch {
    return null
  }
}

export function normalizeWatchHistoryEntry(
  value: unknown,
  now = Date.now(),
): WatchHistoryEntry | null {
  if (!isRecord(value)) return null
  const pageIdentity = normalizePageIdentity(value.pageIdentity)
  const title = normalizeText(value.title)
  const context = normalizeText(value.context, true)
  const duration = finiteNumber(value.duration)
  const currentTime = finiteNumber(value.currentTime)
  const updatedAt = finiteNumber(value.updatedAt)
  if (
    !pageIdentity ||
    !title ||
    context === null ||
    duration === null ||
    duration <= 0 ||
    currentTime === null ||
    updatedAt === null ||
    updatedAt <= 0
  )
    return null

  const safeNow = Number.isFinite(now) && now > 0 ? now : Date.now()
  const clampedDuration = clamp(duration, 1, MAX_DURATION_SECONDS)
  const clampedCurrentTime = clamp(currentTime, 0, clampedDuration)
  const clampedUpdatedAt = clamp(updatedAt, 1, safeNow)
  const remaining = clampedDuration - clampedCurrentTime
  if (
    clampedCurrentTime < 10 ||
    clampedCurrentTime / clampedDuration >= 0.95 ||
    remaining < 30 ||
    safeNow - clampedUpdatedAt > WATCH_HISTORY_RETENTION_MS
  )
    return null

  const season = normalizePositiveInteger(value.season)
  const episode = normalizePositiveInteger(value.episode)
  return {
    pageIdentity,
    title,
    context,
    ...(season === undefined ? {} : { season }),
    ...(episode === undefined ? {} : { episode }),
    currentTime: clampedCurrentTime,
    duration: clampedDuration,
    updatedAt: clampedUpdatedAt,
  }
}

export function normalizeWatchHistory(
  value: unknown,
  now = Date.now(),
): WatchHistoryEntry[] {
  if (!Array.isArray(value)) return []
  const normalized = value
    .map((item) => normalizeWatchHistoryEntry(item, now))
    .filter((item): item is WatchHistoryEntry => item !== null)
    .sort((left, right) => right.updatedAt - left.updatedAt)
  const unique = new Map<string, WatchHistoryEntry>()
  for (const item of normalized) {
    const key = watchHistoryIdentity(item)
    if (!unique.has(key)) unique.set(key, item)
  }
  return [...unique.values()].slice(0, WATCH_HISTORY_LIMIT)
}

export function watchHistoryIdentity(
  entry: Pick<WatchHistoryEntry, 'pageIdentity' | 'season' | 'episode'>,
): string {
  return `${entry.pageIdentity}\u0000${entry.season ?? ''}\u0000${entry.episode ?? ''}`
}

function normalizeText(value: unknown, allowEmpty = false): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().slice(0, MAX_TEXT_LENGTH)
  return normalized || (allowEmpty ? '' : null)
}

function normalizePositiveInteger(value: unknown): number | undefined {
  const number = finiteNumber(value)
  if (number === null || number < 1) return undefined
  return clamp(Math.trunc(number), 1, 9999)
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
