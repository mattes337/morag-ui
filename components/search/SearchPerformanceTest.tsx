'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui';
import { PerformanceOptimizedSearch } from './PerformanceOptimizedSearch';
import { SearchResult } from '@/lib/mockData/searchMockData';

/**
 * Test component to verify search performance improvements
 * This component helps validate that:
 * 1. Memory leaks are fixed
 * 2. Re-render cascades are prevented
 * 3. Search highlighting is optimized
 * 4. Large data processing doesn't block UI
 */
export const SearchPerformanceTest: React.FC = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState<number>(0);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  // Track render performance
  useEffect(() => {
    const renderStartTime = performance.now();
    setRenderCount(prev => prev + 1);
    
    // Use requestAnimationFrame to get accurate render timing
    requestAnimationFrame(() => {
      const renderEndTime = performance.now();
      setLastRenderTime(renderEndTime - renderStartTime);
    });
  }, []);

  const handleResultClick = (result: SearchResult) => {
    console.log('Result clicked:', result.title);
    setSelectedResult(result);
  };

  return (
    <div className="search-performance-test p-6 space-y-6">
      {/* Performance Metrics Panel */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Performance Test Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium text-blue-800">Render Count</div>
              <div className="text-2xl font-bold text-blue-600">{renderCount}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-medium text-green-800">Last Render Time</div>
              <div className="text-2xl font-bold text-green-600">
                {lastRenderTime.toFixed(2)}ms
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="font-medium text-purple-800">Memory Usage</div>
              <div className="text-sm font-bold text-purple-600">
                {typeof performance !== 'undefined' && 'memory' in performance 
                  ? `${Math.round((performance as any).memory.usedJSHeapSize / 1048576)}MB`
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="font-medium text-orange-800">Selected Result</div>
              <div className="text-sm font-bold text-orange-600 truncate">
                {selectedResult ? selectedResult.title.substring(0, 20) + '...' : 'None'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Optimized Search */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Optimized Search Interface</h3>
          <PerformanceOptimizedSearch
            onResultClick={handleResultClick}
            enableMemoryMonitoring={true}
          />
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Performance Optimizations Applied</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <div>
                <strong>Memory Leak Fix:</strong> Stable debounce function using useRef prevents recreation on every render
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <div>
                <strong>Re-render Optimization:</strong> React.memo and memoized callbacks prevent unnecessary re-renders
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <div>
                <strong>Highlighting Performance:</strong> Memoized regex cache and escaped patterns prevent ReDoS attacks
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <div>
                <strong>Large Data Processing:</strong> Chunked processing and requestIdleCallback for non-blocking operations
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <div>
                <strong>Concurrent Features:</strong> useTransition and useDeferredValue for better user experience
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Performance Test Instructions</h3>
          <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
            <li>Open browser DevTools and monitor the Performance tab</li>
            <li>Type quickly in the search box to test debounce performance</li>
            <li>Watch the render count - it should not increase excessively during typing</li>
            <li>Monitor memory usage in the Memory tab - should remain stable</li>
            <li>Test with long search queries to verify highlighting performance</li>
            <li>Use filters to test re-render optimization</li>
            <li>Navigate between pages to test pagination performance</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchPerformanceTest;