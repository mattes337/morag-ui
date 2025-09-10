/**
 * Tests for Job Management Hooks
 */

import { renderHook, act } from '@testing-library/react';
import { 
  useJobs,
  useJobById,
  useJobQueue,
  useRunningJobs,
  useJobStatistics,
  useRecentJobs,
  useJobCreate,
  useJobCancel,
  useJobRetry,
  useJobLogs
} from '../useJobs';
import { mockApiClient } from '../../api/mockApiClient';
import type { ProcessingJob, JobQueue } from '../../api/types';

// Mock the API client
jest.mock('../../api/mockApiClient');

const mockApiClientInstance = mockApiClient as jest.Mocked<typeof mockApiClient>;

describe('useJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockJob: ProcessingJob = {
    id: 'job-123',
    type: 'document_upload',
    status: 'running',
    progress: 65,
    createdAt: '2024-01-01T10:00:00Z',
    startedAt: '2024-01-01T10:01:00Z',
    metadata: { documentId: 'doc-123', realmId: 'realm-1' }
  };

  describe('useJobs', () => {
    it('should fetch all jobs successfully', async () => {
      const mockJobs = [mockJob];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockJobs,
        timestamp: new Date().toISOString(),
        requestId: 'test-1'
      });

      const { result } = renderHook(() => useJobs());

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/jobs');
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockJobs);
      expect(result.current.error).toBeUndefined();
    });

    it('should fetch jobs with realm filter', async () => {
      const realmId = 'realm-123';
      const mockJobs = [{ ...mockJob, metadata: { ...mockJob.metadata, realmId } }];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockJobs,
        timestamp: new Date().toISOString(),
        requestId: 'test-2'
      });

      const { result } = renderHook(() => useJobs({ realmId }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/jobs?realm=${realmId}`);
      expect(result.current.data).toEqual(mockJobs);
    });

    it('should fetch jobs with status filter', async () => {
      const status = 'running';
      const mockJobs = [{ ...mockJob, status: 'running' as const }];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockJobs,
        timestamp: new Date().toISOString(),
        requestId: 'test-3'
      });

      const { result } = renderHook(() => useJobs({ status }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/jobs?status=${status}`);
      expect(result.current.data).toEqual(mockJobs);
    });

    it('should fetch jobs with type filter', async () => {
      const type = 'document_upload';
      const mockJobs = [{ ...mockJob, type: 'document_upload' as const }];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockJobs,
        timestamp: new Date().toISOString(),
        requestId: 'test-4'
      });

      const { result } = renderHook(() => useJobs({ type }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/jobs?type=${type}`);
      expect(result.current.data).toEqual(mockJobs);
    });
  });

  describe('useJobById', () => {
    it('should fetch single job by ID', async () => {
      const jobId = 'job-123';

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockJob,
        timestamp: new Date().toISOString(),
        requestId: 'test-5'
      });

      const { result } = renderHook(() => useJobById(jobId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/jobs/${jobId}`);
      expect(result.current.data).toEqual(mockJob);
    });

    it('should not make API call when ID is empty', () => {
      renderHook(() => useJobById(''));

      expect(mockApiClientInstance.get).not.toHaveBeenCalled();
    });
  });

  describe('useJobQueue', () => {
    it('should fetch job queue successfully', async () => {
      const mockQueue: JobQueue = {
        pending: [{ ...mockJob, status: 'pending' }],
        running: [{ ...mockJob, status: 'running' }],
        completed: [{ ...mockJob, status: 'completed' }],
        failed: [{ ...mockJob, status: 'failed' }],
        totalJobs: 4
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockQueue,
        timestamp: new Date().toISOString(),
        requestId: 'test-6'
      });

      const { result } = renderHook(() => useJobQueue());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/jobs/queue');
      expect(result.current.data).toEqual(mockQueue);
    });
  });

  describe('useRunningJobs', () => {
    it('should fetch running jobs', async () => {
      const mockRunningJobs = [{ ...mockJob, status: 'running' as const }];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockRunningJobs,
        timestamp: new Date().toISOString(),
        requestId: 'test-7'
      });

      const { result } = renderHook(() => useRunningJobs());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/jobs?status=running');
      expect(result.current.data).toEqual(mockRunningJobs);
    });
  });

  describe('useJobStatistics', () => {
    it('should fetch job statistics', async () => {
      const mockStats = {
        total: 1000,
        byStatus: {
          pending: 50,
          running: 25,
          completed: 900,
          failed: 20,
          cancelled: 5
        },
        byType: {
          document_upload: 400,
          pipeline_execution: 500,
          batch_processing: 100
        },
        avgProcessingTime: 2.5,
        successRate: 0.92,
        queueLength: 75,
        throughputPerHour: 50
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockStats,
        timestamp: new Date().toISOString(),
        requestId: 'test-8'
      });

      const { result } = renderHook(() => useJobStatistics());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/jobs/statistics');
      expect(result.current.data).toEqual(mockStats);
    });

    it('should fetch job statistics with realm filter', async () => {
      const realmId = 'realm-123';

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
        requestId: 'test-9'
      });

      renderHook(() => useJobStatistics({ realmId }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/jobs/statistics?realm=${realmId}`);
    });
  });

  describe('useRecentJobs', () => {
    it('should fetch recent jobs', async () => {
      const mockRecentJobs = [mockJob];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockRecentJobs,
        timestamp: new Date().toISOString(),
        requestId: 'test-10'
      });

      const { result } = renderHook(() => useRecentJobs());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith('/api/jobs/recent');
      expect(result.current.data).toEqual(mockRecentJobs);
    });

    it('should fetch recent jobs with limit', async () => {
      const limit = 10;
      const mockRecentJobs = [mockJob];

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockRecentJobs,
        timestamp: new Date().toISOString(),
        requestId: 'test-11'
      });

      const { result } = renderHook(() => useRecentJobs(limit));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/jobs/recent?limit=${limit}`);
      expect(result.current.data).toEqual(mockRecentJobs);
    });
  });

  describe('useJobCreate', () => {
    it('should create job successfully', async () => {
      const jobData = {
        type: 'document_upload' as const,
        realmId: 'realm-123',
        metadata: { documentId: 'doc-123' },
        priority: 'normal' as const
      };

      const mockCreatedJob = {
        ...mockJob,
        id: 'job-new',
        status: 'pending' as const,
        progress: 0
      };

      mockApiClientInstance.post.mockResolvedValue({
        success: true,
        data: mockCreatedJob,
        timestamp: new Date().toISOString(),
        requestId: 'test-12'
      });

      const { result } = renderHook(() => useJobCreate());

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createJob(jobData);
      });

      expect(mockApiClientInstance.post).toHaveBeenCalledWith('/api/jobs', jobData);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(createResult).toEqual(mockCreatedJob);
    });

    it('should handle creation errors', async () => {
      const jobData = {
        type: 'document_upload' as const,
        metadata: { documentId: 'doc-123' }
      };

      const mockError = {
        code: 'CREATE_JOB_ERROR',
        message: 'Failed to create job',
        statusCode: 500
      };

      mockApiClientInstance.post.mockResolvedValue({
        success: false,
        error: mockError,
        timestamp: new Date().toISOString(),
        requestId: 'test-13'
      });

      const { result } = renderHook(() => useJobCreate());

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createJob(jobData);
      });

      expect(result.current.error).toBeDefined();
      expect(createResult).toBeNull();
    });
  });

  describe('useJobCancel', () => {
    it('should cancel job successfully', async () => {
      const jobId = 'job-123';

      mockApiClientInstance.post.mockResolvedValue({
        success: true,
        data: { message: 'Job cancelled successfully' },
        timestamp: new Date().toISOString(),
        requestId: 'test-14'
      });

      const { result } = renderHook(() => useJobCancel());

      let cancelResult: boolean;
      await act(async () => {
        cancelResult = await result.current.cancelJob(jobId);
      });

      expect(mockApiClientInstance.post).toHaveBeenCalledWith(`/api/jobs/${jobId}/cancel`);
      expect(result.current.isCanceling).toBe(false);
      expect(cancelResult!).toBe(true);
    });

    it('should handle cancel errors', async () => {
      const jobId = 'job-123';
      const mockError = {
        code: 'CANCEL_JOB_ERROR',
        message: 'Failed to cancel job',
        statusCode: 500
      };

      mockApiClientInstance.post.mockResolvedValue({
        success: false,
        error: mockError,
        timestamp: new Date().toISOString(),
        requestId: 'test-15'
      });

      const { result } = renderHook(() => useJobCancel());

      let cancelResult: boolean;
      await act(async () => {
        cancelResult = await result.current.cancelJob(jobId);
      });

      expect(result.current.error).toBeDefined();
      expect(cancelResult!).toBe(false);
    });
  });

  describe('useJobRetry', () => {
    it('should retry job successfully', async () => {
      const jobId = 'job-123';
      const mockRetriedJob = {
        ...mockJob,
        id: jobId,
        status: 'pending' as const,
        progress: 0
      };

      mockApiClientInstance.post.mockResolvedValue({
        success: true,
        data: mockRetriedJob,
        timestamp: new Date().toISOString(),
        requestId: 'test-16'
      });

      const { result } = renderHook(() => useJobRetry());

      let retryResult: any;
      await act(async () => {
        retryResult = await result.current.retryJob(jobId);
      });

      expect(mockApiClientInstance.post).toHaveBeenCalledWith(`/api/jobs/${jobId}/retry`);
      expect(result.current.isRetrying).toBe(false);
      expect(retryResult).toEqual(mockRetriedJob);
    });
  });

  describe('useJobLogs', () => {
    it('should fetch job logs', async () => {
      const jobId = 'job-123';
      const mockLogs = {
        jobId,
        logs: [
          {
            timestamp: '2024-01-01T10:00:00Z',
            level: 'info' as const,
            message: 'Job started',
            details: { stage: 'initialization' }
          },
          {
            timestamp: '2024-01-01T10:05:00Z',
            level: 'warn' as const,
            message: 'Processing taking longer than expected'
          }
        ],
        metrics: {
          cpuUsage: 45.5,
          memoryUsage: 512,
          duration: 300,
          throughput: 1.2
        }
      };

      mockApiClientInstance.get.mockResolvedValue({
        success: true,
        data: mockLogs,
        timestamp: new Date().toISOString(),
        requestId: 'test-17'
      });

      const { result } = renderHook(() => useJobLogs(jobId));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockApiClientInstance.get).toHaveBeenCalledWith(`/api/jobs/${jobId}/logs`);
      expect(result.current.data).toEqual(mockLogs);
    });

    it('should not make API call when jobId is empty', () => {
      renderHook(() => useJobLogs(''));

      expect(mockApiClientInstance.get).not.toHaveBeenCalled();
    });
  });
});