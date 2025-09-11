'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { 
  Clock,
  TrendingUp,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BarChartData, PieChartData, TimeSeriesData } from '@/lib/mockData/analyticsMockData'

interface ProcessingChartProps {
  stageData?: BarChartData[]
  documentTypes?: PieChartData[]
  performanceTrends?: TimeSeriesData
  isLoading?: boolean
  className?: string
  onExportData?: (data: any[], filename: string) => void
}

type ChartType = 'bar' | 'pie' | 'line'

const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`
  return `${(milliseconds / 60000).toFixed(1)}min`
}

const formatBytes = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const CustomTooltip = ({ active, payload, label, chartType }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs">
      <p className="font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry: any, index: number) => {
        let value = entry.value
        if (chartType === 'processing' && typeof value === 'number') {
          value = formatDuration(value)
        }
        
        return (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{value}</span>
          </div>
        )
      })}
    </div>
  )
}

const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div 
    className="animate-pulse bg-muted rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <Activity className="h-12 w-12 text-muted-foreground/50" />
  </div>
)

/**
 * ProcessingChart component displays pipeline performance analytics
 * Features:
 * - Multiple chart types (bar, pie, line)
 * - Interactive tooltips with formatting
 * - Export functionality
 * - Responsive design
 * - Loading states
 * - Accessibility support
 */
export function ProcessingChart({
  stageData = [],
  documentTypes = [],
  performanceTrends,
  isLoading = false,
  className,
  onExportData
}: ProcessingChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('bar')

  const handleExport = () => {
    if (onExportData) {
      let dataToExport: any[] = []
      let filename = ''

      switch (activeChart) {
        case 'bar':
          dataToExport = stageData.map(item => ({
            stage: item.category,
            duration_ms: item.value,
            duration_formatted: formatDuration(item.value)
          }))
          filename = 'processing-stages-performance.csv'
          break
        case 'pie':
          dataToExport = documentTypes.map(item => ({
            document_type: item.name,
            count: item.value,
            percentage: item.percentage
          }))
          filename = 'document-types-distribution.csv'
          break
        case 'line':
          if (performanceTrends) {
            dataToExport = performanceTrends.data.map(point => ({
              timestamp: point.timestamp,
              value: point.value,
              formatted_time: formatDuration(point.value)
            }))
            filename = 'performance-trends.csv'
          }
          break
      }

      onExportData(dataToExport, filename)
    }
  }

  const renderBarChart = () => {
    if (isLoading) return <ChartSkeleton />

    if (!stageData || stageData.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p>No processing stage data available</p>
          </div>
        </div>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="category"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatDuration(value)}
          />
          <Tooltip content={<CustomTooltip chartType="processing" />} />
          <Legend />
          <Bar 
            dataKey="value" 
            fill="#3b82f6"
            name="Processing Time"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderPieChart = () => {
    if (isLoading) return <ChartSkeleton />

    if (!documentTypes || documentTypes.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          <div className="text-center">
            <PieChartIcon className="h-12 w-12 mx-auto mb-2" />
            <p>No document type data available</p>
          </div>
        </div>
      )
    }

    const RADIAN = Math.PI / 180
    const renderCustomizedLabel = ({
      cx, cy, midAngle, innerRadius, outerRadius, percent
    }: any) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5
      const x = cx + radius * Math.cos(-midAngle * RADIAN)
      const y = cy + radius * Math.sin(-midAngle * RADIAN)

      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={12}
          fontWeight={600}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      )
    }

    return (
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={documentTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {documentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Count: {data.value.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Percentage: {data.percentage}%
                      </p>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {documentTypes.map((type, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-sm">{type.name}</span>
              <Badge variant="outline" className="ml-auto">
                {type.value.toLocaleString()}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderLineChart = () => {
    if (isLoading) return <ChartSkeleton />

    if (!performanceTrends || performanceTrends.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-2" />
            <p>No performance trend data available</p>
          </div>
        </div>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={performanceTrends.data}
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
            tickFormatter={(value) => formatDuration(value)}
          />
          <Tooltip 
            content={<CustomTooltip chartType="processing" />}
            labelFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={performanceTrends.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            name={performanceTrends.name}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderChart = () => {
    switch (activeChart) {
      case 'bar':
        return renderBarChart()
      case 'pie':
        return renderPieChart()
      case 'line':
        return renderLineChart()
      default:
        return renderBarChart()
    }
  }

  const getChartTitle = () => {
    switch (activeChart) {
      case 'bar':
        return 'Processing Stage Performance'
      case 'pie':
        return 'Document Type Distribution'
      case 'line':
        return 'Performance Trends Over Time'
      default:
        return 'Processing Analytics'
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{getChartTitle()}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 border rounded-md">
            <Button
              variant={activeChart === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveChart('bar')}
              className="h-8"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={activeChart === 'pie' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveChart('pie')}
              className="h-8"
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={activeChart === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveChart('line')}
              className="h-8"
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
          {onExportData && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              disabled={isLoading}
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
  )
}

export type { ProcessingChartProps }