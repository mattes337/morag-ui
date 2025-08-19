import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { backgroundJobService } from '../../lib/services/backgroundJobService';
import { PrismaClient, JobStatus } from '@prisma/client';
import { errorHandlingService } from '../../lib/services/errorHandlingService';

// Mock dependencies
vi.mock('@prisma/client');
vi.mock('../../lib/services/errorHandlingService');

const mockPrisma = {
  processingJob: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn()
  },
  document: {
    findUnique: vi.fn(),
    update: vi.fn()
  }
} as any;

const mockErrorHandlingService = errorHandlingService as {
  handleProcessingError: Mock;
};

// Mock PrismaClient constructor
(PrismaClient as any).mockImplementation(() => mockPrisma);

// Mock fetch for webhook calls
global.fetch = vi.fn();

describe('BackgroundJobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Default mock implementations
    mockPrisma.processingJob.findMany.mockResolvedValue([]);
    mockPrisma.processingJob.count.mockResolvedValue(0);
    mockPrisma.processingJob.groupBy.mockResolvedValue([]);
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('createJob', () => {
    const jobData = {
      documentId: 'doc-1',
      stage: 'MARKDOWN_CONVERSION',
      priority: 1
    };

    const mockJob = {
      id: 'job-1',
      ...jobData,
      status: JobStatus.PENDING,
      createdAt: new Date(),
      scheduledAt: new Date()
    };

    beforeEach(() => {
      mockPrisma.processingJob.create.mockResolvedValue(mockJob);
    });

    it('should create a new job successfully', async () => {
      const result = await backgroundJobService.createJob(jobData);

      expect(result).toEqual(mockJob);
      expect(mockPrisma.processingJob.create).toHaveBeenCalledWith({
        data: {
          ...jobData,
          status: JobStatus.PENDING,
          createdAt: expect.any(Date),
          scheduledAt: expect.any(Date)
        }
      });
    });

    it('should use provided scheduledAt date', async () => {
      const scheduledAt = new Date(Date.now() + 60000);
      const jobWithSchedule = { ...jobData, scheduledAt };

      await backgroundJobService.createJob(jobWithSchedule);

      expect(mockPrisma.processingJob.create).toHaveBeenCalledWith({
        data: {
          ...jobData,
          status: JobStatus.PENDING,
          createdAt: expect.any(Date),
          scheduledAt
        }
      });
    });

    it('should handle job creation errors', async () => {
      const error = new Error('Database error');
      mockPrisma.processingJob.create.mockRejectedValue(error);

      await expect(backgroundJobService.createJob(jobData)).rejects.toThrow('Database error');
    });
  });

  describe('scheduleAutomaticJobs', () => {
    const mockDocuments = [
      {
        id: 'doc-1',
        name: 'test1.pdf',
        state: 'uploaded',
        processingMode: 'AUTOMATIC'
      },
      {
        id: 'doc-2',
        name: 'test2.pdf',
        state: 'ingesting',
        processingMode: 'AUTOMATIC'
      }
    ];

    beforeEach(() => {
      mockPrisma.processingJob.create.mockResolvedValue({ id: 'job-1' });
    });

    it('should schedule jobs for documents needing processing', async () => {
      await backgroundJobService.scheduleAutomaticJobs(mockDocuments);

      expect(mockPrisma.processingJob.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.processingJob.create).toHaveBeenCalledWith({
        data: {
          documentId: 'doc-1',
          stage: 'MARKDOWN_CONVERSION',
          priority: 0,
          status: JobStatus.PENDING,
          createdAt: expect.any(Date),
          scheduledAt: expect.any(Date)
        }
      });
    });

    it('should handle empty document list', async () => {
      await backgroundJobService.scheduleAutomaticJobs([]);

      expect(mockPrisma.processingJob.create).not.toHaveBeenCalled();
    });

    it('should skip documents that do not need processing', async () => {
      const completedDoc = {
        id: 'doc-3',
        name: 'completed.pdf',
        state: 'completed',
        processingMode: 'AUTOMATIC'
      };

      await backgroundJobService.scheduleAutomaticJobs([completedDoc]);

      expect(mockPrisma.processingJob.create).not.toHaveBeenCalled();
    });
  });

  describe('processJobs', () => {
    const mockPendingJob = {
      id: 'job-1',
      documentId: 'doc-1',
      stage: 'MARKDOWN_CONVERSION',
      status: JobStatus.PENDING,
      priority: 1,
      scheduledAt: new Date(Date.now() - 1000),
      createdAt: new Date()
    };

    const mockDocument = {
      id: 'doc-1',
      name: 'test.pdf',
      state: 'uploaded'
    };

    beforeEach(() => {
      mockPrisma.processingJob.findMany.mockResolvedValue([mockPendingJob]);
      mockPrisma.document.findUnique.mockResolvedValue(mockDocument);
      mockPrisma.processingJob.update.mockResolvedValue({});
      mockPrisma.document.update.mockResolvedValue({});
    });

    it('should process pending jobs successfully', async () => {
      const result = await backgroundJobService.processJobs();

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockPrisma.processingJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: {
          status: JobStatus.RUNNING,
          startedAt: expect.any(Date)
        }
      });
    });

    it('should handle job processing errors', async () => {
      const error = new Error('Processing failed');
      (global.fetch as Mock).mockRejectedValue(error);
      mockErrorHandlingService.handleProcessingError.mockResolvedValue({
        shouldRetry: false,
        errorRecord: { id: 'error-1' }
      });

      const result = await backgroundJobService.processJobs();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(mockErrorHandlingService.handleProcessingError).toHaveBeenCalledWith({
        jobId: 'job-1',
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        attempt: 1,
        error,
        timestamp: expect.any(Date)
      });
    });

    it('should skip jobs not yet scheduled', async () => {
      const futureJob = {
        ...mockPendingJob,
        scheduledAt: new Date(Date.now() + 60000) // 1 minute in future
      };
      mockPrisma.processingJob.findMany.mockResolvedValue([futureJob]);

      const result = await backgroundJobService.processJobs();

      expect(result.processed).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('should respect max concurrent jobs limit', async () => {
      const multipleJobs = Array.from({ length: 10 }, (_, i) => ({
        ...mockPendingJob,
        id: `job-${i + 1}`
      }));
      mockPrisma.processingJob.findMany.mockResolvedValue(multipleJobs);

      const result = await backgroundJobService.processJobs();

      // Should only process up to maxConcurrentJobs (default 5)
      expect(result.processed).toBeLessThanOrEqual(5);
    });
  });

  describe('cancelJob', () => {
    it('should cancel a pending job', async () => {
      const pendingJob = {
        id: 'job-1',
        status: JobStatus.PENDING
      };
      mockPrisma.processingJob.findFirst.mockResolvedValue(pendingJob);
      mockPrisma.processingJob.update.mockResolvedValue({});

      const result = await backgroundJobService.cancelJob('job-1');

      expect(result).toBe(true);
      expect(mockPrisma.processingJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: {
          status: JobStatus.CANCELLED,
          completedAt: expect.any(Date),
          error: 'Job cancelled by user'
        }
      });
    });

    it('should not cancel a running job', async () => {
      const runningJob = {
        id: 'job-1',
        status: JobStatus.RUNNING
      };
      mockPrisma.processingJob.findFirst.mockResolvedValue(runningJob);

      const result = await backgroundJobService.cancelJob('job-1');

      expect(result).toBe(false);
      expect(mockPrisma.processingJob.update).not.toHaveBeenCalled();
    });

    it('should handle non-existent job', async () => {
      mockPrisma.processingJob.findFirst.mockResolvedValue(null);

      const result = await backgroundJobService.cancelJob('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      mockPrisma.processingJob.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(10)  // pending
        .mockResolvedValueOnce(5)   // running
        .mockResolvedValueOnce(80)  // completed
        .mockResolvedValueOnce(5);  // failed
    });

    it('should return comprehensive job statistics', async () => {
      const stats = await backgroundJobService.getStats();

      expect(stats).toEqual({
        totalJobs: 100,
        pendingJobs: 10,
        runningJobs: 5,
        completedJobs: 80,
        failedJobs: 5
      });
    });
  });

  describe('startProcessor and stopProcessor', () => {
    it('should start the processor', async () => {
      expect(backgroundJobService.isProcessorRunning()).toBe(false);

      await backgroundJobService.startProcessor();

      expect(backgroundJobService.isProcessorRunning()).toBe(true);
    });

    it('should stop the processor', async () => {
      await backgroundJobService.startProcessor();
      expect(backgroundJobService.isProcessorRunning()).toBe(true);

      await backgroundJobService.stopProcessor();

      expect(backgroundJobService.isProcessorRunning()).toBe(false);
    });

    it('should not start processor if already running', async () => {
      await backgroundJobService.startProcessor();
      const firstStart = backgroundJobService.isProcessorRunning();

      await backgroundJobService.startProcessor(); // Second start
      const secondStart = backgroundJobService.isProcessorRunning();

      expect(firstStart).toBe(true);
      expect(secondStart).toBe(true);
    });
  });

  describe('processor interval', () => {
    it('should process jobs at regular intervals when running', async () => {
      const processSpy = vi.spyOn(backgroundJobService, 'processJobs');
      processSpy.mockResolvedValue({ processed: 0, failed: 0, skipped: 0 });

      await backgroundJobService.startProcessor();

      // Fast forward time to trigger interval
      vi.advanceTimersByTime(30000); // 30 seconds

      expect(processSpy).toHaveBeenCalled();

      await backgroundJobService.stopProcessor();
      processSpy.mockRestore();
    });

    it('should not process jobs when processor is stopped', async () => {
      const processSpy = vi.spyOn(backgroundJobService, 'processJobs');
      processSpy.mockResolvedValue({ processed: 0, failed: 0, skipped: 0 });

      // Don't start processor
      vi.advanceTimersByTime(30000);

      expect(processSpy).not.toHaveBeenCalled();
      processSpy.mockRestore();
    });
  });
});