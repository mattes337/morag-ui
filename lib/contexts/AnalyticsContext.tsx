'use client'

import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react'
import { useRealm } from '@/lib/hooks/useRealm'
import { 
  AnalyticsData, 
  MetricCard,
  PerformanceMetric,
  ProcessingMetric,
  UsageMetric
} from '@/lib/mockData/analyticsMockData'
import { 
  analyticsService,
  exportAnalyticsData
} from '@/lib/mockData/analyticsData'

interface AnalyticsContextType {
  // Current analytics data
  analytics: AnalyticsData | null
  
  // Loading states
  isLoading: boolean
  isRefreshing: boolean
  
  // Actions
  refreshAnalytics: () => Promise<void>
  exportData: (format: 'csv' | 'json' | 'pdf') => Promise<void>
  
  // Filters
  dateRange: '7d' | '30d' | '90d'
  setDateRange: (range: '7d' | '30d' | '90d') => void
  
  // Summary metrics for dashboard widgets
  summaryMetrics: {
    totalDocuments: number
    activeJobs: number
    successRate: number
    avgProcessingTime: number
  }
  
  // Real-time updates
  lastUpdate: Date | null
  
  // Error handling
  error: string | null
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

export interface AnalyticsProviderProps {
  children: ReactNode
}

/**
 * AnalyticsProvider - Manages global analytics state and real-time updates
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { currentRealm } = useRealm()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Calculate summary metrics from analytics data
  const summaryMetrics = React.useMemo(() => {
    if (!analytics) {
      return {
        totalDocuments: 0,
        activeJobs: 0,
        successRate: 0,
        avgProcessingTime: 0
      }
    }

    // Extract metrics from analytics data
    const documentsMetric = analytics.metrics.find(m => m.id === 'total-documents')
    const jobsMetric = analytics.metrics.find(m => m.id === 'active-jobs')
    const successRateMetric = analytics.metrics.find(m => m.id === 'success-rate')
    const processingTimeMetric = analytics.performanceMetrics.find(m => m.name === 'Avg Processing Time')

    return {
      totalDocuments: documentsMetric?.value || 0,
      activeJobs: jobsMetric?.value || 0,
      successRate: successRateMetric?.value || 0,
      avgProcessingTime: processingTimeMetric?.value || 0
    }
  }, [analytics])

  // Load analytics data
  const loadAnalytics = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300))

      // Get analytics data for current realm or global
      const realmId = currentRealm?.id
      const data = await analyticsService.getAnalytics(realmId, {
        dateRange,
        includePerformance: true,
        includeUsage: true
      })

      setAnalytics(data)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [currentRealm?.id, dateRange])

  // Refresh analytics data
  const refreshAnalytics = useCallback(async () => {
    await loadAnalytics(false)
  }, [loadAnalytics])

  // Export analytics data
  const exportData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    if (!analytics) return

    try {
      await exportAnalyticsData(analytics, format, currentRealm?.name || 'Global')
    } catch (err) {
      console.error('Failed to export analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to export data')
    }
  }, [analytics, currentRealm?.name])

  // Load analytics when realm or date range changes
  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  // Set up real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        refreshAnalytics()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isLoading, isRefreshing, refreshAnalytics])

  const contextValue: AnalyticsContextType = {
    analytics,
    isLoading,
    isRefreshing,
    refreshAnalytics,
    exportData,
    dateRange,
    setDateRange,
    summaryMetrics,
    lastUpdate,
    error
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

/**
 * useAnalyticsContext - Hook to access analytics context
 */
export const useAnalyticsContext = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}

/**
 * useAnalyticsSummary - Hook for dashboard summary metrics
 */
export const useAnalyticsSummary = () => {
  const { summaryMetrics, isLoading, lastUpdate, error } = useAnalyticsContext()
  
  return {
    metrics: summaryMetrics,
    isLoading,
    lastUpdate,
    error,
    hasData: Object.values(summaryMetrics).some(v => v > 0)
  }
}

export default AnalyticsProvider