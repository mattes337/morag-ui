'use client';

/**
 * Search-specific performance utilities and monitoring
 * 
 * This module provides comprehensive performance monitoring specifically tailored 
 * for search operations, including query optimization, result processing metrics,
 * and user experience performance tracking.
 */

interface SearchPerformanceMetrics {
  queryProcessingTime: number;
  resultRenderingTime: number;
  totalResponseTime: number;
  resultCount: number;
  cacheHit: boolean;
  query: string;
  timestamp: number;
  userAgent?: string;
  viewportSize?: { width: number; height: number };
}

interface SearchPerformanceStats {
  averageQueryTime: number;
  averageRenderTime: number;
  averageResponseTime: number;
  cacheHitRate: number;
  slowQueriesCount: number;
  totalSearches: number;
  topSlowQueries: Array<{ query: string; time: number; count: number }>;
}

interface SearchOptimizationSuggestions {
  shouldVirtualize: boolean;
  suggestedPageSize: number;
  shouldCache: boolean;
  shouldDebounce: boolean;
  suggestedDebounceDelay: number;
  memoryUsageWarning: boolean;
}

class SearchPerformanceManager {
  private static instance: SearchPerformanceManager;
  private metrics: SearchPerformanceMetrics[] = [];
  private maxMetricsSize = 1000;
  private slowQueryThreshold = 500; // ms
  
  static getInstance(): SearchPerformanceManager {
    if (!SearchPerformanceManager.instance) {
      SearchPerformanceManager.instance = new SearchPerformanceManager();
    }
    return SearchPerformanceManager.instance;
  }

  /**
   * Record a search performance metric
   */
  recordSearchMetric(metric: SearchPerformanceMetrics): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
      ...(typeof navigator !== 'undefined' && { userAgent: navigator.userAgent }),
      ...(typeof window !== 'undefined' && { 
        viewportSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      })
    });

    // Keep metrics array size manageable
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-Math.floor(this.maxMetricsSize * 0.8));
    }

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && 
        metric.totalResponseTime > this.slowQueryThreshold) {
      console.warn(
        `Slow search detected: "${metric.query}" took ${metric.totalResponseTime}ms`,
        {
          queryTime: metric.queryProcessingTime,
          renderTime: metric.resultRenderingTime,
          resultCount: metric.resultCount,
          cacheHit: metric.cacheHit
        }
      );
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): SearchPerformanceStats {
    if (this.metrics.length === 0) {
      return {
        averageQueryTime: 0,
        averageRenderTime: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        slowQueriesCount: 0,
        totalSearches: 0,
        topSlowQueries: []
      };
    }

    const queryTimes = this.metrics.map(m => m.queryProcessingTime);
    const renderTimes = this.metrics.map(m => m.resultRenderingTime);
    const responseTimes = this.metrics.map(m => m.totalResponseTime);
    
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;
    const slowQueries = this.metrics.filter(m => m.totalResponseTime > this.slowQueryThreshold);
    
    // Aggregate slow queries by query string
    const slowQueryMap = new Map<string, { time: number; count: number }>();
    slowQueries.forEach(metric => {
      const existing = slowQueryMap.get(metric.query);
      if (existing) {
        existing.time = Math.max(existing.time, metric.totalResponseTime);
        existing.count++;
      } else {
        slowQueryMap.set(metric.query, { 
          time: metric.totalResponseTime, 
          count: 1 
        });
      }
    });

    const topSlowQueries = Array.from(slowQueryMap.entries())
      .map(([query, data]) => ({ query, ...data }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    return {
      averageQueryTime: this.average(queryTimes),
      averageRenderTime: this.average(renderTimes),
      averageResponseTime: this.average(responseTimes),
      cacheHitRate: cacheHits / this.metrics.length,
      slowQueriesCount: slowQueries.length,
      totalSearches: this.metrics.length,
      topSlowQueries
    };
  }

  /**
   * Get optimization suggestions based on performance data
   */
  getOptimizationSuggestions(): SearchOptimizationSuggestions {
    const stats = this.getPerformanceStats();
    const recentMetrics = this.metrics.slice(-50); // Last 50 searches
    
    const avgResultCount = this.average(recentMetrics.map(m => m.resultCount));
    const avgRenderTime = stats.averageRenderTime;
    const avgResponseTime = stats.averageResponseTime;
    
    return {
      shouldVirtualize: avgResultCount > 100 || avgRenderTime > 100,
      suggestedPageSize: this.calculateOptimalPageSize(avgRenderTime, avgResultCount),
      shouldCache: stats.cacheHitRate < 0.3 && stats.averageQueryTime > 200,
      shouldDebounce: stats.totalSearches > 20 && stats.averageResponseTime > 300,
      suggestedDebounceDelay: this.calculateOptimalDebounceDelay(avgResponseTime),
      memoryUsageWarning: this.checkMemoryUsage()
    };
  }

  /**
   * Clear all performance metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): SearchPerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific time range
   */
  getMetricsInRange(startTime: number, endTime: number): SearchPerformanceMetrics[] {
    return this.metrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private calculateOptimalPageSize(avgRenderTime: number, avgResultCount: number): number {
    // Target render time of 100ms
    const targetRenderTime = 100;
    
    if (avgRenderTime <= targetRenderTime) {
      return Math.min(50, Math.max(10, Math.floor(avgResultCount / 5)));
    }
    
    // Calculate based on render performance
    const renderRatio = targetRenderTime / avgRenderTime;
    const suggestedSize = Math.floor(avgResultCount * renderRatio);
    
    return Math.min(50, Math.max(5, suggestedSize));
  }

  private calculateOptimalDebounceDelay(avgResponseTime: number): number {
    // Base delay of 300ms, adjust based on response time
    const baseDelay = 300;
    
    if (avgResponseTime < 200) return 200;
    if (avgResponseTime < 500) return baseDelay;
    if (avgResponseTime < 1000) return 500;
    
    return 800; // For very slow responses
  }

  private checkMemoryUsage(): boolean {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1048576;
      return usedMB > 150; // Warn if using more than 150MB
    }
    return false;
  }
}

// Singleton instance
const performanceManager = SearchPerformanceManager.getInstance();

/**
 * Measure search query processing time
 */
export const measureSearchQuery = async <T>(
  operation: () => Promise<T>,
  query: string
): Promise<{ result: T; metrics: Partial<SearchPerformanceMetrics> }> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const queryProcessingTime = performance.now() - startTime;
    
    return {
      result,
      metrics: {
        queryProcessingTime,
        query: query.trim()
      }
    };
  } catch (error) {
    const queryProcessingTime = performance.now() - startTime;
    
    // Log failed query performance
    if (process.env.NODE_ENV === 'development') {
      console.error(`Search query "${query}" failed after ${queryProcessingTime}ms:`, error);
    }
    
    throw error;
  }
};

/**
 * Measure search result rendering time
 */
export const measureSearchRender = (
  operation: () => void,
  _resultCount: number
): { renderTime: number } => {
  const startTime = performance.now();
  
  operation();
  
  const renderTime = performance.now() - startTime;
  
  return { renderTime };
};

/**
 * Track complete search operation performance
 */
export const trackSearchPerformance = (
  queryMetrics: Partial<SearchPerformanceMetrics>,
  renderMetrics: { renderTime: number },
  resultCount: number,
  cacheHit: boolean = false
): void => {
  const totalResponseTime = (queryMetrics.queryProcessingTime || 0) + renderMetrics.renderTime;
  
  const completeMetrics: SearchPerformanceMetrics = {
    queryProcessingTime: queryMetrics.queryProcessingTime || 0,
    resultRenderingTime: renderMetrics.renderTime,
    totalResponseTime,
    resultCount,
    cacheHit,
    query: queryMetrics.query || '',
    timestamp: Date.now()
  };
  
  performanceManager.recordSearchMetric(completeMetrics);
};

/**
 * Get current search performance statistics
 */
export const getSearchPerformanceStats = (): SearchPerformanceStats => {
  return performanceManager.getPerformanceStats();
};

/**
 * Get optimization suggestions for search performance
 */
export const getSearchOptimizationSuggestions = (): SearchOptimizationSuggestions => {
  return performanceManager.getOptimizationSuggestions();
};

/**
 * Monitor search component performance using React Profiler
 */
export const createSearchProfiler = (id: string) => {
  return (
    _id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    _baseDuration: number,
    _startTime: number,
    commitTime: number
  ) => {
    if (actualDuration > 16) { // Longer than one frame at 60fps
      const metric = {
        queryProcessingTime: 0,
        resultRenderingTime: actualDuration,
        totalResponseTime: actualDuration,
        resultCount: 0,
        cacheHit: false,
        query: `${id}-${phase}`,
        timestamp: commitTime
      };
      
      performanceManager.recordSearchMetric(metric);
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `Slow render in ${id} (${phase}): ${actualDuration.toFixed(2)}ms`,
          { baseDuration: _baseDuration, startTime: _startTime, commitTime }
        );
      }
    }
  };
};

/**
 * Debounce utility optimized for search performance
 */
export const createOptimizedDebounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): T & { cancel: () => void; flush: () => ReturnType<T> } => {
  let timeoutId: NodeJS.Timeout | undefined;
  let maxTimeoutId: NodeJS.Timeout | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T>;
  let lastThis: any;
  let result: ReturnType<T>;

  const { leading = false, trailing = true, maxWait } = options;

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined as any;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time: number): ReturnType<T> {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired(): ReturnType<T> | undefined {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
    return undefined;
  }

  function trailingEdge(time: number): ReturnType<T> {
    timeoutId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined as any;
    return result;
  }

  function cancel(): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== undefined) {
      clearTimeout(maxTimeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeoutId = maxTimeoutId = undefined as any;
  }

  function flush(): ReturnType<T> {
    return timeoutId === undefined ? result : (trailingEdge(Date.now()) as ReturnType<T>);
  }

  function debounced(this: any, ...args: Parameters<T>): ReturnType<T> {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced as T & { cancel: () => void; flush: () => ReturnType<T> };
};

/**
 * Performance-optimized search result processor
 */
export const processSearchResults = <T>(
  results: T[],
  processor: (item: T, index: number) => T,
  batchSize: number = 50
): Promise<T[]> => {
  return new Promise((resolve) => {
    const processed: T[] = [];
    let currentIndex = 0;

    const processBatch = () => {
      const endIndex = Math.min(currentIndex + batchSize, results.length);
      
      for (let i = currentIndex; i < endIndex; i++) {
        const item = results[i];
        if (item !== undefined) {
          processed.push(processor(item, i));
        }
      }
      
      currentIndex = endIndex;
      
      if (currentIndex < results.length) {
        // Use setTimeout to avoid blocking the main thread
        setTimeout(processBatch, 0);
      } else {
        resolve(processed);
      }
    };

    processBatch();
  });
};

/**
 * Clear all performance metrics (useful for testing)
 */
export const clearSearchMetrics = (): void => {
  performanceManager.clearMetrics();
};

/**
 * Export performance metrics for analysis
 */
export const exportSearchMetrics = (): SearchPerformanceMetrics[] => {
  return performanceManager.exportMetrics();
};

export default performanceManager;