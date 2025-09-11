'use client'

import React from 'react'
import { MetricsCard } from './MetricsCard'
import { ChartContainer } from './ChartContainer'
import { cn } from '@/lib/utils'
import { MetricCard } from '@/lib/mockData/analyticsMockData'
import { ChartDataPoint } from './ChartContainer'

export interface ChartConfig {
  id: string
  title: string
  subtitle?: string
  type: 'line' | 'bar' | 'pie' | 'area'
  data: ChartDataPoint[]
  dataKey?: string
  xAxisDataKey?: string
  height?: number
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
}

export interface AnalyticsGridProps {
  metrics: MetricCard[]
  charts: ChartConfig[]
  className?: string
  layout?: 'default' | 'compact' | 'wide'
  showMetrics?: boolean
  showCharts?: boolean
  isLoading?: boolean
}

const skeletonMetrics = Array.from({ length: 6 }, (_, i) => ({
  id: `skeleton-${i}`,
  title: '',
  value: 0,
  format: 'number' as const,
}))

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="bg-muted rounded-lg h-32 w-full" />
  </div>
)

const SkeletonChart = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="bg-muted rounded-lg h-80 w-full" />
  </div>
)

/**
 * AnalyticsGrid component - Responsive grid layout for analytics components
 * 
 * Features:
 * - Responsive grid layout that adapts to screen size
 * - Supports both metrics cards and charts
 * - Multiple layout presets (default, compact, wide)
 * - Loading states with skeleton components
 * - Flexible configuration for different dashboard needs
 * - Accessibility support with proper semantic structure
 * - Performance optimized with React.memo where appropriate
 */
export function AnalyticsGrid({
  metrics,
  charts,
  className,
  layout = 'default',
  showMetrics = true,
  showCharts = true,
  isLoading = false,
}: AnalyticsGridProps) {
  // Grid layout classes based on layout type
  const getGridClasses = () => {
    switch (layout) {
      case 'compact':
        return {
          metrics: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4',
          charts: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
        }
      case 'wide':
        return {
          metrics: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
          charts: 'grid grid-cols-1 gap-8',
        }
      default:
        return {
          metrics: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
          charts: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6',
        }
    }
  }

  const gridClasses = getGridClasses()

  // Determine card variant based on layout
  const getCardVariant = () => {
    return layout === 'compact' ? 'compact' : 'default'
  }

  // Get chart height based on layout
  const getChartHeight = (chart: ChartConfig) => {
    if (chart.height) return chart.height
    
    switch (layout) {
      case 'compact':
        return 250
      case 'wide':
        return 400
      default:
        return 300
    }
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-8", className)}>
        {/* Loading Metrics */}
        {showMetrics && (
          <section aria-label="Metrics loading">
            <div className={gridClasses.metrics}>
              {skeletonMetrics.map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </section>
        )}

        {/* Loading Charts */}
        {showCharts && (
          <section aria-label="Charts loading">
            <div className={gridClasses.charts}>
              <SkeletonChart />
              <SkeletonChart />
              {layout !== 'compact' && <SkeletonChart />}
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Metrics Grid */}
      {showMetrics && metrics.length > 0 && (
        <section aria-label="Key performance metrics">
          <div className={gridClasses.metrics}>
            {metrics.map((metric) => (
              <MetricsCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                description={metric.description}
                format={metric.format}
                variant={getCardVariant()}
                animate={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Charts Grid */}
      {showCharts && charts.length > 0 && (
        <section aria-label="Analytics charts">
          <div className={gridClasses.charts}>
            {charts.map((chart) => (
              <ChartContainer
                key={chart.id}
                data={chart.data}
                chartType={chart.type}
                title={chart.title}
                subtitle={chart.subtitle}
                height={getChartHeight(chart)}
                dataKey={chart.dataKey}
                xAxisDataKey={chart.xAxisDataKey}
                colors={chart.colors}
                showGrid={chart.showGrid}
                showLegend={chart.showLegend}
                animate={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && 
       (!showMetrics || metrics.length === 0) && 
       (!showCharts || charts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No analytics data available</h3>
          <p className="text-muted-foreground max-w-md">
            Analytics data will appear here once you have processed documents and generated metrics. 
            Check your filters or try refreshing the data.
          </p>
        </div>
      )}
    </div>
  )
}

// Performance optimization: Memoize the component
export default React.memo(AnalyticsGrid)

export type { ChartConfig, AnalyticsGridProps }