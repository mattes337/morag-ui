import type { Meta, StoryObj } from '@storybook/react'
import { MetricsCard } from './MetricsCard'

const meta: Meta<typeof MetricsCard> = {
  title: 'Analytics/MetricsCard',
  component: MetricsCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Key performance indicator display component with trend indicators and animated values.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: ['number', 'currency', 'percentage', 'duration', 'bytes'],
      description: 'Format type for the value display',
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'flat'],
      description: 'Trend direction indicator',
    },
    variant: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Card size variant',
    },
    icon: {
      control: 'select',
      options: ['file-text', 'clock', 'search', 'users', 'check-circle', 'hard-drive', 'layers', 'activity', 'alert-circle'],
      description: 'Icon to display with the metric',
    },
    animate: {
      control: 'boolean',
      description: 'Enable/disable CountUp animation',
    },
  },
}

export default meta
type Story = StoryObj<typeof MetricsCard>

export const Default: Story = {
  args: {
    title: 'Total Documents',
    value: 1247,
    change: 12.5,
    trend: 'up',
    icon: 'file-text',
    description: 'Documents processed this month',
    format: 'number',
    variant: 'default',
    animate: true,
  },
}

export const CurrencyFormat: Story = {
  args: {
    title: 'Revenue Generated',
    value: 45780,
    change: 8.3,
    trend: 'up',
    icon: 'activity',
    description: 'Monthly recurring revenue',
    format: 'currency',
    variant: 'default',
    animate: true,
  },
}

export const PercentageFormat: Story = {
  args: {
    title: 'Success Rate',
    value: 97.8,
    change: 2.1,
    trend: 'up',
    icon: 'check-circle',
    description: 'Document processing success rate',
    format: 'percentage',
    variant: 'default',
    animate: true,
  },
}

export const DurationFormat: Story = {
  args: {
    title: 'Average Processing Time',
    value: 138000, // 2.3 minutes in milliseconds
    change: -15.7,
    trend: 'down',
    icon: 'clock',
    description: 'Time to process documents',
    format: 'duration',
    variant: 'default',
    animate: true,
  },
}

export const BytesFormat: Story = {
  args: {
    title: 'Storage Used',
    value: 47300000000, // ~47.3 GB in bytes
    change: 7.3,
    trend: 'up',
    icon: 'hard-drive',
    description: 'Total storage consumed',
    format: 'bytes',
    variant: 'default',
    animate: true,
  },
}

export const NegativeTrend: Story = {
  args: {
    title: 'Error Rate',
    value: 3.2,
    change: -1.8,
    trend: 'down', // Down is good for error rate
    icon: 'alert-circle',
    description: 'Processing failure rate',
    format: 'percentage',
    variant: 'default',
    animate: true,
  },
}

export const FlatTrend: Story = {
  args: {
    title: 'Active Users',
    value: 28,
    change: 0,
    trend: 'flat',
    icon: 'users',
    description: 'Currently active users',
    format: 'number',
    variant: 'default',
    animate: true,
  },
}

export const NoTrend: Story = {
  args: {
    title: 'System Uptime',
    value: '99.9%',
    icon: 'activity',
    description: 'Platform availability',
    format: 'percentage',
    variant: 'default',
    animate: false,
  },
}

export const CompactVariant: Story = {
  args: {
    title: 'Search Queries',
    value: 5832,
    change: 15.2,
    trend: 'up',
    icon: 'search',
    description: 'Queries this month',
    format: 'number',
    variant: 'compact',
    animate: true,
  },
}

export const LargeNumber: Story = {
  args: {
    title: 'Total Interactions',
    value: 2547893,
    change: 23.7,
    trend: 'up',
    icon: 'activity',
    description: 'All user interactions',
    format: 'number',
    variant: 'default',
    animate: true,
  },
}

export const NoAnimation: Story = {
  args: {
    title: 'Static Metric',
    value: 1247,
    change: 12.5,
    trend: 'up',
    icon: 'file-text',
    description: 'No animation example',
    format: 'number',
    variant: 'default',
    animate: false,
  },
}

export const StringValue: Story = {
  args: {
    title: 'Current Status',
    value: 'Operational',
    icon: 'check-circle',
    description: 'System health status',
    format: 'number',
    variant: 'default',
    animate: false,
  },
}

// Grid layout example
export const GridExample: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricsCard
        title="Total Documents"
        value={1247}
        change={12.5}
        trend="up"
        icon="file-text"
        description="Documents processed"
        format="number"
        animate={true}
      />
      <MetricsCard
        title="Success Rate"
        value={97.8}
        change={2.1}
        trend="up"
        icon="check-circle"
        description="Processing success"
        format="percentage"
        animate={true}
      />
      <MetricsCard
        title="Active Users"
        value={28}
        change={0}
        trend="flat"
        icon="users"
        description="Current users"
        format="number"
        animate={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of multiple metrics cards in a grid layout.',
      },
    },
  },
}