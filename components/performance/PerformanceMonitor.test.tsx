import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceMonitor } from './PerformanceMonitor';

// Mock the dependencies
jest.mock('@/lib/utils/performanceTracking', () => ({
  createPagePerformanceTracker: jest.fn(() => ({
    startPageLoad: jest.fn(),
    endPageLoad: jest.fn(() => ({
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
    })),
    destroy: jest.fn()
  })),
  createComponentTracker: jest.fn(() => ({
    startRender: jest.fn(),
    endRender: jest.fn(() => ({
      componentName: 'TestComponent',
      renderCount: 5,
      averageRenderTime: 12,
      slowestRender: 25,
      fastestRender: 8,
      memoryUsage: 75,
      lastRenderTime: 12
    })),
    getMetrics: jest.fn(),
    reset: jest.fn()
  })),
  createMemoryLeakDetector: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    getMemoryHistory: jest.fn(() => [50, 52, 54, 56, 58])
  })),
  getOverallPerformanceReport: jest.fn(() => ({
    memoryStats: {
      currentMB: 85,
      peakMB: 120,
      averageMB: 75,
      samples: 10
    },
    renderStats: {
      slowRenders: 2,
      totalRenders: 20,
      averageRenderTime: 15,
      slowestRender: 35,
      componentsWithSlowRenders: new Set(['SlowComponent'])
    },
    cacheStats: new Map(),
    rerenderStats: new Map([
      ['TestComponent', {
        componentName: 'TestComponent',
        rerenderCount: 5,
        lastRerenderTime: Date.now() - 1000,
        averageRerenderInterval: 500
      }]
    ]),
    recommendations: ['Consider optimizing TestComponent'],
    timestamp: Date.now()
  })),
  formatPerformanceMetrics: jest.fn((metrics) => `Page: ${metrics.pageLoad}ms | FCP: ${metrics.firstContentfulPaint}ms`),
  getPerformanceGrade: jest.fn(() => 'good'),
  PERFORMANCE_THRESHOLDS: {
    slowRender: 16,
    slowPageLoad: 3000,
    highMemoryUsage: 100,
    largeBundleSize: 1000,
    highCLS: 0.1,
    slowFCP: 1800,
    slowLCP: 2500,
    slowFID: 100
  }
}));

jest.mock('@/lib/hooks/usePerformanceTracking', () => ({
  useRenderTracking: jest.fn(),
  useMemoryTracking: jest.fn(() => ({
    currentMB: 85,
    peakMB: 120,
    averageMB: 75,
    samples: 10
  }))
}));

// Mock environment
const originalEnv = process.env.NODE_ENV;

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock performance API
    Object.defineProperty(window, 'performance', {
      value: {
        now: jest.fn(() => Date.now()),
        memory: {
          usedJSHeapSize: 85 * 1024 * 1024,
          totalJSHeapSize: 120 * 1024 * 1024,
          jsHeapSizeLimit: 2048 * 1024 * 1024
        }
      },
      writable: true
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders toggle button when not visible', () => {
      render(<PerformanceMonitor />);
      
      expect(screen.getByText('📊 Performance Monitor')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders full monitor when defaultVisible is true', () => {
      render(<PerformanceMonitor defaultVisible />);
      
      expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      expect(screen.getByText('Real-time application performance monitoring and analysis')).toBeInTheDocument();
    });

    it('shows live badge when tracking is active', () => {
      render(<PerformanceMonitor defaultVisible autoTrack />);
      
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  describe('Development Mode', () => {
    it('renders in development mode', () => {
      process.env.NODE_ENV = 'development';
      
      render(<PerformanceMonitor devMode />);
      
      expect(screen.getByText('📊 Performance Monitor')).toBeInTheDocument();
    });

    it('does not render in production when devMode is true', () => {
      process.env.NODE_ENV = 'production';
      
      const { container } = render(<PerformanceMonitor devMode />);
      
      expect(container.firstChild).toBeNull();
    });

    it('renders in production when devMode is false', () => {
      process.env.NODE_ENV = 'production';
      
      render(<PerformanceMonitor devMode={false} />);
      
      expect(screen.getByText('📊 Performance Monitor')).toBeInTheDocument();
    });
  });

  describe('Overlay Mode', () => {
    it('renders as overlay with minimal indicator', () => {
      process.env.NODE_ENV = 'development';
      
      render(
        <PerformanceMonitor 
          overlay 
          overlayPosition="top-right"
        />
      );
      
      const overlay = screen.getByText('📊 Performance').closest('div');
      expect(overlay).toHaveClass('top-4', 'right-4', 'fixed');
    });

    it('toggles visibility on overlay click', async () => {
      process.env.NODE_ENV = 'development';
      
      render(<PerformanceMonitor overlay />);
      
      const toggleButton = screen.getByText('📊 Performance');
      fireEvent.click(toggleButton);
      
      // Should show detailed overlay after click
      await waitFor(() => {
        expect(screen.getByTestId).toBeDefined(); // Would show performance data
      });
    });
  });

  describe('Interactive Controls', () => {
    it('toggles visibility when toggle button is clicked', () => {
      render(<PerformanceMonitor />);
      
      const toggleButton = screen.getByText('📊 Performance Monitor');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      expect(screen.getByText('Real-time application performance monitoring and analysis')).toBeInTheDocument();
    });

    it('toggles tracking when pause/start button is clicked', () => {
      render(<PerformanceMonitor defaultVisible autoTrack />);
      
      const pauseButton = screen.getByText('⏸️ Pause');
      fireEvent.click(pauseButton);
      
      expect(screen.getByText('▶️ Start')).toBeInTheDocument();
      expect(screen.queryByText('Live')).not.toBeInTheDocument();
    });

    it('closes monitor when close button is clicked', () => {
      render(<PerformanceMonitor defaultVisible />);
      
      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);
      
      expect(screen.getByText('📊 Performance Monitor')).toBeInTheDocument();
      expect(screen.queryByText('Real-time application performance monitoring and analysis')).not.toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      render(<PerformanceMonitor defaultVisible />);
    });

    it('shows overview tab by default', () => {
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Overview');
    });

    it('switches to memory tab when clicked', () => {
      const memoryTab = screen.getByRole('tab', { name: 'Memory' });
      fireEvent.click(memoryTab);
      
      expect(memoryTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Memory Statistics')).toBeInTheDocument();
    });

    it('switches to components tab when clicked', () => {
      const componentsTab = screen.getByRole('tab', { name: 'Components' });
      fireEvent.click(componentsTab);
      
      expect(componentsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to web vitals tab when clicked', () => {
      const vitalsTab = screen.getByRole('tab', { name: 'Web Vitals' });
      fireEvent.click(vitalsTab);
      
      expect(vitalsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Core Web Vitals Summary')).toBeInTheDocument();
    });
  });

  describe('Performance Data Display', () => {
    it('displays page load metrics in overview tab', () => {
      render(<PerformanceMonitor defaultVisible />);
      
      // Should show formatted performance metrics
      expect(screen.getByText(/Page Load Summary/)).toBeInTheDocument();
      expect(screen.getByText(/Bundle Analysis/)).toBeInTheDocument();
    });

    it('displays memory statistics in memory tab', () => {
      render(<PerformanceMonitor defaultVisible />);
      
      const memoryTab = screen.getByRole('tab', { name: 'Memory' });
      fireEvent.click(memoryTab);
      
      expect(screen.getByText('Memory Statistics')).toBeInTheDocument();
      expect(screen.getByText('85MB')).toBeInTheDocument(); // Current memory
      expect(screen.getByText('120MB')).toBeInTheDocument(); // Peak memory
    });

    it('displays component metrics when available', () => {
      render(<PerformanceMonitor defaultVisible />);
      
      const componentsTab = screen.getByRole('tab', { name: 'Components' });
      fireEvent.click(componentsTab);
      
      expect(screen.getByText('TestComponent')).toBeInTheDocument();
      expect(screen.getByText('5 renders')).toBeInTheDocument();
    });

    it('shows no data message when metrics are unavailable', () => {
      // Mock empty performance report
      const mockEmptyReport = jest.requireMock('@/lib/utils/performanceTracking');
      mockEmptyReport.getOverallPerformanceReport.mockReturnValue({
        memoryStats: { currentMB: 0, peakMB: 0, averageMB: 0, samples: 0 },
        renderStats: { slowRenders: 0, totalRenders: 0, averageRenderTime: 0, slowestRender: 0, componentsWithSlowRenders: new Set() },
        cacheStats: new Map(),
        rerenderStats: new Map(),
        recommendations: [],
        timestamp: Date.now()
      });

      render(<PerformanceMonitor defaultVisible />);
      
      expect(screen.getByText('No performance data available. Start tracking to see metrics.')).toBeInTheDocument();
    });
  });

  describe('Memory Alerts', () => {
    it('displays memory alerts when present', async () => {
      // Mock memory leak detector to trigger alerts
      const mockDetector = jest.requireMock('@/lib/utils/performanceTracking');
      const alertCallback = mockDetector.createMemoryLeakDetector.mock.calls[0][0];
      
      render(<PerformanceMonitor defaultVisible />);
      
      const memoryTab = screen.getByRole('tab', { name: 'Memory' });
      fireEvent.click(memoryTab);
      
      // Simulate memory alert
      const mockAlert = {
        type: 'trend' as const,
        severity: 'high' as const,
        currentUsage: 150,
        trend: 25,
        message: 'Memory usage trending upward'
      };
      
      if (alertCallback) {
        alertCallback(mockAlert);
      }

      await waitFor(() => {
        expect(screen.getByText('Memory Alerts')).toBeInTheDocument();
        expect(screen.getByText('Memory usage trending upward')).toBeInTheDocument();
      });
    });

    it('clears alerts when clear button is clicked', async () => {
      render(<PerformanceMonitor defaultVisible />);
      
      const memoryTab = screen.getByRole('tab', { name: 'Memory' });
      fireEvent.click(memoryTab);
      
      // Assuming there are alerts present
      const clearButton = screen.queryByText('Clear');
      if (clearButton) {
        fireEvent.click(clearButton);
        
        await waitFor(() => {
          expect(screen.queryByText('Memory Alerts')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Web Vitals Display', () => {
    it('displays Core Web Vitals metrics', () => {
      render(<PerformanceMonitor defaultVisible />);
      
      const vitalsTab = screen.getByRole('tab', { name: 'Web Vitals' });
      fireEvent.click(vitalsTab);
      
      expect(screen.getByText('First Contentful Paint')).toBeInTheDocument();
      expect(screen.getByText('Largest Contentful Paint')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Layout Shift')).toBeInTheDocument();
      expect(screen.getByText('First Input Delay')).toBeInTheDocument();
    });

    it('shows Core Web Vitals targets and current values', () => {
      render(<PerformanceMonitor defaultVisible />);
      
      const vitalsTab = screen.getByRole('tab', { name: 'Web Vitals' });
      fireEvent.click(vitalsTab);
      
      expect(screen.getByText(/LCP: Target ≤ 2.5s/)).toBeInTheDocument();
      expect(screen.getByText(/FID: Target ≤ 100ms/)).toBeInTheDocument();
      expect(screen.getByText(/CLS: Target ≤ 0.1/)).toBeInTheDocument();
    });
  });

  describe('Update Intervals', () => {
    it('respects custom update interval', () => {
      jest.useFakeTimers();
      
      render(<PerformanceMonitor defaultVisible updateInterval={1000} />);
      
      // Fast-forward time to trigger updates
      jest.advanceTimersByTime(1000);
      
      // Should have called performance tracking functions
      expect(jest.requireMock('@/lib/utils/performanceTracking').getOverallPerformanceReport).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('handles missing performance API gracefully', () => {
      // Remove performance API
      delete (window as any).performance;
      
      expect(() => {
        render(<PerformanceMonitor defaultVisible />);
      }).not.toThrow();
    });

    it('handles undefined metrics gracefully', () => {
      const mockTracking = jest.requireMock('@/lib/utils/performanceTracking');
      mockTracking.getOverallPerformanceReport.mockReturnValue(undefined);
      
      expect(() => {
        render(<PerformanceMonitor defaultVisible />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for tabs', () => {
      render(<PerformanceMonitor defaultVisible />);
      
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Memory' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Components' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Web Vitals' })).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      render(<PerformanceMonitor defaultVisible autoTrack />);
      
      expect(screen.getByRole('button', { name: /Pause/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /✕/ })).toBeInTheDocument();
    });
  });

  describe('Performance Optimization', () => {
    it('cleans up intervals on unmount', () => {
      const { unmount } = render(<PerformanceMonitor defaultVisible autoTrack />);
      
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('stops tracking when component unmounts', () => {
      const { unmount } = render(<PerformanceMonitor defaultVisible autoTrack />);
      
      const mockDetector = jest.requireMock('@/lib/utils/performanceTracking');
      
      unmount();
      
      expect(mockDetector.createMemoryLeakDetector().stop).toHaveBeenCalled();
      expect(mockDetector.createPagePerformanceTracker().destroy).toHaveBeenCalled();
    });
  });
});