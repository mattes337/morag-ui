import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AnalyticsFilters, AnalyticsFiltersState } from './AnalyticsFilters'
import { useState } from 'react'
import { subDays, startOfDay, endOfDay } from 'date-fns'

const meta: Meta<typeof AnalyticsFilters> = {
  title: 'Analytics/AnalyticsFilters',
  component: AnalyticsFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Multi-criteria filtering component for analytics with time range, realm, and search capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showSearch: {
      control: 'boolean',
      description: 'Show/hide search input',
    },
    showReset: {
      control: 'boolean',
      description: 'Show/hide reset filters button',
    },
    placeholder: {
      control: 'text',
      description: 'Search input placeholder text',
    },
  },
}

export default meta
type Story = StoryObj<typeof AnalyticsFilters>

// Mock data
const mockRealms = [
  { label: 'Marketing Realm', value: '1', count: 1247 },
  { label: 'Sales Realm', value: '2', count: 834 },
  { label: 'Engineering Realm', value: '3', count: 1234 },
  { label: 'Executive Realm', value: '4', count: 298 },
]

const mockMetrics = [
  { label: 'Documents Processed', value: 'documents_processed', count: 1247 },
  { label: 'Search Queries', value: 'search_queries', count: 5832 },
  { label: 'Active Users', value: 'active_users', count: 28 },
  { label: 'Processing Time', value: 'processing_time' },
  { label: 'Success Rate', value: 'success_rate' },
]

const mockDocumentTypes = [
  { label: 'PDF Documents', value: 'pdf', count: 542 },
  { label: 'Word Documents', value: 'docx', count: 298 },
  { label: 'Text Files', value: 'txt', count: 156 },
  { label: 'Markdown', value: 'md', count: 89 },
]

const mockStatuses = [
  { label: 'Completed', value: 'completed', count: 1189 },
  { label: 'Processing', value: 'processing', count: 23 },
  { label: 'Failed', value: 'failed', count: 15 },
  { label: 'Queued', value: 'queued', count: 8 },
]

// Default filter state
const defaultFilters: AnalyticsFiltersState = {
  timeRange: {
    startDate: startOfDay(subDays(new Date(), 29)),
    endDate: endOfDay(new Date()),
    period: '30d',
  },
}

export const Default: Story = {
  render: (args) => {
    const [filters, setFilters] = useState<AnalyticsFiltersState>(defaultFilters)
    
    return (
      <div className="space-y-6">
        <AnalyticsFilters
          {...args}
          filters={filters}
          onFiltersChange={setFilters}
          realms={mockRealms}
          metrics={mockMetrics}
          documentTypes={mockDocumentTypes}
          statuses={mockStatuses}
        />
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Current Filters:</h4>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    )
  },
  args: {
    showSearch: true,
    showReset: true,
    placeholder: 'Search analytics data...',
  },
}

export const WithActiveFilters: Story = {
  render: () => {
    const [filters, setFilters] = useState<AnalyticsFiltersState>({
      timeRange: {
        startDate: startOfDay(subDays(new Date(), 29)),
        endDate: endOfDay(new Date()),
        period: '30d',
      },
      realm: '1',
      metric: 'documents_processed',
      searchQuery: 'marketing documents',
      documentType: 'pdf',
      status: 'completed',
    })
    
    return (
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        realms={mockRealms}
        metrics={mockMetrics}
        documentTypes={mockDocumentTypes}
        statuses={mockStatuses}
      />
    )
  },
}

export const NoSearch: Story = {
  render: () => {
    const [filters, setFilters] = useState<AnalyticsFiltersState>(defaultFilters)
    
    return (
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        realms={mockRealms}
        metrics={mockMetrics}
        documentTypes={mockDocumentTypes}
        statuses={mockStatuses}
        showSearch={false}
      />
    )
  },
}

export const NoReset: Story = {
  render: () => {
    const [filters, setFilters] = useState<AnalyticsFiltersState>({
      ...defaultFilters,
      realm: '1',
      metric: 'documents_processed',
    })
    
    return (
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        realms={mockRealms}
        metrics={mockMetrics}
        documentTypes={mockDocumentTypes}
        statuses={mockStatuses}
        showReset={false}
      />
    )
  },
}

export const CustomPlaceholder: Story = {
  render: () => {
    const [filters, setFilters] = useState<AnalyticsFiltersState>(defaultFilters)
    
    return (
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        realms={mockRealms}
        metrics={mockMetrics}
        documentTypes={mockDocumentTypes}
        statuses={mockStatuses}
        placeholder="Find specific documents or metrics..."
      />
    )
  },
}

export const LimitedOptions: Story = {
  render: () => {
    const [filters, setFilters] = useState<AnalyticsFiltersState>(defaultFilters)
    
    const limitedRealms = mockRealms.slice(0, 2)
    const limitedMetrics = mockMetrics.slice(0, 3)
    
    return (
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        realms={limitedRealms}
        metrics={limitedMetrics}
        documentTypes={[]}
        statuses={[]}
      />
    )
  },
}

export const EmptyState: Story = {
  render: () => {
    const [filters, setFilters] = useState<AnalyticsFiltersState>(defaultFilters)
    
    return (
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        realms={[]}
        metrics={[]}
        documentTypes={[]}
        statuses={[]}
      />
    )
  },
}

export const InteractiveDemo: Story = {
  render: () => {
    const [filters, setFilters] = useState<AnalyticsFiltersState>(defaultFilters)
    const [resultCount, setResultCount] = useState(1247)
    
    // Simulate result count changes based on filters
    React.useEffect(() => {
      let count = 1247
      if (filters.realm) count = Math.floor(count * 0.6)
      if (filters.metric) count = Math.floor(count * 0.8)
      if (filters.searchQuery) count = Math.floor(count * 0.3)
      if (filters.documentType) count = Math.floor(count * 0.4)
      if (filters.status) count = Math.floor(count * 0.9)
      setResultCount(count)
    }, [filters])
    
    return (
      <div className="space-y-6">
        <AnalyticsFilters
          filters={filters}
          onFiltersChange={setFilters}
          realms={mockRealms}
          metrics={mockMetrics}
          documentTypes={mockDocumentTypes}
          statuses={mockStatuses}
        />
        
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            Analytics Results
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {resultCount.toLocaleString()} items found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Based on current filter criteria
          </p>
        </div>
      </div>
    )
  },
}