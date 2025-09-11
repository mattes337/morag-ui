'use client';

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { SearchResult } from '@/lib/mockData/searchMockData';

interface SearchCache {
  [key: string]: {
    results: SearchResult[];
    totalResults: number;
    totalPages: number;
    timestamp: number;
    ttl: number;
  };
}

interface UseSearchOptimizationOptions {
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTTL?: number;
  /** Maximum number of cached entries (default: 50) */
  maxCacheSize?: number;
  /** Debounce delay for search suggestions (default: 150ms) */
  suggestionDelay?: number;
  /** Enable search analytics tracking (default: true in development) */
  enableAnalytics?: boolean;
}

interface SearchAnalytics {
  totalSearches: number;
  averageResponseTime: number;
  cacheHitRate: number;
  mostSearchedTerms: string[];
  slowQueries: Array<{ query: string; duration: number; timestamp: number }>;
}

interface UseSearchOptimizationReturn {
  // Cache management
  getCachedResult: (key: string) => SearchCache[string] | null;
  setCachedResult: (key: string, data: Omit<SearchCache[string], 'timestamp'>) => void;
  clearCache: () => void;
  getCacheStats: () => { size: number; hitRate: number };
  
  // Search suggestions
  getSearchSuggestions: (query: string, allResults: SearchResult[]) => string[];
  
  // Performance monitoring
  measureSearchPerformance: <T>(operation: () => Promise<T>, query: string) => Promise<T>;
  getAnalytics: () => SearchAnalytics;
  
  // Query optimization
  optimizeQuery: (query: string) => string;
  
  // Memory management
  cleanupOldEntries: () => void;
}

/**
 * Hook for advanced search optimization including caching, suggestions, and performance monitoring
 * 
 * Features:
 * - Intelligent result caching with TTL
 * - Search query suggestions based on previous searches
 * - Performance analytics and monitoring
 * - Query optimization and normalization
 * - Memory management for large result sets
 * 
 * @example
 * ```typescript
 * const SearchComponent = () => {
 *   const {
 *     getCachedResult,
 *     setCachedResult,
 *     getSearchSuggestions,
 *     measureSearchPerformance,
 *     optimizeQuery
 *   } = useSearchOptimization({
 *     cacheTTL: 300000, // 5 minutes
 *     maxCacheSize: 100
 *   });
 * 
 *   const handleSearch = async (query: string) => {
 *     const optimizedQuery = optimizeQuery(query);
 *     const cacheKey = `search:${optimizedQuery}:${JSON.stringify(filters)}`;
 *     
 *     // Try cache first
 *     const cached = getCachedResult(cacheKey);
 *     if (cached) {
 *       return cached;
 *     }
 *     
 *     // Perform search with performance monitoring
 *     const results = await measureSearchPerformance(
 *       () => searchApi.search(optimizedQuery),
 *       optimizedQuery
 *     );
 *     
 *     // Cache results
 *     setCachedResult(cacheKey, {
 *       results: results.results,
 *       totalResults: results.totalResults,
 *       totalPages: results.totalPages,
 *       ttl: 300000
 *     });
 *     
 *     return results;
 *   };
 * };
 * ```
 */
export const useSearchOptimization = (
  options: UseSearchOptimizationOptions = {}
): UseSearchOptimizationReturn => {
  const {
    cacheTTL = 300000, // 5 minutes
    maxCacheSize = 50,
    suggestionDelay = 150,
    enableAnalytics = process.env.NODE_ENV === 'development'
  } = options;

  // Cache storage
  const cacheRef = useRef<SearchCache>({});
  const analyticsRef = useRef<SearchAnalytics>({
    totalSearches: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    mostSearchedTerms: [],
    slowQueries: []
  });
  
  // Performance tracking
  const searchTimesRef = useRef<number[]>([]);
  const cacheHitsRef = useRef(0);
  const cacheMissesRef = useRef(0);
  const searchTermsRef = useRef<Map<string, number>>(new Map());

  // Generate cache key helper
  const generateCacheKey = useCallback((query: string, filters?: any): string => {
    const normalizedQuery = query.trim().toLowerCase();
    const filterKey = filters ? JSON.stringify(filters) : '';
    return `search:${normalizedQuery}:${filterKey}`;
  }, []);

  // Check if cache entry is valid
  const isCacheValid = useCallback((entry: SearchCache[string]): boolean => {
    return Date.now() - entry.timestamp < entry.ttl;
  }, []);

  // Get cached result
  const getCachedResult = useCallback((key: string): SearchCache[string] | null => {
    const entry = cacheRef.current[key];
    if (entry && isCacheValid(entry)) {
      cacheHitsRef.current++;
      return entry;
    } else if (entry) {
      // Remove expired entry
      delete cacheRef.current[key];
    }
    cacheMissesRef.current++;
    return null;
  }, [isCacheValid]);

  // Set cached result
  const setCachedResult = useCallback((
    key: string, 
    data: Omit<SearchCache[string], 'timestamp'>
  ): void => {
    // Clean up old entries if cache is full
    const cacheKeys = Object.keys(cacheRef.current);
    if (cacheKeys.length >= maxCacheSize) {
      // Remove oldest entries (by timestamp)
      const sortedEntries = cacheKeys
        .map(k => ({ key: k, timestamp: cacheRef.current[k].timestamp }))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      const toRemove = sortedEntries.slice(0, Math.floor(maxCacheSize * 0.3));
      toRemove.forEach(entry => {
        delete cacheRef.current[entry.key];
      });
    }

    cacheRef.current[key] = {
      ...data,
      timestamp: Date.now()
    };
  }, [maxCacheSize]);

  // Clear entire cache
  const clearCache = useCallback((): void => {
    cacheRef.current = {};
    cacheHitsRef.current = 0;
    cacheMissesRef.current = 0;
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const totalRequests = cacheHitsRef.current + cacheMissesRef.current;
    return {
      size: Object.keys(cacheRef.current).length,
      hitRate: totalRequests > 0 ? cacheHitsRef.current / totalRequests : 0
    };
  }, []);

  // Generate search suggestions based on cached queries and results
  const getSearchSuggestions = useCallback((
    query: string, 
    allResults: SearchResult[]
  ): string[] => {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const suggestions = new Set<string>();

    // Extract suggestions from cached search terms
    searchTermsRef.current.forEach((count, term) => {
      if (term.toLowerCase().includes(normalizedQuery) && term !== normalizedQuery) {
        suggestions.add(term);
      }
    });

    // Extract suggestions from document titles and content
    allResults.forEach(result => {
      const title = result.title.toLowerCase();
      const excerpt = result.excerpt.toLowerCase();
      
      // Add title words that match
      const titleWords = title.split(/\s+/).filter(word => 
        word.length > 2 && word.includes(normalizedQuery)
      );
      titleWords.forEach(word => suggestions.add(word));

      // Add relevant phrases from excerpts
      const excerptPhrases = excerpt.split(/[.!?]+/).filter(phrase => 
        phrase.includes(normalizedQuery) && phrase.length < 50
      );
      excerptPhrases.forEach(phrase => {
        const cleanPhrase = phrase.trim();
        if (cleanPhrase.length > normalizedQuery.length) {
          suggestions.add(cleanPhrase);
        }
      });
    });

    // Return top 5 suggestions, sorted by relevance
    return Array.from(suggestions)
      .slice(0, 5)
      .sort((a, b) => {
        // Prioritize exact word matches
        const aExact = a.toLowerCase().startsWith(normalizedQuery);
        const bExact = b.toLowerCase().startsWith(normalizedQuery);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then by length (shorter is better)
        return a.length - b.length;
      });
  }, []);

  // Optimize search query
  const optimizeQuery = useCallback((query: string): string => {
    if (!query) return '';

    let optimized = query.trim();
    
    // Remove excessive whitespace
    optimized = optimized.replace(/\s+/g, ' ');
    
    // Remove common stop words for better search performance
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = optimized.split(' ');
    
    // Only remove stop words if we have more than 2 words
    if (words.length > 2) {
      optimized = words
        .filter(word => !stopWords.includes(word.toLowerCase()) || word.length > 3)
        .join(' ');
    }
    
    // Trim again after processing
    return optimized.trim();
  }, []);

  // Measure search performance
  const measureSearchPerformance = useCallback(async <T>(
    operation: () => Promise<T>,
    query: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      // Track analytics
      if (enableAnalytics) {
        analyticsRef.current.totalSearches++;
        searchTimesRef.current.push(duration);
        
        // Track search term frequency
        const normalizedQuery = query.trim().toLowerCase();
        const currentCount = searchTermsRef.current.get(normalizedQuery) || 0;
        searchTermsRef.current.set(normalizedQuery, currentCount + 1);
        
        // Track slow queries (>1 second)
        if (duration > 1000) {
          analyticsRef.current.slowQueries.push({
            query,
            duration,
            timestamp: Date.now()
          });
          
          // Keep only last 20 slow queries
          if (analyticsRef.current.slowQueries.length > 20) {
            analyticsRef.current.slowQueries = analyticsRef.current.slowQueries.slice(-20);
          }
        }
        
        // Update average response time
        if (searchTimesRef.current.length > 100) {
          searchTimesRef.current = searchTimesRef.current.slice(-50);
        }
        analyticsRef.current.averageResponseTime = 
          searchTimesRef.current.reduce((sum, time) => sum + time, 0) / searchTimesRef.current.length;
        
        // Update cache hit rate
        const totalRequests = cacheHitsRef.current + cacheMissesRef.current;
        analyticsRef.current.cacheHitRate = 
          totalRequests > 0 ? cacheHitsRef.current / totalRequests : 0;
        
        // Update most searched terms
        const sortedTerms = Array.from(searchTermsRef.current.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(entry => entry[0]);
        analyticsRef.current.mostSearchedTerms = sortedTerms;
        
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Search "${query}" completed in ${duration.toFixed(2)}ms`);
          
          if (duration > 500) {
            console.warn(`Slow search detected: "${query}" took ${duration.toFixed(2)}ms`);
          }
        }
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`Search "${query}" failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, [enableAnalytics]);

  // Get analytics data
  const getAnalytics = useCallback((): SearchAnalytics => {
    return { ...analyticsRef.current };
  }, []);

  // Clean up old cache entries
  const cleanupOldEntries = useCallback((): void => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > cache[key].ttl) {
        delete cache[key];
      }
    });
    
    // Clean up old search times
    if (searchTimesRef.current.length > 200) {
      searchTimesRef.current = searchTimesRef.current.slice(-100);
    }
    
    // Clean up old search terms (keep only top 100)
    if (searchTermsRef.current.size > 100) {
      const sortedTerms = Array.from(searchTermsRef.current.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);
      
      searchTermsRef.current.clear();
      sortedTerms.forEach(([term, count]) => {
        searchTermsRef.current.set(term, count);
      });
    }
  }, []);

  // Periodic cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      cleanupOldEntries();
    }, 60000); // Cleanup every minute

    return () => clearInterval(cleanup);
  }, [cleanupOldEntries]);

  return {
    getCachedResult,
    setCachedResult,
    clearCache,
    getCacheStats,
    getSearchSuggestions,
    measureSearchPerformance,
    getAnalytics,
    optimizeQuery,
    cleanupOldEntries
  };
};

export default useSearchOptimization;