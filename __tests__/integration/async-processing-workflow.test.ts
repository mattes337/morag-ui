import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { jobScheduler } from '../../lib/services/jobScheduler';
import { backgroundJobService } from '../../lib/services/backgroundJobService';
import { errorHandlingService } from '../../lib/services/errorHandlingService';
import { PrismaClient, JobStatus } from '@prisma/client';

// Mock dependencies
vi.mock('@prisma/client');
vi.mock('../../lib/services/backgroundJobService');
vi.mock('../../lib/services/errorHandlingService');

const mockPrisma = {
  document: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn()
  },
  processingJob: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn()
  },
  processingError: {
    create: vi.fn(),
    findMany: vi.fn()
  }
} as any;

const mockBackgroundJobService = backgroundJobService as {
  startProcessor: Mock;
  stopProcessor: Mock;
  isProcessorRunning: Mock;
  createJob: Mock;
  scheduleAutomaticJobs: Mock;
  processJobs: Mock;
  cancelJob: Mock;
  getStats: Mock;
};

const mockErrorHandlingService = errorHandlingService as {
  handleProcessingError: Mock;
  getErrorStats: Mock;
  getDocumentErrors: Mock;
};

// Mock PrismaClient constructor
(PrismaClient as any).mockImplementation(() => mockPrisma);

// Mock fetch for webhook calls
global.fetch = vi.fn();

describe('Async Processing Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Default mock implementations
    mockBackgroundJobService.isProcessorRunning.mockReturnValue(false);
    mockBackgroundJobService.getStats.mockResolvedValue({
      totalJobs: 0,
      pendingJobs: 0,
      runningJobs: 0,
      completedJobs: 0,
      failedJobs: 0
    });
    
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Complete Document Processing Flow', () => {
    const mockDocument = {
      id: 'doc-1',
      name: 'test-document.pdf',
      state: 'uploaded',
      processingMode: 'AUTOMATIC',
      userId: 'user-1',
      realmId: 'realm-1'
    };

    const mockJob = {
      id: 'job-1',
      documentId: 'doc-1',
      stage: 'MARKDOWN_CONVERSION',
      status: JobStatus.PENDING,
      priority: 0,
      createdAt: new Date(),
      scheduledAt: new Date()
    };

    beforeEach(() => {
      mockPrisma.document.findMany.mockResolvedValue([mockDocument]);
      mockPrisma.processingJob.create.mockResolvedValue(mockJob);
      mockPrisma.processingJob.findMany.mockResolvedValue([mockJob]);
      mockPrisma.document.findUnique.mockResolvedValue(mockDocument);
      mockPrisma.processingJob.update.mockResolvedValue({});
      mockPrisma.document.update.mockResolvedValue({});
      
      mockBackgroundJobService.startProcessor.mockResolvedValue(undefined);
      mockBackgroundJobService.scheduleAutomaticJobs.mockResolvedValue(undefined);
      mockBackgroundJobService.processJobs.mockResolvedValue({
        processed: 1,
        failed: 0,
        skipped: 0
      });
    });

    it('should complete full automatic processing workflow', async () => {
      // 1. Start the scheduler
      const startResult = await jobScheduler.start();
      expect(startResult.success).toBe(true);
      expect(mockBackgroundJobService.startProcessor).toHaveBeenCalled();

      // 2. Schedule automatic jobs for documents
      const scheduleResult = await jobScheduler.scheduleDocumentProcessing('user-1', 'realm-1');
      expect(scheduleResult.success).toBe(true);
      expect(scheduleResult.scheduledDocuments).toBe(1);
      expect(mockBackgroundJobService.scheduleAutomaticJobs).toHaveBeenCalledWith([mockDocument]);

      // 3. Process the scheduled jobs
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      const processResult = await backgroundJobService.processJobs();
      expect(processResult.processed).toBe(1);
      expect(processResult.failed).toBe(0);

      // 4. Verify job status updates
      expect(mockPrisma.processingJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: {
          status: JobStatus.RUNNING,
          startedAt: expect.any(Date)
        }
      });

      // 5. Verify webhook call was made
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/stages/markdown-conversion/execute'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('doc-1')
        })
      );
    });

    it('should handle processing errors with retry logic', async () => {
      // Mock a processing error
      const processingError = new Error('Network timeout');
      (global.fetch as Mock).mockRejectedValue(processingError);
      
      mockErrorHandlingService.handleProcessingError.mockResolvedValue({
        shouldRetry: true,
        retryAt: new Date(Date.now() + 30000),
        errorRecord: {
          id: 'error-1',
          jobId: 'job-1',
          documentId: 'doc-1',
          stage: 'MARKDOWN_CONVERSION',
          errorType: 'TIMEOUT_ERROR',
          errorMessage: 'Network timeout',
          attempt: 1,
          isRetryable: true,
          retryAt: new Date(Date.now() + 30000),
          createdAt: new Date()
        }
      });

      // Start processing
      await jobScheduler.start();
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      
      const processResult = await backgroundJobService.processJobs();
      expect(processResult.failed).toBe(1);

      // Verify error handling was called
      expect(mockErrorHandlingService.handleProcessingError).toHaveBeenCalledWith({
        jobId: 'job-1',
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        attempt: 1,
        error: processingError,
        timestamp: expect.any(Date)
      });
    });

    it('should handle manual processing mode correctly', async () => {
      const manualDocument = {
        ...mockDocument,
        processingMode: 'MANUAL'
      };
      mockPrisma.document.findMany.mockResolvedValue([manualDocument]);

      const scheduleResult = await jobScheduler.scheduleDocumentProcessing('user-1', 'realm-1');
      
      expect(scheduleResult.success).toBe(true);
      expect(scheduleResult.scheduledDocuments).toBe(0); // No documents scheduled
      expect(mockBackgroundJobService.scheduleAutomaticJobs).toHaveBeenCalledWith([]);
    });

    it('should support manual job triggering', async () => {
      mockBackgroundJobService.createJob.mockResolvedValue({ id: 'manual-job-1' });

      const triggerResult = await jobScheduler.triggerJob('doc-1', 'CHUNKER');
      
      expect(triggerResult.success).toBe(true);
      expect(triggerResult.jobId).toBe('manual-job-1');
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledWith({
        documentId: 'doc-1',
        stage: 'CHUNKER',
        priority: 2 // Higher priority for manual triggers
      });
    });

    it('should support job cancellation', async () => {
      mockBackgroundJobService.cancelJob.mockResolvedValue(true);

      const cancelResult = await jobScheduler.cancelJob('job-1');
      
      expect(cancelResult.success).toBe(true);
      expect(mockBackgroundJobService.cancelJob).toHaveBeenCalledWith('job-1');
    });
  });

  describe('Health Monitoring and Statistics', () => {
    beforeEach(() => {
      mockPrisma.processingJob.count
        .mockResolvedValueOnce(5)  // pending jobs
        .mockResolvedValueOnce(2); // running jobs
      
      mockBackgroundJobService.getStats.mockResolvedValue({
        totalJobs: 100,
        pendingJobs: 5,
        runningJobs: 2,
        completedJobs: 90,
        failedJobs: 3
      });
    });

    it('should perform health checks correctly', async () => {
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      
      const healthCheck = await jobScheduler.performHealthCheck();
      
      expect(healthCheck.healthy).toBe(true);
      expect(healthCheck.processorRunning).toBe(true);
      expect(healthCheck.pendingJobs).toBe(5);
      expect(healthCheck.issues).toHaveLength(0);
    });

    it('should detect unhealthy conditions', async () => {
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(false);
      mockPrisma.processingJob.count
        .mockResolvedValueOnce(150) // High pending count
        .mockResolvedValueOnce(0);
      
      const healthCheck = await jobScheduler.performHealthCheck();
      
      expect(healthCheck.healthy).toBe(false);
      expect(healthCheck.issues).toContain('Background processor is not running');
      expect(healthCheck.issues).toContain('High number of pending jobs: 150');
    });

    it('should provide comprehensive statistics', async () => {
      const status = await jobScheduler.getStatus();
      
      expect(status.isRunning).toBe(false);
      expect(status.stats.totalJobs).toBe(100);
      expect(status.stats.pendingJobs).toBe(5);
      expect(status.stats.completedJobs).toBe(90);
      expect(status.lastHealthCheck).toBeInstanceOf(Date);
    });
  });

  describe('Configuration Management', () => {
    it('should update scheduler configuration', async () => {
      const newConfig = {
        maxConcurrentJobs: 10,
        processingInterval: 15000,
        healthCheckInterval: 180000
      };
      
      const updateResult = await jobScheduler.updateConfig(newConfig);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.config.maxConcurrentJobs).toBe(10);
      expect(updateResult.config.processingInterval).toBe(15000);
    });

    it('should validate configuration values', async () => {
      const invalidConfig = {
        maxConcurrentJobs: -1,
        processingInterval: 500 // Too low
      };
      
      const updateResult = await jobScheduler.updateConfig(invalidConfig);
      
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toContain('Invalid configuration');
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from processor crashes', async () => {
      // Start scheduler
      await jobScheduler.start();
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      
      // Simulate processor crash
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(false);
      
      // Health check should detect the issue
      const healthCheck = await jobScheduler.performHealthCheck();
      expect(healthCheck.healthy).toBe(false);
      expect(healthCheck.processorRunning).toBe(false);
      
      // Restart should work
      mockBackgroundJobService.startProcessor.mockResolvedValue(undefined);
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      
      const restartResult = await jobScheduler.restart();
      expect(restartResult.success).toBe(true);
    });

    it('should handle database connection issues gracefully', async () => {
      const dbError = new Error('Database connection lost');
      mockPrisma.document.findMany.mockRejectedValue(dbError);
      
      const scheduleResult = await jobScheduler.scheduleDocumentProcessing('user-1', 'realm-1');
      
      expect(scheduleResult.success).toBe(false);
      expect(scheduleResult.error).toBe('Database connection lost');
    });

    it('should handle webhook endpoint failures', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      mockErrorHandlingService.handleProcessingError.mockResolvedValue({
        shouldRetry: true,
        retryAt: new Date(Date.now() + 30000),
        errorRecord: { id: 'error-1' }
      });
      
      await jobScheduler.start();
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      
      const processResult = await backgroundJobService.processJobs();
      expect(processResult.failed).toBe(1);
      expect(mockErrorHandlingService.handleProcessingError).toHaveBeenCalled();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high job volumes efficiently', async () => {
      // Create many documents
      const manyDocuments = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-${i + 1}`,
        name: `document-${i + 1}.pdf`,
        state: 'uploaded',
        processingMode: 'AUTOMATIC',
        userId: 'user-1',
        realmId: 'realm-1'
      }));
      
      mockPrisma.document.findMany.mockResolvedValue(manyDocuments);
      
      const scheduleResult = await jobScheduler.scheduleDocumentProcessing('user-1', 'realm-1');
      
      expect(scheduleResult.success).toBe(true);
      expect(scheduleResult.scheduledDocuments).toBe(100);
      expect(mockBackgroundJobService.scheduleAutomaticJobs).toHaveBeenCalledWith(manyDocuments);
    });

    it('should respect concurrency limits', async () => {
      const manyJobs = Array.from({ length: 20 }, (_, i) => ({
        id: `job-${i + 1}`,
        documentId: `doc-${i + 1}`,
        stage: 'MARKDOWN_CONVERSION',
        status: JobStatus.PENDING,
        priority: 0,
        createdAt: new Date(),
        scheduledAt: new Date(Date.now() - 1000)
      }));
      
      mockPrisma.processingJob.findMany.mockResolvedValue(manyJobs);
      mockPrisma.document.findUnique.mockResolvedValue(mockDocument);
      
      const processResult = await backgroundJobService.processJobs();
      
      // Should only process up to maxConcurrentJobs (default 5)
      expect(processResult.processed).toBeLessThanOrEqual(5);
    });
  });
});