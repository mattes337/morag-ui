'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/Progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ResourceUtilization, PerformanceMetrics } from '@/lib/mockData/analyticsMockData'

interface PerformanceMetricsProps {
  resources?: ResourceUtilization[]
  performance?: PerformanceMetrics
  isLoading?: boolean
  className?: string
  onRefresh?: () => void
}

type StatusColor = 'healthy' | 'warning' | 'critical'

const statusConfig = {
  healthy: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-950',
    icon: CheckCircle,
    badge: 'default'
  },
  warning: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    icon: AlertTriangle,
    badge: 'secondary'
  },
  critical: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950',
    icon: XCircle,
    badge: 'destructive'
  }
} as const

const resourceIcons = {
  'CPU Usage': Cpu,
  'Memory Usage': Database,
  'Storage Usage': HardDrive,
  'API Rate Limit': Server,
  'Vector DB Connections': Database,
  'Processing Queue': Activity,
  'Network Latency': Wifi,
}

const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatPercentage = (value: number): string => {
  return `${Math.round(value * 10) / 10}%`
}

const getTrendIcon = (current: number, data: any[]) => {
  if (data.length < 2) return Minus
  
  const previous = data[data.length - 2]?.value || 0
  const change = ((current - previous) / previous) * 100
  
  if (change > 5) return TrendingUp
  if (change < -5) return TrendingDown
  return Minus
}

const ResourceCard = ({ resource }: { resource: ResourceUtilization }) => {
  const config = statusConfig[resource.status]
  const IconComponent = config.icon
  const ResourceIcon = resourceIcons[resource.resource as keyof typeof resourceIcons] || Activity
  const TrendIcon = getTrendIcon(resource.used, resource.trend[0]?.data || [])

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <ResourceIcon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">
            {resource.resource}
          </CardTitle>
        </div>
        <Badge 
          variant={config.badge as any}
          className="text-xs"
        >
          <IconComponent className="h-3 w-3 mr-1" />
          {resource.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {resource.used}
              <span className="text-sm font-normal text-muted-foreground">
                /{resource.total}
              </span>
            </span>
            <div className="flex items-center space-x-1">
              <TrendIcon 
                className={cn(
                  "h-4 w-4",
                  resource.status === 'critical' ? 'text-red-500' :
                  resource.status === 'warning' ? 'text-yellow-500' :
                  'text-green-500'
                )}
              />
              <span className="text-lg font-semibold">
                {formatPercentage(resource.percentage)}
              </span>
            </div>
          </div>
          
          <Progress 
            value={resource.percentage} 
            className="h-2"
            // @ts-ignore - Progress component accepts custom colors
            indicatorClassName={
              resource.status === 'critical' ? 'bg-red-500' :
              resource.status === 'warning' ? 'bg-yellow-500' :
              'bg-green-500'
            }
          />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Current Usage</span>
            <span>
              {resource.status === 'critical' ? 'Over Capacity' :
               resource.status === 'warning' ? 'High Usage' :
               'Normal'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const PerformanceOverview = ({ performance }: { performance: PerformanceMetrics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Performance Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatDuration(performance.averageProcessingTime)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Processing Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(performance.successRate)}
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatPercentage(performance.errorRate)}
            </div>
            <div className="text-sm text-muted-foreground">Error Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {performance.throughput.toFixed(1)}/day
            </div>
            <div className="text-sm text-muted-foreground">Throughput</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Peak Usage</span>
            <span className="text-sm text-muted-foreground">
              {performance.peakUsage.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          {performance.bottlenecks.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Current Bottlenecks</span>
              <div className="space-y-1">
                {performance.bottlenecks.map((bottleneck, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {bottleneck}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const SystemStatus = ({ resources }: { resources: ResourceUtilization[] }) => {
  const criticalCount = resources.filter(r => r.status === 'critical').length
  const warningCount = resources.filter(r => r.status === 'warning').length
  const healthyCount = resources.filter(r => r.status === 'healthy').length

  const overallStatus: StatusColor = 
    criticalCount > 0 ? 'critical' :
    warningCount > 0 ? 'warning' :
    'healthy'

  const config = statusConfig[overallStatus]
  const StatusIcon = config.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Health</span>
          </div>
          <Badge variant={config.badge as any}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {overallStatus.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 text-center md:grid-cols-3">
          <div className={cn("p-4 rounded-lg", statusConfig.healthy.bgColor)}>
            <div className="text-2xl font-bold text-green-600">
              {healthyCount}
            </div>
            <div className="text-sm text-muted-foreground">Healthy</div>
          </div>
          
          <div className={cn("p-4 rounded-lg", statusConfig.warning.bgColor)}>
            <div className="text-2xl font-bold text-yellow-600">
              {warningCount}
            </div>
            <div className="text-sm text-muted-foreground">Warning</div>
          </div>
          
          <div className={cn("p-4 rounded-lg", statusConfig.critical.bgColor)}>
            <div className="text-2xl font-bold text-red-600">
              {criticalCount}
            </div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const PerformanceMetricsSkeleton = () => (
  <div className="space-y-6">
    {/* System Status Skeleton */}
    <Card>
      <CardHeader>
        <div className="h-6 bg-muted rounded w-32 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-muted rounded-lg animate-pulse">
              <div className="h-8 bg-muted-foreground/20 rounded w-8 mx-auto mb-2" />
              <div className="h-4 bg-muted-foreground/20 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Resource Cards Skeleton */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="flex justify-between">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-6 bg-muted rounded w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-8 bg-muted rounded w-20" />
              <div className="h-2 bg-muted rounded" />
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-16" />
                <div className="h-3 bg-muted rounded w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

/**
 * PerformanceMetrics component displays system health monitoring
 * Features:
 * - Real-time resource utilization monitoring
 * - System health status overview
 * - Performance bottleneck identification
 * - Color-coded status indicators
 * - Responsive grid layout
 * - Loading states and animations
 * - Manual refresh capability
 * - Accessibility support
 */
export function PerformanceMetrics({
  resources = [],
  performance,
  isLoading = false,
  className,
  onRefresh
}: PerformanceMetricsProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setLastRefresh(new Date())
    onRefresh?.()
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <PerformanceMetricsSkeleton />
      </div>
    )
  }

  if (!resources.length && !performance) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Activity className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
            <p className="text-sm">Performance metrics are not available at this time.</p>
            {onRefresh && (
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Performance</h2>
          <p className="text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        {onRefresh && (
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {/* System Health Overview */}
      {resources.length > 0 && <SystemStatus resources={resources} />}

      {/* Performance Overview */}
      {performance && <PerformanceOverview performance={performance} />}

      {/* Resource Utilization Cards */}
      {resources.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resource Utilization</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export type { PerformanceMetricsProps }