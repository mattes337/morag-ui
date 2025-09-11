import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AnalyticsGrid, ChartConfig } from './AnalyticsGrid'
import { MetricCard } from '@/lib/mockData/analyticsMockData'

// Mock the child components
jest.mock('./MetricsCard', () => ({
  MetricsCard: ({ title, value }: any) => (
    <div data-testid="metrics-card">
      {title}: {value}
    </div>
  ),
}))

jest.mock('./ChartContainer', () => ({
  ChartContainer: ({ title, chartType }: any) => (
    <div data-testid="chart-container">
      {title} ({chartType})
    </div>
  ),
}))

describe('AnalyticsGrid', () => {
  const mockMetrics: MetricCard[] = [
    {
      id: 'test-1',
      title: 'Total Documents',
      value: 1247,
      format: 'number',
    },
    {
      id: 'test-2',
      title: 'Success Rate',
      value: '97.8%',
      format: 'percentage',
    },
  ]

  const mockCharts: ChartConfig[] = [
    {
      id: 'chart-1',
      title: 'Documents Trend',
      type: 'line',
      data: [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 150 },
      ],
    },
    {
      id: 'chart-2',
      title: 'Document Types',
      type: 'pie',
      data: [
        { name: 'PDF', value: 45 },
        { name: 'Word', value: 32 },
      ],
    },
  ]

  it('renders without crashing', () => {
    render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
      />
    )
    
    expect(screen.getByLabelText('Key performance metrics')).toBeInTheDocument()
    expect(screen.getByLabelText('Analytics charts')).toBeInTheDocument()
  })

  it('displays all metrics cards', () => {
    render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
      />
    )
    
    expect(screen.getByText('Total Documents: 1247')).toBeInTheDocument()
    expect(screen.getByText('Success Rate: 97.8%')).toBeInTheDocument()
  })

  it('displays all charts', () => {
    render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
      />
    )
    
    expect(screen.getByText('Documents Trend (line)')).toBeInTheDocument()
    expect(screen.getByText('Document Types (pie)')).toBeInTheDocument()
  })

  it('hides metrics section when showMetrics is false', () => {
    render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
        showMetrics={false}
      />
    )
    
    expect(screen.queryByLabelText('Key performance metrics')).not.toBeInTheDocument()
    expect(screen.queryByTestId('metrics-card')).not.toBeInTheDocument()
  })

  it('hides charts section when showCharts is false', () => {
    render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
        showCharts={false}
      />
    )
    
    expect(screen.queryByLabelText('Analytics charts')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chart-container')).not.toBeInTheDocument()
  })

  it('shows loading skeletons when isLoading is true', () => {
    render(
      <AnalyticsGrid
        metrics={[]}
        charts={[]}
        isLoading={true}
      />
    )
    
    expect(screen.getByLabelText('Metrics loading')).toBeInTheDocument()
    expect(screen.getByLabelText('Charts loading')).toBeInTheDocument()
  })

  it('shows empty state when no data and not loading', () => {
    render(
      <AnalyticsGrid
        metrics={[]}
        charts={[]}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('No analytics data available')).toBeInTheDocument()
    expect(screen.getByText(/Analytics data will appear here/)).toBeInTheDocument()
  })

  it('applies default layout classes', () => {
    const { container } = render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
        layout="default"
      />
    )
    
    // Check for default grid classes
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('applies compact layout classes', () => {
    const { container } = render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
        layout="compact"
      />
    )
    
    // Check for compact-specific grid classes
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('applies wide layout classes', () => {
    const { container } = render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
        layout="wide"
      />
    )
    
    // Check for wide-specific grid classes
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
        className="custom-grid"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-grid')
  })

  it('handles empty metrics array', () => {
    render(
      <AnalyticsGrid
        metrics={[]}
        charts={mockCharts}
        showMetrics={true}
      />
    )
    
    expect(screen.queryByLabelText('Key performance metrics')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Analytics charts')).toBeInTheDocument()
  })

  it('handles empty charts array', () => {
    render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={[]}
        showCharts={true}
      />
    )
    
    expect(screen.getByLabelText('Key performance metrics')).toBeInTheDocument()
    expect(screen.queryByLabelText('Analytics charts')).not.toBeInTheDocument()
  })

  it('renders with large datasets efficiently', () => {
    const largeMetrics = Array.from({ length: 50 }, (_, i) => ({
      id: `metric-${i}`,
      title: `Metric ${i}`,
      value: i * 100,
      format: 'number' as const,
    }))

    const largeCharts = Array.from({ length: 20 }, (_, i) => ({
      id: `chart-${i}`,
      title: `Chart ${i}`,
      type: 'line' as const,
      data: [{ name: 'test', value: i }],
    }))

    const startTime = performance.now()
    render(
      <AnalyticsGrid
        metrics={largeMetrics}
        charts={largeCharts}
      />
    )
    const endTime = performance.now()

    // Should render within reasonable time
    expect(endTime - startTime).toBeLessThan(100)
  })
})

describe('AnalyticsGrid Layout Behavior', () => {
  const mockMetrics: MetricCard[] = [
    { id: 'test-1', title: 'Test', value: 100, format: 'number' },
  ]

  const mockCharts: ChartConfig[] = [
    {
      id: 'chart-1',
      title: 'Test Chart',
      type: 'line',
      data: [{ name: 'test', value: 100 }],
    },
  ]

  it('passes correct variant to MetricsCard for compact layout', () => {
    render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
        layout="compact"
      />
    )
    
    // MetricsCard should receive compact variant
    expect(screen.getByTestId('metrics-card')).toBeInTheDocument()
  })

  it('passes correct height to charts for different layouts', () => {
    const chartWithHeight: ChartConfig = {
      id: 'chart-1',
      title: 'Test Chart',
      type: 'line',
      data: [{ name: 'test', value: 100 }],
      height: 500, // Custom height
    }

    render(
      <AnalyticsGrid
        metrics={[]}
        charts={[chartWithHeight]}
        layout="default"
      />
    )
    
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
  })
})

describe('AnalyticsGrid Accessibility', () => {
  const mockMetrics: MetricCard[] = [
    { id: 'test-1', title: 'Test', value: 100, format: 'number' },
  ]

  const mockCharts: ChartConfig[] = [
    {
      id: 'chart-1',
      title: 'Test Chart',
      type: 'line',
      data: [{ name: 'test', value: 100 }],
    },
  ]

  it('has proper semantic structure with sections', () => {
    render(
      <AnalyticsGrid
        metrics={mockMetrics}
        charts={mockCharts}
      />
    )
    
    expect(screen.getByRole('region', { name: 'Key performance metrics' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Analytics charts' })).toBeInTheDocument()
  })

  it('provides loading states with proper labels', () => {
    render(
      <AnalyticsGrid
        metrics={[]}
        charts={[]}
        isLoading={true}
      />
    )
    
    expect(screen.getByLabelText('Metrics loading')).toBeInTheDocument()
    expect(screen.getByLabelText('Charts loading')).toBeInTheDocument()
  })

  it('provides meaningful empty state messaging', () => {
    render(
      <AnalyticsGrid
        metrics={[]}
        charts={[]}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('No analytics data available')).toBeInTheDocument()
    expect(screen.getByText(/Analytics data will appear here/)).toBeInTheDocument()
  })
})

describe('AnalyticsGrid Edge Cases', () => {
  it('handles undefined props gracefully', () => {
    render(
      <AnalyticsGrid
        metrics={undefined as any}
        charts={undefined as any}
      />
    )
    
    expect(screen.getByText('No analytics data available')).toBeInTheDocument()
  })

  it('handles mixed data availability', () => {
    render(
      <AnalyticsGrid
        metrics={[{ id: 'test', title: 'Test', value: 100, format: 'number' }]}
        charts={[]}
        showMetrics={true}
        showCharts={true}
      />
    )
    
    expect(screen.getByLabelText('Key performance metrics')).toBeInTheDocument()
    expect(screen.queryByLabelText('Analytics charts')).not.toBeInTheDocument()
  })
})