import { describe, expect, it } from 'vitest'

import { createEpisodeDownloadList } from '../src/application/episode-download-list'
import type { MediaSource } from '../src/domain/icc-page'

function source(href: string, label = 'S01E01'): MediaSource {
  return {
    id: label,
    label,
    href,
    mediaType: 'video/mp4',
    size: null,
    playable: true,
  }
}

describe('createEpisodeDownloadList', () => {
  it('preserves episode order and creates a Windows-friendly UTF-8 text body', () => {
    const result = createEpisodeDownloadList('Example Series Season 01', [
      source('http://10.16.100.212/show/S01E01.mp4', 'S01E01'),
      source('http://10.16.100.212/show/S01E02.mp4?session=abc', 'S01E02'),
    ])

    expect(result).toEqual({
      filename: 'Example Series Season 01-download-links.txt',
      contents:
        'http://10.16.100.212/show/S01E01.mp4\r\n' +
        'http://10.16.100.212/show/S01E02.mp4?session=abc\r\n',
      linkCount: 2,
    })
  })

  it('excludes unsafe and duplicate URLs without altering valid server URLs', () => {
    const result = createEpisodeDownloadList('Mousetrap', [
      source('javascript:alert(1)'),
      source('http://10.16.100.212/show/S01E01.mp4'),
      source('http://10.16.100.212/show/S01E01.mp4'),
      source('http://10.16.100.212/show/S01E02.mp4\nhttps://example.com'),
      source('https://media.internal/show/S01E03.mp4#source'),
    ])

    expect(result?.contents).toBe(
      'http://10.16.100.212/show/S01E01.mp4\r\n' +
        'https://media.internal/show/S01E03.mp4#source\r\n',
    )
  })

  it('creates a safe filename and returns null when no exportable URL exists', () => {
    expect(
      createEpisodeDownloadList('  Season 01: Finale / Encore?  ', [
        source('https://media.internal/episode.mp4'),
      ])?.filename,
    ).toBe('Season 01- Finale - Encore-download-links.txt')

    expect(
      createEpisodeDownloadList('Example', [source('/relative/episode.mp4')]),
    ).toBeNull()
  })
})
