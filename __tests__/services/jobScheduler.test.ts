import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { jobScheduler } from '../../lib/services/jobScheduler';
import { backgroundJobService } from '../../lib/services/backgroundJobService';
import { PrismaClient, JobStatus, ProcessingStage } from '@prisma/client';

// Mock dependencies
jest.mock('../../lib/services/backgroundJobService');
jest.mock('@prisma/client');

const mockBackgroundJobService = jest.mocked(backgroundJobService);

const mockPrisma = {
  document: {
    findMany: jest.fn(),
    update: jest.fn()
  },
  processingJob: {
    findMany: jest.fn(),
    count: jest.fn()
  }
} as any;

// Mock PrismaClient constructor
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

describe('JobScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBackgroundJobService.isProcessorRunning.mockReturnValue(false);
    mockBackgroundJobService.getPendingJobsCount.mockResolvedValue(0);
    mockBackgroundJobService.getStats.mockResolvedValue({
      totalJobs: 0,
      pendingJobs: 0,
      runningJobs: 0,
      completedJobs: 0,
      failedJobs: 0
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('start', () => {
    it('should start the scheduler successfully', async () => {
      mockBackgroundJobService.startProcessor.mockImplementation(() => {});
      mockBackgroundJobService.scheduleAutomaticJobs.mockImplementation(async () => {});

      const result = await jobScheduler.start();

      expect(result.success).toBe(true);
      expect(mockBackgroundJobService.startProcessor).toHaveBeenCalled();
      expect(mockBackgroundJobService.scheduleAutomaticJobs).toHaveBeenCalled();
    });

    it('should handle start errors gracefully', async () => {
      const error = new Error('Failed to start processor');
      mockBackgroundJobService.startProcessor.mockImplementation(() => { throw error; });

      const result = await jobScheduler.start();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to start processor');
    });

    it('should not start if already running', async () => {
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);

      const result = await jobScheduler.start();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Scheduler is already running');
      expect(mockBackgroundJobService.startProcessor).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop the scheduler successfully', async () => {
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      mockBackgroundJobService.stopProcessor.mockImplementation(() => {});

      const result = await jobScheduler.stop();

      expect(result.success).toBe(true);
      expect(mockBackgroundJobService.stopProcessor).toHaveBeenCalled();
    });

    it('should handle stop errors gracefully', async () => {
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      const error = new Error('Failed to stop processor');
      mockBackgroundJobService.stopProcessor.mockImplementation(() => { throw error; });

      const result = await jobScheduler.stop();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to stop processor');
    });

    it('should not stop if not running', async () => {
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(false);

      const result = await jobScheduler.stop();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Scheduler is not running');
      expect(mockBackgroundJobService.stopProcessor).not.toHaveBeenCalled();
    });
  });

  describe('scheduleDocumentProcessing', () => {
    const mockDocument = {
      id: 'doc-1',
      name: 'test.pdf',
      processingMode: 'AUTOMATIC',
      state: 'uploaded'
    };

    beforeEach(() => {
      mockPrisma.document.findMany.mockResolvedValue([mockDocument]);
    });

    it('should schedule document processing successfully', async () => {
      const mockJob = {
         id: 'job-1',
         documentId: 'doc-1',
         stage: ProcessingStage.MARKDOWN_CONVERSION,
         status: JobStatus.PENDING,
         priority: 0,
         scheduledAt: new Date(),
         retryCount: 0,
         maxRetries: 3,
         createdAt: new Date(),
         updatedAt: new Date()
       };
      mockBackgroundJobService.createJob.mockResolvedValue(mockJob);

      const result = await jobScheduler.scheduleDocumentProcessing('doc-1', 'MARKDOWN_CONVERSION');

      expect(result).toBe('job-1');
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledWith({
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        priority: 0,
        scheduledAt: expect.any(Date)
      });
    });

    it('should handle job creation errors', async () => {
      const error = new Error('Job creation failed');
      mockBackgroundJobService.createJob.mockRejectedValue(error);

      await expect(jobScheduler.scheduleDocumentProcessing('doc-1', 'MARKDOWN_CONVERSION')).rejects.toThrow('Job creation failed');
    });

    it('should schedule with custom priority and date', async () => {
      const scheduledAt = new Date('2024-01-01');
      const mockJob = {
         id: 'job-2',
         documentId: 'doc-2',
         stage: ProcessingStage.CHUNKER,
         status: JobStatus.PENDING,
         priority: 5,
         scheduledAt: scheduledAt,
         retryCount: 0,
         maxRetries: 3,
         createdAt: new Date(),
         updatedAt: new Date()
       };
      mockBackgroundJobService.createJob.mockResolvedValue(mockJob);

      const result = await jobScheduler.scheduleDocumentProcessing('doc-2', 'CHUNKER', 5, scheduledAt);

      expect(result).toBe('job-2');
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledWith({
        documentId: 'doc-2',
        stage: 'CHUNKER',
        priority: 5,
        scheduledAt: scheduledAt
      });
    });
  });

  describe('getStats', () => {
    it('should return scheduler statistics', () => {
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      
      const stats = jobScheduler.getStats();

      expect(stats.isRunning).toBe(false); // Default state
       expect(stats.totalJobsProcessed).toBe(0);
       expect(stats.pendingJobs).toBe(0);
       expect(stats.failedJobs).toBe(0);
       expect(stats.uptime).toBeGreaterThanOrEqual(0);
       expect(stats.averageProcessingTime).toBe(0);
    });
  });





  describe('cancelDocumentJobs', () => {
    it('should cancel document jobs successfully', async () => {
      const mockJobs = [{ id: 'job-1' }, { id: 'job-2' }];
      mockPrisma.processingJob.findMany.mockResolvedValue(mockJobs);
      mockBackgroundJobService.cancelJob.mockResolvedValue(undefined);

      const result = await jobScheduler.cancelDocumentJobs('doc-1');

      expect(result).toBe(2);
      expect(mockPrisma.processingJob.findMany).toHaveBeenCalledWith({
        where: {
          documentId: 'doc-1',
          status: 'PENDING'
        }
      });
      expect(mockBackgroundJobService.cancelJob).toHaveBeenCalledTimes(2);
    });

    it('should handle job cancellation errors', async () => {
      const error = new Error('Cancellation failed');
      mockPrisma.processingJob.findMany.mockRejectedValue(error);

      await expect(jobScheduler.cancelDocumentJobs('doc-1')).rejects.toThrow('Cancellation failed');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration successfully', () => {
      const newConfig = {
        maxConcurrentJobs: 10,
        healthCheckIntervalMs: 60000
      };

      jobScheduler.updateConfig(newConfig);

      const config = jobScheduler.getConfig();
      expect(config.maxConcurrentJobs).toBe(10);
      expect(config.healthCheckIntervalMs).toBe(60000);
    });

    it('should preserve existing config values when updating partial config', () => {
      const originalConfig = jobScheduler.getConfig();
      const newConfig = {
        maxConcurrentJobs: 15
      };

      jobScheduler.updateConfig(newConfig);

      const updatedConfig = jobScheduler.getConfig();
      expect(updatedConfig.maxConcurrentJobs).toBe(15);
      expect(updatedConfig.processingIntervalMs).toBe(originalConfig.processingIntervalMs);
      expect(updatedConfig.enabled).toBe(originalConfig.enabled);
    });
  });
});