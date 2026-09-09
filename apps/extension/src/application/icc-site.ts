import type {
  CatalogItem,
  CatalogPage,
  IccPageParseResult,
  SearchSuggestion,
} from '../domain/icc-page'

export interface IccSitePort {
  readCurrentPage(): IccPageParseResult
  search(query: string): Promise<CatalogPage>
  submitNativeSearch(query: string): void
  suggest(query: string, signal?: AbortSignal): Promise<SearchSuggestion[]>
  loadMore(pageNumber: number): Promise<CatalogItem[]>
}

export class IccSiteService {
  constructor(private readonly port: IccSitePort) {}

  readCurrentPage(): IccPageParseResult {
    return this.port.readCurrentPage()
  }

  async search(query: string): Promise<CatalogPage> {
    const normalized = query.trim()
    if (!normalized) throw new Error('Enter a title to search the catalog.')
    return this.port.search(normalized)
  }

  submitNativeSearch(query: string): void {
    this.port.submitNativeSearch(query.trim())
  }

  async suggest(
    query: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> {
    const normalized = query.trim()
    if (normalized.length < 2) return []
    return this.port.suggest(normalized, signal)
  }

  loadMore(pageNumber: number): Promise<CatalogItem[]> {
    return this.port.loadMore(pageNumber)
  }
}
