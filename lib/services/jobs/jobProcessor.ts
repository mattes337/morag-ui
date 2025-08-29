import { prisma } from '../../database';
import { jobManager } from './jobManager';
import { DocumentHandlerFactory } from './documentHandlers';
import { stageExecutionService } from '../stageExecutionService';

/**
 * Background worker responsible for processing pending jobs
 */
export class JobProcessor {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the job processor
   */
  start(intervalMs: number = 10000): void {
    if (this.isRunning) {
      console.log('⚠️ [JobProcessor] Already running');
      return;
    }

    console.log(`🚀 [JobProcessor] Starting with ${intervalMs}ms interval`);
    this.isRunning = true;

    // Process immediately
    this.processJobs().catch(error => {
      console.error('❌ [JobProcessor] Initial processing failed:', error);
    });

    // Schedule periodic processing
    this.intervalId = setInterval(async () => {
      try {
        await this.processJobs();
      } catch (error) {
        console.error('❌ [JobProcessor] Periodic processing failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop the job processor
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 [JobProcessor] Stopping');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if processor is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    try {
      const jobs = await jobManager.getPendingJobs(5);

      if (jobs.length === 0) {
        return;
      }

      console.log(`🔄 [JobProcessor] Processing ${jobs.length} pending jobs`);

      for (const job of jobs) {
        try {
          await this.processJob(job);
        } catch (error) {
          console.error(`❌ [JobProcessor] Failed to process job ${job.id}:`, error);
          await jobManager.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } catch (error) {
      console.error('❌ [JobProcessor] Failed to get pending jobs:', error);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: any): Promise<void> {
    // Atomically claim the job
    const claimed = await jobManager.markJobAsProcessing(job.id);
    if (!claimed) {
      console.log(`⏭️ [JobProcessor] Job ${job.id} was already claimed, skipping`);
      return;
    }

    console.log(`🔧 [JobProcessor] Processing job ${job.id} for document ${job.documentId}, stage ${job.stage}`);

    try {
      // Get the document with all necessary includes
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

      // Start stage execution
      const execution = await stageExecutionService.startExecution({
        documentId: job.documentId,
        stage: job.stage,
        metadata: job.metadata ? JSON.parse(job.metadata) : {},
      });

      // Get the appropriate handler for this document type
      const handler = DocumentHandlerFactory.getHandler(document.type);

      // Process the document
      const result = await handler.processDocument({
        documentId: job.documentId,
        stage: job.stage,
        executionId: execution.id,
        document,
        job
      });

      if (result.success && result.taskId) {
        // Update job metadata with task ID for polling
        const updatedMetadata = {
          ...(job.metadata ? JSON.parse(job.metadata) : {}),
          moragTaskId: result.taskId,
          executionId: execution.id
        };

        await jobManager.updateJobMetadata(job.id, updatedMetadata);

        if (result.immediateCompletion) {
          // For immediate completions, mark the job as completed right away
          console.log(`✅ [JobProcessor] Job ${job.id} completed immediately`);
          await jobManager.completeJob(job.id, {
            ...updatedMetadata,
            immediateCompletion: true,
            completedAt: new Date().toISOString()
          });
        } else {
          // For async processing, job will be polled by status poller
          console.log(`✅ [JobProcessor] Job ${job.id} submitted to backend, task ID: ${result.taskId}`);
        }
      } else {
        throw new Error(result.error || 'Backend processing failed');
      }

    } catch (error) {
      console.error(`❌ [JobProcessor] Job ${job.id} processing failed:`, error);
      await jobManager.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export const jobProcessor = new JobProcessor();
