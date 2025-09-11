import type { Meta, StoryObj } from '@storybook/react'
import { AnalyticsGrid, ChartConfig } from './AnalyticsGrid'
import { MetricCard } from '@/lib/mockData/analyticsMockData'

const meta: Meta<typeof AnalyticsGrid> = {
  title: 'Analytics/AnalyticsGrid',
  component: AnalyticsGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Responsive grid layout component for displaying analytics metrics and charts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['default', 'compact', 'wide'],
      description: 'Grid layout preset',
    },
    showMetrics: {
      control: 'boolean',
      description: 'Show/hide metrics cards section',
    },
    showCharts: {
      control: 'boolean',
      description: 'Show/hide charts section',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading skeleton state',
    },
  },
}

export default meta
type Story = StoryObj<typeof AnalyticsGrid>

// Mock metrics data
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
    id: 'search-queries',
    title: 'Search Queries',
    value: 5832,
    previousValue: 5203,
    change: 12.1,
    changeType: 'positive',
    format: 'number',
    description: 'Searches performed this month',
    trend: 'up',
    icon: 'search',
  },
  {
    id: 'active-users',
    title: 'Active Users',
    value: 28,
    previousValue: 25,
    change: 12.0,
    changeType: 'positive',
    format: 'number',
    description: 'Monthly active users',
    trend: 'up',
    icon: 'users',
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
  {
    id: 'storage-used',
    title: 'Storage Used',
    value: '47.3 GB',
    previousValue: '44.1 GB',
    change: 7.3,
    changeType: 'neutral',
    format: 'bytes',
    description: 'Total storage consumed',
    trend: 'up',
    icon: 'hard-drive',
  },
]

// Mock chart data
const mockCharts: ChartConfig[] = [
  {
    id: 'documents-trend',
    title: 'Documents Processed',
    subtitle: 'Daily processing volume',
    type: 'area',
    data: [
      { name: 'Jan 1', value: 120, timestamp: new Date() },
      { name: 'Jan 2', value: 145, timestamp: new Date() },
      { name: 'Jan 3', value: 189, timestamp: new Date() },
      { name: 'Jan 4', value: 167, timestamp: new Date() },
      { name: 'Jan 5', value: 234, timestamp: new Date() },
      { name: 'Jan 6', value: 198, timestamp: new Date() },
      { name: 'Jan 7', value: 276, timestamp: new Date() },
    ],
    dataKey: 'value',
    xAxisDataKey: 'name',
    colors: ['#3b82f6'],
    showGrid: true,
    showLegend: false,
  },
  {
    id: 'document-types',
    title: 'Document Types',
    subtitle: 'Distribution by file format',
    type: 'pie',
    data: [
      { name: 'PDF', value: 45, timestamp: new Date() },
      { name: 'Word', value: 32, timestamp: new Date() },
      { name: 'Text', value: 28, timestamp: new Date() },
      { name: 'Excel', value: 15, timestamp: new Date() },
      { name: 'Other', value: 12, timestamp: new Date() },
    ],
    dataKey: 'value',
    xAxisDataKey: 'name',
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    showGrid: false,
    showLegend: true,
  },
  {
    id: 'processing-stages',
    title: 'Processing Performance',
    subtitle: 'Average time per stage',
    type: 'bar',
    data: [
      { name: 'Conversion', value: 2400, timestamp: new Date() },
      { name: 'Optimizer', value: 8900, timestamp: new Date() },
      { name: 'Chunker', value: 1200, timestamp: new Date() },
      { name: 'Generator', value: 15600, timestamp: new Date() },
      { name: 'Ingestor', value: 3200, timestamp: new Date() },
    ],
    dataKey: 'value',
    xAxisDataKey: 'name',
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    showGrid: true,
    showLegend: false,
  },
  {
    id: 'user-activity',
    title: 'User Activity',
    subtitle: 'Active users over time',
    type: 'line',
    data: [
      { name: 'Week 1', value: 22, timestamp: new Date() },
      { name: 'Week 2', value: 25, timestamp: new Date() },
      { name: 'Week 3', value: 28, timestamp: new Date() },
      { name: 'Week 4', value: 26, timestamp: new Date() },
      { name: 'Week 5', value: 31, timestamp: new Date() },
    ],
    dataKey: 'value',
    xAxisDataKey: 'name',
    colors: ['#10b981'],
    showGrid: true,
    showLegend: false,
  },
]

export const Default: Story = {
  args: {
    metrics: mockMetrics,
    charts: mockCharts,
    layout: 'default',
    showMetrics: true,
    showCharts: true,
    isLoading: false,
  },
}

export const CompactLayout: Story = {
  args: {
    metrics: mockMetrics,
    charts: mockCharts.slice(0, 2),
    layout: 'compact',
    showMetrics: true,
    showCharts: true,
    isLoading: false,
  },
}

export const WideLayout: Story = {
  args: {
    metrics: mockMetrics.slice(0, 4),
    charts: mockCharts.slice(0, 2),
    layout: 'wide',
    showMetrics: true,
    showCharts: true,
    isLoading: false,
  },
}

export const MetricsOnly: Story = {
  args: {
    metrics: mockMetrics,
    charts: [],
    layout: 'default',
    showMetrics: true,
    showCharts: false,
    isLoading: false,
  },
}

export const ChartsOnly: Story = {
  args: {
    metrics: [],
    charts: mockCharts,
    layout: 'default',
    showMetrics: false,
    showCharts: true,
    isLoading: false,
  },
}

export const LoadingState: Story = {
  args: {
    metrics: [],
    charts: [],
    layout: 'default',
    showMetrics: true,
    showCharts: true,
    isLoading: true,
  },
}

export const EmptyState: Story = {
  args: {
    metrics: [],
    charts: [],
    layout: 'default',
    showMetrics: true,
    showCharts: true,
    isLoading: false,
  },
}

export const LimitedData: Story = {
  args: {
    metrics: mockMetrics.slice(0, 3),
    charts: mockCharts.slice(0, 1),
    layout: 'default',
    showMetrics: true,
    showCharts: true,
    isLoading: false,
  },
}

export const CompactMetrics: Story = {
  args: {
    metrics: mockMetrics,
    charts: mockCharts,
    layout: 'compact',
    showMetrics: true,
    showCharts: true,
    isLoading: false,
  },
}

// Responsive demo
export const ResponsiveDemo: Story = {
  render: (args) => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Desktop View (Default)</h3>
        <div className="border rounded-lg p-4">
          <AnalyticsGrid {...args} />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tablet View (Medium)</h3>
        <div className="border rounded-lg p-4 max-w-2xl">
          <AnalyticsGrid {...args} />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mobile View (Small)</h3>
        <div className="border rounded-lg p-4 max-w-sm">
          <AnalyticsGrid {...args} />
        </div>
      </div>
    </div>
  ),
  args: {
    metrics: mockMetrics.slice(0, 4),
    charts: mockCharts.slice(0, 2),
    layout: 'default',
    showMetrics: true,
    showCharts: true,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how the grid adapts to different screen sizes.',
      },
    },
  },
}

export const LayoutComparison: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Layout</h3>
        <AnalyticsGrid
          metrics={mockMetrics.slice(0, 4)}
          charts={mockCharts.slice(0, 2)}
          layout="default"
          showMetrics={true}
          showCharts={true}
          isLoading={false}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Layout</h3>
        <AnalyticsGrid
          metrics={mockMetrics}
          charts={mockCharts.slice(0, 2)}
          layout="compact"
          showMetrics={true}
          showCharts={true}
          isLoading={false}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Wide Layout</h3>
        <AnalyticsGrid
          metrics={mockMetrics.slice(0, 4)}
          charts={mockCharts.slice(0, 2)}
          layout="wide"
          showMetrics={true}
          showCharts={true}
          isLoading={false}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available layout options.',
      },
    },
  },
}