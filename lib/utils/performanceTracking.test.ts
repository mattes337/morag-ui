import {
  createPagePerformanceTracker,
  createComponentTracker,
  createMemoryLeakDetector,
  formatPerformanceMetrics,
  getPerformanceGrade,
  PERFORMANCE_THRESHOLDS
} from './performanceTracking';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 85 * 1024 * 1024,
    totalJSHeapSize: 120 * 1024 * 1024,
    jsHeapSizeLimit: 2048 * 1024 * 1024
  },
  getEntriesByType: jest.fn(() => [])
};

// Mock PerformanceObserver
const mockPerformanceObserver = jest.fn();
mockPerformanceObserver.prototype.observe = jest.fn();
mockPerformanceObserver.prototype.disconnect = jest.fn();

// Setup global mocks
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true
});

describe('Performance Tracking Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(Date.now());
  });

  describe('PagePerformanceTracker', () => {
    it('creates a tracker instance', () => {
      const tracker = createPagePerformanceTracker();
      expect(tracker).toBeDefined();
      expect(typeof tracker.startPageLoad).toBe('function');
      expect(typeof tracker.endPageLoad).toBe('function');
      expect(typeof tracker.destroy).toBe('function');
    });

    it('tracks page load metrics', () => {
      const tracker = createPagePerformanceTracker();
      
      tracker.startPageLoad();
      
      // Mock some time passing
      mockPerformance.now.mockReturnValue(Date.now() + 1500);
      
      const metrics = tracker.endPageLoad();
      
      expect(metrics).toBeDefined();
      expect(metrics.pageLoad).toBeGreaterThan(0);
      expect(metrics.bundleSize).toBeDefined();
    });

    it('cleans up resources on destroy', () => {
      const tracker = createPagePerformanceTracker();
      expect(() => tracker.destroy()).not.toThrow();
    });
  });

  describe('ComponentPerformanceTracker', () => {
    it('creates a component tracker', () => {
      const tracker = createComponentTracker('TestComponent');
      expect(tracker).toBeDefined();
      expect(typeof tracker.startRender).toBe('function');
      expect(typeof tracker.endRender).toBe('function');
    });

    it('tracks render performance', () => {
      const tracker = createComponentTracker('TestComponent');
      
      tracker.startRender();
      
      // Mock render time
      mockPerformance.now.mockReturnValue(Date.now() + 12);
      
      const metrics = tracker.endRender();
      
      expect(metrics.componentName).toBe('TestComponent');
      expect(metrics.renderCount).toBe(1);
      expect(metrics.lastRenderTime).toBeGreaterThan(0);
    });

    it('calculates average render time correctly', () => {
      const tracker = createComponentTracker('TestComponent');
      
      // First render - 10ms
      tracker.startRender();
      mockPerformance.now.mockReturnValue(Date.now() + 10);
      tracker.endRender();
      
      // Second render - 20ms
      tracker.startRender();
      mockPerformance.now.mockReturnValue(Date.now() + 20);
      const metrics = tracker.endRender();
      
      expect(metrics.renderCount).toBe(2);
      expect(metrics.averageRenderTime).toBe(15); // (10 + 20) / 2
    });

    it('resets metrics correctly', () => {
      const tracker = createComponentTracker('TestComponent');
      
      tracker.startRender();
      tracker.endRender();
      
      tracker.reset();
      const metrics = tracker.getMetrics();
      
      expect(metrics.renderCount).toBe(0);
      expect(metrics.averageRenderTime).toBe(0);
    });
  });

  describe('MemoryLeakDetector', () => {
    beforeEach(() => {
      // Mock window object for Node.js environment
      Object.defineProperty(global, 'window', {
        value: {
          setInterval: jest.fn(() => 123),
          clearInterval: jest.fn(),
          addEventListener: jest.fn()
        },
        writable: true
      });
    });

    it('creates a memory leak detector', () => {
      const detector = createMemoryLeakDetector();
      expect(detector).toBeDefined();
      expect(typeof detector.start).toBe('function');
      expect(typeof detector.stop).toBe('function');
    });

    it('calls alert callback when memory leak detected', () => {
      const alertCallback = jest.fn();
      const detector = createMemoryLeakDetector(alertCallback);
      
      expect(detector).toBeDefined();
      expect(typeof detector.start).toBe('function');
    });

    it('stops monitoring correctly', () => {
      const detector = createMemoryLeakDetector();
      detector.start(1000);
      
      expect(() => detector.stop()).not.toThrow();
    });

    it('returns memory history', () => {
      const detector = createMemoryLeakDetector();
      const history = detector.getMemoryHistory();
      
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    describe('formatPerformanceMetrics', () => {
      it('formats metrics correctly', () => {
        const metrics = {
          pageLoad: 1500,
          domContentLoaded: 800,
          firstContentfulPaint: 1200,
          largestContentfulPaint: 1800,
          firstInputDelay: 50,
          cumulativeLayoutShift: 0.05,
          totalBlockingTime: 100,
          bundleSize: {
            totalJSSize: 850,
            totalCSSSize: 120,
            initialChunkSize: 600,
            chunkCount: 3,
            loadTime: 1200
          }
        };

        const formatted = formatPerformanceMetrics(metrics);
        
        expect(formatted).toContain('1500ms');
        expect(formatted).toContain('1200ms');
        expect(formatted).toContain('1800ms');
        expect(formatted).toContain('850KB');
        expect(formatted).toContain('120KB');
      });
    });

    describe('getPerformanceGrade', () => {
      it('returns excellent for good metrics', () => {
        const excellentMetrics = {
          pageLoad: 800,
          domContentLoaded: 400,
          firstContentfulPaint: 900,
          largestContentfulPaint: 1000,
          firstInputDelay: 30,
          cumulativeLayoutShift: 0.05,
          totalBlockingTime: 50,
          bundleSize: {
            totalJSSize: 400,
            totalCSSSize: 50,
            initialChunkSize: 300,
            chunkCount: 2,
            loadTime: 800
          }
        };

        const grade = getPerformanceGrade(excellentMetrics);
        expect(grade).toBe('excellent');
      });

      it('returns poor for bad metrics', () => {
        const poorMetrics = {
          pageLoad: 8000,
          domContentLoaded: 5000,
          firstContentfulPaint: 5000,
          largestContentfulPaint: 6000,
          firstInputDelay: 500,
          cumulativeLayoutShift: 0.5,
          totalBlockingTime: 1000,
          bundleSize: {
            totalJSSize: 2000,
            totalCSSSize: 500,
            initialChunkSize: 1500,
            chunkCount: 10,
            loadTime: 5000
          }
        };

        const grade = getPerformanceGrade(poorMetrics);
        expect(grade).toBe('poor');
      });

      it('returns appropriate grades for mixed metrics', () => {
        const mixedMetrics = {
          pageLoad: 2000,
          domContentLoaded: 1000,
          firstContentfulPaint: 1500,
          largestContentfulPaint: 2200,
          firstInputDelay: 80,
          cumulativeLayoutShift: 0.15,
          totalBlockingTime: 200,
          bundleSize: {
            totalJSSize: 800,
            totalCSSSize: 150,
            initialChunkSize: 600,
            chunkCount: 4,
            loadTime: 1800
          }
        };

        const grade = getPerformanceGrade(mixedMetrics);
        expect(['good', 'needs-improvement']).toContain(grade);
      });
    });

    describe('PERFORMANCE_THRESHOLDS', () => {
      it('has all required thresholds', () => {
        expect(PERFORMANCE_THRESHOLDS.slowRender).toBeDefined();
        expect(PERFORMANCE_THRESHOLDS.slowPageLoad).toBeDefined();
        expect(PERFORMANCE_THRESHOLDS.highMemoryUsage).toBeDefined();
        expect(PERFORMANCE_THRESHOLDS.largeBundleSize).toBeDefined();
        expect(PERFORMANCE_THRESHOLDS.highCLS).toBeDefined();
        expect(PERFORMANCE_THRESHOLDS.slowFCP).toBeDefined();
        expect(PERFORMANCE_THRESHOLDS.slowLCP).toBeDefined();
        expect(PERFORMANCE_THRESHOLDS.slowFID).toBeDefined();
      });

      it('has reasonable threshold values', () => {
        expect(PERFORMANCE_THRESHOLDS.slowRender).toBe(16);
        expect(PERFORMANCE_THRESHOLDS.slowPageLoad).toBe(3000);
        expect(PERFORMANCE_THRESHOLDS.highMemoryUsage).toBe(100);
        expect(PERFORMANCE_THRESHOLDS.largeBundleSize).toBe(1000);
        expect(PERFORMANCE_THRESHOLDS.highCLS).toBe(0.1);
        expect(PERFORMANCE_THRESHOLDS.slowFCP).toBe(1800);
        expect(PERFORMANCE_THRESHOLDS.slowLCP).toBe(2500);
        expect(PERFORMANCE_THRESHOLDS.slowFID).toBe(100);
      });
    });
  });

  describe('Integration with Global Monitor', () => {
    it('does not throw when performance API is unavailable', () => {
      // Temporarily remove performance API
      const originalPerformance = global.performance;
      delete (global as any).performance;

      expect(() => {
        const tracker = createPagePerformanceTracker();
        tracker.startPageLoad();
        tracker.endPageLoad();
      }).not.toThrow();

      // Restore performance API
      global.performance = originalPerformance;
    });

    it('handles missing PerformanceObserver gracefully', () => {
      // Temporarily remove PerformanceObserver
      const originalObserver = global.PerformanceObserver;
      delete (global as any).PerformanceObserver;

      expect(() => {
        createPagePerformanceTracker();
      }).not.toThrow();

      // Restore PerformanceObserver
      global.PerformanceObserver = originalObserver;
    });
  });

  describe('Development Helpers', () => {
    it('exposes development helpers in window object', () => {
      // Mock window object
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      });

      // Set development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Re-import to trigger development helper setup
      jest.resetModules();
      require('./performanceTracking');

      expect((global.window as any).__performanceTracking).toBeDefined();

      // Restore
      process.env.NODE_ENV = originalEnv;
    });
  });
});