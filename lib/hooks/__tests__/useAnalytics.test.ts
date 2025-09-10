/**
 * Tests for Analytics Data Fetching Hooks
 */

import { renderHook, act } from '@testing-library/react';
import { 
  useAnalytics,
  useGlobalAnalytics,
  useRealmAnalytics,
  useUsageAnalytics,
  usePerformanceAnalytics,
  useTrendAnalytics,
  useSystemHealth,
  useUserEngagement,
  useCustomAnalytics
} from '../useAnalytics';
import { mockApiClient } from '../../api/mockApiClient';
import type { AnalyticsData } from '../../api/types';

// Mock the API client
jest.mock('../../api/mockApiClient');

const mockApiClientInstance = mockApiClient as jest.Mocked<typeof mockApiClient>;

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAnalyticsData: AnalyticsData = {
    documentProcessing: {
      totalDocuments: 150,
      processedToday: 12,
      avgProcessingTime: 2.5,
      successRate: 0.95
    },
    usage: {
      storageUsed: 1024000,
      storageLimit: 10240000,
      apiCalls: 1250,
      activeUsers: 25
    },
    trends: [
      {
        date: '2024-01-01',
        documents: 10,
        processing_time: 2.1,
        success_rate: 0.96
      },
      {
        date: '2024-01-02',
        documents: 15,
        processing_time: 2.3,
        success_rate: 0.94
      }
    ]
  };

  describe('useAnalytics', () => {
    it('should fetch dashboard analytics without realm filter', async () => {
      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockAnalyticsData,
        timestamp: new Date().toISOString(),
        requestId: 'test-1'
      });

      const { result } = renderHook(() => useAnalytics());

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/analytics/dashboard');
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockAnalyticsData);
      expect(result.current.error).toBeUndefined();
    });

    it('should fetch dashboard analytics with realm filter', async () => {
      const realmId = 'realm-123';

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockAnalyticsData,
        timestamp: new Date().toISOString(),
        requestId: 'test-2'
      });

      const { result } = renderHook(() => useAnalytics(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/analytics/dashboard?realm=${realmId}`);
      expect(result.current.data).toEqual(mockAnalyticsData);
    });

    it('should handle API errors', async () => {
      const mockError = {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to fetch analytics',
        statusCode: 500
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: false,
        error: mockError,
        timestamp: new Date().toISOString(),
        requestId: 'test-3'
      });

      const { result } = renderHook(() => useAnalytics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useGlobalAnalytics', () => {
    it('should fetch global analytics', async () => {
      const mockGlobalData = {
        totalRealms: 50,
        totalUsers: 1200,
        totalDocuments: 15000,
        totalStorage: 52428800, // 50MB
        systemLoad: {
          cpu: 45.2,
          memory: 68.5,
          storage: 34.8
        },
        performance: {
          avgResponseTime: 120,
          uptime: 0.999,
          errorRate: 0.001
        },
        trends: {
          realmGrowth: [{ date: '2024-01-01', value: 48 }, { date: '2024-01-02', value: 50 }],
          userGrowth: [{ date: '2024-01-01', value: 1180 }, { date: '2024-01-02', value: 1200 }],
          documentGrowth: [{ date: '2024-01-01', value: 14800 }, { date: '2024-01-02', value: 15000 }]
        }
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockGlobalData,
        timestamp: new Date().toISOString(),
        requestId: 'test-4'
      });

      const { result } = renderHook(() => useGlobalAnalytics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/analytics/global');
      expect(result.current.data).toEqual(mockGlobalData);
    });
  });

  describe('useRealmAnalytics', () => {
    it('should fetch realm-specific analytics', async () => {
      const realmId = 'realm-123';
      const mockRealmData = {
        realm: {
          id: realmId,
          name: 'Test Realm',
          memberCount: 5,
          documentCount: 150,
          storageUsed: 2048000
        },
        activity: {
          documentsUploadedToday: 12,
          documentsProcessedToday: 10,
          activeUsersToday: 3,
          searchesPerformedToday: 45
        },
        processing: {
          averageProcessingTime: 2.5,
          successRate: 0.95,
          failureRate: 0.05,
          queueLength: 3
        },
        usage: {
          storageUtilization: 0.75,
          apiCallsToday: 320,
          bandwidthUsed: 1024000
        },
        trends: {
          dailyActivity: [
            { date: '2024-01-01', documents: 8, searches: 32 },
            { date: '2024-01-02', documents: 12, searches: 45 }
          ],
          weeklyUsage: [
            { week: '2024-W01', storage: 1900000, processing: 85 },
            { week: '2024-W02', storage: 2048000, processing: 92 }
          ]
        }
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockRealmData,
        timestamp: new Date().toISOString(),
        requestId: 'test-5'
      });

      const { result } = renderHook(() => useRealmAnalytics(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/analytics/realms/${realmId}`);
      expect(result.current.data).toEqual(mockRealmData);
    });

    it('should not make API call when realmId is empty', () => {
      renderHook(() => useRealmAnalytics(''));

      expect(mockApiClientInstance.get).not.toHaveBeenCalled();
    });
  });

  describe('useUsageAnalytics', () => {
    it('should fetch usage analytics with default period', async () => {
      const realmId = 'realm-123';
      const mockUsageData = {
        period: 'week',
        metrics: {
          documentsProcessed: 95,
          storageConsumed: 2048000,
          apiCalls: 1850,
          activeUsers: 8,
          averageResponseTime: 145
        },
        breakdown: {
          byDay: [
            { date: '2024-01-01', value: 12 },
            { date: '2024-01-02', value: 15 },
            { date: '2024-01-03', value: 18 }
          ],
          byType: {
            document_upload: 45,
            search_query: 30,
            data_export: 20
          },
          byUser: [
            { userId: 'user-1', name: 'John Doe', activity: 25 },
            { userId: 'user-2', name: 'Jane Smith', activity: 32 }
          ]
        },
        costs: {
          storage: 5.12,
          processing: 12.45,
          bandwidth: 3.67,
          total: 21.24
        }
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockUsageData,
        timestamp: new Date().toISOString(),
        requestId: 'test-6'
      });

      const { result } = renderHook(() => useUsageAnalytics(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/analytics/realms/${realmId}/usage?period=week`);
      expect(result.current.data).toEqual(mockUsageData);
    });

    it('should fetch usage analytics with custom period', async () => {
      const realmId = 'realm-123';
      const period = 'month';

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
        requestId: 'test-7'
      });

      renderHook(() => useUsageAnalytics(realmId, period));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/analytics/realms/${realmId}/usage?period=${period}`);
    });
  });

  describe('usePerformanceAnalytics', () => {
    it('should fetch performance analytics', async () => {
      const realmId = 'realm-123';
      const mockPerformanceData = {
        overview: {
          avgProcessingTime: 2.5,
          avgResponseTime: 120,
          successRate: 0.95,
          errorRate: 0.05,
          throughput: 45.2
        },
        stages: [
          {
            name: 'markdown-conversion',
            avgDuration: 0.8,
            successRate: 0.98,
            bottleneck: false,
            trends: [
              { timestamp: '2024-01-01T10:00:00Z', duration: 0.7 },
              { timestamp: '2024-01-01T11:00:00Z', duration: 0.9 }
            ]
          },
          {
            name: 'chunker',
            avgDuration: 1.2,
            successRate: 0.96,
            bottleneck: true,
            trends: [
              { timestamp: '2024-01-01T10:00:00Z', duration: 1.1 },
              { timestamp: '2024-01-01T11:00:00Z', duration: 1.3 }
            ]
          }
        ],
        errors: [
          {
            type: 'PROCESSING_TIMEOUT',
            count: 5,
            percentage: 2.1,
            lastOccurred: '2024-01-01T15:30:00Z'
          },
          {
            type: 'MEMORY_LIMIT_EXCEEDED',
            count: 2,
            percentage: 0.8,
            lastOccurred: '2024-01-01T14:20:00Z'
          }
        ],
        resources: {
          cpuUsage: 45.2,
          memoryUsage: 68.5,
          diskUsage: 34.8,
          networkLatency: 12.5
        }
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockPerformanceData,
        timestamp: new Date().toISOString(),
        requestId: 'test-8'
      });

      const { result } = renderHook(() => usePerformanceAnalytics(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/analytics/realms/${realmId}/performance`);
      expect(result.current.data).toEqual(mockPerformanceData);
    });
  });

  describe('useTrendAnalytics', () => {
    it('should fetch trend analytics with default timeframe', async () => {
      const realmId = 'realm-123';
      const metric = 'documents';
      const mockTrendData = {
        metric: 'documents',
        timeframe: 'month',
        current: 150,
        previous: 135,
        change: 15,
        changePercentage: 11.1,
        data: [
          { timestamp: '2024-01-01T00:00:00Z', value: 135 },
          { timestamp: '2024-01-02T00:00:00Z', value: 140 },
          { timestamp: '2024-01-03T00:00:00Z', value: 150 }
        ],
        forecast: [
          { timestamp: '2024-01-04T00:00:00Z', predicted: 155, confidence: 0.85 },
          { timestamp: '2024-01-05T00:00:00Z', predicted: 162, confidence: 0.82 }
        ]
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockTrendData,
        timestamp: new Date().toISOString(),
        requestId: 'test-9'
      });

      const { result } = renderHook(() => useTrendAnalytics(realmId, metric));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(
        `/api/analytics/realms/${realmId}/trends/${metric}?timeframe=month`
      );
      expect(result.current.data).toEqual(mockTrendData);
    });

    it('should fetch trend analytics with custom timeframe', async () => {
      const realmId = 'realm-123';
      const metric = 'users';
      const timeframe = 'quarter';

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
        requestId: 'test-10'
      });

      renderHook(() => useTrendAnalytics(realmId, metric, { timeframe }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(
        `/api/analytics/realms/${realmId}/trends/${metric}?timeframe=${timeframe}`
      );
    });
  });

  describe('useSystemHealth', () => {
    it('should fetch system health data', async () => {
      const mockHealthData = {
        status: 'healthy' as const,
        uptime: 0.9995,
        services: [
          {
            name: 'api-gateway',
            status: 'up' as const,
            responseTime: 45,
            lastCheck: '2024-01-01T12:00:00Z'
          },
          {
            name: 'vector-db',
            status: 'up' as const,
            responseTime: 12,
            lastCheck: '2024-01-01T12:00:00Z'
          },
          {
            name: 'processing-queue',
            status: 'degraded' as const,
            responseTime: 250,
            lastCheck: '2024-01-01T12:00:00Z'
          }
        ],
        resources: {
          cpu: { current: 45.2, average: 42.1, peak: 78.5 },
          memory: { current: 68.5, average: 65.2, peak: 89.3 },
          storage: { current: 2048000, available: 8192000, total: 10240000 },
          network: { latency: 12.5, throughput: 125.6 }
        },
        alerts: [
          {
            level: 'warning' as const,
            message: 'Processing queue response time above threshold',
            timestamp: '2024-01-01T11:45:00Z',
            resolved: false
          },
          {
            level: 'info' as const,
            message: 'System maintenance completed successfully',
            timestamp: '2024-01-01T08:00:00Z',
            resolved: true
          }
        ]
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockHealthData,
        timestamp: new Date().toISOString(),
        requestId: 'test-11'
      });

      const { result } = renderHook(() => useSystemHealth());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/analytics/health');
      expect(result.current.data).toEqual(mockHealthData);
    });
  });

  describe('useUserEngagement', () => {
    it('should fetch user engagement data without realm filter', async () => {
      const mockEngagementData = {
        overview: {
          totalUsers: 1200,
          activeUsers: 350,
          newUsers: 45,
          retentionRate: 0.78
        },
        activity: {
          dailyActiveUsers: [
            { date: '2024-01-01', users: 320 },
            { date: '2024-01-02', users: 350 },
            { date: '2024-01-03', users: 380 }
          ],
          sessionDuration: { average: 25.5, median: 18.2 },
          actionsPerSession: { average: 12.3, median: 9.1 }
        },
        features: [
          {
            feature: 'document_search',
            usage: 85.2,
            growth: 12.5,
            popularityRank: 1
          },
          {
            feature: 'document_upload',
            usage: 72.8,
            growth: 8.3,
            popularityRank: 2
          },
          {
            feature: 'analytics_dashboard',
            usage: 45.6,
            growth: 15.7,
            popularityRank: 3
          }
        ],
        cohortAnalysis: {
          retention: [
            {
              cohort: '2024-01',
              week1: 0.85,
              week2: 0.72,
              week4: 0.58,
              week8: 0.45
            },
            {
              cohort: '2023-12',
              week1: 0.82,
              week2: 0.69,
              week4: 0.55,
              week8: 0.42
            }
          ]
        }
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockEngagementData,
        timestamp: new Date().toISOString(),
        requestId: 'test-12'
      });

      const { result } = renderHook(() => useUserEngagement());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/analytics/engagement');
      expect(result.current.data).toEqual(mockEngagementData);
    });

    it('should fetch user engagement data with realm filter', async () => {
      const realmId = 'realm-123';

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
        requestId: 'test-13'
      });

      renderHook(() => useUserEngagement(realmId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/analytics/realms/${realmId}/engagement`);
    });
  });

  describe('useCustomAnalytics', () => {
    it('should generate custom report successfully', async () => {
      const reportConfig = {
        realmId: 'realm-123',
        metrics: ['documents', 'users', 'storage'],
        timeframe: { start: '2024-01-01', end: '2024-01-31' },
        groupBy: 'day' as const,
        filters: { documentType: 'pdf' }
      };

      const mockReportData = {
        config: reportConfig,
        data: [
          { date: '2024-01-01', documents: 10, users: 5, storage: 1024000 },
          { date: '2024-01-02', documents: 12, users: 6, storage: 1126400 }
        ],
        summary: {
          totalDocuments: 22,
          uniqueUsers: 11,
          totalStorage: 2150400
        }
      };

      mockApiClientInstance.post.mockResolvedValue({
        success: true,
        data: mockReportData,
        timestamp: new Date().toISOString(),
        requestId: 'test-14'
      });

      const { result } = renderHook(() => useCustomAnalytics());

      let reportResult: any;
      await act(async () => {
        reportResult = await result.current.generateReport(reportConfig);
      });

      expect(mockApiClientInstance.post).toHaveBeenCalledWith('/api/analytics/custom-report', reportConfig);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(reportResult).toEqual(mockReportData);
    });

    it('should export report successfully', async () => {
      const reportData = { test: 'data' };
      const format = 'csv';

      mockApiClientInstance.post.mockResolvedValue({
        success: true,
        data: { downloadUrl: '/api/exports/report.csv' },
        timestamp: new Date().toISOString(),
        requestId: 'test-15'
      });

      const { result } = renderHook(() => useCustomAnalytics());

      let exportResult: any;
      await act(async () => {
        exportResult = await result.current.exportReport(reportData, format);
      });

      expect(mockApiClientInstance.post).toHaveBeenCalledWith(`/api/analytics/export/${format}`, reportData);
      expect(result.current.isGenerating).toBe(false);
      expect(exportResult).toBeInstanceOf(Blob);
    });

    it('should handle report generation errors', async () => {
      const reportConfig = {
        metrics: ['invalid_metric'],
        timeframe: { start: '2024-01-01', end: '2024-01-31' }
      };

      const mockError = {
        code: 'ANALYTICS_ERROR',
        message: 'Invalid metric specified',
        statusCode: 400
      };

      mockApiClientInstance.post.mockResolvedValue({
        success: false,
        error: mockError,
        timestamp: new Date().toISOString(),
        requestId: 'test-16'
      });

      const { result } = renderHook(() => useCustomAnalytics());

      let reportResult: any;
      await act(async () => {
        reportResult = await result.current.generateReport(reportConfig);
      });

      expect(result.current.error).toBeDefined();
      expect(reportResult).toBeNull();
    });
  });
});