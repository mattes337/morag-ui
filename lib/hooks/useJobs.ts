/**
 * Job Management Hooks
 * Custom hooks for processing job monitoring, queue management, and job operations
 */

import { useCallback, useState } from 'react';
import { useAsyncData } from './useAsyncData';
import { mockApiClient } from '../api/mockApiClient';
import { queryKeys } from '../utils/queryKeys';
import type { 
  ApiResponse, 
  AsyncDataState,
  ApiError,
  ProcessingJob,
  JobQueue
} from '../api/types';

// Hook for fetching all jobs with optional filtering
export function useJobs(options?: {
  realmId?: string;
  status?: string;
  type?: string;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { 
    realmId,
    status,
    type,
    enabled = true, 
    staleTime = 30000,
    refetchInterval = 5000 
  } = options || {};

  // Build query parameters
  const params = new URLSearchParams();
  if (realmId) params.append('realm', realmId);
  if (status) params.append('status', status);
  if (type) params.append('type', type);
  
  const endpoint = `/api/jobs${params.toString() ? `?${params.toString()}` : ''}`;
  
  // Generate appropriate query key based on filters
  let queryKey;
  if (realmId) {
    queryKey = queryKeys.jobs.byRealm(realmId);
  } else if (status) {
    queryKey = queryKeys.jobs.byStatus(status);
  } else if (type) {
    queryKey = queryKeys.jobs.byType(type);
  } else {
    queryKey = queryKeys.jobs.all;
  }

  return useAsyncData<ProcessingJob[]>(
    queryKey,
    async () => {
      const response = await mockApiClient.get<ProcessingJob[]>(endpoint);
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

// Hook for fetching a single job by ID
export function useJobById(id: string, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 10000, refetchInterval = 2000 } = options || {};

  return useAsyncData<ProcessingJob>(
    queryKeys.jobs.byId(id),
    async () => {
      const response = await mockApiClient.get<ProcessingJob>(`/api/jobs/${id}`);
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled: enabled && !!id,
      staleTime,
      refetchInterval: refetchInterval, // More frequent updates for individual jobs
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for fetching the job queue
export function useJobQueue(options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 5000, refetchInterval = 3000 } = options || {};

  return useAsyncData<JobQueue>(
    queryKeys.jobs.queue,
    async () => {
      const response = await mockApiClient.get<JobQueue>('/api/jobs/queue');
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

// Hook for fetching running jobs (high-frequency updates)
export function useRunningJobs(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  const { enabled = true, refetchInterval = 1000 } = options || {};

  return useAsyncData<ProcessingJob[]>(
    queryKeys.jobs.running,
    async () => {
      const response = await mockApiClient.get<ProcessingJob[]>('/api/jobs?status=running');
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled,
      staleTime: 500, // Very short stale time for running jobs
      refetchInterval,
      refetchOnWindowFocus: true,
    }
  );
}

// Hook for job statistics
export function useJobStatistics(options?: {
  realmId?: string;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { realmId, enabled = true, staleTime = 60000, refetchInterval = 30000 } = options || {};

  const endpoint = realmId ? `/api/jobs/statistics?realm=${realmId}` : '/api/jobs/statistics';

  return useAsyncData<{
    total: number;
    byStatus: {
      pending: number;
      running: number;
      completed: number;
      failed: number;
      cancelled: number;
    };
    byType: Record<string, number>;
    avgProcessingTime: number;
    successRate: number;
    queueLength: number;
    throughputPerHour: number;
  }>(
    queryKeys.jobs.statistics,
    async () => {
      const response = await mockApiClient.get<{ total: number; byStatus: { pending: number; running: number; completed: number; failed: number; cancelled: number; }; byType: Record<string, number>; avgProcessingTime: number; successRate: number; queueLength: number; throughputPerHour: number; }>(endpoint);
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

// Hook for recent jobs
export function useRecentJobs(limit?: number, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 30000, refetchInterval = 10000 } = options || {};

  return useAsyncData<ProcessingJob[]>(
    queryKeys.jobs.recent(limit),
    async () => {
      const endpoint = `/api/jobs/recent${limit ? `?limit=${limit}` : ''}`;
      const response = await mockApiClient.get<ProcessingJob[]>(endpoint);
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

// Hook for creating jobs
export function useJobCreate() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createJob = useCallback(async (data: {
    type: 'document_upload' | 'pipeline_execution' | 'batch_processing';
    realmId?: string;
    metadata: Record<string, any>;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<ProcessingJob | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await mockApiClient.post<ProcessingJob>('/api/jobs', data);
      if (!response.success) {
        throw response.error;
      }

      return response.data!;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'CREATE_JOB_ERROR',
        message: error.message || 'Failed to create job',
        statusCode: 500
      };
      setError(apiError);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createJob,
    isCreating,
    error
  };
}

// Hook for canceling jobs
export function useJobCancel() {
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const cancelJob = useCallback(async (jobId: string): Promise<boolean> => {
    setIsCanceling(true);
    setError(null);

    try {
      const response = await mockApiClient.post<{ message: string }>(`/api/jobs/${jobId}/cancel`);
      if (!response.success) {
        throw response.error;
      }

      return true;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'CANCEL_JOB_ERROR',
        message: error.message || 'Failed to cancel job',
        statusCode: 500
      };
      setError(apiError);
      return false;
    } finally {
      setIsCanceling(false);
    }
  }, []);

  const cancelBatch = useCallback(async (jobIds: string[]): Promise<{
    success: string[];
    failed: { id: string; error: string }[];
  }> => {
    setIsCanceling(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        jobIds.map(id => cancelJob(id))
      );

      const success: string[] = [];
      const failed: { id: string; error: string }[] = [];

      results.forEach((result, index) => {
        const jobId = jobIds[index];
        if (!jobId) return; // Skip if jobId is undefined
        
        if (result.status === 'fulfilled' && result.value) {
          success.push(jobId);
        } else {
          failed.push({
            id: jobId,
            error: result.status === 'rejected' ? result.reason?.message || 'Unknown error' : 'Cancel failed'
          });
        }
      });

      return { success, failed };
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'BATCH_CANCEL_ERROR',
        message: error.message || 'Failed to cancel jobs',
        statusCode: 500
      };
      setError(apiError);
      return { success: [], failed: jobIds.map(id => ({ id, error: apiError.message })) };
    } finally {
      setIsCanceling(false);
    }
  }, [cancelJob]);

  return {
    cancelJob,
    cancelBatch,
    isCanceling,
    error
  };
}

// Hook for retrying failed jobs
export function useJobRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const retryJob = useCallback(async (jobId: string): Promise<ProcessingJob | null> => {
    setIsRetrying(true);
    setError(null);

    try {
      const response = await mockApiClient.post<ProcessingJob>(`/api/jobs/${jobId}/retry`);
      if (!response.success) {
        throw response.error;
      }

      return response.data!;
    } catch (error: any) {
      const apiError: ApiError = error.code ? error : {
        code: 'RETRY_JOB_ERROR',
        message: error.message || 'Failed to retry job',
        statusCode: 500
      };
      setError(apiError);
      return null;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  return {
    retryJob,
    isRetrying,
    error
  };
}

// Hook for job logs/details
export function useJobLogs(jobId: string, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { enabled = true, staleTime = 5000, refetchInterval = 3000 } = options || {};

  return useAsyncData<{
    jobId: string;
    logs: Array<{
      timestamp: string;
      level: 'info' | 'warn' | 'error' | 'debug';
      message: string;
      details?: Record<string, any>;
    }>;
    metrics: {
      cpuUsage: number;
      memoryUsage: number;
      duration: number;
      throughput?: number;
    };
  }>(
    ['jobs', 'logs', jobId],
    async () => {
      if (!jobId) {
        throw new Error('Job ID is required');
      }
      const response = await mockApiClient.get<{ jobId: string; logs: { timestamp: string; level: 'info' | 'warn' | 'error' | 'debug'; message: string; details?: Record<string, any>; }[]; metrics: { cpuUsage: number; memoryUsage: number; duration: number; throughput?: number; }; }>(`/api/jobs/${jobId}/logs`);
      if (!response.success) {
        throw response.error;
      }
      return response.data!;
    },
    {
      enabled: enabled && !!jobId,
      staleTime,
      refetchInterval,
      refetchOnWindowFocus: true,
    }
  );
}