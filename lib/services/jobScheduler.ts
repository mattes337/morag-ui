import { backgroundJobService } from './backgroundJobService';
import { PrismaClient, ProcessingMode, DocumentState, JobStatus } from '@prisma/client';
import { errorHandlingService } from './errorHandlingService';

const prisma = new PrismaClient();

export interface SchedulerConfig {
  enabled: boolean;
  processingIntervalMs: number;
  maxConcurrentJobs: number;
  retryDelayMs: number;
  healthCheckIntervalMs: number;
}

export interface SchedulerStats {
  isRunning: boolean;
  totalJobsProcessed: number;
  pendingJobs: number;
  failedJobs: number;
  lastProcessedAt?: Date;
  uptime: number;
  averageProcessingTime: number;
}

class JobScheduler {
  private config: SchedulerConfig;
  private isRunning = false;
  private startTime?: Date;
  private stats = {
    totalJobsProcessed: 0,
    pendingJobs: 0,
    failedJobs: 0,
    lastProcessedAt: undefined as Date | undefined,
    processingTimes: [] as number[]
  };
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config?: Partial<SchedulerConfig>) {
    this.config = {
      enabled: true,
      processingIntervalMs: 30000, // 30 seconds
      maxConcurrentJobs: 5,
      retryDelayMs: 60000, // 1 minute
      healthCheckIntervalMs: 300000, // 5 minutes
      ...config
    };
  }

  /**
   * Start the job scheduler
   */
  async start(): Promise<{ success: boolean; error?: string }> {
    if (this.isRunning) {
      console.log('Job scheduler is already running');
      return { success: false, error: 'Scheduler is already running' };
    }

    if (!this.config.enabled) {
      console.log('Job scheduler is disabled');
      return { success: false, error: 'Scheduler is disabled' };
    }

    try {
      console.log('Starting job scheduler...');
      this.isRunning = true;
      this.startTime = new Date();

      // Start the background job processor
      await backgroundJobService.startProcessor(this.config.processingIntervalMs);

      // Start health check monitoring
      this.startHealthCheck();

      // Schedule automatic jobs for documents with AUTOMATIC processing mode
      await this.scheduleAutomaticProcessing();

      console.log(`Job scheduler started with ${this.config.processingIntervalMs}ms interval`);
      return { success: true };
    } catch (error) {
      this.isRunning = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to start job scheduler:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Stop the job scheduler
   */
  async stop(): Promise<{ success: boolean; error?: string }> {
    if (!this.isRunning) {
      console.log('Job scheduler is not running');
      return { success: false, error: 'Scheduler is not running' };
    }

    try {
      console.log('Stopping job scheduler...');
      this.isRunning = false;

      // Stop the background job processor
      await backgroundJobService.stopProcessor();

      // Stop health check monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = undefined;
      }

      console.log('Job scheduler stopped');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to stop job scheduler:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Restart the job scheduler
   */
  async restart(): Promise<{ success: boolean; error?: string }> {
    const stopResult = await this.stop();
    if (!stopResult.success && stopResult.error !== 'Scheduler is not running') {
      return stopResult;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    return await this.start();
  }

  /**
   * Schedule automatic processing for documents with AUTOMATIC mode
   */
  private async scheduleAutomaticProcessing(): Promise<void> {
    try {
      // Find documents with AUTOMATIC processing mode that need processing
      const documents = await prisma.document.findMany({
        where: {
          processingMode: ProcessingMode.AUTOMATIC,
          state: {
            in: [DocumentState.PENDING, DocumentState.INGESTING]
          }
        },
        include: {
          processingJobs: {
            where: {
              status: {
                in: ['PENDING', 'PROCESSING']
              }
            }
          }
        }
      });

      let scheduledCount = 0;
      for (const document of documents) {
        // Skip if there are already pending/processing jobs
        if (document.processingJobs.length > 0) {
          continue;
        }

        // Determine the next stage to process based on document state
        let nextStage;
        if (document.state === DocumentState.PENDING) {
          nextStage = 'MARKDOWN_CONVERSION';
        } else if (document.state === DocumentState.INGESTING) {
          // For ingesting documents, we need to check which stage to process next
          // This is a simplified logic - in practice, you'd check the current stage status
          nextStage = 'CHUNKER';
        }

        if (nextStage) {
          await backgroundJobService.createJob({
            documentId: document.id,
            stage: nextStage as any,
            priority: 0,
            scheduledAt: new Date()
          });
          scheduledCount++;
        }
      }

      if (scheduledCount > 0) {
        console.log(`Scheduled ${scheduledCount} automatic processing jobs`);
      }
    } catch (error) {
      console.error('Error scheduling automatic processing:', error);
    }
  }

  /**
   * Start health check monitoring
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, this.config.healthCheckIntervalMs);
  }

  /**
   * Perform health check and update statistics
   */
  private async performHealthCheck(): Promise<void> {
    try {
      // Update pending jobs count
      this.stats.pendingJobs = await backgroundJobService.getPendingJobsCount();

      // Update failed jobs count
      const failedJobs = await prisma.processingJob.count({
        where: {
          status: 'FAILED'
        }
      });
      this.stats.failedJobs = failedJobs;

      // Log health status
      console.log(`Job Scheduler Health Check - Pending: ${this.stats.pendingJobs}, Failed: ${this.stats.failedJobs}`);

      // Check for stuck jobs (processing for more than 30 minutes)
      const stuckJobs = await prisma.processingJob.findMany({
        where: {
          status: JobStatus.PROCESSING,
          startedAt: {
            lt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
          }
        },
        include: {
          document: true
        }
      });

      if (stuckJobs.length > 0) {
        console.warn(`Found ${stuckJobs.length} potentially stuck jobs, initiating recovery...`);
        await this.recoverStuckJobs(stuckJobs);
      }

      // Schedule new automatic jobs if needed
      await this.scheduleAutomaticProcessing();
    } catch (error) {
      console.error('Health check error:', error);
    }
  }

  /**
   * Get scheduler statistics
   */
  getStats(): SchedulerStats {
    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    const averageProcessingTime = this.stats.processingTimes.length > 0
      ? this.stats.processingTimes.reduce((a, b) => a + b, 0) / this.stats.processingTimes.length
      : 0;

    return {
      isRunning: this.isRunning,
      totalJobsProcessed: this.stats.totalJobsProcessed,
      pendingJobs: this.stats.pendingJobs,
      failedJobs: this.stats.failedJobs,
      lastProcessedAt: this.stats.lastProcessedAt,
      uptime,
      averageProcessingTime
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    const wasRunning = this.isRunning;
    
    this.config = { ...this.config, ...newConfig };
    
    if (wasRunning) {
      // Restart with new configuration
      this.restart().catch(error => {
        console.error('Error restarting scheduler with new config:', error);
      });
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SchedulerConfig {
    return { ...this.config };
  }

  /**
   * Manually trigger job processing
   */
  async triggerProcessing(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Job scheduler is not running');
    }

    console.log('Manually triggering job processing...');
    await backgroundJobService.processNextJobs(this.config.maxConcurrentJobs);
  }

  /**
   * Schedule a specific job for a document
   */
  async scheduleDocumentProcessing(
    documentId: string, 
    stage: string, 
    priority: number = 0,
    scheduledAt?: Date
  ): Promise<string> {
    const job = await backgroundJobService.createJob({
      documentId,
      stage: stage as any,
      priority,
      scheduledAt: scheduledAt || new Date()
    });

    console.log(`Scheduled job ${job.id} for document ${documentId}, stage ${stage}`);
    return job.id;
  }

  /**
   * Cancel all pending jobs for a document
   */
  async cancelDocumentJobs(documentId: string): Promise<number> {
    const jobs = await prisma.processingJob.findMany({
      where: {
        documentId,
        status: 'PENDING'
      }
    });

    let cancelledCount = 0;
    for (const job of jobs) {
      await backgroundJobService.cancelJob(job.id);
      cancelledCount++;
    }

    console.log(`Cancelled ${cancelledCount} jobs for document ${documentId}`);
    return cancelledCount;
  }

  /**
   * Get jobs for a specific document
   */
  async getDocumentJobs(documentId: string) {
    return backgroundJobService.getDocumentJobs(documentId);
  }

  /**
   * Pause processing for a document (set processing mode to MANUAL)
   */
  async pauseDocumentProcessing(documentId: string): Promise<void> {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        processingMode: ProcessingMode.MANUAL
      }
    });

    // Cancel any pending jobs
    await this.cancelDocumentJobs(documentId);
    
    console.log(`Paused processing for document ${documentId}`);
  }

  /**
   * Resume processing for a document (set processing mode to AUTOMATIC)
   */
  async resumeDocumentProcessing(documentId: string): Promise<void> {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        processingMode: ProcessingMode.AUTOMATIC
      }
    });

    // Schedule processing if needed
    await this.scheduleAutomaticProcessing();

    console.log(`Resumed processing for document ${documentId}`);
  }

  /**
   * Recover stuck jobs by analyzing their state and taking appropriate action
   */
  private async recoverStuckJobs(stuckJobs: any[]): Promise<void> {
    const recoveryActions = {
      cancelled: 0,
      retried: 0,
      failed: 0,
      errors: 0
    };

    for (const job of stuckJobs) {
      try {
        const stuckDuration = Date.now() - new Date(job.startedAt).getTime();
        const stuckHours = Math.floor(stuckDuration / (60 * 60 * 1000));

        console.log(`Recovering stuck job ${job.id} (${job.stage}) for document ${job.documentId}, stuck for ${stuckHours} hours`);

        // Determine recovery action based on how long the job has been stuck
        if (stuckHours >= 2) {
          // Jobs stuck for 2+ hours: Cancel and create error record
          await this.cancelStuckJob(job, `Job stuck for ${stuckHours} hours`);
          recoveryActions.cancelled++;

        } else if (stuckHours >= 1) {
          // Jobs stuck for 1-2 hours: Fail and retry if retries available
          if (job.retryCount < job.maxRetries) {
            await this.retryStuckJob(job, `Job stuck for ${stuckHours} hours, retrying`);
            recoveryActions.retried++;
          } else {
            await this.failStuckJob(job, `Job stuck for ${stuckHours} hours, max retries exceeded`);
            recoveryActions.failed++;
          }

        } else {
          // Jobs stuck for 30 minutes - 1 hour: Just retry once
          await this.retryStuckJob(job, `Job stuck for ${Math.floor(stuckDuration / (60 * 1000))} minutes, retrying`);
          recoveryActions.retried++;
        }

      } catch (error) {
        console.error(`Error recovering stuck job ${job.id}:`, error);
        recoveryActions.errors++;
      }
    }

    console.log(`Stuck job recovery completed:`, recoveryActions);
  }

  /**
   * Cancel a stuck job and create an error record
   */
  private async cancelStuckJob(job: any, reason: string): Promise<void> {
    // Update job status
    await prisma.processingJob.update({
      where: { id: job.id },
      data: {
        status: JobStatus.CANCELLED,
        completedAt: new Date(),
        errorMessage: reason
      }
    });

    // Create error record
    const timeoutError = new Error(reason);
    timeoutError.name = 'TIMEOUT';

    await errorHandlingService.handleProcessingError({
      jobId: job.id,
      documentId: job.documentId,
      stage: job.stage,
      attempt: job.retryCount + 1,
      error: timeoutError,
      timestamp: new Date()
    });

    // Reset document status
    await prisma.document.update({
      where: { id: job.documentId },
      data: {
        stageStatus: 'FAILED',
        lastStageError: reason
      }
    });

    console.log(`Cancelled stuck job ${job.id}: ${reason}`);
  }

  /**
   * Retry a stuck job
   */
  private async retryStuckJob(job: any, reason: string): Promise<void> {
    // Mark current job as failed
    await prisma.processingJob.update({
      where: { id: job.id },
      data: {
        status: JobStatus.FAILED,
        completedAt: new Date(),
        errorMessage: reason
      }
    });

    // Create new job for retry
    await backgroundJobService.createJob({
      documentId: job.documentId,
      stage: job.stage,
      priority: job.priority + 1, // Slightly higher priority for retries
      scheduledAt: new Date(Date.now() + 60000), // Retry in 1 minute
      metadata: {
        ...JSON.parse(job.metadata || '{}'),
        retryOf: job.id,
        stuckJobRecovery: true,
        originalStartTime: job.startedAt
      }
    });

    // Reset document status
    await prisma.document.update({
      where: { id: job.documentId },
      data: {
        stageStatus: 'PENDING',
        lastStageError: null
      }
    });

    console.log(`Retrying stuck job ${job.id}: ${reason}`);
  }

  /**
   * Mark a stuck job as permanently failed
   */
  private async failStuckJob(job: any, reason: string): Promise<void> {
    // Update job status
    await prisma.processingJob.update({
      where: { id: job.id },
      data: {
        status: JobStatus.FAILED,
        completedAt: new Date(),
        errorMessage: reason
      }
    });

    // Create error record
    const timeoutError = new Error(reason);
    timeoutError.name = 'TIMEOUT';

    await errorHandlingService.handleProcessingError({
      jobId: job.id,
      documentId: job.documentId,
      stage: job.stage,
      attempt: job.retryCount + 1,
      error: timeoutError,
      timestamp: new Date()
    });

    // Reset document status
    await prisma.document.update({
      where: { id: job.documentId },
      data: {
        stageStatus: 'FAILED',
        lastStageError: reason
      }
    });

    console.log(`Failed stuck job ${job.id}: ${reason}`);
  }
}

// Create singleton instance
export const jobScheduler = new JobScheduler();

// Auto-start the scheduler in production
if (process.env.NODE_ENV === 'production' && process.env.AUTO_START_SCHEDULER !== 'false') {
  jobScheduler.start().catch(error => {
    console.error('Failed to auto-start job scheduler:', error);
  });
}

export default jobScheduler;