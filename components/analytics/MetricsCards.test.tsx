import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MetricsCards } from './MetricsCards'
import type { MetricCard } from '@/lib/mockData/analyticsMockData'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

const mockMetrics: MetricCard[] = [
  {
    id: 'total-documents',
    title: 'Total Documents',
    value: 1247,
    previousValue: 1189,
    change: 4.9,
    changeType: 'positive',
    format: 'number',
    description: 'Documents uploaded this month',
    trend: 'up',
    icon: 'file-text',
  },
  {
    id: 'processing-time',
    title: 'Avg Processing Time',
    value: '2.3 min',
    previousValue: '2.8 min',
    change: -17.9,
    changeType: 'positive',
    format: 'duration',
    description: 'Average document processing time',
    trend: 'down',
    icon: 'clock',
  },
  {
    id: 'success-rate',
    title: 'Success Rate',
    value: '97.8%',
    previousValue: '96.2%',
    change: 1.6,
    changeType: 'positive',
    format: 'percentage',
    description: 'Document processing success rate',
    trend: 'up',
    icon: 'check-circle',
  },
]

describe('MetricsCards', () => {
  describe('Rendering', () => {
    it('renders metrics cards correctly', () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      expect(screen.getByText('Total Documents')).toBeInTheDocument()
      expect(screen.getByText('1,247')).toBeInTheDocument()
      expect(screen.getByText('Avg Processing Time')).toBeInTheDocument()
      expect(screen.getByText('2.3 min')).toBeInTheDocument()
      expect(screen.getByText('Success Rate')).toBeInTheDocument()
      expect(screen.getByText('97.8%')).toBeInTheDocument()
    })

    it('renders change indicators with correct colors', () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      // Positive change should be green
      const positiveChanges = screen.getAllByText(/\+4\.9%|\+1\.6%/)
      expect(positiveChanges.length).toBeGreaterThan(0)
      
      // Negative change (but positive trend) should still show improvement
      expect(screen.getByText('-17.9%')).toBeInTheDocument()
    })

    it('displays loading state', () => {
      render(<MetricsCards metrics={[]} isLoading={true} />)
      
      expect(screen.getAllByRole('generic')).toHaveLength(6) // 6 skeleton cards
    })

    it('displays empty state when no metrics provided', () => {
      render(<MetricsCards metrics={[]} />)
      
      expect(screen.getByText('No metrics available')).toBeInTheDocument()
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument() // Alert icon
    })
  })

  describe('Formatting', () => {
    it('formats numbers correctly', () => {
      const numberMetric: MetricCard[] = [{
        id: 'test',
        title: 'Test Metric',
        value: 1234567,
        format: 'number',
      }]
      
      render(<MetricsCards metrics={numberMetric} />)
      expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    it('formats percentages correctly', () => {
      const percentMetric: MetricCard[] = [{
        id: 'test',
        title: 'Test Percentage',
        value: 85.5,
        format: 'percentage',
      }]
      
      render(<MetricsCards metrics={percentMetric} />)
      expect(screen.getByText('85.5%')).toBeInTheDocument()
    })

    it('formats currency correctly', () => {
      const currencyMetric: MetricCard[] = [{
        id: 'test',
        title: 'Test Currency',
        value: 1250.75,
        format: 'currency',
      }]
      
      render(<MetricsCards metrics={currencyMetric} />)
      expect(screen.getByText('$1,250.75')).toBeInTheDocument()
    })

    it('formats bytes correctly', () => {
      const bytesMetric: MetricCard[] = [{
        id: 'test',
        title: 'Storage Used',
        value: 1073741824, // 1 GB
        format: 'bytes',
      }]
      
      render(<MetricsCards metrics={bytesMetric} />)
      expect(screen.getByText('1.0 GB')).toBeInTheDocument()
    })

    it('formats duration correctly', () => {
      const durationMetric: MetricCard[] = [{
        id: 'test',
        title: 'Processing Time',
        value: 125000, // 2:05
        format: 'duration',
      }]
      
      render(<MetricsCards metrics={durationMetric} />)
      expect(screen.getByText('2:05')).toBeInTheDocument()
    })
  })

  describe('Status Badges', () => {
    it('displays correct badge for positive change', () => {
      const positiveMetric: MetricCard[] = [{
        id: 'test',
        title: 'Test',
        value: 100,
        changeType: 'positive',
        format: 'number',
      }]
      
      render(<MetricsCards metrics={positiveMetric} />)
      expect(screen.getByText('Improving')).toBeInTheDocument()
    })

    it('displays correct badge for negative change', () => {
      const negativeMetric: MetricCard[] = [{
        id: 'test',
        title: 'Test',
        value: 100,
        changeType: 'negative',
        format: 'number',
      }]
      
      render(<MetricsCards metrics={negativeMetric} />)
      expect(screen.getByText('Declining')).toBeInTheDocument()
    })

    it('displays correct badge for neutral change', () => {
      const neutralMetric: MetricCard[] = [{
        id: 'test',
        title: 'Test',
        value: 100,
        changeType: 'neutral',
        format: 'number',
      }]
      
      render(<MetricsCards metrics={neutralMetric} />)
      expect(screen.getByText('Stable')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<MetricsCards metrics={mockMetrics} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper ARIA labels', () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      expect(screen.getByRole('region', { name: 'Key Performance Metrics' })).toBeInTheDocument()
      
      mockMetrics.forEach(metric => {
        expect(screen.getByRole('article')).toBeInTheDocument()
      })
    })

    it('has proper heading structure', () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      mockMetrics.forEach(metric => {
        expect(screen.getByText(metric.title)).toHaveAttribute('id', `metric-${metric.id}-title`)
      })
    })

    it('has proper descriptions linked to values', () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      mockMetrics.forEach(metric => {
        if (metric.description) {
          expect(screen.getByText(metric.description)).toHaveAttribute('id', `metric-${metric.id}-desc`)
        }
      })
    })
  })

  describe('Interactive States', () => {
    it('applies hover styles correctly', () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      const cards = screen.getAllByRole('article')
      expect(cards[0]).toHaveClass('hover:shadow-md')
    })

    it('applies focus styles correctly', () => {
      render(<MetricsCards metrics={mockMetrics} />)
      
      const cards = screen.getAllByRole('article')
      expect(cards[0]).toHaveClass('focus-within:ring-2', 'focus-within:ring-primary', 'focus-within:ring-offset-2')
    })
  })

  describe('Responsive Design', () => {
    it('applies correct grid classes', () => {
      const { container } = render(<MetricsCards metrics={mockMetrics} />)
      
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-6')
    })

    it('handles custom className prop', () => {
      const { container } = render(<MetricsCards metrics={mockMetrics} className="custom-class" />)
      
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('custom-class')
    })
  })

  describe('Edge Cases', () => {
    it('handles metrics without change values', () => {
      const metricWithoutChange: MetricCard[] = [{
        id: 'test',
        title: 'Test',
        value: 100,
        format: 'number',
      }]
      
      render(<MetricsCards metrics={metricWithoutChange} />)
      
      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.queryByText('%')).not.toBeInTheDocument()
    })

    it('handles string values correctly', () => {
      const stringMetric: MetricCard[] = [{
        id: 'test',
        title: 'Test',
        value: 'Custom Value',
        format: 'number',
      }]
      
      render(<MetricsCards metrics={stringMetric} />)
      
      expect(screen.getByText('Custom Value')).toBeInTheDocument()
    })

    it('handles unknown icon gracefully', () => {
      const unknownIconMetric: MetricCard[] = [{
        id: 'test',
        title: 'Test',
        value: 100,
        format: 'number',
        icon: 'unknown-icon' as any,
      }]
      
      render(<MetricsCards metrics={unknownIconMetric} />)
      
      // Should render without error and fallback to Activity icon
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })
})