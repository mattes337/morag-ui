/**
 * Enhanced Analytics Data for Task A1
 * Real-time analytics data with CSV export support and enhanced mock data
 */

export * from './analyticsMockData'

import {
  mockRealmAnalytics,
  globalAnalytics,
  type MetricCard,
  type TimeSeriesData,
  type UsageTrend,
  type RealmAnalytics,
} from './analyticsMockData'

// Additional data types for enhanced analytics dashboard
export interface DateRangeFilter {
  start: Date
  end: Date
  period: 'daily' | 'weekly' | 'monthly'
}

export interface ExportConfig {
  format: 'csv' | 'json'
  includeCharts: boolean
  dateRange?: DateRangeFilter
}

// Enhanced dashboard data with real-time simulation
export class AnalyticsDataService {
  private static instance: AnalyticsDataService
  private lastUpdate: Date = new Date()
  private updateInterval: number = 30000 // 30 seconds

  private constructor() {}

  static getInstance(): AnalyticsDataService {
    if (!AnalyticsDataService.instance) {
      AnalyticsDataService.instance = new AnalyticsDataService()
    }
    return AnalyticsDataService.instance
  }

  /**
   * Get real-time metrics with simulated updates
   */
  getRealTimeMetrics(realmId?: string): MetricCard[] {
    const now = new Date()
    const shouldUpdate = now.getTime() - this.lastUpdate.getTime() > this.updateInterval

    if (shouldUpdate) {
      this.simulateRealTimeUpdates()
      this.lastUpdate = now
    }

    if (realmId) {
      const realmData = mockRealmAnalytics.find(r => r.realmId === realmId)
      return realmData ? realmData.metrics : []
    }

    return globalAnalytics.metrics
  }

  /**
   * Simulate real-time data updates
   */
  private simulateRealTimeUpdates(): void {
    // Simulate minor variations in metrics
    globalAnalytics.metrics.forEach(metric => {
      if (typeof metric.value === 'number') {
        const variation = (Math.random() - 0.5) * 0.02 // ±1% variation
        const newValue = Math.max(0, Math.round(metric.value * (1 + variation)))
        
        const change = metric.previousValue 
          ? ((newValue - metric.previousValue) / metric.previousValue) * 100
          : 0

        metric.previousValue = metric.value as number
        metric.value = newValue
        metric.change = Math.round(change * 100) / 100
        metric.changeType = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
      }
    })

    // Update realm analytics as well
    mockRealmAnalytics.forEach(realm => {
      realm.metrics.forEach(metric => {
        if (typeof metric.value === 'number') {
          const variation = (Math.random() - 0.5) * 0.02
          const newValue = Math.max(0, Math.round(metric.value * (1 + variation)))
          
          const change = metric.previousValue 
            ? ((newValue - metric.previousValue) / metric.previousValue) * 100
            : 0

          metric.previousValue = metric.value as number
          metric.value = newValue
          metric.change = Math.round(change * 100) / 100
          metric.changeType = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
        }
      })
    })
  }

  /**
   * Generate CSV export data for analytics
   */
  generateCSVExport(data: any[], filename: string): void {
    let csvContent: string

    if (data.length === 0) {
      csvContent = 'No data available'
    } else if (data[0].timestamp && data[0].value !== undefined) {
      // Time series data
      csvContent = [
        ['Timestamp', 'Value'].join(','),
        ...data.map(item => [
          item.timestamp instanceof Date 
            ? item.timestamp.toISOString()
            : item.timestamp,
          item.value
        ].join(','))
      ].join('\n')
    } else {
      // Generic object data
      const headers = Object.keys(data[0])
      csvContent = [
        headers.join(','),
        ...data.map(item => 
          headers.map(header => {
            const value = item[header]
            return typeof value === 'object' ? JSON.stringify(value) : String(value)
          }).join(',')
        )
      ].join('\n')
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Filter time series data by date range
   */
  filterByDateRange(data: TimeSeriesData, dateRange: DateRangeFilter): TimeSeriesData {
    const filtered = data.data.filter(point => {
      const pointDate = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp)
      return pointDate >= dateRange.start && pointDate <= dateRange.end
    })

    return {
      ...data,
      data: filtered
    }
  }

  /**
   * Get usage trends with date filtering
   */
  getUsageTrends(realmId?: string, dateRange?: DateRangeFilter): UsageTrend | null {
    let usage: UsageTrend | null = null

    if (realmId) {
      const realmData = mockRealmAnalytics.find(r => r.realmId === realmId)
      usage = realmData ? realmData.usage : null
    } else {
      // Create global usage trend from all realms
      usage = {
        period: '30d',
        documentsProcessed: globalAnalytics.trends.documentsOverTime,
        searchQueries: globalAnalytics.trends.searchesOverTime,
        apiRequests: {
          id: 'global-api-requests',
          name: 'API Requests',
          color: '#8b5cf6',
          data: globalAnalytics.trends.documentsOverTime.data.map(point => ({
            ...point,
            value: Math.round(point.value * 15) // Simulate API requests
          }))
        },
        activeUsers: globalAnalytics.trends.usersOverTime,
        storageUsage: {
          id: 'global-storage',
          name: 'Storage Usage (GB)',
          color: '#ef4444',
          data: globalAnalytics.trends.documentsOverTime.data.map(point => ({
            ...point,
            value: Math.round(point.value * 0.5) // Simulate storage growth
          }))
        }
      }
    }

    // Apply date range filtering if provided
    if (usage && dateRange) {
      return {
        ...usage,
        documentsProcessed: this.filterByDateRange(usage.documentsProcessed, dateRange),
        searchQueries: this.filterByDateRange(usage.searchQueries, dateRange),
        apiRequests: this.filterByDateRange(usage.apiRequests, dateRange),
        activeUsers: this.filterByDateRange(usage.activeUsers, dateRange),
        storageUsage: this.filterByDateRange(usage.storageUsage, dateRange)
      }
    }

    return usage
  }

  /**
   * Get enhanced realm analytics
   */
  getRealmAnalytics(realmId: string): RealmAnalytics | null {
    return mockRealmAnalytics.find(r => r.realmId === realmId) || null
  }

  /**
   * Get all available realms
   */
  getAvailableRealms(): { id: string; name: string }[] {
    return mockRealmAnalytics.map(realm => ({
      id: realm.realmId,
      name: realm.realmName
    }))
  }
}

// Singleton instance for use throughout the application
export const analyticsService = AnalyticsDataService.getInstance()

// Enhanced export functions
export const exportAnalyticsData = {
  /**
   * Export metrics to CSV
   */
  metrics: (metrics: MetricCard[]) => {
    const data = metrics.map(metric => ({
      title: metric.title,
      value: metric.value,
      previousValue: metric.previousValue || 'N/A',
      change: metric.change || 0,
      changeType: metric.changeType || 'neutral',
      trend: metric.trend || 'flat',
      description: metric.description || ''
    }))
    
    analyticsService.generateCSVExport(
      data,
      `analytics-metrics-${new Date().toISOString().split('T')[0]}.csv`
    )
  },

  /**
   * Export time series data to CSV
   */
  timeSeries: (series: TimeSeriesData, filename?: string) => {
    const data = series.data.map(point => ({
      timestamp: point.timestamp,
      value: point.value,
      label: point.label || '',
      category: point.category || ''
    }))
    
    const exportFilename = filename || 
      `analytics-${series.id}-${new Date().toISOString().split('T')[0]}.csv`
    
    analyticsService.generateCSVExport(data, exportFilename)
  },

  /**
   * Export complete usage trends
   */
  usageTrends: (usage: UsageTrend) => {
    // Combine all usage data into a single export
    const maxLength = Math.max(
      usage.documentsProcessed.data.length,
      usage.searchQueries.data.length,
      usage.apiRequests.data.length,
      usage.activeUsers.data.length,
      usage.storageUsage.data.length
    )

    const data = []
    for (let i = 0; i < maxLength; i++) {
      const row = {
        timestamp: usage.documentsProcessed.data[i]?.timestamp || '',
        documentsProcessed: usage.documentsProcessed.data[i]?.value || 0,
        searchQueries: usage.searchQueries.data[i]?.value || 0,
        apiRequests: usage.apiRequests.data[i]?.value || 0,
        activeUsers: usage.activeUsers.data[i]?.value || 0,
        storageUsage: usage.storageUsage.data[i]?.value || 0
      }
      data.push(row)
    }
    
    analyticsService.generateCSVExport(
      data,
      `analytics-usage-trends-${new Date().toISOString().split('T')[0]}.csv`
    )
  }
}

// Default export for the service instance
export default analyticsService