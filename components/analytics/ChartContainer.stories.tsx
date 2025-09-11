import type { Meta, StoryObj } from '@storybook/react'
import { ChartContainer } from './ChartContainer'

const meta: Meta<typeof ChartContainer> = {
  title: 'Analytics/ChartContainer',
  component: ChartContainer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Reusable chart wrapper component supporting line, bar, pie, and area charts with recharts integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    chartType: {
      control: 'select',
      options: ['line', 'bar', 'pie', 'area'],
      description: 'Type of chart to render',
    },
    height: {
      control: 'number',
      description: 'Chart height in pixels',
    },
    showGrid: {
      control: 'boolean',
      description: 'Show/hide grid lines',
    },
    showTooltip: {
      control: 'boolean',
      description: 'Show/hide tooltips on hover',
    },
    showLegend: {
      control: 'boolean',
      description: 'Show/hide chart legend',
    },
    animate: {
      control: 'boolean',
      description: 'Enable/disable chart animations',
    },
  },
}

export default meta
type Story = StoryObj<typeof ChartContainer>

// Sample data for different chart types
const lineChartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 280 },
  { name: 'May', value: 390 },
  { name: 'Jun', value: 420 },
]

const barChartData = [
  { name: 'PDF', value: 45 },
  { name: 'Word', value: 32 },
  { name: 'Text', value: 28 },
  { name: 'Excel', value: 15 },
  { name: 'Other', value: 12 },
]

const pieChartData = [
  { name: 'Completed', value: 75 },
  { name: 'Processing', value: 15 },
  { name: 'Failed', value: 8 },
  { name: 'Queued', value: 2 },
]

const areaChartData = [
  { name: 'Week 1', value: 120 },
  { name: 'Week 2', value: 145 },
  { name: 'Week 3', value: 189 },
  { name: 'Week 4', value: 167 },
  { name: 'Week 5', value: 234 },
]

export const LineChart: Story = {
  args: {
    data: lineChartData,
    chartType: 'line',
    title: 'Monthly Trends',
    subtitle: 'Document processing over time',
    height: 300,
    dataKey: 'value',
    xAxisDataKey: 'name',
    showGrid: true,
    showTooltip: true,
    showLegend: false,
    animate: true,
  },
}

export const BarChart: Story = {
  args: {
    data: barChartData,
    chartType: 'bar',
    title: 'Document Types',
    subtitle: 'Distribution by file format',
    height: 300,
    dataKey: 'value',
    xAxisDataKey: 'name',
    showGrid: true,
    showTooltip: true,
    showLegend: false,
    animate: true,
  },
}

export const PieChart: Story = {
  args: {
    data: pieChartData,
    chartType: 'pie',
    title: 'Processing Status',
    subtitle: 'Current document states',
    height: 350,
    dataKey: 'value',
    xAxisDataKey: 'name',
    showGrid: false,
    showTooltip: true,
    showLegend: true,
    animate: true,
  },
}

export const AreaChart: Story = {
  args: {
    data: areaChartData,
    chartType: 'area',
    title: 'Weekly Performance',
    subtitle: 'Processing volume trends',
    height: 300,
    dataKey: 'value',
    xAxisDataKey: 'name',
    showGrid: true,
    showTooltip: true,
    showLegend: false,
    animate: true,
  },
}

export const CustomColors: Story = {
  args: {
    data: barChartData,
    chartType: 'bar',
    title: 'Custom Color Scheme',
    subtitle: 'Bar chart with custom colors',
    height: 300,
    dataKey: 'value',
    xAxisDataKey: 'name',
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
    showGrid: true,
    showTooltip: true,
    showLegend: false,
    animate: true,
  },
}

export const NoAnimation: Story = {
  args: {
    data: lineChartData,
    chartType: 'line',
    title: 'Static Chart',
    subtitle: 'Line chart without animations',
    height: 300,
    dataKey: 'value',
    xAxisDataKey: 'name',
    showGrid: true,
    showTooltip: true,
    showLegend: false,
    animate: false,
  },
}

export const MinimalChart: Story = {
  args: {
    data: lineChartData,
    chartType: 'line',
    height: 200,
    dataKey: 'value',
    xAxisDataKey: 'name',
    showGrid: false,
    showTooltip: false,
    showLegend: false,
    animate: true,
  },
}

export const LargeChart: Story = {
  args: {
    data: areaChartData,
    chartType: 'area',
    title: 'Large Analytics View',
    subtitle: 'Full-size chart for detailed analysis',
    height: 500,
    dataKey: 'value',
    xAxisDataKey: 'name',
    showGrid: true,
    showTooltip: true,
    showLegend: true,
    animate: true,
  },
}