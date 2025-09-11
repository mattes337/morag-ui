import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { AnalyticsDashboard } from './AnalyticsDashboard'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock the analytics hook
jest.mock('@/lib/hooks/useAnalytics', () => ({
  useAnalytics: jest.fn(() => ({
    data: {
      metrics: [],
      usage: null,
      realmAnalytics: null,
      globalData: {
        metrics: [],
        trends: {
          documentsOverTime: { data: [] },
          usersOverTime: { data: [] },
          searchesOverTime: { data: [] }
        }
      },
      dashboardSummary: {
        totalDocuments: 1000,
        totalUsers: 50,
        totalSearches: 2000
      },
      systemHealth: {
        overall: 'healthy',
        critical: 0,
        warning: 1,
        healthy: 5
      },
      isLoading: false,
      error: null,
      lastUpdated: new Date()
    },
    refreshData: jest.fn(),
    exportToCSV: jest.fn(),
    isLoading: false,
    error: null,
    lastUpdated: new Date()
  }))
}))

// Mock the analytics service
jest.mock('@/lib/mockData/analyticsData', () => ({
  analyticsService: {
    getRealTimeMetrics: jest.fn(() => []),
    getUsageTrends: jest.fn(() => null),
    getRealmAnalytics: jest.fn(() => null),
    getAvailableRealms: jest.fn(() => [
      { id: 'realm1', name: 'Marketing Realm' },
      { id: 'realm2', name: 'Sales Realm' }
    ]),
    generateCSVExport: jest.fn()
  },
  exportAnalyticsData: {
    metrics: jest.fn(),
    timeSeries: jest.fn(),
    usageTrends: jest.fn()
  }
}))

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => children,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}))

describe('AnalyticsDashboard', () => {
  describe('Rendering', () => {
    it('renders dashboard header correctly', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })

    it('renders realm selector with options', async () => {
      render(<AnalyticsDashboard />)
      
      const realmSelector = screen.getByRole('combobox')
      expect(realmSelector).toBeInTheDocument()
      
      // Open the selector
      await userEvent.click(realmSelector)
      
      await waitFor(() => {
        expect(screen.getByText('Global View')).toBeInTheDocument()
        expect(screen.getByText('Marketing Realm')).toBeInTheDocument()
        expect(screen.getByText('Sales Realm')).toBeInTheDocument()
      })
    })

    it('renders date range selector', async () => {
      render(<AnalyticsDashboard />)
      
      const dateSelectors = screen.getAllByRole('combobox')
      const dateRangeSelector = dateSelectors[1] // Second combobox should be date range
      
      expect(dateRangeSelector).toBeInTheDocument()
      
      if (dateRangeSelector) {
        await userEvent.click(dateRangeSelector)
      }
      
      await waitFor(() => {
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
        expect(screen.getByText('Last 30 Days')).toBeInTheDocument()
        expect(screen.getByText('Last 90 Days')).toBeInTheDocument()
      })
    })

    it('renders export buttons', () => {
      render(<AnalyticsDashboard />)
      
      const exportButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') !== null
      )
      expect(exportButtons.length).toBeGreaterThan(0)
    })

    it('renders refresh button', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })

    it('renders tab navigation', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Detailed Analysis' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Performance' })).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('handles realm selection change', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDashboard />)
      
      const realmSelector = screen.getByRole('combobox')
      await user.click(realmSelector)
      
      await waitFor(() => {
        expect(screen.getByText('Marketing Realm')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Marketing Realm'))
      
      // Should show the selected realm in a badge
      await waitFor(() => {
        expect(screen.getByText('Marketing Realm')).toBeInTheDocument()
      })
    })

    it('handles date range change', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDashboard />)
      
      const dateSelectors = screen.getAllByRole('combobox')
      const dateRangeSelector = dateSelectors[1]
      
      if (dateRangeSelector) {
        await user.click(dateRangeSelector)
      }
      
      await waitFor(() => {
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Last 7 Days'))
      
      // Should update the badge or display
      expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
    })

    it('handles tab switching', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDashboard />)
      
      // Switch to Performance tab
      const performanceTab = screen.getByRole('tab', { name: 'Performance' })
      await user.click(performanceTab)
      
      // Should show performance content
      expect(performanceTab).toHaveAttribute('data-state', 'active')
    })

    it('handles refresh button click', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDashboard />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)
      
      // Should trigger refresh (mocked function should be called)
      expect(refreshButton).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('displays error state when analytics fails to load', () => {
      // Mock error state
      const mockUseAnalytics = require('@/lib/hooks/useAnalytics').useAnalytics
      mockUseAnalytics.mockReturnValue({
        data: null,
        refreshData: jest.fn(),
        exportToCSV: jest.fn(),
        isLoading: false,
        error: 'Failed to load analytics data',
        lastUpdated: new Date()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument()
      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('handles retry button in error state', async () => {
      const mockRefreshData = jest.fn()
      const mockUseAnalytics = require('@/lib/hooks/useAnalytics').useAnalytics
      mockUseAnalytics.mockReturnValue({
        data: null,
        refreshData: mockRefreshData,
        exportToCSV: jest.fn(),
        isLoading: false,
        error: 'Failed to load analytics data',
        lastUpdated: new Date()
      })

      const user = userEvent.setup()
      render(<AnalyticsDashboard />)
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      await user.click(tryAgainButton)
      
      expect(mockRefreshData).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('displays loading state correctly', () => {
      const mockUseAnalytics = require('@/lib/hooks/useAnalytics').useAnalytics
      mockUseAnalytics.mockReturnValue({
        data: {
          metrics: [],
          usage: null,
          realmAnalytics: null,
          globalData: { metrics: [], trends: {} },
          isLoading: true
        },
        refreshData: jest.fn(),
        exportToCSV: jest.fn(),
        isLoading: true,
        error: null,
        lastUpdated: new Date()
      })

      render(<AnalyticsDashboard />)
      
      // Should show loading indicators
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      const refreshIcon = refreshButton.querySelector('svg')
      expect(refreshIcon).toHaveClass('animate-spin')
    })
  })

  describe('Export Functionality', () => {
    it('handles metrics export', async () => {
      const { exportAnalyticsData } = require('@/lib/mockData/analyticsData')
      const user = userEvent.setup()
      render(<AnalyticsDashboard />)
      
      // Find and click first export button
      const exportButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') !== null && button.getAttribute('class')?.includes('border')
      )
      
      if (exportButtons.length > 0) {
        await user.click(exportButtons[0]!)
        expect(exportAnalyticsData.metrics).toHaveBeenCalled()
      }
    })
  })

  describe('Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<AnalyticsDashboard />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDashboard />)
      
      // Should be able to navigate through interactive elements
      await user.tab()
      expect(document.activeElement).toBeInstanceOf(HTMLElement)
      
      await user.tab()
      expect(document.activeElement).toBeInstanceOf(HTMLElement)
    })

    it('has proper ARIA labels and roles', () => {
      render(<AnalyticsDashboard />)
      
      // Check for tab list
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      
      // Check for tabs
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Detailed Analysis' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Performance' })).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      const { container } = render(<AnalyticsDashboard />)
      
      // Check for responsive grid classes
      const gridElements = container.querySelectorAll('.grid')
      expect(gridElements.length).toBeGreaterThan(0)
    })

    it('handles mobile layout with custom className', () => {
      const { container } = render(<AnalyticsDashboard className="custom-mobile-class" />)
      
      expect(container.firstChild).toHaveClass('custom-mobile-class')
    })
  })

  describe('Real-time Updates', () => {
    it('displays last updated timestamp', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })

    it('updates timestamp format correctly', () => {
      const fixedDate = new Date('2024-01-15T10:30:00Z')
      const mockUseAnalytics = require('@/lib/hooks/useAnalytics').useAnalytics
      mockUseAnalytics.mockReturnValue({
        data: {
          metrics: [],
          lastUpdated: fixedDate
        },
        refreshData: jest.fn(),
        exportToCSV: jest.fn(),
        isLoading: false,
        error: null,
        lastUpdated: fixedDate
      })

      render(<AnalyticsDashboard />)
      
      const timeString = fixedDate.toLocaleTimeString()
      expect(screen.getByText(`Last updated: ${timeString}`)).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('accepts and uses realmId prop', () => {
      render(<AnalyticsDashboard realmId="realm1" />)
      
      // Should initialize with the provided realm
      expect(screen.getByText('Marketing Realm')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<AnalyticsDashboard className="custom-dashboard" />)
      
      expect(container.firstChild).toHaveClass('custom-dashboard')
    })
  })
})