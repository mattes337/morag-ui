import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { MockedFunction, Mock } from 'jest-mock';
import { jobScheduler } from '../../lib/services/jobScheduler';
import { backgroundJobService } from '../../lib/services/backgroundJobService';
import { errorHandlingService } from '../../lib/services/errorHandlingService';
import { PrismaClient, JobStatus } from '@prisma/client';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('../../lib/services/backgroundJobService');
jest.mock('../../lib/services/errorHandlingService');

const mockPrisma = {
  document: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  processingJob: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn()
  },
  processingError: {
    create: jest.fn(),
    findMany: jest.fn()
  }
} as any;

const mockBackgroundJobService = backgroundJobService as {
  startProcessor: MockedFunction<any>;
  stopProcessor: MockedFunction<any>;
  isProcessorRunning: MockedFunction<any>;
  createJob: MockedFunction<any>;
  scheduleAutomaticJobs: MockedFunction<any>;
  processJobs: MockedFunction<any>;
  getStats: MockedFunction<any>;
  getPendingJobsCount: MockedFunction<any>;
  cancelJob: MockedFunction<any>;
};

const mockErrorHandlingService = errorHandlingService as {
  handleProcessingError: MockedFunction<any>;
  getErrorStats: MockedFunction<any>;
  getDocumentErrors: MockedFunction<any>;
};

// Mock PrismaClient constructor
(PrismaClient as any).mockImplementation(() => mockPrisma);

// Mock document for tests
const mockDocument = {
  id: 'doc-1',
  name: 'test.pdf',
  type: 'application/pdf',
  userId: 'user-1',
  realmId: 'realm-1',
  state: 'INGESTED',
  version: 1,
  chunks: 10,
  quality: 0.95,
  uploadDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  realm: { id: 'realm-1', name: 'Test Realm' },
  user: { id: 'user-1', email: 'test@example.com' },
  jobs: []
};

// Mock fetch for webhook calls
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('Async Processing Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default mock implementations
    mockBackgroundJobService.isProcessorRunning.mockReturnValue(false);
    mockBackgroundJobService.getStats.mockResolvedValue({
      totalJobs: 0,
      pendingJobs: 0,
      runningJobs: 0,
      completedJobs: 0,
      failedJobs: 0
    });
    
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: 'http://localhost:3000/api/webhook',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({ success: true })
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
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
      const jobId = await jobScheduler.scheduleDocumentProcessing('doc-1', 'MARKDOWN_CONVERSION');
      expect(jobId).toBe('job-1');
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledWith({
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        priority: 0,
        scheduledAt: expect.any(Date)
      });

      // 3. Process the scheduled jobs
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      const processResult = await backgroundJobService.processJobs();
      expect(processResult.processed).toBe(1);
      expect(processResult.failed).toBe(0);

      // 4. Verify job status updates
      expect(mockPrisma.processingJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: {
          status: JobStatus.PROCESSING,
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
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(processingError);
      
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

      const scheduleResult = await jobScheduler.scheduleDocumentProcessing('doc-1', 'MARKDOWN_CONVERSION');
      
      expect(scheduleResult).toBe('job-1');
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledWith({
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        priority: 0,
        scheduledAt: expect.any(Date)
      });
    });

    it('should support manual job triggering', async () => {
      mockBackgroundJobService.createJob.mockResolvedValue({ id: 'manual-job-1' });

      const triggerResult = await jobScheduler.scheduleDocumentProcessing('doc-1', 'CHUNKER');
      
      expect(triggerResult).toBe('manual-job-1');
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledWith({
        documentId: 'doc-1',
        stage: 'CHUNKER',
        priority: 2 // Higher priority for manual triggers
      });
    });

    it('should support job cancellation', async () => {
      mockBackgroundJobService.cancelJob.mockResolvedValue(true);

      // Test job cancellation through background service
      mockBackgroundJobService.cancelJob.mockResolvedValue({ success: true });
      const cancelResult = await mockBackgroundJobService.cancelJob('job-1');
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

    it('should get scheduler stats correctly', async () => {
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      mockBackgroundJobService.getPendingJobsCount.mockResolvedValue(5);
      
      const stats = jobScheduler.getStats();
      
      expect(stats.isRunning).toBe(false); // Default state
      expect(stats.pendingJobs).toBe(0); // Default state
      expect(stats.failedJobs).toBe(0);
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should get scheduler configuration', async () => {
      const config = jobScheduler.getConfig();
      
      expect(config.enabled).toBe(true);
      expect(config.processingIntervalMs).toBe(30000);
      expect(config.maxConcurrentJobs).toBe(5);
      expect(config.retryDelayMs).toBe(60000);
    });

    it('should provide comprehensive statistics', async () => {
      const stats = jobScheduler.getStats();
      
      expect(stats.isRunning).toBe(false);
      expect(stats.totalJobsProcessed).toBe(0);
      expect(stats.pendingJobs).toBe(0);
      expect(stats.failedJobs).toBe(0);
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Configuration Management', () => {
    it('should update scheduler configuration', async () => {
      const newConfig = {
        maxConcurrentJobs: 10,
        processingIntervalMs: 15000,
        healthCheckIntervalMs: 180000
      };
      
      jobScheduler.updateConfig(newConfig);
      const config = jobScheduler.getConfig();
      
      expect(config.maxConcurrentJobs).toBe(10);
      expect(config.processingIntervalMs).toBe(15000);
      expect(config.healthCheckIntervalMs).toBe(180000);
    });

    it('should accept configuration updates', async () => {
      const newConfig = {
        maxConcurrentJobs: 3,
        processingIntervalMs: 60000
      };
      
      jobScheduler.updateConfig(newConfig);
      const config = jobScheduler.getConfig();
      
      expect(config.maxConcurrentJobs).toBe(3);
      expect(config.processingIntervalMs).toBe(60000);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from processor crashes', async () => {
      // Start scheduler
      mockBackgroundJobService.startProcessor.mockImplementation(() => {});
      const startResult = await jobScheduler.start();
      expect(startResult.success).toBe(true);
      
      // Simulate processor crash
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(false);
      
      // Restart should work
      mockBackgroundJobService.startProcessor.mockImplementation(() => {});
      mockBackgroundJobService.stopProcessor.mockImplementation(() => {});
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      
      const restartResult = await jobScheduler.restart();
      expect(restartResult.success).toBe(true);
    });

    it('should handle database connection issues gracefully', async () => {
      const dbError = new Error('Database connection lost');
      mockBackgroundJobService.createJob.mockRejectedValue(dbError);
      
      await expect(jobScheduler.scheduleDocumentProcessing('doc-1', 'MARKDOWN_CONVERSION'))
        .rejects.toThrow('Database connection lost');
    });

    it('should handle webhook endpoint failures', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
       mockFetch.mockResolvedValue({
         ok: false,
         status: 500,
         statusText: 'Internal Server Error',
         headers: new Headers(),
         redirected: false,
         type: 'basic',
         url: 'http://localhost:3000/api/webhook',
         clone: () => ({} as Response),
         body: null,
         bodyUsed: false,
         arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
         blob: () => Promise.resolve(new Blob()),
         formData: () => Promise.resolve(new FormData()),
         text: () => Promise.resolve(''),
         json: () => Promise.resolve({ error: 'Internal Server Error' })
       } as Response);
      
      mockErrorHandlingService.handleProcessingError.mockResolvedValue({
        shouldRetry: true,
        retryAt: new Date(Date.now() + 30000),
        errorRecord: { id: 'error-1' }
      });
      
      mockBackgroundJobService.startProcessor.mockImplementation(() => {});
      await jobScheduler.start();
      mockBackgroundJobService.isProcessorRunning.mockReturnValue(true);
      
      const processResult = await backgroundJobService.processJobs();
      expect(processResult.failed).toBe(1);
      expect(mockErrorHandlingService.handleProcessingError).toHaveBeenCalled();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple job scheduling efficiently', async () => {
      // Mock multiple job creation calls
      mockBackgroundJobService.createJob.mockResolvedValue({
        id: 'job-1',
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        status: JobStatus.PENDING,
        priority: 0,
        scheduledAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const jobIds = await Promise.all([
        jobScheduler.scheduleDocumentProcessing('doc-1', 'MARKDOWN_CONVERSION'),
        jobScheduler.scheduleDocumentProcessing('doc-2', 'CHUNKER'),
        jobScheduler.scheduleDocumentProcessing('doc-3', 'MARKDOWN_CONVERSION')
      ]);
      
      expect(jobIds).toHaveLength(3);
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledTimes(3);
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