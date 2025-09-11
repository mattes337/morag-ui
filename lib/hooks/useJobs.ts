/**
 * Advanced Job Management Hooks
 * Comprehensive hooks for job monitoring, filtering, sorting, and bulk operations
 * Designed specifically for Task B1: Advanced Job Management Interface
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ProcessingJob, 
  mockJobs, 
  getJobStatistics, 
  getUniqueRealms, 
  getJobTrends 
} from '@/lib/mockData/jobsMockData';
import { useAsyncData } from './useAsyncData';
import { mockApiClient } from '../api/mockApiClient';
import { queryKeys } from '../utils/queryKeys';
import type { 
  ApiResponse, 
  AsyncDataState,
  ApiError,
  JobQueue
} from '../api/types';

export interface JobFilters {
  status?: ProcessingJob['status'][];
  priority?: ProcessingJob['priority'][];
  type?: ProcessingJob['type'][];
  realm?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface JobSorting {
  field: keyof ProcessingJob;
  direction: 'asc' | 'desc';
}

export interface JobPagination {
  page: number;
  limit: number;
  total: number;
}

export interface UseAdvancedJobsOptions {
  filters?: JobFilters;
  sorting?: JobSorting;
  pagination?: {
    page: number;
    limit: number;
  };
  realTimeUpdates?: boolean;
  infiniteScroll?: boolean;
}

export interface UseAdvancedJobsReturn {
  jobs: ProcessingJob[];
  loading: boolean;
  error: string | null;
  statistics: ReturnType<typeof getJobStatistics>;
  trends: ReturnType<typeof getJobTrends>;
  realms: string[];
  pagination: JobPagination;
  filters: JobFilters;
  sorting: JobSorting;
  
  // Actions
  setFilters: (filters: JobFilters) => void;
  setSorting: (sorting: JobSorting) => void;
  setPage: (page: number) => void;
  refreshJobs: () => void;
  
  // Job actions
  cancelJob: (jobId: string) => Promise<boolean>;
  retryJob: (jobId: string) => Promise<boolean>;
  deleteJob: (jobId: string) => Promise<boolean>;
  bulkCancel: (jobIds: string[]) => Promise<{ success: string[]; failed: string[] }>;
  bulkRetry: (jobIds: string[]) => Promise<{ success: string[]; failed: string[] }>;
  bulkDelete: (jobIds: string[]) => Promise<{ success: string[]; failed: string[] }>;
  
  // Selected jobs for bulk operations
  selectedJobs: string[];
  setSelectedJobs: (jobIds: string[]) => void;
  toggleJobSelection: (jobId: string) => void;
  selectAllJobs: () => void;
  clearSelection: () => void;
}

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

// ========== TASK B1: ADVANCED JOB MANAGEMENT INTERFACE ==========

const DEFAULT_FILTERS: JobFilters = {};
const DEFAULT_SORTING: JobSorting = { field: 'createdAt', direction: 'desc' };
const DEFAULT_PAGINATION = { page: 1, limit: 25 };

/**
 * Advanced Jobs Hook - Task B1 Implementation
 * Provides comprehensive job management with filtering, sorting, pagination, and bulk operations
 */
export function useAdvancedJobs(options: UseAdvancedJobsOptions = {}): UseAdvancedJobsReturn {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>(options.filters || DEFAULT_FILTERS);
  const [sorting, setSorting] = useState<JobSorting>(options.sorting || DEFAULT_SORTING);
  const [pagination, setPagination] = useState({
    page: options.pagination?.page || DEFAULT_PAGINATION.page,
    limit: options.pagination?.limit || DEFAULT_PAGINATION.limit,
    total: 0
  });
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  // Simulate real-time updates
  useEffect(() => {
    if (!options.realTimeUpdates) return;

    const interval = setInterval(() => {
      // Simulate job status changes
      setJobs(prevJobs => {
        const updatedJobs = [...prevJobs];
        
        // Update running jobs progress
        updatedJobs.forEach(job => {
          if (job.status === 'running' && job.progress < 100) {
            const progressIncrement = Math.random() * 10;
            job.progress = Math.min(100, job.progress + progressIncrement);
            
            // Sometimes complete jobs
            if (job.progress >= 95 && Math.random() > 0.7) {
              job.status = 'completed';
              job.progress = 100;
              job.completedAt = new Date();
              if (job.startedAt) {
                job.actualDuration = Math.floor((job.completedAt.getTime() - job.startedAt.getTime()) / 60000);
              }
            }
          }
          
          // Sometimes start pending jobs
          if (job.status === 'pending' && Math.random() > 0.95) {
            job.status = 'running';
            job.startedAt = new Date();
            job.progress = Math.random() * 10;
          }
          
          // Sometimes fail running jobs
          if (job.status === 'running' && Math.random() > 0.99) {
            job.status = 'failed';
            job.errorMessage = 'Processing timeout occurred';
          }
        });
        
        return updatedJobs;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [options.realTimeUpdates]);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...mockJobs];

    // Apply filters
    if (filters.status?.length) {
      filtered = filtered.filter(job => filters.status!.includes(job.status));
    }
    
    if (filters.priority?.length) {
      filtered = filtered.filter(job => filters.priority!.includes(job.priority));
    }
    
    if (filters.type?.length) {
      filtered = filtered.filter(job => filters.type!.includes(job.type));
    }
    
    if (filters.realm?.length) {
      filtered = filtered.filter(job => filters.realm!.includes(job.realmName));
    }
    
    if (filters.dateRange) {
      filtered = filtered.filter(job => 
        job.createdAt >= filters.dateRange!.start && 
        job.createdAt <= filters.dateRange!.end
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.name.toLowerCase().includes(searchLower) ||
        job.documentName?.toLowerCase().includes(searchLower) ||
        job.realmName.toLowerCase().includes(searchLower) ||
        job.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sorting.field];
      const bValue = b[sorting.field];
      
      let comparison = 0;
      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sorting.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [filters, sorting]);

  // Paginate jobs
  const paginatedJobs = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredAndSortedJobs.slice(startIndex, endIndex);
  }, [filteredAndSortedJobs, pagination.page, pagination.limit]);

  // Update jobs and pagination
  useEffect(() => {
    setLoading(true);
    
    // Simulate API delay
    const timeout = setTimeout(() => {
      setJobs(paginatedJobs);
      setPagination(prev => ({
        ...prev,
        total: filteredAndSortedJobs.length
      }));
      setLoading(false);
    }, Math.random() * 300 + 100);

    return () => clearTimeout(timeout);
  }, [paginatedJobs, filteredAndSortedJobs.length]);

  // Statistics and trends
  const statistics = useMemo(() => getJobStatistics(), []);
  const trends = useMemo(() => getJobTrends(7), []);
  const realms = useMemo(() => getUniqueRealms(), []);

  // Actions
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const refreshJobs = useCallback(() => {
    setLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Job actions
  const cancelJob = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      // Update job status
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'cancelled' as const, progress: job.progress }
          : job
      ));
      
      return Math.random() > 0.1; // 90% success rate
    } catch (error) {
      console.error('Failed to cancel job:', error);
      return false;
    }
  }, []);

  const retryJobAdvanced = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: 'pending' as const, 
              progress: 0,
              retryCount: job.retryCount + 1,
              errorMessage: undefined,
              errorStack: undefined
            }
          : job
      ));
      
      return Math.random() > 0.05; // 95% success rate
    } catch (error) {
      console.error('Failed to retry job:', error);
      return false;
    }
  }, []);

  const deleteJob = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
      
      setJobs(prev => prev.filter(job => job.id !== jobId));
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
      
      return Math.random() > 0.02; // 98% success rate
    } catch (error) {
      console.error('Failed to delete job:', error);
      return false;
    }
  }, []);

  const bulkCancel = useCallback(async (jobIds: string[]) => {
    const results = { success: [] as string[], failed: [] as string[] };
    
    for (const jobId of jobIds) {
      const success = await cancelJob(jobId);
      if (success) {
        results.success.push(jobId);
      } else {
        results.failed.push(jobId);
      }
    }
    
    return results;
  }, [cancelJob]);

  const bulkRetry = useCallback(async (jobIds: string[]) => {
    const results = { success: [] as string[], failed: [] as string[] };
    
    for (const jobId of jobIds) {
      const success = await retryJobAdvanced(jobId);
      if (success) {
        results.success.push(jobId);
      } else {
        results.failed.push(jobId);
      }
    }
    
    return results;
  }, [retryJobAdvanced]);

  const bulkDelete = useCallback(async (jobIds: string[]) => {
    const results = { success: [] as string[], failed: [] as string[] };
    
    for (const jobId of jobIds) {
      const success = await deleteJob(jobId);
      if (success) {
        results.success.push(jobId);
      } else {
        results.failed.push(jobId);
      }
    }
    
    return results;
  }, [deleteJob]);

  // Selection actions
  const toggleJobSelection = useCallback((jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  }, []);

  const selectAllJobs = useCallback(() => {
    setSelectedJobs(jobs.map(job => job.id));
  }, [jobs]);

  const clearSelection = useCallback(() => {
    setSelectedJobs([]);
  }, []);

  return {
    jobs,
    loading,
    error,
    statistics,
    trends,
    realms,
    pagination,
    filters,
    sorting,
    setFilters,
    setSorting,
    setPage,
    refreshJobs,
    cancelJob,
    retryJob: retryJobAdvanced,
    deleteJob,
    bulkCancel,
    bulkRetry,
    bulkDelete,
    selectedJobs,
    setSelectedJobs,
    toggleJobSelection,
    selectAllJobs,
    clearSelection
  };
}