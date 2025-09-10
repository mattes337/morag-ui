/**
 * React hooks for performance tracking and optimization
 * 
 * Provides hooks to track component render performance, re-renders,
 * and memory usage patterns in React applications.
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   // Track render performance automatically
 *   useRenderTracking('MyComponent');
 *   
 *   // Track re-renders with debug info
 *   useRerenderTracking('MyComponent', { debugInfo: { propCount: 5 } });
 *   
 *   // Monitor memory usage for specific component
 *   const memoryStats = useMemoryTracking();
 *   
 *   return <div>Component content</div>;
 * }
 * ```
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { 
  trackRender, 
  trackComponentRerender, 
  getGlobalPerformanceMonitor,
  type MemoryStats 
} from '@/lib/utils/performanceMonitoring';

// Configuration for render tracking
interface RenderTrackingOptions {
  /** Whether to track renders in production */
  enableInProduction?: boolean;
  /** Threshold in ms for what constitutes a slow render */
  slowRenderThreshold?: number;
  /** Whether to log render times to console */
  debugMode?: boolean;
}

// Configuration for re-render tracking
interface RerenderTrackingOptions extends RenderTrackingOptions {
  /** Additional debug information to log */
  debugInfo?: Record<string, any>;
  /** Whether to track dependency changes */
  trackDependencies?: boolean;
}

/**
 * Hook to track render performance of a component
 * 
 * @param componentName - Name of the component for tracking
 * @param options - Configuration options
 */
export function useRenderTracking(
  componentName: string, 
  options: RenderTrackingOptions = {}
): void {
  const { 
    enableInProduction = false, 
    slowRenderThreshold = 16,
    debugMode = false
  } = options;
  
  const renderStartTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  
  // Skip tracking in production unless explicitly enabled
  const shouldTrack = process.env.NODE_ENV === 'development' || enableInProduction;
  
  // Track render start time
  if (shouldTrack) {
    renderStartTimeRef.current = performance.now();
    renderCountRef.current++;
  }
  
  useEffect(() => {
    if (!shouldTrack) return;
    
    const renderDuration = performance.now() - renderStartTimeRef.current;
    
    // Track render performance
    trackRender(componentName, renderDuration);
    
    // Debug logging if enabled
    if (debugMode) {
      const renderType = renderCountRef.current === 1 ? 'mount' : 'update';
      const isSlowRender = renderDuration > slowRenderThreshold;
      const logLevel = isSlowRender ? 'warn' : 'log';
      
      console[logLevel](
        `🔍 ${componentName} ${renderType}: ${renderDuration.toFixed(2)}ms ${isSlowRender ? '(SLOW)' : ''}`
      );
    }
  });
}

/**
 * Hook to track component re-renders and identify unnecessary renders
 * 
 * @param componentName - Name of the component for tracking
 * @param options - Configuration options
 */
export function useRerenderTracking(
  componentName: string,
  options: RerenderTrackingOptions = {}
): void {
  const { debugInfo, trackDependencies = false, debugMode = false } = options;
  const previousRenderRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const previousDepsRef = useRef<any[]>([]);
  
  const shouldTrack = process.env.NODE_ENV === 'development' || options.enableInProduction;
  
  renderCountRef.current++;
  
  useEffect(() => {
    if (!shouldTrack) return;
    
    const now = Date.now();
    const timeSinceLastRender = now - previousRenderRef.current;
    previousRenderRef.current = now;
    
    // Track the re-render
    trackComponentRerender(componentName);
    
    if (debugMode && renderCountRef.current > 1) {
      const logData: any = {
        component: componentName,
        renderCount: renderCountRef.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`,
      };
      
      if (debugInfo) {
        logData.debugInfo = debugInfo;
      }
      
      // Warn if re-rendering too frequently
      const isFrequentRerender = timeSinceLastRender < 100 && renderCountRef.current > 5;
      const logLevel = isFrequentRerender ? 'warn' : 'log';
      
      console[logLevel](
        `🔄 ${componentName} re-render #${renderCountRef.current}:`,
        logData
      );
    }
  });
  
  // Track dependency changes if enabled
  useEffect(() => {
    if (!shouldTrack || !trackDependencies || !debugMode) return;
    
    const currentDeps = [debugInfo];
    const previousDeps = previousDepsRef.current;
    
    if (previousDeps.length > 0) {
      const changes = currentDeps.map((dep, index) => ({
        index,
        changed: dep !== previousDeps[index],
        previous: previousDeps[index],
        current: dep
      })).filter(change => change.changed);
      
      if (changes.length > 0) {
        console.log(`📊 ${componentName} dependency changes:`, changes);
      }
    }
    
    previousDepsRef.current = currentDeps;
  });
}

/**
 * Hook to monitor memory usage for a specific component or operation
 * 
 * @param interval - How often to check memory (in ms)
 * @returns Current memory statistics
 */
export function useMemoryTracking(interval: number = 5000): MemoryStats | null {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const intervalRef = useRef<number>();
  
  useEffect(() => {
    if (typeof window === 'undefined' || !performance.memory) {
      return;
    }
    
    const updateMemoryStats = () => {
      const report = getGlobalPerformanceMonitor().getReport();
      setMemoryStats(report.memoryStats);
    };
    
    // Initial check
    updateMemoryStats();
    
    // Set up interval
    intervalRef.current = window.setInterval(updateMemoryStats, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval]);
  
  return memoryStats;
}

/**
 * Hook to track expensive calculations and optimize with useMemo
 * 
 * @param factory - Function to compute the expensive value
 * @param deps - Dependencies for the computation
 * @param name - Name for tracking purposes
 * @returns Memoized value and performance stats
 */
export function useTrackedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  name: string
): { value: T; computeTime: number; hitCount: number; missCount: number } {
  const statsRef = useRef({ hitCount: 0, missCount: 0, lastComputeTime: 0 });
  const shouldTrack = process.env.NODE_ENV === 'development';
  
  const value = useMemo(() => {
    if (shouldTrack) {
      const startTime = performance.now();
      const result = factory();
      const computeTime = performance.now() - startTime;
      
      statsRef.current.lastComputeTime = computeTime;
      statsRef.current.missCount++;
      
      if (computeTime > 5) {
        console.log(`🧮 ${name} computed in ${computeTime.toFixed(2)}ms`);
      }
      
      return result;
    }
    
    return factory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  // Track cache hits (when useMemo returns cached value)
  useEffect(() => {
    if (shouldTrack && statsRef.current.missCount > 0) {
      statsRef.current.hitCount++;
    }
  });
  
  return {
    value,
    computeTime: statsRef.current.lastComputeTime,
    hitCount: statsRef.current.hitCount,
    missCount: statsRef.current.missCount
  };
}

/**
 * Hook to track and optimize useCallback performance
 * 
 * @param callback - Callback function
 * @param deps - Dependencies for the callback
 * @param name - Name for tracking purposes
 * @returns Memoized callback and performance stats
 */
export function useTrackedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  name: string
): { callback: T; hitCount: number; missCount: number } {
  const statsRef = useRef({ hitCount: 0, missCount: 0 });
  const shouldTrack = process.env.NODE_ENV === 'development';
  const previousDepsRef = useRef<React.DependencyList>();
  
  const memoizedCallback = useMemo(() => {
    if (shouldTrack) {
      const isFirstRun = !previousDepsRef.current;
      const depsChanged = !isFirstRun && (
        deps.length !== previousDepsRef.current!.length ||
        deps.some((dep, index) => dep !== previousDepsRef.current![index])
      );
      
      if (depsChanged || isFirstRun) {
        statsRef.current.missCount++;
        if (depsChanged) {
          console.log(`🔄 ${name} callback recreated due to dependency changes`);
        }
      } else {
        statsRef.current.hitCount++;
      }
      
      previousDepsRef.current = deps;
    }
    
    return callback;
  }, [callback, name, shouldTrack, deps]);
  
  return {
    callback: memoizedCallback,
    hitCount: statsRef.current.hitCount,
    missCount: statsRef.current.missCount
  };
}

/**
 * Development-only hook to display performance warnings
 */
export function usePerformanceWarnings(): void {
  const report = getGlobalPerformanceMonitor().getReport();
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Show warnings for performance issues
    if (report.recommendations.length > 0) {
      console.group('⚠️ Performance Recommendations');
      report.recommendations.forEach(rec => console.warn(rec));
      console.groupEnd();
    }
    
    // Show memory warnings
    if (report.memoryStats.currentMB > 100) {
      console.warn(`🧠 High memory usage: ${report.memoryStats.currentMB}MB`);
    }
    
    // Show render warnings
    if (report.renderStats.slowRenders > 0) {
      console.warn(`🐌 ${report.renderStats.slowRenders} slow renders detected`);
    }
  }, [report.recommendations, report.memoryStats.currentMB, report.renderStats.slowRenders]);
}

/**
 * Custom hook to measure and optimize component bundle size impact
 * 
 * @param componentName - Name of the component
 * @param imports - Array of imported modules/packages
 */
export function useBundleImpactTracking(
  componentName: string,
  imports: string[] = []
): void {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Log component bundle impact for analysis
    console.log(`📦 ${componentName} bundle impact:`, {
      imports: imports.length,
      importList: imports
    });
  }, [componentName, imports]);
}