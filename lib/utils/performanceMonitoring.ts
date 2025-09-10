/**
 * Performance Monitoring Utilities
 * 
 * Provides comprehensive performance monitoring for React applications,
 * focusing on the key metrics that matter for user experience:
 * - Memory usage tracking
 * - Render performance monitoring
 * - Cache efficiency analysis
 * - Component re-render tracking
 * 
 * @example
 * ```typescript
 * // Initialize monitoring
 * const monitor = createPerformanceMonitor({
 *   enableMemoryMonitoring: true,
 *   enableRenderMonitoring: true,
 *   reportInterval: 30000
 * });
 * 
 * // Track specific operations
 * monitor.trackCacheOperation('search-cache', 'hit', 150);
 * 
 * // Get performance report
 * const report = monitor.getReport();
 * console.log('Memory usage:', report.memoryStats.currentMB + 'MB');
 * ```
 */

// Performance metrics interfaces
export interface MemoryStats {
  currentMB: number;
  peakMB: number;
  averageMB: number;
  samples: number;
  jsHeapSizeMB?: number;
  totalJSHeapSizeMB?: number;
}

export interface RenderStats {
  slowRenders: number;
  totalRenders: number;
  averageRenderTime: number;
  slowestRender: number;
  componentsWithSlowRenders: Set<string>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  averageResponseTime: number;
  operations: number;
}

export interface ComponentRerenderStats {
  componentName: string;
  rerenderCount: number;
  lastRerenderTime: number;
  averageRerenderInterval: number;
}

export interface PerformanceReport {
  memoryStats: MemoryStats;
  renderStats: RenderStats;
  cacheStats: Map<string, CacheStats>;
  rerenderStats: Map<string, ComponentRerenderStats>;
  recommendations: string[];
  timestamp: number;
}

// Configuration options
export interface PerformanceMonitorConfig {
  enableMemoryMonitoring?: boolean;
  enableRenderMonitoring?: boolean;
  enableCacheMonitoring?: boolean;
  enableRerenderTracking?: boolean;
  memoryCheckInterval?: number;
  reportInterval?: number;
  slowRenderThreshold?: number;
  memoryLeakThreshold?: number;
  onReport?: (report: PerformanceReport) => void;
  onMemoryLeak?: (memoryStats: MemoryStats) => void;
  onSlowRender?: (componentName: string, duration: number) => void;
}

// Performance monitor class
class PerformanceMonitor {
  private config: Required<PerformanceMonitorConfig>;
  private memoryHistory: number[] = [];
  private renderHistory: Array<{ component: string; duration: number; timestamp: number }> = [];
  private cacheOperations = new Map<string, CacheStats>();
  private rerenderTracking = new Map<string, ComponentRerenderStats>();
  private memoryInterval?: number;
  private reportInterval?: number;

  constructor(config: PerformanceMonitorConfig = {}) {
    this.config = {
      enableMemoryMonitoring: config.enableMemoryMonitoring ?? true,
      enableRenderMonitoring: config.enableRenderMonitoring ?? true,
      enableCacheMonitoring: config.enableCacheMonitoring ?? true,
      enableRerenderTracking: config.enableRerenderTracking ?? true,
      memoryCheckInterval: config.memoryCheckInterval ?? 10000,
      reportInterval: config.reportInterval ?? 60000,
      slowRenderThreshold: config.slowRenderThreshold ?? 16,
      memoryLeakThreshold: config.memoryLeakThreshold ?? 50,
      onReport: config.onReport ?? (() => {}),
      onMemoryLeak: config.onMemoryLeak ?? (() => {}),
      onSlowRender: config.onSlowRender ?? (() => {})
    };

    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // Start memory monitoring
    if (this.config.enableMemoryMonitoring) {
      this.startMemoryMonitoring();
    }

    // Start periodic reporting
    if (this.config.reportInterval > 0) {
      this.reportInterval = window.setInterval(() => {
        const report = this.getReport();
        this.config.onReport(report);
      }, this.config.reportInterval);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });
  }

  private startMemoryMonitoring(): void {
    if (!(performance as any).memory) return;

    const checkMemory = () => {
      const memoryMB = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      this.memoryHistory.push(memoryMB);

      // Keep only last 100 samples to prevent unbounded growth
      if (this.memoryHistory.length > 100) {
        this.memoryHistory.shift();
      }

      // Check for memory leaks
      if (this.memoryHistory.length >= 10) {
        const recent = this.memoryHistory.slice(-10);
        const trend = (recent[recent.length - 1] || 0) - (recent[0] || 0);
        
        if (trend > this.config.memoryLeakThreshold) {
          const memoryStats = this.getMemoryStats();
          this.config.onMemoryLeak(memoryStats);
        }
      }
    };

    this.memoryInterval = window.setInterval(checkMemory, this.config.memoryCheckInterval);
    checkMemory(); // Initial check
  }

  private getMemoryStats(): MemoryStats {
    if (this.memoryHistory.length === 0 || !(performance as any).memory) {
      return {
        currentMB: 0,
        peakMB: 0,
        averageMB: 0,
        samples: 0
      };
    }

    const current = this.memoryHistory[this.memoryHistory.length - 1] || 0;
    const peak = Math.max(...this.memoryHistory);
    const average = this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length;
    const perfMemory = (performance as any).memory;

    const stats: MemoryStats = {
      currentMB: Math.round(current * 100) / 100,
      peakMB: Math.round(peak * 100) / 100,
      averageMB: Math.round(average * 100) / 100,
      samples: this.memoryHistory.length,
    };

    if (perfMemory) {
      stats.jsHeapSizeMB = Math.round((perfMemory.usedJSHeapSize / (1024 * 1024)) * 100) / 100;
      stats.totalJSHeapSizeMB = Math.round((perfMemory.totalJSHeapSize / (1024 * 1024)) * 100) / 100;
    }

    return stats;
  }

  private getRenderStats(): RenderStats {
    const slowRenders = this.renderHistory.filter(r => r.duration > this.config.slowRenderThreshold);
    const totalRenders = this.renderHistory.length;
    const averageRenderTime = totalRenders > 0 
      ? this.renderHistory.reduce((sum, r) => sum + r.duration, 0) / totalRenders 
      : 0;
    const slowestRender = Math.max(...this.renderHistory.map(r => r.duration), 0);
    const componentsWithSlowRenders = new Set(slowRenders.map(r => r.component));

    return {
      slowRenders: slowRenders.length,
      totalRenders,
      averageRenderTime: Math.round(averageRenderTime * 100) / 100,
      slowestRender: Math.round(slowestRender * 100) / 100,
      componentsWithSlowRenders
    };
  }

  private generateRecommendations(report: PerformanceReport): string[] {
    const recommendations: string[] = [];
    const { memoryStats, renderStats, cacheStats } = report;

    // Memory recommendations
    if (memoryStats.currentMB > 100) {
      recommendations.push(`High memory usage (${memoryStats.currentMB}MB). Consider implementing memory optimization strategies.`);
    }

    if (memoryStats.peakMB > memoryStats.averageMB * 2) {
      recommendations.push(`Memory spikes detected (peak: ${memoryStats.peakMB}MB vs average: ${memoryStats.averageMB}MB). Check for memory leaks.`);
    }

    // Render performance recommendations
    if (renderStats.slowRenders > renderStats.totalRenders * 0.1) {
      const slowRenderRate = Math.round((renderStats.slowRenders / renderStats.totalRenders) * 100);
      recommendations.push(`${slowRenderRate}% of renders are slow (>${this.config.slowRenderThreshold}ms). Consider optimizing: ${Array.from(renderStats.componentsWithSlowRenders).join(', ')}`);
    }

    if (renderStats.averageRenderTime > this.config.slowRenderThreshold / 2) {
      recommendations.push(`Average render time is ${renderStats.averageRenderTime}ms. Consider using React.memo and useMemo for expensive operations.`);
    }

    // Cache efficiency recommendations
    for (const [cacheName, stats] of cacheStats) {
      if (stats.hitRate < 0.7 && stats.operations > 10) {
        recommendations.push(`Low cache hit rate for ${cacheName} (${Math.round(stats.hitRate * 100)}%). Consider adjusting cache strategy.`);
      }

      if (stats.averageResponseTime > 100) {
        recommendations.push(`High average response time for ${cacheName} (${Math.round(stats.averageResponseTime)}ms). Consider optimizing cache storage.`);
      }
    }

    // Re-render recommendations
    const excessiveRerenders = Array.from(report.rerenderStats.values())
      .filter(stats => stats.rerenderCount > 10 && stats.averageRerenderInterval < 1000);
    
    if (excessiveRerenders.length > 0) {
      const componentNames = excessiveRerenders.map(s => s.componentName).join(', ');
      recommendations.push(`Components with excessive re-renders detected: ${componentNames}. Consider memoization strategies.`);
    }

    return recommendations;
  }

  // Public API methods
  public trackRender(componentName: string, duration: number): void {
    if (!this.config.enableRenderMonitoring) return;

    const renderRecord = {
      component: componentName,
      duration,
      timestamp: Date.now()
    };

    this.renderHistory.push(renderRecord);

    // Keep only last 1000 renders to prevent unbounded growth
    if (this.renderHistory.length > 1000) {
      this.renderHistory.shift();
    }

    // Alert on slow render
    if (duration > this.config.slowRenderThreshold) {
      this.config.onSlowRender(componentName, duration);
    }
  }

  public trackCacheOperation(
    cacheName: string, 
    operation: 'hit' | 'miss', 
    responseTimeMs: number = 0
  ): void {
    if (!this.config.enableCacheMonitoring) return;

    const stats = this.cacheOperations.get(cacheName) || {
      hits: 0,
      misses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      operations: 0
    };

    stats.operations++;
    
    if (operation === 'hit') {
      stats.hits++;
    } else {
      stats.misses++;
    }

    stats.hitRate = stats.hits / (stats.hits + stats.misses);
    stats.averageResponseTime = ((stats.averageResponseTime * (stats.operations - 1)) + responseTimeMs) / stats.operations;

    this.cacheOperations.set(cacheName, stats);
  }

  public trackComponentRerender(componentName: string): void {
    if (!this.config.enableRerenderTracking) return;

    const now = Date.now();
    const stats = this.rerenderTracking.get(componentName) || {
      componentName,
      rerenderCount: 0,
      lastRerenderTime: now,
      averageRerenderInterval: 0
    };

    stats.rerenderCount++;
    
    if (stats.rerenderCount > 1) {
      const interval = now - stats.lastRerenderTime;
      stats.averageRerenderInterval = ((stats.averageRerenderInterval * (stats.rerenderCount - 2)) + interval) / (stats.rerenderCount - 1);
    }
    
    stats.lastRerenderTime = now;
    this.rerenderTracking.set(componentName, stats);
  }

  public getReport(): PerformanceReport {
    const memoryStats = this.getMemoryStats();
    const renderStats = this.getRenderStats();
    
    const report: PerformanceReport = {
      memoryStats,
      renderStats,
      cacheStats: new Map(this.cacheOperations),
      rerenderStats: new Map(this.rerenderTracking),
      recommendations: [],
      timestamp: Date.now()
    };

    report.recommendations = this.generateRecommendations(report);
    
    return report;
  }

  public getCacheStats(cacheName?: string): CacheStats | Map<string, CacheStats> {
    if (cacheName) {
      return this.cacheOperations.get(cacheName) || {
        hits: 0,
        misses: 0,
        hitRate: 0,
        averageResponseTime: 0,
        operations: 0
      };
    }
    return new Map(this.cacheOperations);
  }

  public reset(): void {
    this.memoryHistory = [];
    this.renderHistory = [];
    this.cacheOperations.clear();
    this.rerenderTracking.clear();
  }

  public destroy(): void {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
    }
    this.reset();
  }
}

// Factory function for creating monitor instances
export function createPerformanceMonitor(config?: PerformanceMonitorConfig): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

// Global monitor instance for convenience
let globalMonitor: PerformanceMonitor | null = null;

export function getGlobalPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = createPerformanceMonitor({
      enableMemoryMonitoring: true,
      enableRenderMonitoring: true,
      enableCacheMonitoring: true,
      enableRerenderTracking: true,
      reportInterval: 0, // No automatic reporting for global monitor
      onSlowRender: (componentName, duration) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`🐌 Slow render detected: ${componentName} (${duration}ms)`);
        }
      },
      onMemoryLeak: (memoryStats) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('🧠 Potential memory leak detected:', memoryStats);
        }
      }
    });
  }
  return globalMonitor;
}

// React integration helpers
export function trackRender(componentName: string, duration: number): void {
  getGlobalPerformanceMonitor().trackRender(componentName, duration);
}

export function trackCacheOperation(
  cacheName: string, 
  operation: 'hit' | 'miss', 
  responseTimeMs?: number
): void {
  getGlobalPerformanceMonitor().trackCacheOperation(cacheName, operation, responseTimeMs);
}

export function trackComponentRerender(componentName: string): void {
  getGlobalPerformanceMonitor().trackComponentRerender(componentName);
}

// Development helper for debugging performance
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__performanceMonitor = {
    getReport: () => getGlobalPerformanceMonitor().getReport(),
    reset: () => getGlobalPerformanceMonitor().reset(),
    getCacheStats: (name?: string) => getGlobalPerformanceMonitor().getCacheStats(name)
  };
}