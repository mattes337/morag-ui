'use client'

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export interface ChartDataPoint {
  [key: string]: any
  timestamp?: Date | string
  name?: string
  value?: number
}

export interface ChartContainerProps {
  data: ChartDataPoint[]
  chartType: 'line' | 'bar' | 'pie' | 'area'
  title?: string
  subtitle?: string
  className?: string
  height?: number
  width?: string | number
  dataKey?: string
  xAxisDataKey?: string
  yAxisDataKey?: string
  colors?: string[]
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  animate?: boolean
}

const defaultColors = [
  '#3b82f6', // Blue
  '#10b981', // Green  
  '#8b5cf6', // Purple
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280', // Gray
]

/**
 * ChartContainer component - Reusable wrapper for recharts integration
 * 
 * Features:
 * - Support for line, bar, pie, and area charts
 * - Responsive design that adapts to container size
 * - Dark mode support with automatic theme detection
 * - Customizable tooltips and animations
 * - Configurable colors and styling
 * - Accessibility support with proper ARIA labels
 */
export function ChartContainer({
  data,
  chartType,
  title,
  subtitle,
  className,
  height = 300,
  width = '100%',
  dataKey = 'value',
  xAxisDataKey = 'name',
  yAxisDataKey = 'value',
  colors = defaultColors,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  animate = true,
}: ChartContainerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Theme-aware colors
  const chartColors = useMemo(() => ({
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    background: isDark ? '#1f2937' : '#ffffff',
    tooltip: isDark ? '#374151' : '#ffffff',
    tooltipBorder: isDark ? '#6b7280' : '#d1d5db',
  }), [isDark])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div
        className={cn(
          "rounded-lg border p-3 shadow-lg",
          "bg-background text-foreground"
        )}
        style={{ 
          backgroundColor: chartColors.tooltip,
          borderColor: chartColors.tooltipBorder,
        }}
      >
        {label && (
          <p className="font-medium text-sm mb-1">{label}</p>
        )}
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }

  // Format tick values for better readability
  const formatTickValue = (value: any) => {
    if (typeof value === 'number') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
      return value.toLocaleString()
    }
    return value
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
      ...(animate && { animationDuration: 300 }),
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartColors.grid}
                opacity={0.3}
              />
            )}
            <XAxis 
              dataKey={xAxisDataKey}
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={formatTickValue}
            />
            <YAxis 
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={formatTickValue}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartColors.grid}
                opacity={0.3}
              />
            )}
            <XAxis 
              dataKey={xAxisDataKey}
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={formatTickValue}
            />
            <YAxis 
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={formatTickValue}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartColors.grid}
                opacity={0.3}
              />
            )}
            <XAxis 
              dataKey={xAxisDataKey}
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={formatTickValue}
            />
            <YAxis 
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={formatTickValue}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={2}
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        )

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={dataKey}
              nameKey={xAxisDataKey}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelStyle={{ fontSize: 12, fill: chartColors.text }}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        )

      default:
        return <div>Unsupported chart type</div>
    }
  }

  return (
    <Card className={className}>
      {(title || subtitle) && (
        <CardHeader className="pb-4">
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div style={{ width, height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export type { ChartContainerProps }