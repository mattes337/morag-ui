import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import debounce from 'lodash.debounce';
import { SearchResult, SearchFilters } from '@/lib/mockData/searchMockData';
import { searchApi } from '@/lib/api/searchApi';

/**
 * Configuration options for the useSearch hook
 * 
 * @example
 * ```typescript
 * // Basic usage with defaults
 * const search = useSearch();
 * 
 * // Custom configuration
 * const search = useSearch({
 *   initialQuery: "machine learning",
 *   initialFilters: { documentType: 'pdf', dateRange: 'last-month', sortBy: 'relevance' },
 *   debounceDelay: 300,
 *   pageSize: 20,
 *   minQueryLength: 2
 * });
 * ```
 */
export interface UseSearchOptions {
  /** Initial search query to populate on mount */
  initialQuery?: string;
  /** Initial filter values to apply */
  initialFilters?: Partial<SearchFilters>;
  /** Debounce delay in milliseconds for automatic search (default: 500) */
  debounceDelay?: number;
  /** Number of results per page (default: 10) */
  pageSize?: number;
  /** Minimum query length to trigger search (default: 3) */
  minQueryLength?: number;
}

/**
 * Return type for the useSearch hook
 * 
 * Provides comprehensive search state management and actions for React components.
 * 
 * @example
 * ```typescript
 * const SearchComponent = () => {
 *   const {
 *     query,
 *     setQuery,
 *     filters,
 *     updateFilters,
 *     results,
 *     isLoading,
 *     error,
 *     totalResults,
 *     currentPage,
 *     totalPages,
 *     nextPage,
 *     previousPage,
 *     searchNow,
 *     retry
 *   } = useSearch({
 *     debounceDelay: 300,
 *     pageSize: 15
 *   });
 * 
 *   return (
 *     <div>
 *       <input
 *         value={query}
 *         onChange={(e) => setQuery(e.target.value)}
 *         disabled={isLoading}
 *       />
 *       
 *       {error && (
 *         <div className="error">
 *           {error}
 *           <button onClick={retry}>Retry</button>
 *         </div>
 *       )}
 *       
 *       {isLoading && <div>Searching...</div>}
 *       
 *       <div>Found {totalResults} results</div>
 *       
 *       {results.map(result => (
 *         <div key={result.id}>{result.title}</div>
 *       ))}
 *       
 *       <div>
 *         <button 
 *           onClick={previousPage} 
 *           disabled={currentPage === 1}
 *         >
 *           Previous
 *         </button>
 *         <span>{currentPage} of {totalPages}</span>
 *         <button 
 *           onClick={nextPage} 
 *           disabled={currentPage === totalPages}
 *         >
 *           Next
 *         </button>
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export interface UseSearchReturn {
  // State
  /** Current search query string */
  query: string;
  /** Current active filters */
  filters: SearchFilters;
  /** Whether a search request is in progress */
  isLoading: boolean;
  /** Array of search result documents */
  results: SearchResult[];
  /** Total number of results across all pages */
  totalResults: number;
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages available */
  totalPages: number;
  /** Error message if search failed, null if successful */
  error: string | null;

  // Actions
  /** Update the search query (triggers debounced search) */
  setQuery: (query: string) => void;
  /** Update search filters (triggers immediate search) */
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  /** Navigate to a specific page */
  goToPage: (page: number) => void;
  /** Navigate to the next page */
  nextPage: () => void;
  /** Navigate to the previous page */
  previousPage: () => void;
  /** Execute search immediately (bypasses debounce) */
  searchNow: (query?: string) => void;
  /** Retry the last failed search */
  retry: () => void;
  /** Trigger debounced search manually */
  searchDebounced: () => void;
}

const defaultFilters: SearchFilters = {
  documentType: 'all',
  dateRange: 'all',
  sortBy: 'relevance'
};

/**
 * React hook for comprehensive search functionality
 * 
 * Provides a complete search solution with debounced queries, pagination,
 * filtering, error handling, and caching. Integrates with the SearchApi
 * to provide a seamless search experience.
 * 
 * Features:
 * - Debounced search input to reduce API calls
 * - Pagination with next/previous navigation
 * - Advanced filtering and sorting
 * - Error handling with retry functionality
 * - Loading states and progress tracking
 * - Automatic caching through SearchApi
 * 
 * @param options - Configuration options for the search behavior
 * @returns Object containing search state and control functions
 * 
 * @example
 * ```typescript
 * // Basic search implementation
 * const SearchPage = () => {
 *   const {
 *     query,
 *     setQuery,
 *     results,
 *     isLoading,
 *     error,
 *     totalResults,
 *     retry
 *   } = useSearch();
 * 
 *   if (error) {
 *     return (
 *       <div>
 *         <p>Search failed: {error}</p>
 *         <button onClick={retry}>Try Again</button>
 *       </div>
 *     );
 *   }
 * 
 *   return (
 *     <div>
 *       <input
 *         type="search"
 *         value={query}
 *         onChange={(e) => setQuery(e.target.value)}
 *         placeholder="Search documents..."
 *       />
 *       
 *       {isLoading && <div>Searching...</div>}
 *       
 *       <p>Found {totalResults} results</p>
 *       
 *       <div>
 *         {results.map(result => (
 *           <div key={result.id} className="search-result">
 *             <h3>{result.title}</h3>
 *             <p>{result.excerpt}</p>
 *             <small>Relevance: {(result.relevanceScore * 100).toFixed(0)}%</small>
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Advanced search with filters and pagination
 * const AdvancedSearchPage = () => {
 *   const {
 *     query,
 *     setQuery,
 *     filters,
 *     updateFilters,
 *     results,
 *     isLoading,
 *     currentPage,
 *     totalPages,
 *     nextPage,
 *     previousPage,
 *     searchNow
 *   } = useSearch({
 *     initialFilters: { documentType: 'pdf', sortBy: 'date-desc' },
 *     pageSize: 20,
 *     debounceDelay: 300
 *   });
 * 
 *   const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
 *     updateFilters(newFilters);
 *   };
 * 
 *   const handleInstantSearch = () => {
 *     searchNow(); // Bypass debounce for immediate search
 *   };
 * 
 *   return (
 *     <div className="advanced-search">
 *       <div className="search-controls">
 *         <input
 *           value={query}
 *           onChange={(e) => setQuery(e.target.value)}
 *           onKeyPress={(e) => e.key === 'Enter' && handleInstantSearch()}
 *         />
 *         <button onClick={handleInstantSearch}>Search Now</button>
 *       </div>
 * 
 *       <div className="filters">
 *         <select
 *           value={filters.documentType}
 *           onChange={(e) => handleFilterChange({ documentType: e.target.value })}
 *         >
 *           <option value="all">All Types</option>
 *           <option value="pdf">PDF</option>
 *           <option value="docx">Word Documents</option>
 *         </select>
 * 
 *         <select
 *           value={filters.sortBy}
 *           onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
 *         >
 *           <option value="relevance">Relevance</option>
 *           <option value="date-desc">Newest First</option>
 *           <option value="date-asc">Oldest First</option>
 *         </select>
 *       </div>
 * 
 *       {isLoading && <div className="loading">Searching...</div>}
 * 
 *       <div className="results">
 *         {results.map(result => (
 *           <SearchResultCard key={result.id} result={result} />
 *         ))}
 *       </div>
 * 
 *       {totalPages > 1 && (
 *         <div className="pagination">
 *           <button 
 *             onClick={previousPage} 
 *             disabled={currentPage === 1}
 *           >
 *             Previous
 *           </button>
 *           <span>Page {currentPage} of {totalPages}</span>
 *           <button 
 *             onClick={nextPage} 
 *             disabled={currentPage >= totalPages}
 *           >
 *             Next
 *           </button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Custom hook composition
 * const useDocumentSearch = () => {
 *   const searchHook = useSearch({
 *     initialFilters: { documentType: 'all', dateRange: 'last-year', sortBy: 'relevance' },
 *     pageSize: 25,
 *     minQueryLength: 2
 *   });
 * 
 *   // Add custom functionality
 *   const searchInRealm = useCallback((realmId: string, query: string) => {
 *     searchHook.updateFilters({ realm: realmId });
 *     searchHook.searchNow(query);
 *   }, [searchHook]);
 * 
 *   return {
 *     ...searchHook,
 *     searchInRealm
 *   };
 * };
 * ```
 */
export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    initialQuery = '',
    initialFilters = {},
    debounceDelay = 500,
    pageSize = 10,
    minQueryLength = 3
  } = options;

  // State
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Memoized search function
  const performSearch = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters,
    page: number = 1
  ) => {
    // Don't search for empty or too short queries
    if (!searchQuery.trim() || searchQuery.trim().length < minQueryLength) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(1);
      setCurrentPage(1);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Clear results while loading new ones
      if (page === 1) {
        setResults([]);
      }

      const response = await searchApi.searchDocuments({
        query: searchQuery,
        filters: searchFilters,
        page,
        limit: pageSize
      });

      setResults(response.results);
      setTotalResults(response.totalResults);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [minQueryLength, pageSize]);

  // Stable debounced search function using useRef to prevent memory leaks
  const debouncedSearchRef = useRef<ReturnType<typeof debounce>>();
  
  // Create stable debounced function only when dependencies change
  const debouncedSearch = useMemo(() => {
    // Cancel previous debounced function if it exists
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current.cancel();
    }
    
    // Create new debounced function
    debouncedSearchRef.current = debounce((searchQuery: string, searchFilters: SearchFilters) => {
      performSearch(searchQuery, searchFilters, 1);
    }, debounceDelay);
    
    return debouncedSearchRef.current;
  }, [performSearch, debounceDelay]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Reset to first page when filters change
    setCurrentPage(1);
    
    // Trigger search if we have a query
    if (query.trim() && query.trim().length >= minQueryLength) {
      performSearch(query, updatedFilters, 1);
    }
  }, [filters, query, performSearch, minQueryLength]);

  // Pagination functions
  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    
    // Immediately update currentPage state
    setCurrentPage(page);
    
    // Then perform search
    if (query.trim() && query.trim().length >= minQueryLength) {
      performSearch(query, filters, page);
    }
  }, [query, filters, totalPages, performSearch, minQueryLength]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Immediate search (bypasses debounce)
  const searchNow = useCallback((searchQuery?: string) => {
    const queryToUse = searchQuery !== undefined ? searchQuery : query;
    if (searchQuery !== undefined) {
      setQuery(searchQuery);
    }
    setCurrentPage(1);
    performSearch(queryToUse, filters, 1);
  }, [query, filters, performSearch]);

  // Retry function
  const retry = useCallback(() => {
    performSearch(query, filters, currentPage);
  }, [query, filters, currentPage, performSearch]);

  // Search function for manual triggering
  const searchDebounced = useCallback(() => {
    debouncedSearch(query, filters);
  }, [debouncedSearch, query, filters]);

  // Effect to trigger search when query changes
  useEffect(() => {
    if (query.trim() && query.trim().length >= minQueryLength) {
      // Only debounce if it's an automatic search, not manual
      debouncedSearch(query, filters);
    } else if (query.trim().length === 0) {
      // Clear results when query is completely empty
      setResults([]);
      setTotalResults(0);
      setTotalPages(1);
      setCurrentPage(1);
      debouncedSearch.cancel();
    } else {
      // Cancel any pending searches for queries that are too short
      debouncedSearch.cancel();
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, filters, debouncedSearch, minQueryLength]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, []);

  return {
    // State
    query,
    filters,
    isLoading,
    results,
    totalResults,
    currentPage,
    totalPages,
    error,

    // Actions
    setQuery,
    updateFilters,
    goToPage,
    nextPage,
    previousPage,
    searchNow,
    retry,
    searchDebounced
  };
};

export default useSearch;