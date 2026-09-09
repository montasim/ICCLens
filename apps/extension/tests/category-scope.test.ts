import { describe, expect, it } from 'vitest'

import { filterCategoryGroups } from '../src/domain/category-scope'
import type { CategoryGroup } from '../src/domain/icc-page'

const groups: CategoryGroup[] = [
  'Movies',
  'Games',
  'Software',
  'TV Series',
  'Others',
].map((name, index) => ({
  name,
  categories: [
    {
      id: String(index + 1),
      name: `${name} category`,
      count: index + 1,
      href: `http://10.16.100.244/dashboard.php?category=${index + 1}`,
    },
  ],
}))

describe('category scope', () => {
  it('keeps global browsing complete', () => {
    expect(filterCategoryGroups(groups, 'global')).toEqual(groups)
  })

  it('keeps movie and series browsing within their media type', () => {
    expect(
      filterCategoryGroups(groups, 'movie').map((group) => group.name),
    ).toEqual(['Movies'])
    expect(
      filterCategoryGroups(groups, 'series').map((group) => group.name),
    ).toEqual(['TV Series'])
  })

  it('treats games, software, and other resources as file categories', () => {
    expect(
      filterCategoryGroups(groups, 'file').map((group) => group.name),
    ).toEqual(['Games', 'Software', 'Others'])
  })
})
