import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearch } from './useSearch';

jest.mock('@/lib/api/searchApi', () => ({
  searchApi: {
    searchDocuments: jest.fn()
  }
}));

// Mock debounce
jest.mock('lodash.debounce', () => {
  return jest.fn((fn, delay) => {
    const debouncedFn = jest.fn((...args: any[]) => {
      clearTimeout((debouncedFn as any)._timeout);
      (debouncedFn as any)._timeout = setTimeout(() => fn(...args), delay);
    }) as jest.Mock & {
      _timeout?: NodeJS.Timeout | null;
      flush: jest.Mock;
      cancel: jest.Mock;
    };
    
    debouncedFn.flush = jest.fn(() => {
      if (debouncedFn._timeout) {
        clearTimeout(debouncedFn._timeout);
        fn();
      }
    });
    
    debouncedFn.cancel = jest.fn(() => {
      if (debouncedFn._timeout) {
        clearTimeout(debouncedFn._timeout);
        debouncedFn._timeout = null;
      }
    });
    
    return debouncedFn;
  });
});

describe('useSearch', () => {
  const mockSearchApi = require('@/lib/api/searchApi').searchApi;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useSearch());

      expect(result.current.query).toBe('');
      expect(result.current.filters).toEqual({
        documentType: 'all',
        dateRange: 'all',
        sortBy: 'relevance'
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.results).toEqual([]);
      expect(result.current.totalResults).toBe(0);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it('accepts initial query parameter', () => {
      const { result } = renderHook(() => useSearch({ initialQuery: 'test query' }));

      expect(result.current.query).toBe('test query');
    });

    it('accepts initial filters parameter', () => {
      const initialFilters = {
        documentType: 'pdf' as const,
        dateRange: 'last-month' as const,
        sortBy: 'date-desc' as const
      };

      const { result } = renderHook(() => useSearch({ initialFilters }));

      expect(result.current.filters).toEqual(initialFilters);
    });
  });

  describe('Query Management', () => {
    it('updates query state', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('new query');
      });

      expect(result.current.query).toBe('new query');
    });

    it('triggers search when query changes', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 0,
        totalPages: 1
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('test query');
      });

      await waitFor(() => {
        expect(mockSearchApi.searchDocuments).toHaveBeenCalledWith({
          query: 'test query',
          filters: {
            documentType: 'all',
            dateRange: 'all',
            sortBy: 'relevance'
          },
          page: 1,
          limit: 10
        });
      });
    });

    it('debounces search queries', async () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('t');
      });

      act(() => {
        result.current.setQuery('te');
      });

      act(() => {
        result.current.setQuery('test');
      });

      // Should not call search immediately for rapid changes
      expect(mockSearchApi.searchDocuments).not.toHaveBeenCalled();
    });

    it('does not search for empty queries', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('');
      });

      expect(mockSearchApi.searchDocuments).not.toHaveBeenCalled();
    });

    it('does not search for queries shorter than minimum length', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('a');
      });

      act(() => {
        result.current.setQuery('ab');
      });

      expect(mockSearchApi.searchDocuments).not.toHaveBeenCalled();
    });
  });

  describe('Filter Management', () => {
    it('updates individual filters', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.updateFilters({ documentType: 'pdf' });
      });

      expect(result.current.filters).toEqual({
        documentType: 'pdf',
        dateRange: 'all',
        sortBy: 'relevance'
      });
    });

    it('updates multiple filters at once', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.updateFilters({
          documentType: 'pdf',
          dateRange: 'last-month'
        });
      });

      expect(result.current.filters).toEqual({
        documentType: 'pdf',
        dateRange: 'last-month',
        sortBy: 'relevance'
      });
    });

    it('triggers search when filters change', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 0,
        totalPages: 1
      });

      const { result } = renderHook(() => useSearch({ initialQuery: 'test' }));

      act(() => {
        result.current.updateFilters({ documentType: 'pdf' });
      });

      await waitFor(() => {
        expect(mockSearchApi.searchDocuments).toHaveBeenCalledWith({
          query: 'test',
          filters: {
            documentType: 'pdf',
            dateRange: 'all',
            sortBy: 'relevance'
          },
          page: 1,
          limit: 10
        });
      });
    });

    it('resets to page 1 when filters change', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 20,
        totalPages: 3,
        currentPage: 1
      });

      const { result } = renderHook(() => useSearch({ initialQuery: 'test' }));

      // Wait for initial search to complete and set totalPages
      await waitFor(() => {
        expect(result.current.totalPages).toBe(3);
      });

      // Navigate to page 2
      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.currentPage).toBe(2);

      // Change filters should reset to page 1
      act(() => {
        result.current.updateFilters({ documentType: 'pdf' });
      });

      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('Pagination', () => {
    it('updates current page', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 30,
        totalPages: 5,
        currentPage: 1
      });

      const { result } = renderHook(() => useSearch({ initialQuery: 'test' }));

      // Wait for initial search to complete and set totalPages
      await waitFor(() => {
        expect(result.current.totalPages).toBe(5);
      });

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);
    });

    it('triggers search when page changes', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 20,
        totalPages: 3,
        currentPage: 1
      });

      const { result } = renderHook(() => useSearch({ initialQuery: 'test' }));

      // Wait for initial search to complete and set totalPages  
      await waitFor(() => {
        expect(result.current.totalPages).toBe(3);
      });

      // Clear previous calls
      mockSearchApi.searchDocuments.mockClear();
      
      // Update mock for page 2 search
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 20,
        totalPages: 3,
        currentPage: 2
      });

      act(() => {
        result.current.goToPage(2);
      });

      await waitFor(() => {
        expect(mockSearchApi.searchDocuments).toHaveBeenCalledWith({
          query: 'test',
          filters: {
            documentType: 'all',
            dateRange: 'all',
            sortBy: 'relevance'
          },
          page: 2,
          limit: 10
        });
      });
    });

    it('provides next page function', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 30,
        totalPages: 3,
        currentPage: 1
      });

      const { result } = renderHook(() => useSearch({ initialQuery: 'test' }));

      await waitFor(() => {
        expect(result.current.totalPages).toBe(3);
      });

      // Clear previous calls and set up mock for nextPage call
      mockSearchApi.searchDocuments.mockClear();
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 30,
        totalPages: 3,
        currentPage: 2
      });

      act(() => {
        result.current.nextPage();
      });

      // Wait for the search to complete and update currentPage
      await waitFor(() => {
        expect(result.current.currentPage).toBe(2);
      });
    });

    it('provides previous page function', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 30,
        totalPages: 3
      });

      const { result } = renderHook(() => useSearch({ initialQuery: 'test' }));

      act(() => {
        result.current.goToPage(2);
      });

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it('does not go below page 1', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it('does not go above total pages', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 20,
        totalPages: 2
      });

      const { result } = renderHook(() => useSearch({ initialQuery: 'test' }));

      await waitFor(() => {
        expect(result.current.totalPages).toBe(2);
      });

      act(() => {
        result.current.goToPage(2);
      });

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);
    });
  });

  describe('Loading States', () => {
    it('sets loading to true when search starts', async () => {
      let resolveSearch: (value: any) => void;
      mockSearchApi.searchDocuments.mockReturnValue(
        new Promise((resolve) => {
          resolveSearch = resolve;
        })
      );

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('test query');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve the search
      act(() => {
        resolveSearch!({
          results: [],
          totalResults: 0,
          totalPages: 1
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('sets loading to false when search completes', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 0,
        totalPages: 1
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('test query');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('sets loading to false when search fails', async () => {
      mockSearchApi.searchDocuments.mockRejectedValue(new Error('Search failed'));

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('test query');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Search failed');
      });
    });
  });

  describe('Search Results', () => {
    const mockResults = [
      {
        id: '1',
        title: 'Document 1',
        content: 'Content 1',
        documentType: 'pdf',
        createdAt: '2024-01-15T10:00:00Z',
        relevanceScore: 0.95
      },
      {
        id: '2',
        title: 'Document 2',
        content: 'Content 2',
        documentType: 'docx',
        createdAt: '2024-01-14T09:00:00Z',
        relevanceScore: 0.87
      }
    ];

    it('updates results when search completes', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: mockResults,
        totalResults: 25,
        totalPages: 3
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('test query');
      });

      await waitFor(() => {
        expect(result.current.results).toEqual(mockResults);
        expect(result.current.totalResults).toBe(25);
        expect(result.current.totalPages).toBe(3);
      });
    });

    it('clears results when new search starts', async () => {
      mockSearchApi.searchDocuments.mockResolvedValueOnce({
        results: mockResults,
        totalResults: 2,
        totalPages: 1,
        currentPage: 1
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('first query');
      });

      await waitFor(() => {
        expect(result.current.results).toEqual(mockResults);
      });

      // Start new search
      mockSearchApi.searchDocuments.mockResolvedValueOnce({
        results: [],
        totalResults: 0,
        totalPages: 1,
        currentPage: 1
      });

      act(() => {
        result.current.searchNow('second query');
      });

      // Wait for loading to start, then results should be cleared
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Results should be cleared during loading
      expect(result.current.results).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('handles search API errors', async () => {
      mockSearchApi.searchDocuments.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.searchNow('test query');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.results).toEqual([]);
      });
    });

    it('clears error when new search is successful', async () => {
      // First search fails
      mockSearchApi.searchDocuments.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('test query');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Second search succeeds
      mockSearchApi.searchDocuments.mockResolvedValueOnce({
        results: [],
        totalResults: 0,
        totalPages: 1
      });

      act(() => {
        result.current.setQuery('another query');
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('provides retry function', async () => {
      mockSearchApi.searchDocuments.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery('test query');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Retry should work
      mockSearchApi.searchDocuments.mockResolvedValueOnce({
        results: [],
        totalResults: 0,
        totalPages: 1
      });

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(mockSearchApi.searchDocuments).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Manual Search', () => {
    it('provides searchNow function for immediate search', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 0,
        totalPages: 1
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.searchNow('immediate query');
      });

      await waitFor(() => {
        expect(mockSearchApi.searchDocuments).toHaveBeenCalledWith({
          query: 'immediate query',
          filters: {
            documentType: 'all',
            dateRange: 'all',
            sortBy: 'relevance'
          },
          page: 1,
          limit: 10
        });
      });

      expect(result.current.query).toBe('immediate query');
    });

    it('bypasses debounce with searchNow', async () => {
      mockSearchApi.searchDocuments.mockResolvedValue({
        results: [],
        totalResults: 0,
        totalPages: 1,
        currentPage: 1
      });

      const { result } = renderHook(() => useSearch());

      // Set the query first without triggering search
      act(() => {
        result.current.setQuery('immediate');
      });

      // Clear any calls from the setQuery above
      mockSearchApi.searchDocuments.mockClear();

      act(() => {
        result.current.searchNow(); // Use current query
      });

      // Should call API immediately, not wait for debounce
      expect(mockSearchApi.searchDocuments).toHaveBeenCalledTimes(1);
    });
  });
});