import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { TimeRangeSelector, TimeRange } from './TimeRangeSelector'
import { subDays, startOfDay, endOfDay } from 'date-fns'

// Mock date-fns functions for consistent testing
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn((date, format) => {
    if (format === 'MMM d') return 'Jan 1'
    if (format === 'MMM d, yyyy') return 'Jan 1, 2024'
    if (format === 'yyyy-MM-dd') return '2024-01-01'
    return '2024-01-01'
  }),
}))

describe('TimeRangeSelector', () => {
  const mockOnChange = jest.fn()
  
  const defaultTimeRange: TimeRange = {
    startDate: startOfDay(subDays(new Date(), 29)),
    endDate: endOfDay(new Date()),
    period: '30d',
  }

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders without crashing', () => {
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
      />
    )
    
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('displays current selection label', () => {
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
      />
    )
    
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
  })

  it('displays placeholder when no value is provided', () => {
    render(
      <TimeRangeSelector
        onChange={mockOnChange}
      />
    )
    
    expect(screen.getByText('Select time range')).toBeInTheDocument()
  })

  it('opens popover when clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
      />
    )
    
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Select time range')).toBeInTheDocument()
    })
  })

  it('shows default time range options', async () => {
    const user = userEvent.setup()
    
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
      />
    )
    
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Last 7 days')).toBeInTheDocument()
      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
      expect(screen.getByText('Last 90 days')).toBeInTheDocument()
      expect(screen.getByText('Last year')).toBeInTheDocument()
    })
  })

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup()
    
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
      />
    )
    
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Last 7 days'))
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        period: '7d'
      })
    )
  })

  it('supports custom options', async () => {
    const user = userEvent.setup()
    
    const customOptions = [
      { label: 'Today', value: '7d' as const, description: 'Current day' },
      { label: 'This week', value: '30d' as const, description: 'Past 7 days' },
    ]
    
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
        options={customOptions}
      />
    )
    
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('This week')).toBeInTheDocument()
      expect(screen.queryByText('Last year')).not.toBeInTheDocument()
    })
  })

  it('hides custom range when showCustomRange is false', async () => {
    const user = userEvent.setup()
    
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
        showCustomRange={false}
      />
    )
    
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.queryByText('Custom range')).not.toBeInTheDocument()
    })
  })

  it('applies different button variants', () => {
    const { rerender } = render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
        variant="outline"
      />
    )
    
    let button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    
    rerender(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
        variant="ghost"
      />
    )
    
    button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('applies different button sizes', () => {
    const { rerender } = render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
        size="sm"
      />
    )
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-8')
    
    rerender(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
        size="lg"
      />
    )
    
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-11')
  })

  it('applies custom className', () => {
    const { container } = render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
        className="custom-selector"
      />
    )
    
    expect(container.querySelector('.custom-selector')).toBeInTheDocument()
  })

  it('displays custom range dates when period is custom', () => {
    const customRange: TimeRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      period: 'custom',
    }
    
    render(
      <TimeRangeSelector
        value={customRange}
        onChange={mockOnChange}
      />
    )
    
    // Should show the formatted date range
    expect(screen.getByText(/Jan 1 - Jan 1, 2024/)).toBeInTheDocument()
  })
})

describe('TimeRangeSelector Custom Range', () => {
  const mockOnChange = jest.fn()
  
  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('shows custom date inputs when custom is selected', async () => {
    const user = userEvent.setup()
    
    const customRange: TimeRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      period: 'custom',
    }
    
    render(
      <TimeRangeSelector
        value={customRange}
        onChange={mockOnChange}
      />
    )
    
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByLabelText('From')).toBeInTheDocument()
      expect(screen.getByLabelText('To')).toBeInTheDocument()
    })
  })

  it('has apply and cancel buttons for custom range', async () => {
    const user = userEvent.setup()
    
    const customRange: TimeRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      period: 'custom',
    }
    
    render(
      <TimeRangeSelector
        value={customRange}
        onChange={mockOnChange}
      />
    )
    
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })
})

describe('TimeRangeSelector Accessibility', () => {
  const mockOnChange = jest.fn()
  
  const defaultTimeRange: TimeRange = {
    startDate: startOfDay(subDays(new Date(), 29)),
    endDate: endOfDay(new Date()),
    period: '30d',
  }

  it('has proper ARIA labels', () => {
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Time range selector'))
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
      />
    )
    
    const button = screen.getByRole('button')
    
    // Focus the button
    await user.tab()
    expect(button).toHaveFocus()
    
    // Open with Enter key
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(screen.getByText('Select time range')).toBeInTheDocument()
    })
  })

  it('provides proper focus management', async () => {
    const user = userEvent.setup()
    
    render(
      <TimeRangeSelector
        value={defaultTimeRange}
        onChange={mockOnChange}
      />
    )
    
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      // First option should be focusable
      const firstOption = screen.getByText('Last 7 days')
      expect(firstOption).toBeInTheDocument()
    })
  })
})

describe('TimeRangeSelector Edge Cases', () => {
  const mockOnChange = jest.fn()

  it('handles undefined value gracefully', () => {
    render(
      <TimeRangeSelector
        onChange={mockOnChange}
      />
    )
    
    expect(screen.getByText('Select time range')).toBeInTheDocument()
  })

  it('handles empty options array', async () => {
    const user = userEvent.setup()
    
    render(
      <TimeRangeSelector
        onChange={mockOnChange}
        options={[]}
      />
    )
    
    await user.click(screen.getByRole('button'))
    
    // Should still render the popover structure
    await waitFor(() => {
      expect(screen.getByText('Select time range')).toBeInTheDocument()
    })
  })
})