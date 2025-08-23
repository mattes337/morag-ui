import { ProcessingStage, JobStatus, ProcessingMode, StageStatus } from '@prisma/client';
import { prisma } from '../database';
import { stageExecutionService } from './stageExecutionService';
import { moragService } from './moragService';

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
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

class BackgroundJobService {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Start the background job processor
   */
  startProcessor(intervalMs: number = 30000): void {
    if (this.processingInterval) {
      console.log('Background job processor is already running');
      return;
    }

    console.log(`Starting background job processor with ${intervalMs}ms interval`);
    this.processingInterval = setInterval(() => {
      this.processNextJobs().catch(error => {
        console.error('Error in background job processor:', error);
      });
    }, intervalMs);

    // Process immediately on start
    this.processNextJobs().catch(error => {
      console.error('Error in initial background job processing:', error);
    });
  }

  /**
   * Stop the background job processor
   */
  stopProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Background job processor stopped');
    }
  }

  /**
   * Check if the background job processor is running
   */
  isProcessorRunning(): boolean {
    return this.processingInterval !== null;
  }

  /**
   * Create a new processing job
   */
  async createJob(input: ProcessingJobInput): Promise<ProcessingJobOutput> {
    const job = await prisma.processingJob.create({
      data: {
        documentId: input.documentId,
        stage: input.stage,
        priority: input.priority || 0,
        scheduledAt: input.scheduledAt || new Date(),
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });

    return this.mapToOutput(job);
  }

  /**
   * Schedule jobs for documents with automatic processing mode
   */
  async scheduleAutomaticJobs(): Promise<void> {
    // Find documents with automatic processing mode that have pending stages
    const documents = await prisma.document.findMany({
      where: {
        processingMode: ProcessingMode.AUTOMATIC,
        isProcessingPaused: false,
        stageStatus: StageStatus.PENDING,
        currentStage: {
          not: null,
        },
      },
      include: {
        processingJobs: {
          where: {
            status: {
              in: [JobStatus.PENDING, JobStatus.PROCESSING],
            },
          },
        },
      },
    });

    for (const document of documents) {
      // Skip if there's already a pending or processing job for this document
      if (document.processingJobs.length > 0) {
        continue;
      }

      // Create a job for the current stage
      if (document.currentStage) {
        await this.createJob({
          documentId: document.id,
          stage: document.currentStage,
          priority: 0,
        });

        console.log(`Scheduled job for document ${document.id}, stage ${document.currentStage}`);
      }
    }
  }

  /**
   * Process jobs and return statistics
   */
  async processJobs(batchSize: number = 5): Promise<{
    processed: number;
    failed: number;
    skipped: number;
  }> {
    if (this.isProcessing) {
      return { processed: 0, failed: 0, skipped: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;
    let skipped = 0;

    try {
      // First, schedule any new automatic jobs
      await this.scheduleAutomaticJobs();

      // Get pending jobs ordered by priority and scheduled time
      const jobs = await prisma.processingJob.findMany({
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

      // Process each job
      for (const job of jobs) {
        try {
          await this.processJob(job.id);
          processed++;
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
          await this.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
          failed++;
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return { processed, failed, skipped };
  }

  /**
   * Process the next batch of jobs
   */
  async processNextJobs(batchSize: number = 5): Promise<void> {
    await this.processJobs(batchSize);
  }

  /**
   * Process a specific job
   */
  async processJob(jobId: string): Promise<void> {
    const job = await prisma.processingJob.findUnique({
      where: { id: jobId },
      include: { document: true },
    });

    if (!job || job.status !== JobStatus.PENDING) {
      return;
    }

    // Mark job as processing
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
      },
    });

    try {
      // Start the stage execution
      const execution = await stageExecutionService.startExecution({
        documentId: job.documentId,
        stage: job.stage,
        metadata: job.metadata ? JSON.parse(job.metadata) : undefined,
      });

      // Call the MoRAG backend to process the stage
      await this.callMoragBackend(job, execution.id);

      console.log(`Started processing job ${jobId} for document ${job.documentId}, stage ${job.stage}`);
    } catch (error) {
      console.error(`Failed to start processing job ${jobId}:`, error);
      await this.failJob(jobId, error instanceof Error ? error.message : 'Failed to start processing');
    }
  }

  /**
   * Call the MoRAG backend to process a stage
   */
  private async callMoragBackend(job: any, executionId: string): Promise<void> {
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/stages`;
    const webhookToken = process.env.WEBHOOK_AUTH_TOKEN || 'default-token';

    try {
      // Get document details for the request
      const document = await prisma.document.findUnique({
        where: { id: job.documentId },
        include: {
          realm: {
            include: {
              servers: {
                include: {
                  server: true
                }
              }
            }
          },
          files: {
            where: {
              fileType: 'ORIGINAL_DOCUMENT'
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });

      if (!document) {
        throw new Error(`Document ${job.documentId} not found`);
      }

      // Get the original file for processing
      const originalFile = document.files[0];
      if (!originalFile && job.stage === ProcessingStage.MARKDOWN_CONVERSION) {
        throw new Error(`No original file found for document ${job.documentId}`);
      }

      // Prepare the stage processing request
      const stageRequest = {
        documentId: job.documentId,
        stage: job.stage,
        executionId,
        document: {
          id: document.id,
          title: document.name,
          content: document.markdown || '',
          filePath: originalFile?.filepath || '',
          realmId: document.realmId
        },
        webhookUrl,
        metadata: {
          jobId: job.id,
          documentName: document.name,
          realmId: document.realmId,
          originalFile: originalFile?.filepath,
          databaseServers: document.realm.servers.map(realmServer => ({
            type: realmServer.server.type.toLowerCase(),
            host: realmServer.server.host,
            port: realmServer.server.port,
            username: realmServer.server.username,
            password: realmServer.server.password,
            apiKey: realmServer.server.apiKey,
            database: realmServer.server.database,
            collection: realmServer.server.collection,
          }))
        }
      };

      console.log(`Calling MoRAG backend for job ${job.id}, stage ${job.stage}:`, {
        documentId: stageRequest.documentId,
        stage: stageRequest.stage,
        executionId: stageRequest.executionId
      });

      // Make the actual call to MoRAG backend
      const response = await moragService.processStage(stageRequest);

      if (!response.success) {
        throw new Error(response.message || 'MoRAG processing failed');
      }

      console.log(`MoRAG backend call successful for job ${job.id}:`, {
        taskId: response.taskId,
        estimatedTime: response.estimatedTimeSeconds,
        statusUrl: response.statusUrl
      });

      // Store the task ID for tracking
      await prisma.processingJob.update({
        where: { id: job.id },
        data: {
          metadata: JSON.stringify({
            ...JSON.parse(job.metadata || '{}'),
            moragTaskId: response.taskId,
            estimatedTime: response.estimatedTimeSeconds,
            statusUrl: response.statusUrl,
            executionId: response.executionId
          })
        }
      });

    } catch (error) {
      console.error(`MoRAG backend call failed for job ${job.id}:`, error);
      throw error;
    }
  }

  /**
   * Get the processing mode for a stage
   */
  private getProcessingMode(stage: ProcessingStage): 'convert' | 'process' | 'ingest' {
    switch (stage) {
      case ProcessingStage.MARKDOWN_CONVERSION:
        return 'convert';
      case ProcessingStage.MARKDOWN_OPTIMIZER:
      case ProcessingStage.CHUNKER:
      case ProcessingStage.FACT_GENERATOR:
        return 'process';
      case ProcessingStage.INGESTOR:
        return 'ingest';
      default:
        return 'process';
    }
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

    // Check if we should schedule the next stage
    const job = await prisma.processingJob.findUnique({
      where: { id: jobId },
      include: { document: true },
    });

    if (job?.document.processingMode === ProcessingMode.AUTOMATIC) {
      const nextStage = await stageExecutionService.advanceToNextStage(job.documentId);
      if (nextStage) {
        await this.createJob({
          documentId: job.documentId,
          stage: nextStage,
          priority: job.priority,
        });
      }
    }
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
          completedAt: new Date(),
          errorMessage,
        },
      });
    }
  }

  /**
   * Get all jobs for a document
   */
  async getDocumentJobs(documentId: string): Promise<ProcessingJobOutput[]> {
    const jobs = await prisma.processingJob.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map(job => this.mapToOutput(job));
  }

  /**
   * Get pending jobs count
   */
  async getPendingJobsCount(): Promise<number> {
    return prisma.processingJob.count({
      where: {
        status: JobStatus.PENDING,
        scheduledAt: {
          lte: new Date(),
        },
      },
    });
  }

  /**
   * Get job statistics
   */
  async getStats(): Promise<{
    totalJobs: number;
    pendingJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
  }> {
    const [totalJobs, pendingJobs, runningJobs, completedJobs, failedJobs] = await Promise.all([
      prisma.processingJob.count(),
      prisma.processingJob.count({ where: { status: JobStatus.PENDING } }),
      prisma.processingJob.count({ where: { status: JobStatus.PROCESSING } }),
      prisma.processingJob.count({ where: { status: JobStatus.FINISHED } }),
      prisma.processingJob.count({ where: { status: JobStatus.FAILED } })
    ]);

    return {
      totalJobs,
      pendingJobs,
      runningJobs,
      completedJobs,
      failedJobs
    };
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.CANCELLED,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Map database model to output interface
   */
  private mapToOutput(job: any): ProcessingJobOutput {
    return {
      id: job.id,
      documentId: job.documentId,
      stage: job.stage,
      status: job.status,
      priority: job.priority,
      scheduledAt: job.scheduledAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      retryCount: job.retryCount,
      maxRetries: job.maxRetries,
      errorMessage: job.errorMessage,
      metadata: job.metadata ? JSON.parse(job.metadata) : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}

export const backgroundJobService = new BackgroundJobService();
export default backgroundJobService;