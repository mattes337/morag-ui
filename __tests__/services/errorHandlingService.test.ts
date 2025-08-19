import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { errorHandlingService, ErrorContext, RetryConfig } from '../../lib/services/errorHandlingService';
import { backgroundJobService } from '../../lib/services/backgroundJobService';
import { PrismaClient, JobStatus } from '@prisma/client';

// Mock dependencies
vi.mock('../../lib/services/backgroundJobService');
vi.mock('@prisma/client');

const mockBackgroundJobService = backgroundJobService as {
  createJob: Mock;
};

const mockPrisma = {
  processingError: {
    create: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    groupBy: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn()
  },
  processingJob: {
    update: vi.fn()
  }
} as any;

// Mock PrismaClient constructor
(PrismaClient as any).mockImplementation(() => mockPrisma);

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('handleProcessingError', () => {
    const mockContext: ErrorContext = {
      jobId: 'job-1',
      documentId: 'doc-1',
      stage: 'MARKDOWN_CONVERSION',
      attempt: 1,
      error: new Error('Network timeout'),
      timestamp: new Date()
    };

    const mockErrorRecord = {
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
    };

    beforeEach(() => {
      mockPrisma.processingError.create.mockResolvedValue(mockErrorRecord);
      mockBackgroundJobService.createJob.mockResolvedValue({ id: 'retry-job-1' });
      mockPrisma.processingJob.update.mockResolvedValue({});
    });

    it('should handle retryable error and schedule retry', async () => {
      const result = await errorHandlingService.handleProcessingError(mockContext);

      expect(result.shouldRetry).toBe(true);
      expect(result.retryAt).toBeInstanceOf(Date);
      expect(result.errorRecord.errorType).toBe('TIMEOUT_ERROR');
      expect(mockBackgroundJobService.createJob).toHaveBeenCalledWith({
        documentId: 'doc-1',
        stage: 'MARKDOWN_CONVERSION',
        priority: 1,
        scheduledAt: expect.any(Date)
      });
    });

    it('should handle non-retryable error', async () => {
      const validationError = {
        ...mockContext,
        error: new Error('Invalid input validation failed')
      };

      const nonRetryableRecord = {
        ...mockErrorRecord,
        errorType: 'VALIDATION_ERROR',
        isRetryable: false,
        retryAt: undefined
      };
      mockPrisma.processingError.create.mockResolvedValue(nonRetryableRecord);

      const result = await errorHandlingService.handleProcessingError(validationError);

      expect(result.shouldRetry).toBe(false);
      expect(result.retryAt).toBeUndefined();
      expect(mockBackgroundJobService.createJob).not.toHaveBeenCalled();
      expect(mockPrisma.processingJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: {
          status: JobStatus.FAILED,
          completedAt: expect.any(Date),
          error: expect.stringContaining('failed permanently')
        }
      });
    });

    it('should not retry after max attempts reached', async () => {
      const maxAttemptsContext = {
        ...mockContext,
        attempt: 3 // Exceeds max retries for MARKDOWN_CONVERSION (2)
      };

      const result = await errorHandlingService.handleProcessingError(maxAttemptsContext);

      expect(result.shouldRetry).toBe(false);
      expect(mockBackgroundJobService.createJob).not.toHaveBeenCalled();
    });
  });

  describe('categorizeError', () => {
    it('should categorize network errors correctly', () => {
      const networkError = new Error('Network connection failed');
      const result = (errorHandlingService as any).categorizeError(networkError);
      expect(result).toBe('NETWORK_ERROR');
    });

    it('should categorize timeout errors correctly', () => {
      const timeoutError = new Error('Request timeout exceeded');
      const result = (errorHandlingService as any).categorizeError(timeoutError);
      expect(result).toBe('TIMEOUT_ERROR');
    });

    it('should categorize rate limit errors correctly', () => {
      const rateLimitError = new Error('Rate limit exceeded, too many requests');
      const result = (errorHandlingService as any).categorizeError(rateLimitError);
      expect(result).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should categorize validation errors correctly', () => {
      const validationError = new Error('Invalid input validation failed');
      const result = (errorHandlingService as any).categorizeError(validationError);
      expect(result).toBe('VALIDATION_ERROR');
    });

    it('should categorize unknown errors correctly', () => {
      const unknownError = new Error('Something unexpected happened');
      const result = (errorHandlingService as any).categorizeError(unknownError);
      expect(result).toBe('UNKNOWN_ERROR');
    });
  });

  describe('calculateRetryDelay', () => {
    const config: RetryConfig = {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      retryableErrors: ['NETWORK_ERROR']
    };

    it('should calculate exponential backoff correctly', () => {
      const delay1 = (errorHandlingService as any).calculateRetryDelay(1, config);
      const delay2 = (errorHandlingService as any).calculateRetryDelay(2, config);
      const delay3 = (errorHandlingService as any).calculateRetryDelay(3, config);

      expect(delay1.getTime()).toBeGreaterThan(Date.now() + 900); // ~1000ms + jitter
      expect(delay2.getTime()).toBeGreaterThan(Date.now() + 1800); // ~2000ms + jitter
      expect(delay3.getTime()).toBeGreaterThan(Date.now() + 3600); // ~4000ms + jitter
    });

    it('should respect maximum delay', () => {
      const shortMaxConfig = { ...config, maxDelayMs: 1500 };
      const delay = (errorHandlingService as any).calculateRetryDelay(5, shortMaxConfig);
      
      expect(delay.getTime()).toBeLessThan(Date.now() + 1700); // Max + jitter
    });
  });

  describe('getErrorStats', () => {
    beforeEach(() => {
      mockPrisma.processingError.count.mockResolvedValue(10);
      mockPrisma.processingError.groupBy.mockImplementation((params) => {
        if (params.by.includes('errorType')) {
          return Promise.resolve([
            { errorType: 'NETWORK_ERROR', _count: { id: 5 } },
            { errorType: 'TIMEOUT_ERROR', _count: { id: 3 } },
            { errorType: 'VALIDATION_ERROR', _count: { id: 2 } }
          ]);
        }
        if (params.by.includes('stage')) {
          return Promise.resolve([
            { stage: 'MARKDOWN_CONVERSION', _count: { id: 4 } },
            { stage: 'CHUNKER', _count: { id: 3 } },
            { stage: 'INGESTOR', _count: { id: 3 } }
          ]);
        }
        return Promise.resolve([]);
      });
    });

    it('should return comprehensive error statistics', async () => {
      mockPrisma.processingError.count
        .mockResolvedValueOnce(10) // totalErrors
        .mockResolvedValueOnce(7); // retryableErrors

      const stats = await errorHandlingService.getErrorStats();

      expect(stats.totalErrors).toBe(10);
      expect(stats.retryableErrors).toBe(7);
      expect(stats.nonRetryableErrors).toBe(3);
      expect(stats.errorsByType).toHaveLength(3);
      expect(stats.errorsByStage).toHaveLength(3);
      expect(stats.errorsByType[0]).toEqual({ type: 'NETWORK_ERROR', count: 5 });
    });

    it('should filter by time range when provided', async () => {
      const timeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31')
      };

      await errorHandlingService.getErrorStats(timeRange);

      expect(mockPrisma.processingError.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: timeRange.from,
            lte: timeRange.to
          }
        }
      });
    });
  });

  describe('getDocumentErrors', () => {
    it('should retrieve document errors with limit', async () => {
      const mockErrors = [
        { id: 'error-1', documentId: 'doc-1', stage: 'CHUNKER', errorMessage: 'Error 1' },
        { id: 'error-2', documentId: 'doc-1', stage: 'INGESTOR', errorMessage: 'Error 2' }
      ];
      mockPrisma.processingError.findMany.mockResolvedValue(mockErrors);

      const result = await errorHandlingService.getDocumentErrors('doc-1', 5);

      expect(result).toEqual(mockErrors);
      expect(mockPrisma.processingError.findMany).toHaveBeenCalledWith({
        where: { documentId: 'doc-1' },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
    });
  });

  describe('resolveError', () => {
    it('should mark error as resolved', async () => {
      await errorHandlingService.resolveError('error-1');

      expect(mockPrisma.processingError.update).toHaveBeenCalledWith({
        where: { id: 'error-1' },
        data: {
          resolvedAt: expect.any(Date)
        }
      });
    });
  });

  describe('cleanupOldErrors', () => {
    it('should clean up old resolved errors', async () => {
      mockPrisma.processingError.deleteMany.mockResolvedValue({ count: 15 });

      const result = await errorHandlingService.cleanupOldErrors(30);

      expect(result).toBe(15);
      expect(mockPrisma.processingError.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date)
          },
          resolvedAt: {
            not: null
          }
        }
      });
    });
  });

  describe('updateStageRetryConfig', () => {
    it('should update retry configuration for a stage', () => {
      const newConfig = {
        maxRetries: 5,
        baseDelayMs: 60000
      };

      errorHandlingService.updateStageRetryConfig('CHUNKER', newConfig);
      const updatedConfig = errorHandlingService.getStageRetryConfig('CHUNKER');

      expect(updatedConfig.maxRetries).toBe(5);
      expect(updatedConfig.baseDelayMs).toBe(60000);
    });
  });
});