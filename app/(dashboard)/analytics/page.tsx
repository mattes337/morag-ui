'use client'

import { useState, useEffect } from 'react'
import { AnalyticsGrid, ChartConfig } from '@/components/analytics/AnalyticsGrid'
import { AnalyticsFilters, AnalyticsFiltersState } from '@/components/analytics/AnalyticsFilters'
import { 
  mockRealmAnalytics, 
  globalAnalytics,
  getAnalyticsByRealm,
  MetricCard 
} from '@/lib/mockData/analyticsMockData'
import { subDays, startOfDay, endOfDay } from 'date-fns'

// Note: In a real implementation, this would come from an API or be server-rendered
// For now, we're using client-side metadata updates
if (typeof window !== 'undefined') {
  document.title = 'Analytics | MoRAG'
}

/**
 * Analytics page component that displays comprehensive analytics dashboard
 * with interactive charts, time range filtering, and multi-criteria filtering
 */
export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<AnalyticsFiltersState>({
    timeRange: {
      startDate: startOfDay(subDays(new Date(), 29)),
      endDate: endOfDay(new Date()),
      period: '30d',
    },
  })

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Get current data based on filters
  const getCurrentData = () => {
    let selectedMetrics: MetricCard[]
    let selectedRealmName = 'Global View'

    if (filters.realm) {
      const realmAnalytics = getAnalyticsByRealm(filters.realm)
      selectedMetrics = realmAnalytics?.metrics || []
      selectedRealmName = realmAnalytics?.realmName || 'Unknown Realm'
    } else {
      selectedMetrics = globalAnalytics.metrics
    }

    return { selectedMetrics, selectedRealmName }
  }

  const { selectedMetrics, selectedRealmName } = getCurrentData()

  // Generate chart configurations
  const generateCharts = (): ChartConfig[] => {
    const baseCharts: ChartConfig[] = [
      // Documents Processed Over Time
      {
        id: 'documents-trend',
        title: 'Documents Processed',
        subtitle: 'Daily document processing volume',
        type: 'area',
        data: globalAnalytics.trends.documentsOverTime.data.map(point => ({
          name: point.timestamp.toLocaleDateString(),
          value: point.value,
          timestamp: point.timestamp,
        })),
        dataKey: 'value',
        xAxisDataKey: 'name',
        colors: ['#3b82f6'],
        showGrid: true,
        showLegend: false,
      },
      // Realm Comparison
      {
        id: 'realm-comparison',
        title: 'Documents by Realm',
        subtitle: 'Total documents processed per realm',
        type: 'bar',
        data: globalAnalytics.realmComparison.documentsProcessed.map(item => ({
          name: item.category,
          value: item.value,
          color: item.color,
          timestamp: new Date(),
        })),
        dataKey: 'value',
        xAxisDataKey: 'name',
        colors: globalAnalytics.realmComparison.documentsProcessed.map(item => item.color),
        showGrid: true,
        showLegend: false,
      },
      // User Activity Trends
      {
        id: 'user-activity',
        title: 'User Activity',
        subtitle: 'Active users over time',
        type: 'line',
        data: globalAnalytics.trends.usersOverTime.data.map(point => ({
          name: point.timestamp.toLocaleDateString(),
          value: point.value,
          timestamp: point.timestamp,
        })),
        dataKey: 'value',
        xAxisDataKey: 'name',
        colors: ['#10b981'],
        showGrid: true,
        showLegend: false,
      },
      // Search Volume
      {
        id: 'search-volume',
        title: 'Search Queries',
        subtitle: 'Daily search volume trends',
        type: 'area',
        data: globalAnalytics.trends.searchesOverTime.data.map(point => ({
          name: point.timestamp.toLocaleDateString(),
          value: point.value,
          timestamp: point.timestamp,
        })),
        dataKey: 'value',
        xAxisDataKey: 'name',
        colors: ['#8b5cf6'],
        showGrid: true,
        showLegend: false,
      },
    ]

    // If specific realm is selected, show realm-specific charts
    if (filters.realm) {
      const realmAnalytics = getAnalyticsByRealm(filters.realm)
      if (realmAnalytics) {
        return [
          // Processing Stage Times
          {
            id: 'processing-stages',
            title: 'Processing Stage Performance',
            subtitle: 'Average time per processing stage',
            type: 'bar',
            data: realmAnalytics.documents.processingStageTimes.map(stage => ({
              name: stage.category,
              value: stage.value,
              color: stage.color,
              timestamp: new Date(),
            })),
            dataKey: 'value',
            xAxisDataKey: 'name',
            colors: realmAnalytics.documents.processingStageTimes.map(stage => stage.color || '#3b82f6'),
            showGrid: true,
            showLegend: false,
          },
          // Document Types Distribution
          {
            id: 'document-types',
            title: 'Document Types',
            subtitle: 'Distribution of document types processed',
            type: 'pie',
            data: realmAnalytics.documents.documentTypes.map(type => ({
              name: type.name,
              value: type.value,
              color: type.color,
              timestamp: new Date(),
            })),
            dataKey: 'value',
            xAxisDataKey: 'name',
            colors: realmAnalytics.documents.documentTypes.map(type => type.color),
            showGrid: false,
            showLegend: true,
          },
          // Usage Trends
          {
            id: 'realm-usage',
            title: 'Usage Trends',
            subtitle: 'Documents processed over time',
            type: 'line',
            data: realmAnalytics.usage.documentsProcessed.data.map(point => ({
              name: point.timestamp.toLocaleDateString(),
              value: point.value,
              timestamp: point.timestamp,
            })),
            dataKey: 'value',
            xAxisDataKey: 'name',
            colors: ['#3b82f6'],
            showGrid: true,
            showLegend: false,
          },
        ]
      }
    }

    return baseCharts
  }

  const charts = generateCharts()

  // Generate realm options for filter
  const realmOptions = mockRealmAnalytics.map(realm => ({
    label: realm.realmName,
    value: realm.realmId,
    count: realm.documents.totalDocuments,
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Monitor system performance, document processing metrics, and usage trends
          {filters.realm && ` for ${selectedRealmName}`}
        </p>
      </div>
      
      {/* Filters */}
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={setFilters}
        realms={realmOptions}
        showSearch={true}
        showReset={true}
        placeholder="Search analytics data..."
      />

      {/* Analytics Grid */}
      <AnalyticsGrid
        metrics={selectedMetrics}
        charts={charts}
        layout="default"
        showMetrics={true}
        showCharts={true}
        isLoading={isLoading}
      />
    </div>
  )
}