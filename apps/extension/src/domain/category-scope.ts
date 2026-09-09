import type { CategoryGroup } from './icc-page'

export type CategoryScope = 'global' | 'movie' | 'series' | 'file'

export const PRIMARY_PAGE_CATEGORY_IDS = {
  movie: '9',
  series: '38',
  file: '68',
} as const

export function categoryHrefForId(
  homeHref: string,
  categoryId: string,
): string {
  const href = new URL(homeHref)
  href.searchParams.set('category', categoryId)
  return href.toString()
}

export function filterCategoryGroups(
  groups: CategoryGroup[],
  scope: CategoryScope,
): CategoryGroup[] {
  if (scope === 'global') return groups

  return groups.filter((group) => {
    const groupType = categoryScopeForGroupName(group.name)
    if (scope === 'movie') return groupType === 'movie'
    if (scope === 'series') return groupType === 'series'
    return groupType === 'file'
  })
}

export function categoryScopeForGroupName(
  name: string,
): Exclude<CategoryScope, 'global'> {
  const normalized = name.trim().toLowerCase()
  if (/^movies?$/u.test(normalized)) return 'movie'
  if (/(?:^|\s)(?:tv|series|shows?)(?:\s|$)/u.test(normalized)) {
    return 'series'
  }
  return 'file'
}
