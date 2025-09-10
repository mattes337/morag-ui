'use client';

import React, { useCallback, useTransition, useDeferredValue } from 'react';
import { SearchInterface } from './SearchInterface';
import { SearchResults } from './SearchResults';
import { useSearch } from './hooks/useSearch';
import { SearchResult } from '@/lib/mockData/searchMockData';
import { measureSearchPerformance, monitorMemoryUsage } from '@/lib/utils/performance';

interface PerformanceOptimizedSearchProps {
  onResultClick?: (result: SearchResult) => void;
  className?: string;
  enableMemoryMonitoring?: boolean;
}

/**
 * Performance-optimized search component that implements:
 * - React 18 concurrent features (useTransition, useDeferredValue)
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Memory monitoring in development
 * - Performance metrics collection
 */
export const PerformanceOptimizedSearch: React.FC<PerformanceOptimizedSearchProps> = ({
  onResultClick,
  className = '',
  enableMemoryMonitoring = process.env.NODE_ENV === 'development'
}) => {
  // Use React 18 concurrent features for better performance
  const [isPending, startTransition] = useTransition();
  
  const {
    query,
    results,
    totalResults,
    currentPage,
    totalPages,
    isLoading,
    goToPage,
    updateFilters
  } = useSearch({
    debounceDelay: 300, // Slightly faster for better UX
    pageSize: 10,
    minQueryLength: 2 // Lower threshold for better search experience
  });

  // Defer non-urgent updates to prevent blocking user interactions
  const deferredResults = useDeferredValue(results);
  const deferredTotalResults = useDeferredValue(totalResults);

  // Memoized search handler with performance monitoring
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (enableMemoryMonitoring) {
      monitorMemoryUsage('Search');
    }

    // Use transition for non-urgent search updates
    startTransition(() => {
      measureSearchPerformance(
        async () => {
          // The actual search is handled by the useSearch hook
          return Promise.resolve();
        },
        `Search for "${searchQuery}"`
      );
    });
  }, [enableMemoryMonitoring]);

  // Memoized filter handler
  const handleFilter = useCallback((newFilters: any) => {
    startTransition(() => {
      updateFilters(newFilters);
    });
  }, [updateFilters]);

  // Memoized page change handler
  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      goToPage(page);
    });
  }, [goToPage]);

  // Memoized result click handler
  const handleResultClick = useCallback((result: SearchResult) => {
    // Immediate priority for user interactions
    onResultClick?.(result);
  }, [onResultClick]);

  // Show stale indicator when results are deferred
  const isStale = results !== deferredResults;
  const combinedLoading = isLoading || isPending;

  // Memory monitoring effect
  React.useEffect(() => {
    if (enableMemoryMonitoring) {
      const interval = setInterval(() => {
        monitorMemoryUsage('PerformanceOptimizedSearch');
      }, 30000); // Monitor every 30 seconds

      return () => clearInterval(interval);
    }
    return undefined;
  }, [enableMemoryMonitoring]);

  return (
    <div className={`performance-optimized-search ${className}`}>
      {/* Search Interface */}
      <SearchInterface
        onSearch={handleSearch}
        onFilter={handleFilter}
        placeholder="Search documents with optimized performance..."
        autoFocus
      />

      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (isStale || isPending) && (
        <div className="mt-2 mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
          {isPending && "🔄 Processing search..."}
          {isStale && "⏱️ Results updating..."}
        </div>
      )}

      {/* Search Results with deferred values for better performance */}
      <div className="mt-6">
        <SearchResults
          results={deferredResults}
          totalResults={deferredTotalResults}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={combinedLoading}
          onPageChange={handlePageChange}
          onResultClick={handleResultClick}
          query={query}
          className={isStale ? 'opacity-70 transition-opacity' : ''}
        />
      </div>

      {/* Development performance metrics */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-600">
          <h4 className="font-semibold mb-2">Performance Metrics (Dev Mode)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Query:</strong> {query || 'No query'}
            </div>
            <div>
              <strong>Results:</strong> {deferredResults.length}/{deferredTotalResults}
            </div>
            <div>
              <strong>Loading:</strong> {combinedLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Stale:</strong> {isStale ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceOptimizedSearch;