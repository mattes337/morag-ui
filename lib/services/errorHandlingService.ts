import { JobStatus, ProcessingStage } from '@prisma/client';
import { prisma } from '../database';
// Removed backgroundJobService import - using dynamic import

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface ErrorContext {
  jobId: string;
  documentId: string;
  stage: string;
  attempt: number;
  error: Error;
  timestamp: Date;
}

export interface ProcessingError {
  id: string;
  jobId: string;
  documentId: string;
  stage: string;
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  attempt: number;
  isRetryable: boolean;
  retryAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
}

class ErrorHandlingService {
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 30000, // 30 seconds
    maxDelayMs: 300000, // 5 minutes
    backoffMultiplier: 2,
    retryableErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'TEMPORARY_SERVICE_UNAVAILABLE',
      'RATE_LIMIT_EXCEEDED',
      'CONNECTION_RESET',
      'INTERNAL_SERVER_ERROR'
    ]
  };

  private stageRetryConfigs: Record<string, Partial<RetryConfig>> = {
    'MARKDOWN_CONVERSION': {
      maxRetries: 2,
      baseDelayMs: 15000
    },
    'MARKDOWN_OPTIMIZER': {
      maxRetries: 3,
      baseDelayMs: 10000
    },
    'CHUNKER': {
      maxRetries: 2,
      baseDelayMs: 20000
    },
    'FACT_GENERATOR': {
      maxRetries: 3,
      baseDelayMs: 45000
    },
    'INGESTOR': {
      maxRetries: 2,
      baseDelayMs: 30000
    }
  };

  /**
   * Handle processing error and determine retry strategy
   * NOTE: Per requirements, no automatic retries - jobs should only be retried by user action
   */
  async handleProcessingError(context: ErrorContext): Promise<{
    shouldRetry: boolean;
    retryAt?: Date;
    errorRecord: ProcessingError;
  }> {
    const errorType = this.categorizeError(context.error);

    // Create error record - never retry automatically
    const errorRecord = await this.createErrorRecord({
      jobId: context.jobId,
      documentId: context.documentId,
      stage: context.stage,
      errorType,
      errorMessage: context.error.message,
      errorStack: context.error.stack,
      attempt: context.attempt,
      isRetryable: false, // Never automatically retryable
      retryAt: undefined // No automatic retry scheduling
    });

    // Always mark job as failed immediately - no automatic retries
    console.error(`Job ${context.jobId} failed on attempt ${context.attempt}. Error: ${context.error.message}`);
    await this.markJobAsFailed(context.jobId, errorRecord.id);

    return {
      shouldRetry: false, // Never automatically retry
      retryAt: undefined,
      errorRecord
    };
  }

  /**
   * Get retry configuration for a specific stage
   */
  private getRetryConfig(stage: string): RetryConfig {
    const stageConfig = this.stageRetryConfigs[stage] || {};
    return { ...this.defaultRetryConfig, ...stageConfig };
  }

  /**
   * Categorize error type based on error message and properties
   */
  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('network') || message.includes('connection')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('timeout') || name.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'RATE_LIMIT_EXCEEDED';
    }
    if (message.includes('service unavailable') || message.includes('502') || message.includes('503')) {
      return 'TEMPORARY_SERVICE_UNAVAILABLE';
    }
    if (message.includes('internal server error') || message.includes('500')) {
      return 'INTERNAL_SERVER_ERROR';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'PERMISSION_ERROR';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'RESOURCE_NOT_FOUND';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Check if error type is retryable
   */
  private isErrorRetryable(errorType: string, config: RetryConfig): boolean {
    return config.retryableErrors.includes(errorType);
  }

  /**
   * Calculate retry delay using exponential backoff
   */
  private calculateRetryDelay(attempt: number, config: RetryConfig): Date {
    const delay = Math.min(
      config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
      config.maxDelayMs
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    const finalDelay = delay + jitter;
    
    return new Date(Date.now() + finalDelay);
  }

  /**
   * Create error record in database
   */
  private async createErrorRecord(data: Omit<ProcessingError, 'id' | 'createdAt'>): Promise<ProcessingError> {
    const errorRecord = await prisma.processingError.create({
      data: {
        jobId: data.jobId,
        documentId: data.documentId,
        stage: data.stage as ProcessingStage,
        errorType: data.errorType,
        errorMessage: data.errorMessage,
        errorStack: data.errorStack,
        attempt: data.attempt,
        isRetryable: data.isRetryable,
        retryAt: data.retryAt
      }
    });

    return {
      id: errorRecord.id,
      jobId: errorRecord.jobId,
      documentId: errorRecord.documentId,
      stage: errorRecord.stage,
      errorType: errorRecord.errorType,
      errorMessage: errorRecord.errorMessage,
      errorStack: errorRecord.errorStack || undefined,
      attempt: errorRecord.attempt,
      isRetryable: errorRecord.isRetryable,
      retryAt: errorRecord.retryAt || undefined,
      resolvedAt: errorRecord.resolvedAt || undefined,
      createdAt: errorRecord.createdAt
    };
  }

  /**
   * Schedule retry for failed job
   */
  private async scheduleRetry(context: ErrorContext, retryAt: Date): Promise<void> {
    // Create new job for retry
    const { jobManager } = await import('./jobs');
    await jobManager.createJob({
      documentId: context.documentId,
      stage: context.stage as ProcessingStage,
      priority: 1, // Higher priority for retries
      scheduledAt: retryAt
    });

    // Update original job status
    await prisma.processingJob.update({
      where: { id: context.jobId },
      data: {
        status: 'FAILED' as JobStatus,
        completedAt: new Date(),
        errorMessage: `Failed on attempt ${context.attempt}. Retry scheduled for ${retryAt.toISOString()}`
      }
    });
  }

  /**
   * Mark job as permanently failed
   */
  private async markJobAsFailed(jobId: string, errorId: string): Promise<void> {
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED' as JobStatus,
        completedAt: new Date(),
        errorMessage: `Job failed permanently. Error ID: ${errorId}`
      }
    });
  }

  /**
   * Get error statistics
   */
  async getErrorStats(timeRange?: { from: Date; to: Date }) {
    const whereClause = timeRange ? {
      createdAt: {
        gte: timeRange.from,
        lte: timeRange.to
      }
    } : {};

    const [totalErrors, retryableErrors, errorsByType, errorsByStage] = await Promise.all([
      prisma.processingError.count({ where: whereClause }),
      prisma.processingError.count({
        where: { ...whereClause, isRetryable: true }
      }),
      prisma.processingError.groupBy({
        by: ['errorType'],
        where: whereClause,
        _count: { id: true }
      }),
      prisma.processingError.groupBy({
        by: ['stage'],
        where: whereClause,
        _count: { id: true }
      })
    ]);

    return {
      totalErrors,
      retryableErrors,
      nonRetryableErrors: totalErrors - retryableErrors,
      errorsByType: errorsByType.map(item => ({
        type: item.errorType,
        count: item._count.id
      })),
      errorsByStage: errorsByStage.map(item => ({
        stage: item.stage,
        count: item._count.id
      }))
    };
  }

  /**
   * Get recent errors for a document
   */
  async getDocumentErrors(documentId: string, limit = 10) {
    return await prisma.processingError.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Resolve error (mark as resolved)
   */
  async resolveError(errorId: string): Promise<void> {
    await prisma.processingError.update({
      where: { id: errorId },
      data: {
        resolvedAt: new Date()
      }
    });
  }

  /**
   * Clean up old error records
   */
  async cleanupOldErrors(olderThanDays = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.processingError.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        resolvedAt: {
          not: null
        }
      }
    });

    return result.count;
  }

  /**
   * Update retry configuration for a stage
   */
  updateStageRetryConfig(stage: string, config: Partial<RetryConfig>): void {
    this.stageRetryConfigs[stage] = {
      ...this.stageRetryConfigs[stage],
      ...config
    };
  }

  /**
   * Get current retry configuration
   */
  getStageRetryConfig(stage: string): RetryConfig {
    return this.getRetryConfig(stage);
  }
}

// Create singleton instance
export const errorHandlingService = new ErrorHandlingService();

export default errorHandlingService;