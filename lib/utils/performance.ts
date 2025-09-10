// Performance monitoring utilities for search functionality
import React from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
  props?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private renderStartTimes = new Map<string, number>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startRender(componentName: string): void {
    if (typeof performance !== 'undefined') {
      this.renderStartTimes.set(componentName, performance.now());
    }
  }

  endRender(componentName: string, props?: Record<string, any>): void {
    if (typeof performance !== 'undefined') {
      const startTime = this.renderStartTimes.get(componentName);
      if (startTime) {
        const renderTime = performance.now() - startTime;
        
        const metric: PerformanceMetrics = {
          componentName,
          renderTime,
          timestamp: Date.now()
        };
        
        if (process.env.NODE_ENV === 'development' && props) {
          metric.props = props;
        }
        
        this.metrics.push(metric);

        // Clean up
        this.renderStartTimes.delete(componentName);

        // Log slow renders in development
        if (process.env.NODE_ENV === 'development' && renderTime > 16) {
          console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`, props);
        }

        // Keep only last 100 metrics to prevent memory leaks
        if (this.metrics.length > 100) {
          this.metrics = this.metrics.slice(-50);
        }
      }
    }
  }

  getMetrics(componentName?: string): PerformanceMetrics[] {
    if (componentName) {
      return this.metrics.filter(metric => metric.componentName === componentName);
    }
    return [...this.metrics];
  }

  getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.getMetrics(componentName);
    if (componentMetrics.length === 0) return 0;
    
    const total = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / componentMetrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
    this.renderStartTimes.clear();
  }
}

// Hook for monitoring component performance
export const usePerformanceMonitor = (componentName: string, props?: Record<string, any>) => {
  const monitor = PerformanceMonitor.getInstance();

  React.useLayoutEffect(() => {
    monitor.startRender(componentName);
    
    return () => {
      monitor.endRender(componentName, props);
    };
  });

  return {
    getMetrics: () => monitor.getMetrics(componentName),
    getAverageRenderTime: () => monitor.getAverageRenderTime(componentName)
  };
};

// Search-specific performance utilities
export const measureSearchPerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${operationName} completed in ${duration.toFixed(2)}ms`);
      
      if (duration > 100) {
        console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }
    }
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = (componentName: string) => {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    const memoryInfo = {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
    };
    
    console.debug(`${componentName} memory usage:`, memoryInfo);
    
    // Warn if memory usage is high
    if (memoryInfo.used > 100) {
      console.warn(`High memory usage detected in ${componentName}: ${memoryInfo.used}MB`);
    }
    
    return memoryInfo;
  }
  
  return null;
};

export default PerformanceMonitor;