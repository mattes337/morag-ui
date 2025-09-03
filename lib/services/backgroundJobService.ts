import { prisma } from '../database';
import { ProcessingJob, JobStatus, ProcessingStage } from '@prisma/client';

export interface JobCreateInput {
  documentId: string;
  stage: ProcessingStage;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface JobUpdateInput {
  status?: JobStatus;
  metadata?: Record<string, any>;
  errorMessage?: string;
  retryCount?: number;
}

export interface JobStats {
  total: number;
  pending: number;
  processing: number;
  finished: number;
  failed: number;
  cancelled: number;
}

/**
 * Service for managing background processing jobs
 */
export class BackgroundJobService {
  /**
   * Create a new processing job
   */
  async createJob(input: JobCreateInput): Promise<ProcessingJob> {
    return prisma.processingJob.create({
      data: {
        documentId: input.documentId,
        stage: input.stage,
        priority: input.priority || 0,
        status: JobStatus.PENDING,
        scheduledAt: new Date(),
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        retryCount: 0,
        maxRetries: 3,
        cleanedUp: false
      }
    });
  }

  /**
   * Get a job by ID
   */
  async getJob(jobId: string): Promise<ProcessingJob | null> {
    return prisma.processingJob.findUnique({
      where: { id: jobId },
      include: {
        document: true
      }
    });
  }

  /**
   * Update a job
   */
  async updateJob(jobId: string, updates: JobUpdateInput): Promise<ProcessingJob> {
    const updateData: any = { ...updates };

    if (updates.metadata) {
      updateData.metadata = JSON.stringify(updates.metadata);
    }

    if (updates.status === JobStatus.PROCESSING && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }

    if (updates.status && ['FINISHED', 'FAILED', 'CANCELLED'].includes(updates.status) && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    return prisma.processingJob.update({
      where: { id: jobId },
      data: updateData
    });
  }

  /**
   * Get jobs for a document
   */
  async getJobsForDocument(documentId: string): Promise<ProcessingJob[]> {
    return prisma.processingJob.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get jobs by status
   */
  async getJobsByStatus(status: JobStatus): Promise<ProcessingJob[]> {
    return prisma.processingJob.findMany({
      where: { status },
      include: {
        document: true
      }
    });
  }

  /**
   * Get document jobs
   */
  async getDocumentJobs(documentId: string): Promise<ProcessingJob[]> {
    return this.getJobsForDocument(documentId);
  }

  /**
   * Get pending jobs
   */
  async getPendingJobs(limit?: number): Promise<ProcessingJob[]> {
    return prisma.processingJob.findMany({
      where: {
        status: JobStatus.PENDING,
        scheduledAt: {
          lte: new Date()
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit,
      include: {
        document: true
      }
    });
  }

  /**
   * Get running jobs
   */
  async getRunningJobs(): Promise<ProcessingJob[]> {
    return prisma.processingJob.findMany({
      where: {
        status: {
          in: [JobStatus.PROCESSING, JobStatus.WAITING_FOR_REMOTE_WORKER]
        }
      },
      include: {
        document: true
      }
    });
  }

  /**
   * Get job statistics
   */
  async getStats(): Promise<JobStats> {
    const stats = await prisma.processingJob.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const result: JobStats = {
      total: 0,
      pending: 0,
      processing: 0,
      finished: 0,
      failed: 0,
      cancelled: 0
    };

    for (const stat of stats) {
      result.total += stat._count.id;

      switch (stat.status) {
        case JobStatus.PENDING:
          result.pending = stat._count.id;
          break;
        case JobStatus.PROCESSING:
        case JobStatus.WAITING_FOR_REMOTE_WORKER:
          result.processing += stat._count.id;
          break;
        case JobStatus.FINISHED:
          result.finished = stat._count.id;
          break;
        case JobStatus.FAILED:
          result.failed = stat._count.id;
          break;
        case JobStatus.CANCELLED:
          result.cancelled = stat._count.id;
          break;
      }
    }

    return result;
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<ProcessingJob> {
    return this.updateJob(jobId, {
      status: JobStatus.CANCELLED,
      errorMessage: 'Job cancelled by user'
    });
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<ProcessingJob> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== JobStatus.FAILED) {
      throw new Error('Only failed jobs can be retried');
    }

    return this.updateJob(jobId, {
      status: JobStatus.PENDING,
      errorMessage: undefined,
      retryCount: (job.retryCount || 0) + 1
    });
  }

  /**
   * Mark job as processing
   */
  async startJob(jobId: string): Promise<ProcessingJob> {
    return this.updateJob(jobId, {
      status: JobStatus.PROCESSING
    });
  }

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string, metadata?: Record<string, any>): Promise<ProcessingJob> {
    return this.updateJob(jobId, {
      status: JobStatus.FINISHED,
      metadata
    });
  }

  /**
   * Mark job as failed
   */
  async failJob(jobId: string, errorMessage: string, metadata?: Record<string, any>): Promise<ProcessingJob> {
    return this.updateJob(jobId, {
      status: JobStatus.FAILED,
      errorMessage,
      metadata
    });
  }
}

export const backgroundJobService = new BackgroundJobService();