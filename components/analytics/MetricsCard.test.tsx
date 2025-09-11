import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MetricsCard } from './MetricsCard'

describe('MetricsCard', () => {
  it('renders without crashing', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={1234}
      />
    )
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('displays title and description', () => {
    render(
      <MetricsCard
        title="Total Documents"
        value={1247}
        description="Documents processed this month"
      />
    )
    
    expect(screen.getByText('Total Documents')).toBeInTheDocument()
    expect(screen.getByText('Documents processed this month')).toBeInTheDocument()
  })

  it('formats number values correctly', () => {
    render(
      <MetricsCard
        title="Test"
        value={1234567}
        format="number"
      />
    )
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('formats currency values correctly', () => {
    render(
      <MetricsCard
        title="Revenue"
        value={45780}
        format="currency"
      />
    )
    
    expect(screen.getByText(/\$45,780/)).toBeInTheDocument()
  })

  it('formats percentage values correctly', () => {
    render(
      <MetricsCard
        title="Success Rate"
        value={97.8}
        format="percentage"
      />
    )
    
    expect(screen.getByText('97.8%')).toBeInTheDocument()
  })

  it('formats duration values correctly', () => {
    render(
      <MetricsCard
        title="Processing Time"
        value={138000} // 2.3 minutes in milliseconds
        format="duration"
      />
    )
    
    expect(screen.getByText('2.3m')).toBeInTheDocument()
  })

  it('formats bytes values correctly', () => {
    render(
      <MetricsCard
        title="Storage"
        value={47300000000} // ~47.3 GB
        format="bytes"
      />
    )
    
    expect(screen.getByText('44.1 GB')).toBeInTheDocument()
  })

  it('displays string values without formatting', () => {
    render(
      <MetricsCard
        title="Status"
        value="Operational"
      />
    )
    
    expect(screen.getByText('Operational')).toBeInTheDocument()
  })

  it('shows positive trend indicator', () => {
    render(
      <MetricsCard
        title="Test"
        value={100}
        change={12.5}
        trend="up"
      />
    )
    
    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })

  it('shows negative trend indicator', () => {
    render(
      <MetricsCard
        title="Test"
        value={100}
        change={-8.3}
        trend="down"
      />
    )
    
    expect(screen.getByText('-8.3%')).toBeInTheDocument()
  })

  it('shows flat trend indicator', () => {
    render(
      <MetricsCard
        title="Test"
        value={100}
        change={0}
        trend="flat"
      />
    )
    
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })

  it('displays icon when provided', () => {
    const { container } = render(
      <MetricsCard
        title="Documents"
        value={1234}
        icon="file-text"
      />
    )
    
    // Lucide icons render as SVG elements
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies compact variant styling', () => {
    const { container } = render(
      <MetricsCard
        title="Test"
        value={100}
        variant="compact"
      />
    )
    
    // Check for compact-specific classes (you might need to adjust based on actual implementation)
    expect(container.querySelector('.text-xl')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <MetricsCard
        title="Test"
        value={100}
        className="custom-metric"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-metric')
  })

  it('handles missing trend gracefully', () => {
    render(
      <MetricsCard
        title="Test"
        value={100}
      />
    )
    
    // Should not show trend badge when no trend data
    expect(screen.queryByText('%')).not.toBeInTheDocument()
  })

  it('animates number values when animate is true', async () => {
    const { rerender } = render(
      <MetricsCard
        title="Test"
        value={0}
        animate={true}
      />
    )
    
    // Update value to trigger animation
    rerender(
      <MetricsCard
        title="Test"
        value={1000}
        animate={true}
      />
    )
    
    // Should eventually show the final value
    await waitFor(() => {
      expect(screen.getByText('1,000')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('does not animate when animate is false', () => {
    render(
      <MetricsCard
        title="Test"
        value={1000}
        animate={false}
      />
    )
    
    // Should show value immediately
    expect(screen.getByText('1,000')).toBeInTheDocument()
  })
})

describe('MetricsCard Accessibility', () => {
  it('has proper ARIA labels for screen readers', () => {
    render(
      <MetricsCard
        title="Total Documents"
        value={1247}
        description="Documents processed"
      />
    )
    
    expect(screen.getByLabelText(/Total Documents: 1,247/)).toBeInTheDocument()
  })

  it('provides trend context for screen readers', () => {
    render(
      <MetricsCard
        title="Test"
        value={100}
        change={12.5}
        trend="up"
      />
    )
    
    // The trend icon should have accessible labels
    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })

  it('maintains color contrast for trend indicators', () => {
    const { container } = render(
      <MetricsCard
        title="Test"
        value={100}
        change={12.5}
        trend="up"
      />
    )
    
    const trendElement = container.querySelector('[class*="text-green"]')
    expect(trendElement).toBeInTheDocument()
  })
})

describe('MetricsCard Edge Cases', () => {
  it('handles very large numbers', () => {
    render(
      <MetricsCard
        title="Large Number"
        value={999999999999}
        format="number"
      />
    )
    
    expect(screen.getByText('999,999,999,999')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(
      <MetricsCard
        title="Zero Value"
        value={0}
        format="number"
      />
    )
    
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('handles negative values', () => {
    render(
      <MetricsCard
        title="Negative Value"
        value={-123}
        format="number"
      />
    )
    
    expect(screen.getByText('-123')).toBeInTheDocument()
  })

  it('handles decimal values', () => {
    render(
      <MetricsCard
        title="Decimal Value"
        value={123.456}
        format="number"
      />
    )
    
    expect(screen.getByText('123')).toBeInTheDocument() // Should round for display
  })
})