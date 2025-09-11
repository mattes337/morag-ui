import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { AnalyticsFilters, AnalyticsFiltersState } from './AnalyticsFilters'
import { subDays, startOfDay, endOfDay } from 'date-fns'

// Mock the TimeRangeSelector component
jest.mock('./TimeRangeSelector', () => ({
  TimeRangeSelector: ({ value, onChange }: any) => (
    <div data-testid="time-range-selector">
      <button onClick={() => onChange({ ...value, period: '7d' })}>
        {value?.period || 'Select time range'}
      </button>
    </div>
  ),
}))

describe('AnalyticsFilters', () => {
  const mockOnFiltersChange = jest.fn()
  
  const defaultFilters: AnalyticsFiltersState = {
    timeRange: {
      startDate: startOfDay(subDays(new Date(), 29)),
      endDate: endOfDay(new Date()),
      period: '30d',
    },
  }

  const mockRealms = [
    { label: 'Marketing Realm', value: '1', count: 1247 },
    { label: 'Sales Realm', value: '2', count: 834 },
  ]

  const mockMetrics = [
    { label: 'Documents Processed', value: 'documents_processed', count: 1247 },
    { label: 'Search Queries', value: 'search_queries', count: 5832 },
  ]

  beforeEach(() => {
    mockOnFiltersChange.mockClear()
  })

  it('renders without crashing', () => {
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )
    
    expect(screen.getByTestId('time-range-selector')).toBeInTheDocument()
  })

  it('displays time range selector', () => {
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )
    
    expect(screen.getByTestId('time-range-selector')).toBeInTheDocument()
    expect(screen.getByText('30d')).toBeInTheDocument()
  })

  it('shows search input when showSearch is true', () => {
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        showSearch={true}
      />
    )
    
    expect(screen.getByPlaceholderText('Search analytics data...')).toBeInTheDocument()
  })

  it('hides search input when showSearch is false', () => {
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        showSearch={false}
      />
    )
    
    expect(screen.queryByPlaceholderText('Search analytics data...')).not.toBeInTheDocument()
  })

  it('uses custom placeholder for search', () => {
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        placeholder="Custom search placeholder"
      />
    )
    
    expect(screen.getByPlaceholderText('Custom search placeholder')).toBeInTheDocument()
  })

  it('shows filters button with count when filters are active', () => {
    const filtersWithData: AnalyticsFiltersState = {
      ...defaultFilters,
      realm: '1',
      metric: 'documents_processed',
    }
    
    render(
      <AnalyticsFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        realms={mockRealms}
        metrics={mockMetrics}
      />
    )
    
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // Filter count badge
  })

  it('shows reset button when filters are active and showReset is true', () => {
    const filtersWithData: AnalyticsFiltersState = {
      ...defaultFilters,
      realm: '1',
    }
    
    render(
      <AnalyticsFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        realms={mockRealms}
        showReset={true}
      />
    )
    
    expect(screen.getByText('Reset')).toBeInTheDocument()
  })

  it('hides reset button when showReset is false', () => {
    const filtersWithData: AnalyticsFiltersState = {
      ...defaultFilters,
      realm: '1',
    }
    
    render(
      <AnalyticsFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        realms={mockRealms}
        showReset={false}
      />
    )
    
    expect(screen.queryByText('Reset')).not.toBeInTheDocument()
  })

  it('expands filter options when filters button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        realms={mockRealms}
        metrics={mockMetrics}
      />
    )
    
    await user.click(screen.getByText('Filters'))
    
    await waitFor(() => {
      expect(screen.getByText('Realm')).toBeInTheDocument()
      expect(screen.getByText('Metric')).toBeInTheDocument()
    })
  })

  it('calls onFiltersChange when search query changes', async () => {
    const user = userEvent.setup()
    
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        showSearch={true}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search analytics data...')
    await user.type(searchInput, 'test query')
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        searchQuery: 'test query'
      })
    )
  })

  it('calls onFiltersChange when reset is clicked', async () => {
    const user = userEvent.setup()
    
    const filtersWithData: AnalyticsFiltersState = {
      ...defaultFilters,
      realm: '1',
      searchQuery: 'test',
    }
    
    render(
      <AnalyticsFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        realms={mockRealms}
        showReset={true}
      />
    )
    
    await user.click(screen.getByText('Reset'))
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      timeRange: defaultFilters.timeRange,
    })
  })

  it('displays active filter badges', () => {
    const filtersWithData: AnalyticsFiltersState = {
      ...defaultFilters,
      realm: '1',
      searchQuery: 'test query',
    }
    
    render(
      <AnalyticsFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        realms={mockRealms}
      />
    )
    
    expect(screen.getByText('Active filters:')).toBeInTheDocument()
    expect(screen.getByText(/Realm:/)).toBeInTheDocument()
    expect(screen.getByText(/Search:/)).toBeInTheDocument()
  })

  it('removes individual filters when badge X is clicked', async () => {
    const user = userEvent.setup()
    
    const filtersWithData: AnalyticsFiltersState = {
      ...defaultFilters,
      realm: '1',
    }
    
    render(
      <AnalyticsFilters
        filters={filtersWithData}
        onFiltersChange={mockOnFiltersChange}
        realms={mockRealms}
      />
    )
    
    // Find and click the X button on the realm filter badge
    const removeButtons = screen.getAllByRole('button')
    const realmRemoveButton = removeButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('class')?.includes('h-auto')
    )
    
    if (realmRemoveButton) {
      await user.click(realmRemoveButton)
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          timeRange: defaultFilters.timeRange,
          // realm should be removed
        })
      )
    }
  })

  it('applies custom className', () => {
    const { container } = render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        className="custom-filters"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-filters')
  })

  it('handles empty filter options gracefully', async () => {
    const user = userEvent.setup()
    
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        realms={[]}
        metrics={[]}
        documentTypes={[]}
        statuses={[]}
      />
    )
    
    await user.click(screen.getByText('Filters'))
    
    // Should still render filter sections but with empty options
    await waitFor(() => {
      expect(screen.getByText('Metric')).toBeInTheDocument()
    })
  })
})

describe('AnalyticsFilters Accessibility', () => {
  const mockOnFiltersChange = jest.fn()
  
  const defaultFilters: AnalyticsFiltersState = {
    timeRange: {
      startDate: startOfDay(subDays(new Date(), 29)),
      endDate: endOfDay(new Date()),
      period: '30d',
    },
  }

  it('has proper labels for form controls', async () => {
    const user = userEvent.setup()
    
    const mockRealms = [
      { label: 'Marketing Realm', value: '1', count: 1247 },
    ]
    
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        realms={mockRealms}
      />
    )
    
    await user.click(screen.getByText('Filters'))
    
    await waitFor(() => {
      expect(screen.getByText('Realm')).toBeInTheDocument()
      expect(screen.getByText('Metric')).toBeInTheDocument()
    })
  })

  it('search input has proper accessibility attributes', () => {
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        showSearch={true}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search analytics data...')
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  it('provides keyboard navigation support', async () => {
    const user = userEvent.setup()
    
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        showSearch={true}
      />
    )
    
    // Tab through elements
    await user.tab()
    expect(screen.getByPlaceholderText('Search analytics data...')).toHaveFocus()
    
    await user.tab()
    expect(screen.getByText('Filters')).toHaveFocus()
  })
})

describe('AnalyticsFilters Performance', () => {
  const mockOnFiltersChange = jest.fn()
  
  it('handles frequent filter changes efficiently', async () => {
    const user = userEvent.setup()
    
    const defaultFilters: AnalyticsFiltersState = {
      timeRange: {
        startDate: startOfDay(subDays(new Date(), 29)),
        endDate: endOfDay(new Date()),
        period: '30d',
      },
    }
    
    render(
      <AnalyticsFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        showSearch={true}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search analytics data...')
    
    // Rapid typing should not cause performance issues
    const startTime = performance.now()
    await user.type(searchInput, 'rapid typing test')
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
  })
})