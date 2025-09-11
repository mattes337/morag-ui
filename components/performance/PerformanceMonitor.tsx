'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PerformanceIndicator, 
  MemoryIndicator, 
  RenderTimeIndicator, 
  PerformanceOverlay,
  type PerformanceMetrics 
} from '@/components/ui/PerformanceIndicator';
import {
  createPagePerformanceTracker,
  createComponentTracker,
  createMemoryLeakDetector,
  getOverallPerformanceReport,
  formatPerformanceMetrics,
  getPerformanceGrade,
  PERFORMANCE_THRESHOLDS,
  type PageLoadMetrics,
  type ComponentMetrics,
  type MemoryLeakAlert
} from '@/lib/utils/performanceTracking';
import { useRenderTracking, useMemoryTracking } from '@/lib/hooks/usePerformanceTracking';

interface PerformanceMonitorProps {
  /** Whether to show the monitor by default */
  defaultVisible?: boolean;
  /** Whether to enable automatic performance tracking */
  autoTrack?: boolean;
  /** Update interval for real-time metrics (ms) */
  updateInterval?: number;
  /** Whether to show development-only features */
  devMode?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Whether to show as overlay */
  overlay?: boolean;
  /** Overlay position */
  overlayPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Performance Monitor Component
 * 
 * Comprehensive performance monitoring component that tracks page load times,
 * component render performance, memory usage, and provides actionable insights.
 * 
 * Features:
 * - Real-time performance metrics display
 * - Memory leak detection
 * - Component render time tracking
 * - Bundle size analysis
 * - Core Web Vitals monitoring
 * - Performance recommendations
 * 
 * @example
 * ```tsx
 * // Basic usage - development overlay
 * <PerformanceMonitor 
 *   overlay 
 *   devMode 
 *   overlayPosition="bottom-right" 
 * />
 * 
 * // Detailed performance dashboard
 * <PerformanceMonitor 
 *   defaultVisible 
 *   autoTrack 
 *   updateInterval={2000} 
 * />
 * 
 * // Compact monitoring
 * <PerformanceMonitor 
 *   className="w-80" 
 *   updateInterval={5000} 
 * />
 * ```
 */
const PerformanceMonitor = React.forwardRef<HTMLDivElement, PerformanceMonitorProps>(
  ({
    defaultVisible = false,
    autoTrack = true,
    updateInterval = 3000,
    devMode = process.env.NODE_ENV === 'development',
    className,
    overlay = false,
    overlayPosition = 'bottom-right',
    ...props
  }, ref) => {
    // State management
    const [isVisible, setIsVisible] = useState(defaultVisible);
    const [isTracking, setIsTracking] = useState(autoTrack);
    const [pageMetrics, setPageMetrics] = useState<PageLoadMetrics | null>(null);
    const [componentMetrics, setComponentMetrics] = useState<ComponentMetrics[]>([]);
    const [memoryAlerts, setMemoryAlerts] = useState<MemoryLeakAlert[]>([]);
    const [currentTab, setCurrentTab] = useState('overview');

    // Refs for tracking instances  
    const pageTrackerRef = useRef<ReturnType<typeof createPagePerformanceTracker> | null>(null);
    const memoryDetectorRef = useRef<ReturnType<typeof createMemoryLeakDetector> | null>(null);
    const updateIntervalRef = useRef<number>();

    // Use existing performance hooks
    useRenderTracking('PerformanceMonitor', { debugMode: devMode });
    const memoryStats = useMemoryTracking(updateInterval);

    // Initialize tracking on mount
    useEffect(() => {
      // Initialize trackers if not already created
      if (!pageTrackerRef.current) {
        pageTrackerRef.current = createPagePerformanceTracker();
      }
      if (!memoryDetectorRef.current) {
        memoryDetectorRef.current = createMemoryLeakDetector((alert) => {
          setMemoryAlerts(prev => [...prev.slice(-4), alert]); // Keep last 5 alerts
        });
      }

      if (isTracking) {
        pageTrackerRef.current?.startPageLoad();
        memoryDetectorRef.current?.start(updateInterval);
      }

      return () => {
        pageTrackerRef.current?.destroy();
        memoryDetectorRef.current?.stop();
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      };
    }, [isTracking, updateInterval]);

    // Update metrics periodically
    useEffect(() => {
      if (!isTracking) return;

      const updateMetrics = () => {
        // Update page metrics
        const newPageMetrics = pageTrackerRef.current?.endPageLoad();
        if (newPageMetrics) {
          setPageMetrics(newPageMetrics);
        }

        // Get overall performance report
        const report = getOverallPerformanceReport();
        
        // Extract component metrics from render stats
        const newComponentMetrics: ComponentMetrics[] = [];
        for (const [componentName, stats] of report.rerenderStats) {
          newComponentMetrics.push({
            componentName: stats.componentName,
            renderCount: stats.rerenderCount,
            averageRenderTime: stats.averageRerenderInterval || 0,
            slowestRender: 0, // Not available in current stats
            fastestRender: 0, // Not available in current stats
            memoryUsage: memoryStats?.currentMB || 0,
            lastRenderTime: Date.now() - stats.lastRerenderTime
          });
        }
        setComponentMetrics(newComponentMetrics);
      };

      updateMetrics();
      updateIntervalRef.current = window.setInterval(updateMetrics, updateInterval);

      return () => {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      };
    }, [isTracking, updateInterval, memoryStats]);

    // Toggle visibility
    const toggleVisibility = useCallback(() => {
      setIsVisible(prev => !prev);
    }, []);

    // Toggle tracking
    const toggleTracking = useCallback(() => {
      setIsTracking(prev => {
        const newTracking = !prev;
        if (newTracking) {
          pageTrackerRef.current?.startPageLoad();
          memoryDetectorRef.current?.start(updateInterval);
        } else {
          memoryDetectorRef.current?.stop();
        }
        return newTracking;
      });
    }, [updateInterval]);

    // Clear alerts
    const clearAlerts = useCallback(() => {
      setMemoryAlerts([]);
    }, []);

    // Skip rendering in production unless explicitly enabled
    if (!devMode && process.env.NODE_ENV === 'production') {
      return null;
    }

    // Prepare current metrics for display
    const currentMetrics: PerformanceMetrics = {
      pageLoadTime: pageMetrics?.pageLoad,
      memoryUsage: memoryStats?.currentMB,
      bundleSize: pageMetrics?.bundleSize.totalJSSize,
      cls: pageMetrics?.cumulativeLayoutShift,
      fcp: pageMetrics?.firstContentfulPaint,
      lcp: pageMetrics?.largestContentfulPaint,
      fid: pageMetrics?.firstInputDelay
    };

    // Filter out undefined values
    const validMetrics = Object.fromEntries(
      Object.entries(currentMetrics).filter(([_, value]) => value !== undefined)
    ) as PerformanceMetrics;

    // Overlay mode
    if (overlay) {
      if (!isVisible && Object.keys(validMetrics).length === 0) {
        return (
          <div 
            className={cn(
              'fixed z-50 cursor-pointer',
              overlayPosition === 'top-left' && 'top-4 left-4',
              overlayPosition === 'top-right' && 'top-4 right-4',
              overlayPosition === 'bottom-left' && 'bottom-4 left-4',
              overlayPosition === 'bottom-right' && 'bottom-4 right-4'
            )}
            onClick={toggleVisibility}
          >
            <Badge variant="secondary" className="opacity-50 hover:opacity-100 transition-opacity">
              📊 Performance
            </Badge>
          </div>
        );
      }

      return (
        <div
          ref={ref}
          className={cn(
            'fixed z-50 cursor-pointer',
            overlayPosition === 'top-left' && 'top-4 left-4',
            overlayPosition === 'top-right' && 'top-4 right-4',
            overlayPosition === 'bottom-left' && 'bottom-4 left-4',
            overlayPosition === 'bottom-right' && 'bottom-4 right-4',
            className
          )}
          onClick={toggleVisibility}
          {...props}
        >
          <PerformanceIndicator 
            variant="compact"
            metrics={validMetrics}
            className="pointer-events-auto bg-background/80 backdrop-blur-sm shadow-lg"
          />
        </div>
      );
    }

    // Main component UI
    if (!isVisible) {
      return (
        <Button 
          ref={ref}
          variant="outline" 
          size="sm" 
          onClick={toggleVisibility}
          className={cn('gap-2', className)}
          {...props}
        >
          📊 Performance Monitor
        </Button>
      );
    }

    return (
      <Card ref={ref} className={cn('w-full max-w-4xl', className)} {...props}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                📊 Performance Monitor
                {isTracking && (
                  <Badge variant="success" size="sm">
                    Live
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time application performance monitoring and analysis
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTracking}
                className="gap-2"
              >
                {isTracking ? '⏸️ Pause' : '▶️ Start'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVisibility}
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {Object.keys(validMetrics).length > 0 ? (
                <PerformanceIndicator 
                  variant="card"
                  metrics={validMetrics}
                  showDetails
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No performance data available. Start tracking to see metrics.
                </div>
              )}

              {pageMetrics && (
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Page Load Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPerformanceMetrics(pageMetrics)}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      Grade: {getPerformanceGrade(pageMetrics).toUpperCase()}
                    </Badge>
                  </div>

                  {pageMetrics.bundleSize && (
                    <div>
                      <h4 className="font-medium mb-2">Bundle Analysis</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">JavaScript: </span>
                          <span className="font-mono">{pageMetrics.bundleSize.totalJSSize}KB</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CSS: </span>
                          <span className="font-mono">{pageMetrics.bundleSize.totalCSSSize}KB</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Chunks: </span>
                          <span className="font-mono">{pageMetrics.bundleSize.chunkCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Load Time: </span>
                          <span className="font-mono">{pageMetrics.bundleSize.loadTime}ms</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="memory" className="space-y-4">
              {memoryStats && (
                <div className="space-y-4">
                  <MemoryIndicator 
                    variant="card"
                    memoryMB={memoryStats.currentMB}
                  />
                  
                  <div className="grid gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Memory Statistics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current: </span>
                          <span className="font-mono">{memoryStats.currentMB}MB</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Peak: </span>
                          <span className="font-mono">{memoryStats.peakMB}MB</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Average: </span>
                          <span className="font-mono">{memoryStats.averageMB}MB</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Samples: </span>
                          <span className="font-mono">{memoryStats.samples}</span>
                        </div>
                      </div>
                    </div>

                    {memoryStats.currentMB > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Memory Usage</h4>
                        <Progress 
                          value={(memoryStats.currentMB / (memoryStats.peakMB || 100)) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {memoryStats.currentMB}MB of {memoryStats.peakMB}MB peak
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {memoryAlerts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Memory Alerts</h4>
                    <Button variant="ghost" size="sm" onClick={clearAlerts}>
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {memoryAlerts.map((alert, index) => (
                      <div 
                        key={index}
                        className={cn(
                          'p-3 rounded-md text-sm',
                          alert.severity === 'high' && 'bg-red-50 text-red-800 border border-red-200',
                          alert.severity === 'medium' && 'bg-yellow-50 text-yellow-800 border border-yellow-200',
                          alert.severity === 'low' && 'bg-blue-50 text-blue-800 border border-blue-200'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={alert.severity === 'high' ? 'destructive' : 'warning'}
                            size="sm"
                          >
                            {alert.type}
                          </Badge>
                          <span className="font-medium">{alert.currentUsage.toFixed(1)}MB</span>
                        </div>
                        <p className="mt-1">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="components" className="space-y-4">
              {componentMetrics.length > 0 ? (
                <div className="space-y-2">
                  {componentMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <span className="font-medium">{metric.componentName}</span>
                        <p className="text-sm text-muted-foreground">
                          {metric.renderCount} renders
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <RenderTimeIndicator 
                          variant="minimal"
                          renderTimeMs={metric.averageRenderTime}
                        />
                        <MemoryIndicator 
                          variant="minimal"
                          memoryMB={metric.memoryUsage}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No component metrics available. Components will appear here as they render.
                </div>
              )}
            </TabsContent>

            <TabsContent value="vitals" className="space-y-4">
              {pageMetrics ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">First Contentful Paint</h4>
                      <PerformanceIndicator 
                        variant="detailed"
                        metrics={{ fcp: pageMetrics.firstContentfulPaint }}
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Largest Contentful Paint</h4>
                      <PerformanceIndicator 
                        variant="detailed"
                        metrics={{ lcp: pageMetrics.largestContentfulPaint }}
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Cumulative Layout Shift</h4>
                      <PerformanceIndicator 
                        variant="detailed"
                        metrics={{ cls: pageMetrics.cumulativeLayoutShift }}
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">First Input Delay</h4>
                      <PerformanceIndicator 
                        variant="detailed"
                        metrics={{ fid: pageMetrics.firstInputDelay }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Core Web Vitals Summary</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• LCP: Target ≤ 2.5s (currently {pageMetrics.largestContentfulPaint.toFixed(0)}ms)</p>
                      <p>• FID: Target ≤ 100ms (currently {pageMetrics.firstInputDelay.toFixed(0)}ms)</p>
                      <p>• CLS: Target ≤ 0.1 (currently {pageMetrics.cumulativeLayoutShift.toFixed(3)})</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No Core Web Vitals data available. Start page tracking to see metrics.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
);

PerformanceMonitor.displayName = 'PerformanceMonitor';

export { PerformanceMonitor };
export type { PerformanceMonitorProps };