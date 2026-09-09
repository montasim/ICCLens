import { describe, expect, it } from 'vitest'

import { sortCatalogItems, type CatalogSort } from '../src/domain/catalog-sort'
import type { CatalogItem } from '../src/domain/icc-page'

function item(title: string, hits: string | null): CatalogItem {
  return {
    id: title,
    title,
    href: `http://10.16.100.244/${encodeURIComponent(title)}`,
    imageHref: null,
    age: null,
    hits,
    action: 'details',
  }
}

const items = [
  item('Title 10', '89 Hits'),
  item('alpha', '21,784 Hits'),
  item('Title 2', null),
  item('Beta', '89 Hits'),
]

function titles(sort: CatalogSort): string[] {
  return sortCatalogItems(items, sort).map(({ title }) => title)
}

describe('catalog sorting', () => {
  it('preserves server order without mutating the source collection', () => {
    const sorted = sortCatalogItems(items, 'server')

    expect(sorted).toEqual(items)
    expect(sorted).not.toBe(items)
    expect(items.map(({ title }) => title)).toEqual([
      'Title 10',
      'alpha',
      'Title 2',
      'Beta',
    ])
  })

  it('sorts numeric popularity in either direction and keeps missing hits last', () => {
    expect(titles('popularity-desc')).toEqual([
      'alpha',
      'Title 10',
      'Beta',
      'Title 2',
    ])
    expect(titles('popularity-asc')).toEqual([
      'Title 10',
      'Beta',
      'alpha',
      'Title 2',
    ])
  })

  it('sorts names naturally in either direction', () => {
    expect(titles('name-asc')).toEqual(['alpha', 'Beta', 'Title 2', 'Title 10'])
    expect(titles('name-desc')).toEqual([
      'Title 10',
      'Title 2',
      'Beta',
      'alpha',
    ])
  })
})
