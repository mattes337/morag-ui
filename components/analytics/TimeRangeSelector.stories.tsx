import type { Meta, StoryObj } from '@storybook/react'
import { TimeRangeSelector, TimeRange } from './TimeRangeSelector'
import { useState } from 'react'
import { subDays, startOfDay, endOfDay } from 'date-fns'

const meta: Meta<typeof TimeRangeSelector> = {
  title: 'Analytics/TimeRangeSelector',
  component: TimeRangeSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Date/period filtering component with predefined periods and custom range selection.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Button size',
    },
    showCustomRange: {
      control: 'boolean',
      description: 'Show/hide custom date range option',
    },
  },
}

export default meta
type Story = StoryObj<typeof TimeRangeSelector>

// Default time range
const defaultTimeRange: TimeRange = {
  startDate: startOfDay(subDays(new Date(), 29)),
  endDate: endOfDay(new Date()),
  period: '30d',
}

export const Default: Story = {
  render: (args) => {
    const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange)
    
    return (
      <div className="space-y-4">
        <TimeRangeSelector
          {...args}
          value={timeRange}
          onChange={setTimeRange}
        />
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Selected Range:</h4>
          <pre className="text-sm">
            {JSON.stringify({
              period: timeRange.period,
              startDate: timeRange.startDate.toLocaleDateString(),
              endDate: timeRange.endDate.toLocaleDateString(),
            }, null, 2)}
          </pre>
        </div>
      </div>
    )
  },
  args: {
    variant: 'outline',
    size: 'default',
    showCustomRange: true,
  },
}

export const Outline: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange)
    
    return (
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        variant="outline"
        size="default"
      />
    )
  },
}

export const Ghost: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange)
    
    return (
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        variant="ghost"
        size="default"
      />
    )
  },
}

export const SmallSize: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange)
    
    return (
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        variant="outline"
        size="sm"
      />
    )
  },
}

export const LargeSize: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange)
    
    return (
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        variant="outline"
        size="lg"
      />
    )
  },
}

export const NoCustomRange: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange)
    
    return (
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        variant="outline"
        size="default"
        showCustomRange={false}
      />
    )
  },
}

export const CustomOptions: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange)
    
    const customOptions = [
      { label: 'Today', value: '7d' as const, description: 'Current day' },
      { label: 'This week', value: '30d' as const, description: 'Past 7 days' },
      { label: 'This month', value: '90d' as const, description: 'Current month' },
      { label: 'Custom', value: 'custom' as const, description: 'Select dates' },
    ]
    
    return (
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        options={customOptions}
        variant="outline"
        size="default"
      />
    )
  },
}

export const MultipleSelectors: Story = {
  render: () => {
    const [range1, setRange1] = useState<TimeRange>(defaultTimeRange)
    const [range2, setRange2] = useState<TimeRange>({
      startDate: startOfDay(subDays(new Date(), 6)),
      endDate: endOfDay(new Date()),
      period: '7d',
    })
    
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Primary Range
            </label>
            <TimeRangeSelector
              value={range1}
              onChange={setRange1}
              variant="outline"
              size="default"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Comparison Range
            </label>
            <TimeRangeSelector
              value={range2}
              onChange={setRange2}
              variant="ghost"
              size="default"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Primary Range:</h4>
            <p className="text-sm">{range1.period}</p>
            <p className="text-xs text-muted-foreground">
              {range1.startDate.toLocaleDateString()} - {range1.endDate.toLocaleDateString()}
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Comparison Range:</h4>
            <p className="text-sm">{range2.period}</p>
            <p className="text-xs text-muted-foreground">
              {range2.startDate.toLocaleDateString()} - {range2.endDate.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    )
  },
}

export const WithoutValue: Story = {
  render: () => {
    const [timeRange, setTimeRange] = useState<TimeRange | undefined>(undefined)
    
    return (
      <div className="space-y-4">
        <TimeRangeSelector
          value={timeRange}
          onChange={setTimeRange}
          variant="outline"
          size="default"
        />
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">
            {timeRange ? 
              `Selected: ${timeRange.period} (${timeRange.startDate.toLocaleDateString()} - ${timeRange.endDate.toLocaleDateString()})` :
              'No range selected'
            }
          </p>
        </div>
      </div>
    )
  },
}