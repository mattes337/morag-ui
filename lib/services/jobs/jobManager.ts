import { prisma } from '../../database';
import { ProcessingStage, JobStatus, ProcessingMode } from '@prisma/client';

export interface ProcessingJobInput {
  documentId: string;
  stage: ProcessingStage;
  priority?: number;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface ProcessingJobOutput {
  id: string;
  documentId: string;
  stage: ProcessingStage;
  status: JobStatus;
  priority: number;
  scheduledAt: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Core job management service - handles CRUD operations for processing jobs
 */
export class JobManager {
  /**
   * Create a new processing job with deduplication and race condition protection
   */
  async createJob(input: ProcessingJobInput): Promise<ProcessingJobOutput> {
    console.log(`🔧 [JobManager] Creating job for document ${input.documentId}, stage ${input.stage}`);

    // Use a transaction to prevent race conditions
    return await prisma.$transaction(async (tx) => {
      try {
        // Check for existing jobs for the same document and stage within the transaction
        const existingJob = await tx.processingJob.findFirst({
          where: {
            documentId: input.documentId,
            stage: input.stage,
            status: {
              in: ['PENDING', 'WAITING_FOR_REMOTE_WORKER', 'PROCESSING']
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (existingJob) {
          console.log(`🔄 [JobManager] Job already exists for document ${input.documentId}, stage ${input.stage}: ${existingJob.id}`);
          return this.mapToOutput(existingJob);
        }

        // Create the job within the transaction
        const job = await tx.processingJob.create({
          data: {
            documentId: input.documentId,
            stage: input.stage,
            priority: input.priority || 0,
            scheduledAt: input.scheduledAt || new Date(),
            metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          },
        });

        console.log(`✅ [JobManager] Job created successfully: ${job.id}`);
        return this.mapToOutput(job);
      } catch (error) {
        console.error(`❌ [JobManager] Failed to create job in transaction:`, error);
        throw error;
      }
    }, {
      // Set transaction timeout and isolation level for better race condition protection
      timeout: 10000, // 10 seconds
      isolationLevel: 'ReadCommitted'
    });
  }

  /**
   * Get pending jobs ready for processing
   */
  async getPendingJobs(batchSize: number = 5): Promise<any[]> {
    return await prisma.processingJob.findMany({
      where: {
        status: JobStatus.PENDING,
        scheduledAt: {
          lte: new Date(),
        },
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' },
      ],
      take: batchSize,
      include: {
        document: true,
      },
    });
  }

  /**
   * Get processing jobs for status polling
   */
  async getProcessingJobs(batchSize: number = 10): Promise<any[]> {
    return await prisma.processingJob.findMany({
      where: {
        status: JobStatus.PROCESSING,
        metadata: {
          not: null,
        },
      },
      take: batchSize,
      include: {
        document: true,
      },
    });
  }

  /**
   * Mark a job as processing
   */
  async markJobAsProcessing(jobId: string): Promise<boolean> {
    const result = await prisma.processingJob.updateMany({
      where: {
        id: jobId,
        status: JobStatus.PENDING  // Only update if still pending
      },
      data: {
        status: JobStatus.PROCESSING,
        startedAt: new Date()
      }
    });

    return result.count > 0;
  }

  /**
   * Mark a job as completed
   */
  async completeJob(jobId: string, metadata?: Record<string, any>): Promise<void> {
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FINISHED,
        completedAt: new Date(),
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  }

  /**
   * Mark a job as failed
   */
  async failJob(jobId: string, errorMessage: string): Promise<void> {
    const job = await prisma.processingJob.findUnique({
      where: { id: jobId },
    });

    if (!job) return;

    const shouldRetry = job.retryCount < job.maxRetries;

    if (shouldRetry) {
      // Retry the job
      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.PENDING,
          retryCount: job.retryCount + 1,
          errorMessage,
          scheduledAt: new Date(Date.now() + (job.retryCount + 1) * 60000), // Exponential backoff
        },
      });
    } else {
      // Mark as permanently failed
      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          errorMessage,
          completedAt: new Date(),
        },
      });
    }
  }

  /**
   * Update job metadata (for progress tracking)
   */
  async updateJobMetadata(jobId: string, metadata: Record<string, any>): Promise<void> {
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        metadata: JSON.stringify(metadata),
      },
    });
  }

  /**
   * Clean up old completed jobs
   */
  async cleanupCompletedJobs(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.processingJob.deleteMany({
      where: {
        status: {
          in: [JobStatus.FINISHED, JobStatus.FAILED],
        },
        completedAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Map database job to output format
   */
  private mapToOutput(job: any): ProcessingJobOutput {
    return {
      id: job.id,
      documentId: job.documentId,
      stage: job.stage,
      status: job.status,
      priority: job.priority,
      scheduledAt: job.scheduledAt,
      createdAt: job.createdAt,
      metadata: job.metadata ? JSON.parse(job.metadata) : undefined,
    };
  }
}

export const jobManager = new JobManager();
