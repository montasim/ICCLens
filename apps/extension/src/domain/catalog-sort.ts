import type { CatalogItem } from './icc-page'

export type CatalogSort =
  'server' | 'popularity-desc' | 'popularity-asc' | 'name-asc' | 'name-desc'

const titleCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
})

export function sortCatalogItems(
  items: CatalogItem[],
  sort: CatalogSort,
): CatalogItem[] {
  if (sort === 'server') return [...items]

  return items
    .map((item, serverIndex) => ({
      item,
      popularity: parsePopularity(item.hits),
      serverIndex,
    }))
    .sort((left, right) => {
      if (sort === 'name-asc' || sort === 'name-desc') {
        const comparison = titleCollator.compare(
          left.item.title,
          right.item.title,
        )
        return (
          (sort === 'name-asc' ? comparison : -comparison) ||
          left.serverIndex - right.serverIndex
        )
      }

      if (left.popularity === null && right.popularity === null) {
        return left.serverIndex - right.serverIndex
      }
      if (left.popularity === null) return 1
      if (right.popularity === null) return -1

      const comparison = left.popularity - right.popularity
      return (
        (sort === 'popularity-asc' ? comparison : -comparison) ||
        left.serverIndex - right.serverIndex
      )
    })
    .map(({ item }) => item)
}

function parsePopularity(hits: string | null): number | null {
  if (!hits) return null
  const digits = hits.replace(/\D/gu, '')
  if (!digits) return null
  const popularity = Number(digits)
  return Number.isSafeInteger(popularity) ? popularity : null
}
