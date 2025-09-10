import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { SearchResult, SearchFilters } from '@/lib/mockData/searchMockData';
import { searchApi } from '@/lib/api/search';

export interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: Partial<SearchFilters>;
  debounceDelay?: number;
  pageSize?: number;
  minQueryLength?: number;
}

export interface UseSearchReturn {
  // State
  query: string;
  filters: SearchFilters;
  isLoading: boolean;
  results: SearchResult[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  error: string | null;

  // Actions
  setQuery: (query: string) => void;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  searchNow: (query?: string) => void;
  retry: () => void;
  searchDebounced: () => void;
}

const defaultFilters: SearchFilters = {
  documentType: 'all',
  dateRange: 'all',
  sortBy: 'relevance'
};

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

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string, searchFilters: SearchFilters) => {
      performSearch(searchQuery, searchFilters, 1);
    }, debounceDelay),
    [performSearch, debounceDelay]
  );

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
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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