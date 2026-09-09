import type { MediaSource } from '../domain/icc-page'

export interface EpisodeDownloadList {
  filename: string
  contents: string
  linkCount: number
}

const DOWNLOAD_PROTOCOLS = new Set(['http:', 'https:'])
const FALLBACK_SERIES_FILENAME = 'icc-lens-series'
const MAX_FILENAME_STEM_LENGTH = 96

export function createEpisodeDownloadList(
  seriesTitle: string,
  sources: readonly MediaSource[],
): EpisodeDownloadList | null {
  const urls = uniqueDownloadUrls(sources)
  if (!urls.length) return null

  return {
    filename: `${filenameStem(seriesTitle)}-download-links.txt`,
    contents: `${urls.join('\r\n')}\r\n`,
    linkCount: urls.length,
  }
}

function uniqueDownloadUrls(sources: readonly MediaSource[]): string[] {
  const seen = new Set<string>()
  const urls: string[] = []

  for (const source of sources) {
    const href = source.href.trim()
    if (!isAbsoluteDownloadUrl(href) || seen.has(href)) continue
    seen.add(href)
    urls.push(href)
  }

  return urls
}

function isAbsoluteDownloadUrl(href: string): boolean {
  if (!href || /[\r\n]/u.test(href)) return false

  try {
    return DOWNLOAD_PROTOCOLS.has(new URL(href).protocol)
  } catch {
    return false
  }
}

function filenameStem(title: string): string {
  const stem = replaceControlCharacters(title.normalize('NFKC'))
    .replace(/[<>:"/\\|?*]/gu, '-')
    .replace(/-+/gu, '-')
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(/[-.\s]+$/gu, '')
    .slice(0, MAX_FILENAME_STEM_LENGTH)
    .trim()

  return stem || FALLBACK_SERIES_FILENAME
}

function replaceControlCharacters(value: string): string {
  return Array.from(value, (character) => {
    const codePoint = character.codePointAt(0) ?? 0
    return codePoint < 32 || codePoint === 127 ? ' ' : character
  }).join('')
}
