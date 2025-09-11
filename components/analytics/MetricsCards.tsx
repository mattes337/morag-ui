'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  FileText,
  Clock,
  Search,
  Users,
  CheckCircle,
  HardDrive,
  Layers,
  AlertCircle,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MetricCard } from '@/lib/mockData/analyticsMockData'

interface MetricsCardsProps {
  metrics: MetricCard[]
  isLoading?: boolean
  className?: string
}

// Icon mapping for metrics
const iconMap = {
  'file-text': FileText,
  'clock': Clock,
  'search': Search,
  'users': Users,
  'check-circle': CheckCircle,
  'hard-drive': HardDrive,
  'layers': Layers,
  'alert-circle': AlertCircle,
  'activity': Activity,
}

const formatValue = (value: string | number, format: string): string => {
  if (typeof value === 'string') return value

  switch (format) {
    case 'number':
      return new Intl.NumberFormat('en-US').format(value)
    case 'currency':
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value)
    case 'percentage':
      return `${value}%`
    case 'duration':
      if (typeof value === 'number') {
        const minutes = Math.floor(value / 60000)
        const seconds = Math.floor((value % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
      return String(value)
    case 'bytes':
      if (typeof value === 'number') {
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(value) / Math.log(1024))
        return `${(value / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
      }
      return String(value)
    default:
      return String(value)
  }
}

const getTrendIcon = (trend?: 'up' | 'down' | 'flat') => {
  switch (trend) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    case 'flat':
    default:
      return Minus
  }
}

const getChangeColor = (changeType?: 'positive' | 'negative' | 'neutral') => {
  switch (changeType) {
    case 'positive':
      return 'text-green-600 dark:text-green-400'
    case 'negative':
      return 'text-red-600 dark:text-red-400'
    case 'neutral':
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

const MetricCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 bg-muted rounded w-24" />
      <div className="h-4 w-4 bg-muted rounded" />
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-muted rounded w-20 mb-2" />
      <div className="flex items-center space-x-2">
        <div className="h-3 bg-muted rounded w-12" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
      <div className="h-3 bg-muted rounded w-32 mt-2" />
    </CardContent>
  </Card>
)

/**
 * MetricsCards component displays key performance indicators
 * Features:
 * - Real-time metric values with change indicators
 * - Trend visualization with icons and colors
 * - Responsive grid layout
 * - Loading states and animations
 * - Accessibility support with proper ARIA labels
 */
export function MetricsCards({ 
  metrics, 
  isLoading = false,
  className 
}: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
        className
      )}>
        {Array.from({ length: 6 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!metrics || metrics.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p>No metrics available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <section 
      className={cn(
        "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
        className
      )}
      aria-label="Key Performance Metrics"
    >
      {metrics.map((metric) => {
        const IconComponent = iconMap[metric.icon as keyof typeof iconMap] || Activity
        const TrendIcon = getTrendIcon(metric.trend)
        const changeColorClass = getChangeColor(metric.changeType)

        return (
          <Card 
            key={metric.id}
            className="transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            aria-labelledby={`metric-${metric.id}-title`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                id={`metric-${metric.id}-title`}
                className="text-sm font-medium text-muted-foreground"
              >
                {metric.title}
              </CardTitle>
              <IconComponent 
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                <div className="text-2xl font-bold" aria-describedby={`metric-${metric.id}-desc`}>
                  {formatValue(metric.value, metric.format)}
                </div>
                
                {metric.change !== undefined && (
                  <div className="flex items-center space-x-1 text-xs">
                    <TrendIcon 
                      className={cn("h-3 w-3", changeColorClass)}
                      aria-hidden="true"
                    />
                    <span className={changeColorClass}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">
                      from last period
                    </span>
                  </div>
                )}
                
                {metric.description && (
                  <p 
                    id={`metric-${metric.id}-desc`}
                    className="text-xs text-muted-foreground mt-1"
                  >
                    {metric.description}
                  </p>
                )}
                
                {metric.changeType && (
                  <Badge 
                    variant={
                      metric.changeType === 'positive' ? 'default' :
                      metric.changeType === 'negative' ? 'destructive' :
                      'secondary'
                    }
                    className="w-fit text-xs"
                  >
                    {metric.changeType === 'positive' ? 'Improving' :
                     metric.changeType === 'negative' ? 'Declining' :
                     'Stable'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}

export type { MetricsCardsProps }