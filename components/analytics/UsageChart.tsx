'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp,
  Download,
  Calendar,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  Users,
  FileText,
  Search,
  Server
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UsageTrend } from '@/lib/mockData/analyticsMockData'

interface UsageChartProps {
  usageTrend?: UsageTrend | null
  isLoading?: boolean
  className?: string
  onExportData?: (data: any[], filename: string) => void
  onDateRangeChange?: (period: 'daily' | 'weekly' | 'monthly') => void
}

type ChartType = 'line' | 'area'
type Period = '7d' | '30d' | '90d'

const periodLabels = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days'
}

const metricIcons = {
  documentsProcessed: FileText,
  searchQueries: Search,
  apiRequests: Server,
  activeUsers: Users,
  storageUsage: Activity
}

const formatValue = (value: number, metric: string): string => {
  if (metric === 'storageUsage') {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(value) / Math.log(1024))
    return `${(value / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

const formatTooltipValue = (value: number, metric: string): string => {
  if (metric === 'storageUsage') {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(value) / Math.log(1024))
    return `${(value / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }
  return value.toLocaleString()
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-background border rounded-lg shadow-lg p-4 min-w-[200px]">
      <p className="font-semibold text-sm mb-3">
        {new Date(label).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </p>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}</span>
            </div>
            <span className="font-medium">
              {formatTooltipValue(entry.value, entry.dataKey)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ChartSkeleton = ({ height = 400 }: { height?: number }) => (
  <div 
    className="animate-pulse bg-muted rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <Activity className="h-16 w-16 text-muted-foreground/50" />
  </div>
)

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-96 text-muted-foreground">
    <div className="text-center">
      <TrendingUp className="h-16 w-16 mx-auto mb-4" />
      <p className="text-lg font-medium mb-2">No Usage Data</p>
      <p className="text-sm">{message}</p>
    </div>
  </div>
)

/**
 * UsageChart component displays document volume and usage trends
 * Features:
 * - Multiple chart types (line, area)
 * - Date range filtering (daily/weekly/monthly)
 * - Multiple metrics visualization
 * - Interactive tooltips with proper formatting
 * - Export functionality
 * - Responsive design
 * - Loading and empty states
 * - Accessibility support
 */
export function UsageChart({
  usageTrend,
  isLoading = false,
  className,
  onExportData,
  onDateRangeChange
}: UsageChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area')
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d')

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (!usageTrend) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <span>Usage Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="Usage trend data is not available for the selected period." />
        </CardContent>
      </Card>
    )
  }

  const handleExport = () => {
    if (!onExportData || !usageTrend) return

    // Combine all metrics into a single dataset
    const combinedData = usageTrend.documentsProcessed.data.map((point, index) => ({
      timestamp: point.timestamp,
      date: point.timestamp instanceof Date ? point.timestamp.toISOString().split('T')[0] : point.timestamp,
      documentsProcessed: point.value,
      searchQueries: usageTrend.searchQueries.data[index]?.value || 0,
      apiRequests: usageTrend.apiRequests.data[index]?.value || 0,
      activeUsers: usageTrend.activeUsers.data[index]?.value || 0,
      storageUsage: usageTrend.storageUsage.data[index]?.value || 0,
      storageUsageFormatted: formatTooltipValue(usageTrend.storageUsage.data[index]?.value || 0, 'storageUsage')
    }))

    onExportData(combinedData, `usage-trends-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period)
    if (onDateRangeChange) {
      const periodMap: Record<Period, 'daily' | 'weekly' | 'monthly'> = {
        '7d': 'daily',
        '30d': 'weekly',
        '90d': 'monthly'
      }
      onDateRangeChange(periodMap[period])
    }
  }

  // Prepare data for charts by combining all metrics
  const chartData = usageTrend.documentsProcessed.data.map((point, index) => ({
    timestamp: point.timestamp,
    documentsProcessed: point.value,
    searchQueries: usageTrend.searchQueries.data[index]?.value || 0,
    apiRequests: usageTrend.apiRequests.data[index]?.value || 0,
    activeUsers: usageTrend.activeUsers.data[index]?.value || 0,
    storageUsage: usageTrend.storageUsage.data[index]?.value || 0,
  }))

  const metrics = [
    { key: 'documentsProcessed', name: 'Documents', color: usageTrend.documentsProcessed.color, icon: FileText },
    { key: 'searchQueries', name: 'Searches', color: usageTrend.searchQueries.color, icon: Search },
    { key: 'apiRequests', name: 'API Requests', color: usageTrend.apiRequests.color, icon: Server },
    { key: 'activeUsers', name: 'Active Users', color: usageTrend.activeUsers.color, icon: Users },
    { key: 'storageUsage', name: 'Storage', color: usageTrend.storageUsage.color, icon: Activity },
  ]

  const renderChart = () => {
    if (chartData.length === 0) {
      return <EmptyState message="No data available for the selected period." />
    }

    const ChartComponent = chartType === 'area' ? AreaChart : LineChart

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="timestamp"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })
            }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatValue(value, '')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />

          {metrics.map((metric) => (
            chartType === 'area' ? (
              <Area
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stackId="1"
                stroke={metric.color}
                fill={metric.color}
                fillOpacity={0.6}
                name={metric.name}
              />
            ) : (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                name={metric.name}
                connectNulls={false}
              />
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  // Calculate summary statistics
  const summaryStats = metrics.map(metric => {
    const values = chartData.map(d => d[metric.key as keyof typeof d] as number)
    const total = values.reduce((sum, val) => sum + val, 0)
    const average = values.length > 0 ? total / values.length : 0
    const trend = values.length >= 2 && values[0] !== undefined && values[values.length - 1] !== undefined ? 
      ((values[values.length - 1]! - values[0]!) / values[0]!) * 100 : 0

    return {
      ...metric,
      total,
      average,
      trend: Math.round(trend * 100) / 100,
      current: values[values.length - 1] || 0
    }
  })

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Usage Trends</CardTitle>
            <Badge variant="outline">{periodLabels[selectedPeriod]}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center border rounded-md">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-8"
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className="h-8"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            
            {onExportData && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {summaryStats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Card key={stat.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </div>
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">
                  {formatValue(stat.current, stat.key)}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {stat.trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                  )}
                  <span className={stat.trend > 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(stat.trend).toFixed(1)}%
                  </span>
                  <span>vs period start</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export type { UsageChartProps }