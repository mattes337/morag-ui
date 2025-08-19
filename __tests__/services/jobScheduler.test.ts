import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { jobScheduler } from '../../lib/services/jobScheduler';
import { backgroundJobService } from '../../lib/services/backgroundJobService';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
vi.mock('../../lib/services/backgroundJobService');
vi.mock('@prisma/client');

const mockBackgroundJobService = backgroundJobService as {
  startProcessor: Mock;
  stopProcessor: Mock;
  scheduleAutomaticJobs: Mock;
  getStats: Mock;
  isProcessorRunning: Mock;
  createJob: Mock;
  cancelJob: Mock;
};

const mockPrisma = {
  document: {
    findMany: vi.fn(),
    update: vi.fn()
  },
  processingJob: {
    findMany: vi.fn(),
    count: vi.fn()
  }
} as any;

// Mock PrismaClient constructor
(PrismaClient as any).mockImplementation(() => mockPrisma);

describe('JobScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBackgroundJobService.isProcessorRunning = vi.fn().mockReturnValue(false);
    mockBackgroundJobService.getStats = vi.fn().mockResolvedValue({
      totalJobs: 0,
      pendingJobs: 0,
      runningJobs: 0,
      completedJobs: 0,
      failedJobs: 0
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('start', () => {
    it('should start the scheduler successfully', async () => {
      mockBackgroundJobService.startProcessor = vi.fn().mockResolvedValue(undefined);
      mockBackgroundJobService.scheduleAutomaticJobs = vi.fn().mockResolvedValue(undefined);

      const result = await jobScheduler.start();

      expect(result.success).toBe(true);
      expect(mockBackgroundJobService.startProcessor).toHaveBeenCalled();
      expect(mockBackgroundJobService.scheduleAutomaticJobs).toHaveBeenCalled();
    });

    it('should handle start errors gracefully', async () => {
      const error = new Error('Failed to start processor');
      mockBackgroundJobService.startProcessor = vi.fn().mockRejectedValue(error);

      const result = await jobScheduler.start();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to start processor');
    });

    it('should not start if already running', async () => {
      mockBackgroundJobService.isProcessorRunning = vi.fn().mockReturnValue(true);

      const result = await jobScheduler.start();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Scheduler is already running');
      expect(mockBackgroundJobService.startProcessor).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop the scheduler successfully', async () => {
      mockBackgroundJobService.isProcessorRunning = vi.fn().mockReturnValue(true);
      mockBackgroundJobService.stopProcessor = vi.fn().mockResolvedValue(undefined);

      const result = await jobScheduler.stop();

      expect(result.success).toBe(true);
      expect(mockBackgroundJobService.stopProcessor).toHaveBeenCalled();
    });

    it('should handle stop errors gracefully', async () => {
      mockBackgroundJobService.isProcessorRunning = vi.fn().mockReturnValue(true);
      const error = new Error('Failed to stop processor');
      mockBackgroundJobService.stopProcessor = vi.fn().mockRejectedValue(error);

      const result = await jobScheduler.stop();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to stop processor');
    });

    it('should not stop if not running', async () => {
      mockBackgroundJobService.isProcessorRunning = vi.fn().mockReturnValue(false);

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

    it('should schedule processing for automatic documents', async () => {
      mockBackgroundJobService.scheduleAutomaticJobs = vi.fn().mockResolvedValue(undefined);

      const result = await jobScheduler.scheduleDocumentProcessing('user-1', 'realm-1');

      expect(result.success).toBe(true);
      expect(result.scheduledDocuments).toBe(1);
      expect(mockBackgroundJobService.scheduleAutomaticJobs).toHaveBeenCalledWith([mockDocument]);
    });

    it('should handle scheduling errors', async () => {
      const error = new Error('Scheduling failed');
      mockBackgroundJobService.scheduleAutomaticJobs = vi.fn().mockRejectedValue(error);

      const result = await jobScheduler.scheduleDocumentProcessing('user-1', 'realm-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Scheduling failed');
    });

    it('should skip manual processing mode documents', async () => {
      const manualDocument = { ...mockDocument, processingMode: 'MANUAL' };
      mockPrisma.document.findMany.mockResolvedValue([manualDocument]);
      mockBackgroundJobService.scheduleAutomaticJobs = vi.fn().mockResolvedValue(undefined);

      const result = await jobScheduler.scheduleDocumentProcessing('user-1', 'realm-1');

      expect(result.success).toBe(true);
      expect(result.scheduledDocuments).toBe(0);
      expect(mockBackgroundJobService.scheduleAutomaticJobs).toHaveBeenCalledWith([]);
    });
  });

  describe('getStatus', () => {
    it('should return scheduler status', async () => {
      mockBackgroundJobService.isProcessorRunning = vi.fn().mockReturnValue(true);
      mockBackgroundJobService.getStats = vi.fn().mockResolvedValue({
        totalJobs: 10,
        pendingJobs: 2,
        runningJobs: 1,
        completedJobs: 6,
        failedJobs: 1
      });

      const status = await jobScheduler.getStatus();

      expect(status.isRunning).toBe(true);
      expect(status.stats.totalJobs).toBe(10);
      expect(status.stats.pendingJobs).toBe(2);
      expect(status.lastHealthCheck).toBeInstanceOf(Date);
    });
  });

  describe('performHealthCheck', () => {
    it('should perform health check successfully', async () => {
      mockBackgroundJobService.isProcessorRunning = vi.fn().mockReturnValue(true);
      mockPrisma.processingJob.count.mockResolvedValue(5);

      const result = await jobScheduler.performHealthCheck();

      expect(result.healthy).toBe(true);
      expect(result.processorRunning).toBe(true);
      expect(result.pendingJobs).toBe(5);
    });

    it('should detect unhealthy state when processor is not running', async () => {
      mockBackgroundJobService.isProcessorRunning = vi.fn().mockReturnValue(false);
      mockPrisma.processingJob.count.mockResolvedValue(5);

      const result = await jobScheduler.performHealthCheck();

      expect(result.healthy).toBe(false);
      expect(result.processorRunning).toBe(false);
      expect(result.issues).toContain('Background processor is not running');
    });

    it('should detect high pending job count', async () => {
      mockBackgroundJobService.isProcessorRunning = vi.fn().mockReturnValue(true);
      mockPrisma.processingJob.count.mockResolvedValue(150); // Above threshold

      const result = await jobScheduler.performHealthCheck();

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('High number of pending jobs: 150');
    });
  });

  describe('triggerJob', () => {
    it('should trigger job successfully', async () => {
      mockBackgroundJobService.createJob = vi.fn().mockResolvedValue({ id: 'job-1' });

      const result = await jobScheduler.triggerJob('doc-1', 'MARKDOWN_CONVERSION');

      expect(result.success).toBe(true);
      expect(result.jobId).toBe('job-1');
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledWith({
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        priority: 2
      });
    });

    it('should handle job creation errors', async () => {
      const error = new Error('Job creation failed');
      mockBackgroundJobService.createJob = vi.fn().mockRejectedValue(error);

      const result = await jobScheduler.triggerJob('doc-1', 'MARKDOWN_CONVERSION');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Job creation failed');
    });
  });

  describe('cancelJob', () => {
    it('should cancel job successfully', async () => {
      mockBackgroundJobService.cancelJob = vi.fn().mockResolvedValue(true);

      const result = await jobScheduler.cancelJob('job-1');

      expect(result.success).toBe(true);
      expect(mockBackgroundJobService.cancelJob).toHaveBeenCalledWith('job-1');
    });

    it('should handle job cancellation errors', async () => {
      const error = new Error('Cancellation failed');
      mockBackgroundJobService.cancelJob = vi.fn().mockRejectedValue(error);

      const result = await jobScheduler.cancelJob('job-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cancellation failed');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration successfully', async () => {
      const newConfig = {
        maxConcurrentJobs: 10,
        healthCheckInterval: 60000
      };

      const result = await jobScheduler.updateConfig(newConfig);

      expect(result.success).toBe(true);
      expect(result.config.maxConcurrentJobs).toBe(10);
      expect(result.config.healthCheckInterval).toBe(60000);
    });

    it('should validate configuration values', async () => {
      const invalidConfig = {
        maxConcurrentJobs: -1, // Invalid
        healthCheckInterval: 1000 // Too low
      };

      const result = await jobScheduler.updateConfig(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid configuration');
    });
  });
});