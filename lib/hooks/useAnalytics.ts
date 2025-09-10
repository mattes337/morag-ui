/**
 * Analytics Data Fetching Hooks
 * Custom hooks for dashboard analytics, metrics, and system monitoring
 */

import { useCallback, useState } from 'react';
import { useAsyncData } from './useAsyncData';
import { mockApiClient } from '../api/mockApiClient';
import { queryKeys } from '../utils/queryKeys';
import type { 
  ApiError,
  AnalyticsData
} from '../api/types';

// Hook for dashboard analytics overview
export function useAnalytics(realmId?: string, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 60000, refetchInterval = 300000 } = options || {};

  const endpoint = realmId ? `/api/analytics/dashboard?realm=${realmId}` : '/api/analytics/dashboard';
  const queryKey = queryKeys.analytics.dashboard(realmId);

  return useAsyncData<AnalyticsData>(
    queryKey,
    async () => {
      const response = await mockApiClient.get<AnalyticsData>(endpoint);
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled,
      staleTime,
      refetchInterval,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for global analytics (system-wide metrics)
export function useGlobalAnalytics(options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 120000, refetchInterval = 600000 } = options || {};

  return useAsyncData<{
    totalRealms: number;
    totalUsers: number;
    totalDocuments: number;
    totalStorage: number;
    systemLoad: {
      cpu: number;
      memory: number;
      storage: number;
    };
    performance: {
      avgResponseTime: number;
      uptime: number;
      errorRate: number;
    };
    trends: {
      realmGrowth: Array<{ date: string; value: number }>;
      userGrowth: Array<{ date: string; value: number }>;
      documentGrowth: Array<{ date: string; value: number }>;
    };
  }>(
    queryKeys.analytics.global,
    async () => {
      const response = await mockApiClient.get('/api/analytics/global');
      if (!response.success) {
        throw response.error;
      }
      return response.data as any;
    },
    {
      enabled,
      staleTime,
      refetchInterval,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for realm-specific analytics
export function useRealmAnalytics(realmId: string, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 60000, refetchInterval = 300000 } = options || {};

  return useAsyncData<{
    realm: {
      id: string;
      name: string;
      memberCount: number;
      documentCount: number;
      storageUsed: number;
    };
    activity: {
      documentsUploadedToday: number;
      documentsProcessedToday: number;
      activeUsersToday: number;
      searchesPerformedToday: number;
    };
    processing: {
      averageProcessingTime: number;
      successRate: number;
      failureRate: number;
      queueLength: number;
    };
    usage: {
      storageUtilization: number;
      apiCallsToday: number;
      bandwidthUsed: number;
    };
    trends: {
      dailyActivity: Array<{ date: string; documents: number; searches: number }>;
      weeklyUsage: Array<{ week: string; storage: number; processing: number }>;
    };
  }>(
    queryKeys.analytics.byRealm(realmId),
    async () => {
      const response = await mockApiClient.get(`/api/analytics/realms/${realmId}`);
      if (!response.success) {
        throw response.error;
      }
      return response.data as any;
    },
    {
      enabled: enabled && !!realmId,
      staleTime,
      refetchInterval,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for usage analytics with time period filtering
export function useUsageAnalytics(
  realmId: string, 
  period: 'day' | 'week' | 'month' | 'quarter' = 'week',
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const { enabled = true, staleTime = 300000 } = options || {};

  return useAsyncData<{
    period: string;
    metrics: {
      documentsProcessed: number;
      storageConsumed: number;
      apiCalls: number;
      activeUsers: number;
      averageResponseTime: number;
    };
    breakdown: {
      byDay: Array<{ date: string; value: number }>;
      byType: Record<string, number>;
      byUser: Array<{ userId: string; name: string; activity: number }>;
    };
    costs: {
      storage: number;
      processing: number;
      bandwidth: number;
      total: number;
    };
  }>(
    queryKeys.analytics.usage(realmId, period),
    async () => {
      const response = await mockApiClient.get(`/api/analytics/realms/${realmId}/usage?period=${period}`);
      if (!response.success) {
        throw response.error;
      }
      return response.data as any;
    },
    {
      enabled: enabled && !!realmId,
      staleTime,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for performance analytics
export function usePerformanceAnalytics(realmId: string, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 60000, refetchInterval = 180000 } = options || {};

  return useAsyncData<{
    overview: {
      avgProcessingTime: number;
      avgResponseTime: number;
      successRate: number;
      errorRate: number;
      throughput: number;
    };
    stages: Array<{
      name: string;
      avgDuration: number;
      successRate: number;
      bottleneck: boolean;
      trends: Array<{ timestamp: string; duration: number }>;
    }>;
    errors: Array<{
      type: string;
      count: number;
      percentage: number;
      lastOccurred: string;
    }>;
    resources: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      networkLatency: number;
    };
  }>(
    queryKeys.analytics.performance(realmId),
    async () => {
      const response = await mockApiClient.get(`/api/analytics/realms/${realmId}/performance`);
      if (!response.success) {
        throw response.error;
      }
      return response.data as any;
    },
    {
      enabled: enabled && !!realmId,
      staleTime,
      refetchInterval,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for trend analytics
export function useTrendAnalytics(
  realmId: string, 
  metric: 'documents' | 'users' | 'storage' | 'processing',
  options?: {
    timeframe?: 'week' | 'month' | 'quarter' | 'year';
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const { timeframe = 'month', enabled = true, staleTime = 600000 } = options || {};

  return useAsyncData<{
    metric: string;
    timeframe: string;
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    data: Array<{
      timestamp: string;
      value: number;
      label?: string;
    }>;
    forecast?: Array<{
      timestamp: string;
      predicted: number;
      confidence: number;
    }>;
  }>(
    queryKeys.analytics.trends(realmId, metric),
    async () => {
      const response = await mockApiClient.get(
        `/api/analytics/realms/${realmId}/trends/${metric}?timeframe=${timeframe}`
      );
      if (!response.success) {
        throw response.error;
      }
      return response.data as any;
    },
    {
      enabled: enabled && !!realmId,
      staleTime,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for system health monitoring
export function useSystemHealth(options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 30000, refetchInterval = 60000 } = options || {};

  return useAsyncData<{
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    services: Array<{
      name: string;
      status: 'up' | 'down' | 'degraded';
      responseTime: number;
      lastCheck: string;
    }>;
    resources: {
      cpu: { current: number; average: number; peak: number };
      memory: { current: number; average: number; peak: number };
      storage: { current: number; available: number; total: number };
      network: { latency: number; throughput: number };
    };
    alerts: Array<{
      level: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      timestamp: string;
      resolved: boolean;
    }>;
  }>(
    queryKeys.analytics.systemHealth,
    async () => {
      const response = await mockApiClient.get('/api/analytics/health');
      if (!response.success) {
        throw response.error;
      }
      return response.data as any;
    },
    {
      enabled,
      staleTime,
      refetchInterval,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for user engagement analytics
export function useUserEngagement(realmId?: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const { enabled = true, staleTime = 300000 } = options || {};

  const endpoint = realmId 
    ? `/api/analytics/realms/${realmId}/engagement`
    : '/api/analytics/engagement';

  return useAsyncData<{
    overview: {
      totalUsers: number;
      activeUsers: number;
      newUsers: number;
      retentionRate: number;
    };
    activity: {
      dailyActiveUsers: Array<{ date: string; users: number }>;
      sessionDuration: { average: number; median: number };
      actionsPerSession: { average: number; median: number };
    };
    features: Array<{
      feature: string;
      usage: number;
      growth: number;
      popularityRank: number;
    }>;
    cohortAnalysis: {
      retention: Array<{
        cohort: string;
        week1: number;
        week2: number;
        week4: number;
        week8: number;
      }>;
    };
  }>(
    queryKeys.analytics.userEngagement(realmId),
    async () => {
      const response = await mockApiClient.get(endpoint);
      if (!response.success) {
        throw response.error;
      }
      return response.data as any;
    },
    {
      enabled,
      staleTime,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for custom analytics reports
export function useCustomAnalytics() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const generateReport = useCallback(async (config: {
    realmId?: string;
    metrics: string[];
    timeframe: { start: string; end: string };
    groupBy?: 'day' | 'week' | 'month';
    filters?: Record<string, any>;
  }): Promise<any | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await mockApiClient.post('/api/analytics/custom-report', config);
      if (!response.success) {
        throw response.error;
      }

      return response.data!;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'ANALYTICS_ERROR',
        message: error.message || 'Failed to generate analytics report',
        statusCode: 500
      };
      setError(apiError);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const exportReport = useCallback(async (
    reportData: any,
    format: 'csv' | 'xlsx' | 'pdf'
  ): Promise<Blob | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await mockApiClient.post(`/api/analytics/export/${format}`, reportData);
      if (!response.success) {
        throw response.error;
      }

      // In a real implementation, this would return a blob
      // For mock purposes, we'll return a fake blob
      const csvContent = JSON.stringify(reportData, null, 2);
      return new Blob([csvContent], { type: 'application/octet-stream' });
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'EXPORT_ERROR',
        message: error.message || 'Failed to export report',
        statusCode: 500
      };
      setError(apiError);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateReport,
    exportReport,
    isGenerating,
    error
  };
}