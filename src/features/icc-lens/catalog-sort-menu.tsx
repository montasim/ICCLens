import { SelectMenu } from '../../components/ui/select-menu'
import type { CatalogSort } from '../../domain/catalog-sort'
import type { CatalogPage } from '../../domain/icc-page'

interface CatalogSortMenuProps {
  pageView: CatalogPage['view']
  value: CatalogSort
  onChange(value: CatalogSort): void
}

const SORT_OPTIONS: ReadonlyArray<{
  value: Exclude<CatalogSort, 'server'>
  label: string
}> = [
  { value: 'popularity-desc', label: 'Popularity: High to low' },
  { value: 'popularity-asc', label: 'Popularity: Low to high' },
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'name-desc', label: 'Name: Z–A' },
]

export function CatalogSortMenu({
  pageView,
  value,
  onChange,
}: CatalogSortMenuProps) {
  const options: ReadonlyArray<{ value: CatalogSort; label: string }> = [
    {
      value: 'server',
      label: pageView === 'latest' ? 'Newest' : 'Default order',
    },
    ...SORT_OPTIONS,
  ]
  return (
    <SelectMenu
      ariaLabel={`Sort by, ${options.find((option) => option.value === value)?.label ?? 'Default order'}`}
      className="flex-1 sm:w-64 sm:flex-none"
      options={options}
      prefix="Sort by"
      value={value}
      onValueChange={onChange}
    />
  )
}
