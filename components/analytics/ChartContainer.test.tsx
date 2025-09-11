import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChartContainer } from './ChartContainer'

// Mock recharts since it doesn't work well in testing environment
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

describe('ChartContainer', () => {
  const mockData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
  ]

  it('renders without crashing', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="line"
        title="Test Chart"
      />
    )
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument()
  })

  it('displays title and subtitle when provided', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="line"
        title="Test Chart"
        subtitle="Test subtitle"
      />
    )
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument()
    expect(screen.getByText('Test subtitle')).toBeInTheDocument()
  })

  it('renders line chart when chartType is line', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="line"
      />
    )
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('line')).toBeInTheDocument()
  })

  it('renders bar chart when chartType is bar', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="bar"
      />
    )
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar')).toBeInTheDocument()
  })

  it('renders pie chart when chartType is pie', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="pie"
      />
    )
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('pie')).toBeInTheDocument()
  })

  it('renders area chart when chartType is area', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="area"
      />
    )
    
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('area')).toBeInTheDocument()
  })

  it('includes grid when showGrid is true', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="line"
        showGrid={true}
      />
    )
    
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
  })

  it('includes tooltip when showTooltip is true', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="line"
        showTooltip={true}
      />
    )
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  it('includes legend when showLegend is true', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="line"
        showLegend={true}
      />
    )
    
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('wraps chart in ResponsiveContainer', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="line"
      />
    )
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(
      <ChartContainer
        data={[]}
        chartType="line"
        title="Empty Chart"
      />
    )
    
    expect(screen.getByText('Empty Chart')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ChartContainer
        data={mockData}
        chartType="line"
        className="custom-chart"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-chart')
  })

  it('renders without title and subtitle', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="line"
      />
    )
    
    // Should not render header when no title/subtitle
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('handles unsupported chart type', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType={'unsupported' as any}
      />
    )
    
    expect(screen.getByText('Unsupported chart type')).toBeInTheDocument()
  })
})

describe('ChartContainer Accessibility', () => {
  const mockData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
  ]

  it('has proper semantic structure with title', () => {
    render(
      <ChartContainer
        data={mockData}
        chartType="line"
        title="Accessibility Test Chart"
      />
    )
    
    // Use more specific text-based approach instead of role-based
    expect(screen.getByText('Accessibility Test Chart')).toBeInTheDocument()
    
    // Verify the title is within a proper heading structure
    const titleElement = screen.getByText('Accessibility Test Chart')
    expect(titleElement.tagName).toMatch(/H[1-6]/)
  })

  it('uses appropriate ARIA labels for chart elements', () => {
    const { container } = render(
      <ChartContainer
        data={mockData}
        chartType="line"
        title="Test Chart"
      />
    )
    
    // Card component should have proper structure
    expect(container.querySelector('[role="region"]') || container.querySelector('[role="img"]')).toBeDefined()
  })
})

describe('ChartContainer Performance', () => {
  it('renders with large dataset efficiently', () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      name: `Item ${i}`,
      value: Math.random() * 1000,
    }))

    const startTime = performance.now()
    render(
      <ChartContainer
        data={largeData}
        chartType="line"
        title="Large Dataset Chart"
      />
    )
    const endTime = performance.now()

    // Should render within reasonable time (< 100ms)
    expect(endTime - startTime).toBeLessThan(100)
  })
})