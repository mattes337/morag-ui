// Main search hook for application-wide use
// This is a wrapper around the component-specific hook for global access

export { useSearch, type UseSearchOptions, type UseSearchReturn } from '@/components/search/hooks/useSearch';

// Re-export search API functions for convenience
export { 
  searchApi,
  searchDocuments,
  getSuggestions,
  getSearchFacets,
  clearSearchCache,
  type SearchRequest,
  type SearchResponse
} from '@/lib/api/searchApi';

// Re-export search data utilities
export {
  getSearchSuggestions,
  getRecentSearches,
  addToSearchHistory,
  getTrendingSearches,
  highlightSearchTerms,
  generateSearchExcerpt,
  type SearchSuggestion,
  type SearchHistory,
  type PopularSearch,
  type SearchAnalytics
} from '@/lib/mockData/searchData';

// Re-export search types
export type {
  SearchResult,
  SearchFilters
} from '@/lib/mockData/searchMockData';

// Re-export all search functionality as default
import { useSearch } from '@/components/search/hooks/useSearch';
export default useSearch;