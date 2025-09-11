/**
 * Performance Tracking Utilities for MoRAG
 * 
 * Provides high-level performance tracking specifically for page load times,
 * component render performance, memory usage monitoring, and bundle size analysis.
 * Builds upon the existing performanceMonitoring.ts infrastructure.
 * 
 * @example
 * ```typescript
 * // Track page performance
 * const pageTracker = createPagePerformanceTracker();
 * pageTracker.startPageLoad();
 * // ... page loads
 * pageTracker.endPageLoad();
 * 
 * // Monitor component performance
 * const componentTracker = createComponentTracker('DocumentList');
 * componentTracker.startRender();
 * // ... component renders
 * componentTracker.endRender();
 * ```
 */

import { 
  getGlobalPerformanceMonitor, 
  createPerformanceMonitor,
  type PerformanceReport,
  type MemoryStats 
} from './performanceMonitoring';

// Page load performance metrics
export interface PageLoadMetrics {
  /** Time from navigation start to DOM content loaded */
  domContentLoaded: number;
  /** Time from navigation start to full page load */
  pageLoad: number;
  /** First contentful paint time */
  firstContentfulPaint: number;
  /** Largest contentful paint time */
  largestContentfulPaint: number;
  /** First input delay */
  firstInputDelay: number;
  /** Cumulative layout shift */
  cumulativeLayoutShift: number;
  /** Total blocking time */
  totalBlockingTime: number;
  /** Bundle size metrics */
  bundleSize: BundleSizeMetrics;
}

// Bundle size analysis
export interface BundleSizeMetrics {
  /** Total JavaScript bundle size in KB */
  totalJSSize: number;
  /** Total CSS bundle size in KB */
  totalCSSSize: number;
  /** Initial chunk size in KB */
  initialChunkSize: number;
  /** Number of chunks loaded */
  chunkCount: number;
  /** Time to load all bundles */
  loadTime: number;
}

// Component render metrics
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  slowestRender: number;
  fastestRender: number;
  memoryUsage: number;
  lastRenderTime: number;
}

// Performance thresholds for warnings
export const PERFORMANCE_THRESHOLDS = {
  slowRender: 16, // 60fps threshold
  slowPageLoad: 3000, // 3 seconds
  highMemoryUsage: 100, // 100MB
  largeBundleSize: 1000, // 1MB
  highCLS: 0.1,
  slowFCP: 1800,
  slowLCP: 2500,
  slowFID: 100
} as const;

/**
 * Page Performance Tracker
 * Tracks page load times and Core Web Vitals
 */
class PagePerformanceTracker {
  private loadStartTime: number = 0;
  private metrics: Partial<PageLoadMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe paint metrics
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observe layout shifts for CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Observe long tasks for TBT
      let totalBlockingTime = 0;
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            totalBlockingTime += entry.duration - 50;
          }
        }
        this.metrics.totalBlockingTime = totalBlockingTime;
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
  }

  startPageLoad(): void {
    this.loadStartTime = performance.now();
    
    // Reset metrics
    this.metrics = {};

    // Measure navigation timing if available
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        if (nav) {
          this.metrics.domContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
        }
      }
    }
  }

  endPageLoad(): PageLoadMetrics {
    const loadTime = performance.now() - this.loadStartTime;
    this.metrics.pageLoad = loadTime;

    // Analyze bundle sizes
    this.metrics.bundleSize = this.analyzeBundleSize();

    const finalMetrics: PageLoadMetrics = {
      domContentLoaded: this.metrics.domContentLoaded || 0,
      pageLoad: this.metrics.pageLoad || 0,
      firstContentfulPaint: this.metrics.firstContentfulPaint || 0,
      largestContentfulPaint: this.metrics.largestContentfulPaint || 0,
      firstInputDelay: this.metrics.firstInputDelay || 0,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift || 0,
      totalBlockingTime: this.metrics.totalBlockingTime || 0,
      bundleSize: this.metrics.bundleSize || {
        totalJSSize: 0,
        totalCSSSize: 0,
        initialChunkSize: 0,
        chunkCount: 0,
        loadTime: 0
      }
    };

    // Log warnings for poor performance
    this.checkPerformanceThresholds(finalMetrics);

    return finalMetrics;
  }

  private analyzeBundleSize(): BundleSizeMetrics {
    let totalJSSize = 0;
    let totalCSSSize = 0;
    let chunkCount = 0;
    let loadTime = 0;

    if (performance.getEntriesByType) {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      for (const entry of resourceEntries) {
        if (entry.name.includes('.js')) {
          totalJSSize += entry.transferSize || 0;
          chunkCount++;
          loadTime = Math.max(loadTime, entry.responseEnd);
        } else if (entry.name.includes('.css')) {
          totalCSSSize += entry.transferSize || 0;
        }
      }
    }

    return {
      totalJSSize: Math.round(totalJSSize / 1024), // Convert to KB
      totalCSSSize: Math.round(totalCSSSize / 1024),
      initialChunkSize: Math.round(totalJSSize / 1024), // Simplified for now
      chunkCount,
      loadTime: Math.round(loadTime)
    };
  }

  private checkPerformanceThresholds(metrics: PageLoadMetrics): void {
    if (process.env.NODE_ENV === 'development') {
      const warnings: string[] = [];

      if (metrics.pageLoad > PERFORMANCE_THRESHOLDS.slowPageLoad) {
        warnings.push(`Slow page load: ${metrics.pageLoad.toFixed(0)}ms (> ${PERFORMANCE_THRESHOLDS.slowPageLoad}ms)`);
      }

      if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.highCLS) {
        warnings.push(`High CLS: ${metrics.cumulativeLayoutShift.toFixed(3)} (> ${PERFORMANCE_THRESHOLDS.highCLS})`);
      }

      if (metrics.firstContentfulPaint > PERFORMANCE_THRESHOLDS.slowFCP) {
        warnings.push(`Slow FCP: ${metrics.firstContentfulPaint.toFixed(0)}ms (> ${PERFORMANCE_THRESHOLDS.slowFCP}ms)`);
      }

      if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.slowLCP) {
        warnings.push(`Slow LCP: ${metrics.largestContentfulPaint.toFixed(0)}ms (> ${PERFORMANCE_THRESHOLDS.slowLCP}ms)`);
      }

      if (metrics.bundleSize.totalJSSize > PERFORMANCE_THRESHOLDS.largeBundleSize) {
        warnings.push(`Large bundle size: ${metrics.bundleSize.totalJSSize}KB (> ${PERFORMANCE_THRESHOLDS.largeBundleSize}KB)`);
      }

      if (warnings.length > 0) {
        console.group('⚠️ Page Performance Warnings');
        warnings.forEach(warning => console.warn(warning));
        console.groupEnd();
      }
    }
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Component Performance Tracker
 * Tracks individual component render performance
 */
class ComponentPerformanceTracker {
  private componentName: string;
  private renderStartTime: number = 0;
  private metrics: ComponentMetrics;

  constructor(componentName: string) {
    this.componentName = componentName;
    this.metrics = {
      componentName,
      renderCount: 0,
      averageRenderTime: 0,
      slowestRender: 0,
      fastestRender: Infinity,
      memoryUsage: 0,
      lastRenderTime: 0
    };
  }

  startRender(): void {
    this.renderStartTime = performance.now();
  }

  endRender(): ComponentMetrics {
    const renderTime = performance.now() - this.renderStartTime;
    
    // Update metrics
    this.metrics.renderCount++;
    this.metrics.lastRenderTime = renderTime;
    this.metrics.slowestRender = Math.max(this.metrics.slowestRender, renderTime);
    this.metrics.fastestRender = Math.min(this.metrics.fastestRender, renderTime);
    
    // Calculate average
    const totalTime = (this.metrics.averageRenderTime * (this.metrics.renderCount - 1)) + renderTime;
    this.metrics.averageRenderTime = totalTime / this.metrics.renderCount;

    // Update memory usage if available
    if ((performance as any).memory) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }

    // Track with global monitor
    getGlobalPerformanceMonitor().trackRender(this.componentName, renderTime);

    // Log slow renders
    if (process.env.NODE_ENV === 'development' && renderTime > PERFORMANCE_THRESHOLDS.slowRender) {
      console.warn(`🐌 Slow render: ${this.componentName} took ${renderTime.toFixed(2)}ms`);
    }

    return { ...this.metrics };
  }

  getMetrics(): ComponentMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      componentName: this.componentName,
      renderCount: 0,
      averageRenderTime: 0,
      slowestRender: 0,
      fastestRender: Infinity,
      memoryUsage: 0,
      lastRenderTime: 0
    };
  }
}

/**
 * Memory Leak Detector
 * Monitors memory usage patterns to detect potential leaks
 */
class MemoryLeakDetector {
  private memoryHistory: number[] = [];
  private interval: number | undefined;
  private alertCallback?: (leak: MemoryLeakAlert) => void;

  constructor(alertCallback?: (leak: MemoryLeakAlert) => void) {
    if (alertCallback !== undefined) {
      this.alertCallback = alertCallback;
    }
  }

  start(checkInterval: number = 10000): void {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return;
    }

    this.interval = window.setInterval(() => {
      this.checkMemoryUsage();
    }, checkInterval);
  }

  private checkMemoryUsage(): void {
    const memoryMB = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    this.memoryHistory.push(memoryMB);

    // Keep only last 20 samples
    if (this.memoryHistory.length > 20) {
      this.memoryHistory.shift();
    }

    // Check for memory leak patterns
    if (this.memoryHistory.length >= 10) {
      const leak = this.detectMemoryLeak();
      if (leak && this.alertCallback) {
        this.alertCallback(leak);
      }
    }
  }

  private detectMemoryLeak(): MemoryLeakAlert | null {
    if (this.memoryHistory.length < 10) return null;

    const recent = this.memoryHistory.slice(-10);
    const trend = this.calculateTrend(recent);
    const currentMemory = recent[recent.length - 1];

    if (currentMemory === undefined) return null;

    // Detect consistent upward trend
    if (trend > 2 && currentMemory > PERFORMANCE_THRESHOLDS.highMemoryUsage) {
      return {
        type: 'trend',
        severity: currentMemory > 200 ? 'high' : 'medium',
        currentUsage: currentMemory,
        trend: trend,
        message: `Memory usage trending upward: +${trend.toFixed(1)}MB over last 10 samples`
      };
    }

    // Detect sudden spike
    if (recent.some(val => val === undefined)) return null;
    const maxInRecent = Math.max(...recent);
    const avgInRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    if (maxInRecent > avgInRecent * 1.5 && maxInRecent > PERFORMANCE_THRESHOLDS.highMemoryUsage) {
      return {
        type: 'spike',
        severity: 'high',
        currentUsage: currentMemory,
        trend: 0,
        message: `Memory spike detected: ${maxInRecent.toFixed(1)}MB (${((maxInRecent / avgInRecent - 1) * 100).toFixed(0)}% above average)`
      };
    }

    return null;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    return values[values.length - 1] - values[0];
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  getMemoryHistory(): number[] {
    return [...this.memoryHistory];
  }
}

// Memory leak alert interface
export interface MemoryLeakAlert {
  type: 'trend' | 'spike';
  severity: 'low' | 'medium' | 'high';
  currentUsage: number;
  trend: number;
  message: string;
}

// Factory functions
export function createPagePerformanceTracker(): PagePerformanceTracker {
  return new PagePerformanceTracker();
}

export function createComponentTracker(componentName: string): ComponentPerformanceTracker {
  return new ComponentPerformanceTracker(componentName);
}

export function createMemoryLeakDetector(alertCallback?: (leak: MemoryLeakAlert) => void): MemoryLeakDetector {
  return new MemoryLeakDetector(alertCallback);
}

// Utility functions
export function getOverallPerformanceReport(): PerformanceReport & { pageMetrics?: PageLoadMetrics } {
  const baseReport = getGlobalPerformanceMonitor().getReport();
  return baseReport;
}

export function formatPerformanceMetrics(metrics: PageLoadMetrics): string {
  return [
    `Page Load: ${metrics.pageLoad.toFixed(0)}ms`,
    `FCP: ${metrics.firstContentfulPaint.toFixed(0)}ms`,
    `LCP: ${metrics.largestContentfulPaint.toFixed(0)}ms`,
    `CLS: ${metrics.cumulativeLayoutShift.toFixed(3)}`,
    `Bundle: ${metrics.bundleSize.totalJSSize}KB JS + ${metrics.bundleSize.totalCSSSize}KB CSS`
  ].join(' | ');
}

export function getPerformanceGrade(metrics: PageLoadMetrics): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
  let score = 0;
  let total = 0;

  // Score LCP
  if (metrics.largestContentfulPaint <= 1200) score += 100;
  else if (metrics.largestContentfulPaint <= 2500) score += 75;
  else if (metrics.largestContentfulPaint <= 4000) score += 50;
  else score += 25;
  total += 100;

  // Score CLS
  if (metrics.cumulativeLayoutShift <= 0.1) score += 100;
  else if (metrics.cumulativeLayoutShift <= 0.25) score += 75;
  else score += 25;
  total += 100;

  // Score FCP
  if (metrics.firstContentfulPaint <= 1000) score += 100;
  else if (metrics.firstContentfulPaint <= 1800) score += 75;
  else if (metrics.firstContentfulPaint <= 3000) score += 50;
  else score += 25;
  total += 100;

  const percentage = (score / total) * 100;

  if (percentage >= 90) return 'excellent';
  if (percentage >= 75) return 'good';
  if (percentage >= 50) return 'needs-improvement';
  return 'poor';
}

// Development helpers
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__performanceTracking = {
    createPageTracker: createPagePerformanceTracker,
    createComponentTracker: createComponentTracker,
    createMemoryDetector: createMemoryLeakDetector,
    getReport: getOverallPerformanceReport,
    thresholds: PERFORMANCE_THRESHOLDS
  };
}