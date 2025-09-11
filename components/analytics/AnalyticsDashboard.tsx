'use client'

import { useState, useCallback } from 'react'
import { MetricsCards } from './MetricsCards'
import { ProcessingChart } from './ProcessingChart'
import { UsageChart } from './UsageChart'
import { PerformanceMetrics } from './PerformanceMetrics'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCw,
  Download,
  BarChart3,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { useRealTimeUpdates } from '@/lib/hooks/useRealTimeUpdates'
import { 
  analyticsService,
  exportAnalyticsData
} from '@/lib/mockData/analyticsData'
import {
  mockRealmAnalytics,
  globalAnalytics
} from '@/lib/mockData/analyticsMockData'

interface AnalyticsDashboardProps {
  className?: string
  realmId?: string
}

type DateRange = '7d' | '30d' | '90d'
type ViewType = 'overview' | 'detailed' | 'performance'

const dateRangeLabels = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days'
}

/**
 * AnalyticsDashboard component - Main analytics dashboard with real-time metrics
 * Features:
 * - Real-time processing metrics display
 * - Document volume charts (daily/weekly/monthly)  
 * - Pipeline performance analytics
 * - Storage usage visualizations
 * - Success/failure rate trends
 * - Interactive charts using Recharts library
 * - Date range filtering
 * - Export functionality for CSV reports
 * - Responsive design
 * - Accessibility support
 */
export function AnalyticsDashboard({ className, realmId }: AnalyticsDashboardProps) {
  const [selectedRealm, setSelectedRealm] = useState<string>(realmId || 'global')
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [viewType, setViewType] = useState<ViewType>('overview')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Get analytics data with real-time updates
  const analytics = useAnalytics(
    selectedRealm === 'global' ? undefined : selectedRealm,
    {
      refetchInterval: 30000, // 30 seconds as specified
    }
  )

  // Real-time updates integration
  const { jobUpdates, documentUpdates, connectionState } = useRealTimeUpdates({
    onJobUpdate: (update) => {
      // Refresh analytics when jobs complete to show updated metrics
      if (update.status === 'completed' || update.status === 'failed') {
        analytics.refetch();
      }
    },
    onDocumentUpdate: (update) => {
      // Refresh analytics when documents are processed
      if (update.action === 'processed') {
        analytics.refetch();
      }
    }
  });

  const currentMetrics = analyticsService.getRealTimeMetrics(
    selectedRealm === 'global' ? undefined : selectedRealm
  )

  const usageTrends = analyticsService.getUsageTrends(
    selectedRealm === 'global' ? undefined : selectedRealm
  )

  const realmAnalytics = selectedRealm !== 'global' 
    ? analyticsService.getRealmAnalytics(selectedRealm)
    : null

  const availableRealms = analyticsService.getAvailableRealms()

  const handleRealmChange = (realm: string) => {
    setSelectedRealm(realm)
  }

  const handleRefresh = useCallback(() => {
    setLastRefresh(new Date())
    analytics.refetch()
  }, [analytics])

  const handleExportData = useCallback((data: any[], filename: string) => {
    analyticsService.generateCSVExport(data, filename)
  }, [])

  const handleDateRangeChange = (period: 'daily' | 'weekly' | 'monthly') => {
    // This would trigger a re-fetch with the new period in a real implementation
    console.log('Date range changed to:', period)
  }

  // Export functions for different data types
  const handleExportMetrics = () => {
    exportAnalyticsData.metrics(currentMetrics)
  }

  const handleExportUsageTrends = () => {
    if (usageTrends) {
      exportAnalyticsData.usageTrends(usageTrends)
    }
  }

  const handleExportFullReport = () => {
    const fullData = {
      exportDate: new Date().toISOString(),
      realm: selectedRealm,
      dateRange,
      metrics: currentMetrics,
      usageTrends,
      realmAnalytics,
      globalData: selectedRealm === 'global' ? globalAnalytics : null
    }

    const jsonStr = JSON.stringify(fullData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-full-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getProcessingData = () => {
    if (realmAnalytics) {
      return {
        stageData: realmAnalytics.documents.processingStageTimes,
        documentTypes: realmAnalytics.documents.documentTypes,
        performanceTrends: realmAnalytics.usage.documentsProcessed
      }
    }
    // Return mock global data
    return {
      stageData: mockRealmAnalytics[0]?.documents.processingStageTimes || [],
      documentTypes: mockRealmAnalytics[0]?.documents.documentTypes || [],
      performanceTrends: globalAnalytics.trends.documentsOverTime
    }
  }

  const processingData = getProcessingData()

  const getPerformanceData = () => {
    if (realmAnalytics) {
      return {
        resources: realmAnalytics.resources,
        performance: realmAnalytics.performance
      }
    }
    // Return aggregated global performance data
    return {
      resources: mockRealmAnalytics[0]?.resources || [], // Use first realm as example
      performance: {
        averageProcessingTime: 156000,
        successRate: 96.2,
        errorRate: 3.8,
        throughput: 85.5,
        peakUsage: new Date('2024-01-05T14:30:00Z'),
        bottlenecks: ['Vector database indexing', 'LLM API rate limits']
      }
    }
  }

  const performanceData = getPerformanceData()

  if (analytics.error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">{analytics.error?.message || 'An error occurred while loading analytics data'}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          </div>
          
          {selectedRealm !== 'global' && (
            <Badge variant="outline" className="text-sm">
              {availableRealms.find(r => r.id === selectedRealm)?.name || selectedRealm}
            </Badge>
          )}
          
          <Badge variant="secondary" className="text-xs">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* Realm Selector */}
          <Select value={selectedRealm} onValueChange={handleRealmChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select realm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global View</SelectItem>
              {availableRealms.map((realm) => (
                <SelectItem key={realm.id} value={realm.id}>
                  {realm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Menu */}
          <div className="flex items-center space-x-1 border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportMetrics}
              className="h-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportUsageTrends}
              className="h-8"
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportFullReport}
              className="h-8"
            >
              <Activity className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={cn("h-4 w-4 mr-2", analytics.loading && "animate-spin")} />
            Refresh
          </Button>

          {/* Real-time connection status */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
            <div 
              className={cn(
                "h-2 w-2 rounded-full",
                connectionState.connected ? "bg-green-500 animate-pulse" : "bg-gray-400"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {connectionState.connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <MetricsCards 
        metrics={currentMetrics}
        isLoading={analytics.loading}
      />

      {/* Main Analytics Content */}
      <Tabs value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Usage Trends Chart */}
            <UsageChart
              usageTrend={usageTrends}
              isLoading={analytics.loading}
              onExportData={handleExportData}
              onDateRangeChange={handleDateRangeChange}
            />

            {/* Processing Performance */}
            <ProcessingChart
              stageData={processingData.stageData}
              documentTypes={processingData.documentTypes}
              performanceTrends={processingData.performanceTrends}
              isLoading={analytics.loading}
              onExportData={handleExportData}
            />
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {/* Full Usage Chart */}
          <UsageChart
            usageTrend={usageTrends}
            isLoading={analytics.loading}
            onExportData={handleExportData}
            onDateRangeChange={handleDateRangeChange}
          />

          {/* Detailed Processing Chart */}
          <ProcessingChart
            stageData={processingData.stageData}
            documentTypes={processingData.documentTypes}
            performanceTrends={processingData.performanceTrends}
            isLoading={analytics.loading}
            onExportData={handleExportData}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* System Performance Monitoring */}
          <PerformanceMetrics
            resources={performanceData.resources}
            performance={performanceData.performance}
            isLoading={analytics.loading}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export type { AnalyticsDashboardProps }