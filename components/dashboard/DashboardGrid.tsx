'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Settings2, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAnalyticsSummary } from '@/lib/contexts/AnalyticsContext'
import { useAdvancedJobs } from '@/lib/hooks/useJobs'

interface DashboardGridProps {
  className?: string
}

/**
 * AnalyticsWidget - Quick analytics overview for dashboard
 */
const AnalyticsWidget: React.FC = () => {
  const { metrics, isLoading, hasData } = useAnalyticsSummary()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics
          </CardTitle>
          <CardDescription>System insights and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analytics
        </CardTitle>
        <CardDescription>System insights and metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Success Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Success Rate</span>
              <span className="font-medium">{metrics.successRate}%</span>
            </div>
            <Progress value={metrics.successRate} className="h-2" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold">{metrics.totalDocuments}</div>
              <div className="text-muted-foreground">Documents</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.avgProcessingTime}s</div>
              <div className="text-muted-foreground">Avg Time</div>
            </div>
          </div>

          {/* View Details Link */}
          <Link href="/analytics">
            <Button variant="outline" size="sm" className="w-full">
              View Full Analytics
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * JobsWidget - Active jobs overview for dashboard
 */
const JobsWidget: React.FC = () => {
  const { jobs, isLoading, summary } = useAdvancedJobs({
    autoRefresh: true,
    refreshInterval: 5000
  })

  const activeJobs = jobs.filter(job => job.status === 'running' || job.status === 'pending')
  const recentCompleted = jobs
    .filter(job => job.status === 'completed')
    .slice(0, 3)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Processing Jobs
          </CardTitle>
          <CardDescription>Active and recent job status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Processing Jobs
        </CardTitle>
        <CardDescription>Active and recent job status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Active Jobs Count */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{activeJobs.length}</div>
              <div className="text-sm text-muted-foreground">Active Jobs</div>
            </div>
            {activeJobs.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Processing
              </Badge>
            )}
          </div>

          {/* Recent Activity */}
          {recentCompleted.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Recent Completed:</div>
              {recentCompleted.map((job) => (
                <div key={job.id} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="flex-1 truncate">{job.documentTitle}</span>
                  <span className="text-muted-foreground">{job.stage}</span>
                </div>
              ))}
            </div>
          )}

          {/* View Jobs Link */}
          <Link href="/jobs">
            <Button variant="outline" size="sm" className="w-full">
              Manage Jobs
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * DocumentsWidget - Document library overview
 */
const DocumentsWidget: React.FC = () => {
  const { metrics } = useAnalyticsSummary()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
        <CardDescription>Document library overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold">{metrics.totalDocuments}</div>
            <div className="text-sm text-muted-foreground">Total Documents</div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Link href="/documents">
              <Button variant="outline" size="sm" className="w-full">
                Browse Library
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * SystemStatusWidget - Overall system health
 */
const SystemStatusWidget: React.FC = () => {
  const { metrics, lastUpdate } = useAnalyticsSummary()
  const { summary } = useAdvancedJobs()

  const hasIssues = summary.failed > 0 || metrics.successRate < 95
  const statusColor = hasIssues ? 'text-orange-500' : 'text-green-500'
  const statusIcon = hasIssues ? AlertCircle : CheckCircle2
  const StatusIcon = statusIcon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Status
        </CardTitle>
        <CardDescription>Overall health and performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", statusColor)} />
            <span className={cn("font-medium", statusColor)}>
              {hasIssues ? 'Some Issues' : 'All Systems Operational'}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold">{metrics.successRate}%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="font-semibold">{summary.running}</div>
              <div className="text-muted-foreground">Active Jobs</div>
            </div>
          </div>

          {/* Last Update */}
          {lastUpdate && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * DashboardGrid - Main dashboard layout with analytics integration
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({ className }) => {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DocumentsWidget />
        <JobsWidget />
        <AnalyticsWidget />
        <SystemStatusWidget />
      </div>

      {/* Analytics Carousel Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quick Insights</CardTitle>
              <CardDescription>Key metrics and trends at a glance</CardDescription>
            </div>
            <Link href="/analytics">
              <Button variant="outline" size="sm">
                View Full Analytics
                <TrendingUp className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Processing Performance */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Processing Performance</div>
              <div className="text-2xl font-bold text-green-600">+12%</div>
              <div className="text-xs text-muted-foreground">vs last week</div>
            </div>

            {/* Error Rate */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Error Rate</div>
              <div className="text-2xl font-bold text-blue-600">2.1%</div>
              <div className="text-xs text-muted-foreground">within target</div>
            </div>

            {/* Storage Usage */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Storage Usage</div>
              <div className="text-2xl font-bold text-orange-600">68%</div>
              <div className="text-xs text-muted-foreground">of quota used</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardGrid