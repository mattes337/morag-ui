'use client';

import React, { useCallback, useTransition, useDeferredValue, useState, useEffect, useMemo } from 'react';
import { SearchInterface } from './SearchInterface';
import { SearchResults } from './SearchResults';
import { SearchResultsVirtualized } from './SearchResultsVirtualized';
import { useSearch } from './hooks/useSearch';
import { useSearchOptimization } from '@/lib/hooks/useSearchOptimization';
import { SearchResult } from '@/lib/mockData/searchMockData';
import { measureSearchPerformance, monitorMemoryUsage } from '@/lib/utils/performance';
import { 
  measureSearchQuery, 
  measureSearchRender, 
  trackSearchPerformance,
  getSearchOptimizationSuggestions,
  createOptimizedDebounce
} from '@/lib/utils/searchPerformance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Zap, 
  Database, 
  Timer, 
  TrendingUp,
  Settings
} from 'lucide-react';

interface PerformanceOptimizedSearchProps {
  onResultClick?: (result: SearchResult) => void;
  onViewDetails?: (result: SearchResult) => void;
  className?: string;
  enableMemoryMonitoring?: boolean;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
  showPerformanceMetrics?: boolean;
  enableSearchSuggestions?: boolean;
}

/**
 * Performance-optimized search component that implements:
 * - React 18 concurrent features (useTransition, useDeferredValue)
 * - Intelligent result caching with TTL
 * - Virtualized rendering for large result sets
 * - Search suggestions and query optimization
 * - Comprehensive performance monitoring
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Memory monitoring and optimization suggestions
 */
export const PerformanceOptimizedSearch: React.FC<PerformanceOptimizedSearchProps> = ({
  onResultClick,
  onViewDetails,
  className = '',
  enableMemoryMonitoring = process.env.NODE_ENV === 'development',
  enableVirtualization = true,
  virtualizationThreshold = 50,
  showPerformanceMetrics = process.env.NODE_ENV === 'development',
  enableSearchSuggestions = true
}) => {
  // Use React 18 concurrent features for better performance
  const [isPending, startTransition] = useTransition();
  
  // Search optimization hooks
  const {
    getCachedResult,
    setCachedResult,
    getSearchSuggestions,
    measureSearchPerformance: measureOptimizedSearch,
    optimizeQuery,
    getAnalytics,
    getCacheStats
  } = useSearchOptimization({
    cacheTTL: 300000, // 5 minutes
    maxCacheSize: 100
  });

  // State for performance monitoring
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showOptimizationPanel, setShowOptimizationPanel] = useState(false);

  const {
    query,
    results,
    totalResults,
    currentPage,
    totalPages,
    isLoading,
    setQuery,
    goToPage,
    updateFilters
  } = useSearch({
    debounceDelay: 200, // Faster for better UX
    pageSize: 20, // Larger page size for better performance
    minQueryLength: 2
  });

  // Defer non-urgent updates to prevent blocking user interactions
  const deferredResults = useDeferredValue(results);
  const deferredTotalResults = useDeferredValue(totalResults);

  // Performance-aware search suggestions
  const optimizedSuggestions = useMemo(() => {
    if (!enableSearchSuggestions || !query) return [];
    return getSearchSuggestions(query, results);
  }, [enableSearchSuggestions, query, results, getSearchSuggestions]);

  // Update suggestions when they change
  useEffect(() => {
    setSuggestions(optimizedSuggestions);
  }, [optimizedSuggestions]);

  // Determine if we should use virtualization
  const shouldVirtualize = useMemo(() => {
    return enableVirtualization && 
           deferredResults.length >= virtualizationThreshold;
  }, [enableVirtualization, deferredResults.length, virtualizationThreshold]);

  // Get optimization suggestions
  const optimizationSuggestions = useMemo(() => {
    return getSearchOptimizationSuggestions();
  }, []);

  // Memoized search handler with caching and performance monitoring
  const handleSearch = useCallback(async (searchQuery: string) => {
    const optimizedSearchQuery = optimizeQuery(searchQuery);
    const cacheKey = `search:${optimizedSearchQuery}`;
    
    // Check cache first
    const cached = getCachedResult(cacheKey);
    if (cached && cached.results) {
      // Track cache hit
      trackSearchPerformance(
        { queryProcessingTime: 0, query: optimizedSearchQuery },
        { renderTime: 0 },
        cached.results.length,
        true
      );
      return;
    }

    if (enableMemoryMonitoring) {
      monitorMemoryUsage('Search');
    }

    // Measure search performance
    try {
      const { metrics } = await measureSearchQuery(
        async () => {
          // The actual search is handled by the useSearch hook via setQuery
          setQuery(optimizedSearchQuery);
          return Promise.resolve();
        },
        optimizedSearchQuery
      );

      // Cache results when search completes
      // Note: This is a simplified cache update - in real implementation,
      // you'd cache after the search API call completes
      setTimeout(() => {
        if (results.length > 0) {
          setCachedResult(cacheKey, {
            results,
            totalResults,
            totalPages,
            ttl: 300000
          });
        }
      }, 100);

    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [
    optimizeQuery, 
    getCachedResult, 
    setCachedResult, 
    setQuery, 
    enableMemoryMonitoring,
    results,
    totalResults,
    totalPages
  ]);

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
    // Track render performance for result interaction
    const renderMetrics = measureSearchRender(() => {
      onResultClick?.(result);
    }, 1);
    
    trackSearchPerformance(
      { queryProcessingTime: 0, query: 'result-click' },
      renderMetrics,
      1,
      false
    );
  }, [onResultClick]);

  // Memoized view details handler
  const handleViewDetails = useCallback((result: SearchResult) => {
    onViewDetails?.(result);
  }, [onViewDetails]);

  // Show stale indicator when results are deferred
  const isStale = results !== deferredResults;
  const combinedLoading = isLoading || isPending;

  // Memory monitoring effect
  useEffect(() => {
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
      {/* Performance optimization panel toggle */}
      {showPerformanceMetrics && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Performance Mode
            </Badge>
            {shouldVirtualize && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                Virtualized ({deferredResults.length} items)
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOptimizationPanel(!showOptimizationPanel)}
            className="flex items-center gap-1"
          >
            <Settings className="h-4 w-4" />
            {showOptimizationPanel ? 'Hide' : 'Show'} Metrics
          </Button>
        </div>
      )}

      {/* Search Interface */}
      <SearchInterface
        onSearch={handleSearch}
        onFilter={handleFilter}
        placeholder="Search documents with optimized performance..."
        autoFocus
      />

      {/* Search suggestions */}
      {enableSearchSuggestions && suggestions.length > 0 && (
        <div className="mt-2 mb-4">
          <div className="text-sm text-gray-600 mb-2">Suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSearch(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Performance indicator */}
      {(isStale || isPending) && (
        <div className="mt-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 animate-spin" />
            <span>
              {isPending && "Processing search with optimization..."}
              {isStale && "Results updating with deferred rendering..."}
            </span>
          </div>
        </div>
      )}

      {/* Optimization suggestions */}
      {showOptimizationPanel && optimizationSuggestions.memoryUsageWarning && (
        <div className="mt-2 mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>High memory usage detected. Consider reducing result set size or enabling virtualization.</span>
          </div>
        </div>
      )}

      {/* Search Results - Choose between virtualized and standard based on result count */}
      <div className="mt-6">
        {shouldVirtualize ? (
          <SearchResultsVirtualized
            results={deferredResults}
            query={query}
            onResultClick={handleResultClick}
            onViewDetails={handleViewDetails}
            height={600}
            itemHeight={140}
            isLoading={combinedLoading}
            className={isStale ? 'opacity-70 transition-opacity' : ''}
          />
        ) : (
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
        )}
      </div>

      {/* Performance metrics panel */}
      {showPerformanceMetrics && showOptimizationPanel && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Performance Analytics
            </h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-gray-600 dark:text-gray-400">Current Query</div>
              <div className="font-mono text-xs bg-white dark:bg-gray-700 p-2 rounded border">
                {query || 'No query'}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-gray-600 dark:text-gray-400">Results</div>
              <div className="font-semibold">
                {deferredResults.length}/{deferredTotalResults}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-gray-600 dark:text-gray-400">Rendering</div>
              <div className="font-semibold">
                {shouldVirtualize ? 'Virtualized' : 'Standard'}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
              <div className="font-semibold">
                {(getCacheStats().hitRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Optimization suggestions */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Optimization Suggestions:
            </div>
            <div className="flex flex-wrap gap-2">
              {optimizationSuggestions.shouldVirtualize && (
                <Badge variant="secondary">Enable Virtualization</Badge>
              )}
              {optimizationSuggestions.shouldCache && (
                <Badge variant="secondary">Improve Caching</Badge>
              )}
              {optimizationSuggestions.shouldDebounce && (
                <Badge variant="secondary">
                  Adjust Debounce ({optimizationSuggestions.suggestedDebounceDelay}ms)
                </Badge>
              )}
              {!optimizationSuggestions.shouldVirtualize && 
               !optimizationSuggestions.shouldCache && 
               !optimizationSuggestions.shouldDebounce && (
                <Badge variant="default" className="text-green-700 bg-green-100">
                  Performance Optimal
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceOptimizedSearch;