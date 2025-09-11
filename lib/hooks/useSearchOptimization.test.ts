import { renderHook, act } from '@testing-library/react';
import { useSearchOptimization } from './useSearchOptimization';
import { SearchResult } from '@/lib/mockData/searchMockData';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
  }
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

describe('useSearchOptimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(Date.now());
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useSearchOptimization());

    expect(result.current.getCacheStats().size).toBe(0);
    expect(result.current.getCacheStats().hitRate).toBe(0);
    expect(result.current.getAnalytics().totalSearches).toBe(0);
  });

  it('should cache and retrieve search results', () => {
    const { result } = renderHook(() => useSearchOptimization());

    const testData = {
      results: [] as SearchResult[],
      totalResults: 0,
      totalPages: 1,
      ttl: 300000
    };

    act(() => {
      result.current.setCachedResult('test-key', testData);
    });

    const cached = result.current.getCachedResult('test-key');
    expect(cached).toBeTruthy();
    expect(cached?.results).toEqual([]);
    expect(cached?.totalResults).toBe(0);
  });

  it('should return null for expired cache entries', async () => {
    const { result } = renderHook(() => useSearchOptimization({
      cacheTTL: 100 // 100ms TTL
    }));

    const testData = {
      results: [] as SearchResult[],
      totalResults: 0,
      totalPages: 1,
      ttl: 100
    };

    act(() => {
      result.current.setCachedResult('test-key', testData);
    });

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    const cached = result.current.getCachedResult('test-key');
    expect(cached).toBeNull();
  });

  it('should optimize search queries', () => {
    const { result } = renderHook(() => useSearchOptimization());

    expect(result.current.optimizeQuery('  hello   world  ')).toBe('hello world');
    expect(result.current.optimizeQuery('the quick brown fox')).toBe('quick brown fox');
    expect(result.current.optimizeQuery('a very long query with stop words')).toBe('very long query with stop words');
    expect(result.current.optimizeQuery('')).toBe('');
  });

  it('should generate search suggestions', () => {
    const { result } = renderHook(() => useSearchOptimization());

    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'JavaScript Performance Tips',
        excerpt: 'Learn about JavaScript performance optimization techniques',
        documentType: 'document',
        relevanceScore: 0.9,
        author: 'John Doe',
        dateCreated: '2023-01-01',
        realm: 'tech'
      },
      {
        id: '2',
        title: 'React Performance Guide',
        excerpt: 'Comprehensive guide to React performance',
        documentType: 'document',
        relevanceScore: 0.8,
        author: 'Jane Smith',
        dateCreated: '2023-01-02',
        realm: 'tech'
      }
    ];

    const suggestions = result.current.getSearchSuggestions('perf', mockResults);
    
    expect(suggestions).toContain('performance');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(5);
  });

  it('should measure search performance', async () => {
    const { result } = renderHook(() => useSearchOptimization({
      enableAnalytics: true
    }));

    const mockOperation = jest.fn().mockResolvedValue('test result');
    let startTime = 100;
    mockPerformance.now
      .mockReturnValueOnce(startTime)
      .mockReturnValueOnce(startTime + 250); // 250ms duration

    await act(async () => {
      const operationResult = await result.current.measureSearchPerformance(
        mockOperation,
        'test query'
      );
      expect(operationResult).toBe('test result');
    });

    expect(mockOperation).toHaveBeenCalledTimes(1);
    
    const analytics = result.current.getAnalytics();
    expect(analytics.totalSearches).toBe(1);
    expect(analytics.averageResponseTime).toBe(250);
  });

  it('should track slow queries', async () => {
    const { result } = renderHook(() => useSearchOptimization({
      enableAnalytics: true
    }));

    const mockOperation = jest.fn().mockResolvedValue('test result');
    mockPerformance.now
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(1500); // 1400ms duration (slow)

    await act(async () => {
      await result.current.measureSearchPerformance(mockOperation, 'slow query');
    });

    const analytics = result.current.getAnalytics();
    expect(analytics.slowQueries.length).toBe(1);
    expect(analytics.slowQueries[0].query).toBe('slow query');
    expect(analytics.slowQueries[0].duration).toBe(1400);
  });

  it('should clear cache', () => {
    const { result } = renderHook(() => useSearchOptimization());

    const testData = {
      results: [] as SearchResult[],
      totalResults: 0,
      totalPages: 1,
      ttl: 300000
    };

    act(() => {
      result.current.setCachedResult('test-key', testData);
    });

    expect(result.current.getCacheStats().size).toBe(1);

    act(() => {
      result.current.clearCache();
    });

    expect(result.current.getCacheStats().size).toBe(0);
    expect(result.current.getCacheStats().hitRate).toBe(0);
  });

  it('should manage cache size limits', () => {
    const { result } = renderHook(() => useSearchOptimization({
      maxCacheSize: 10 // Use a larger cache size so cleanup is meaningful
    }));

    const testData = {
      results: [] as SearchResult[],
      totalResults: 0,
      totalPages: 1,
      ttl: 300000
    };

    act(() => {
      // Add items equal to max cache size
      for (let i = 1; i <= 10; i++) {
        result.current.setCachedResult(`key${i}`, testData);
      }
      
      // This should trigger cleanup when adding the 11th item
      result.current.setCachedResult('key11', testData);
    });

    const stats = result.current.getCacheStats();
    // After cleanup (30% of 10 = 3 items removed), we should have 8 items
    expect(stats.size).toBeLessThan(11);
    expect(stats.size).toBeGreaterThan(0); // But still have some items
  });

  it('should calculate cache hit rate correctly', () => {
    const { result } = renderHook(() => useSearchOptimization());

    const testData = {
      results: [] as SearchResult[],
      totalResults: 0,
      totalPages: 1,
      ttl: 300000
    };

    act(() => {
      result.current.setCachedResult('test-key', testData);
      
      // Hit
      result.current.getCachedResult('test-key');
      // Miss
      result.current.getCachedResult('non-existent-key');
      // Hit
      result.current.getCachedResult('test-key');
    });

    const stats = result.current.getCacheStats();
    expect(stats.hitRate).toBeCloseTo(0.67, 2); // 2 hits out of 3 requests
  });

  it('should handle empty suggestions gracefully', () => {
    const { result } = renderHook(() => useSearchOptimization());

    expect(result.current.getSearchSuggestions('', [])).toEqual([]);
    expect(result.current.getSearchSuggestions('x', [])).toEqual([]);
    expect(result.current.getSearchSuggestions('nonexistent', [])).toEqual([]);
  });

  it('should cleanup old entries periodically', async () => {
    const { result } = renderHook(() => useSearchOptimization());

    const testData = {
      results: [] as SearchResult[],
      totalResults: 0,
      totalPages: 1,
      ttl: 1 // Very short TTL (1ms)
    };

    act(() => {
      result.current.setCachedResult('test-key', testData);
    });

    expect(result.current.getCacheStats().size).toBe(1);

    // Wait for the TTL to expire
    await new Promise(resolve => setTimeout(resolve, 10));

    act(() => {
      result.current.cleanupOldEntries();
    });

    // Should clean up expired entries
    expect(result.current.getCacheStats().size).toBe(0);
  });
});