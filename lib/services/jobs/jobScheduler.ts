import { prisma } from '../../database';
import { ProcessingMode, JobStatus, ProcessingStage } from '@prisma/client';
import { jobManager } from './jobManager';

/**
 * Background worker responsible for scheduling automatic processing jobs
 */
export class JobScheduler {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the job scheduler
   */
  start(intervalMs: number = 30000): void {
    if (this.isRunning) {
      console.log('⚠️ [JobScheduler] Already running');
      return;
    }

    console.log(`🚀 [JobScheduler] Starting with ${intervalMs}ms interval`);
    this.isRunning = true;

    // Schedule immediate run
    this.scheduleJobs().catch(error => {
      console.error('❌ [JobScheduler] Initial scheduling failed:', error);
    });

    // Schedule periodic runs
    this.intervalId = setInterval(async () => {
      try {
        await this.scheduleJobs();
      } catch (error) {
        console.error('❌ [JobScheduler] Periodic scheduling failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop the job scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 [JobScheduler] Stopping');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if scheduler is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Main scheduling logic - find documents that need jobs and create them
   */
  private async scheduleJobs(): Promise<void> {
    try {
      // Find documents with automatic processing mode that need processing
      const documents = await prisma.document.findMany({
        where: {
          processingMode: ProcessingMode.AUTOMATIC,
          isProcessingPaused: false,
          // Include documents that are not in final states
          state: {
            not: 'INGESTED'
          }
        },
        include: {
          processingJobs: {
            where: {
              status: {
                in: [JobStatus.PENDING, JobStatus.PROCESSING, JobStatus.WAITING_FOR_REMOTE_WORKER],
              },
            },
          },
        },
      });

      let scheduledCount = 0;

      for (const document of documents) {
        try {
          // Skip if there's already an active job for this document
          if (document.processingJobs.length > 0) {
            continue;
          }

          // Determine what stage this document needs based on job history
          const nextStage = await this.determineNextStageFromJobs(document.id);
          
          if (nextStage) {
            // Update document current stage to match what we're about to process
            await prisma.document.update({
              where: { id: document.id },
              data: {
                currentStage: nextStage,
                stageStatus: 'PENDING'
              }
            });

            // Create job metadata for URL-based documents
            let jobMetadata = {};
            if (document.type === 'youtube' || document.type === 'website') {
              console.log(`🔍 [JobScheduler] Looking for source URL for ${document.type} document ${document.id}`);
              // For URL-based documents, we need to find the source URL
              const sourceUrl = await this.findSourceUrlForDocument(document.id);
              if (!sourceUrl) {
                console.warn(`⚠️ [JobScheduler] No source URL found for ${document.type} document ${document.id}, skipping`);
                continue;
              }
              console.log(`✅ [JobScheduler] Found source URL for document ${document.id}: ${sourceUrl}`);
              jobMetadata = {
                sourceUrl,
                documentType: document.type,
                documentSubType: document.subType
              };
            }

            console.log(`📋 [JobScheduler] Creating job for document ${document.id}, stage ${nextStage} with metadata:`, jobMetadata);

            await jobManager.createJob({
              documentId: document.id,
              stage: nextStage,
              priority: 0,
              metadata: Object.keys(jobMetadata).length > 0 ? jobMetadata : undefined
            });

            scheduledCount++;
            console.log(`📋 [JobScheduler] Scheduled job for document ${document.id}, stage ${nextStage}`);
          }
        } catch (error) {
          console.error(`❌ [JobScheduler] Failed to schedule job for document ${document.id}:`, error);
        }
      }

      if (scheduledCount > 0) {
        console.log(`✅ [JobScheduler] Scheduled ${scheduledCount} new jobs`);
      }
    } catch (error) {
      console.error('❌ [JobScheduler] Failed to schedule jobs:', error);
    }
  }

  /**
   * Determine the next stage needed for a document based on completed jobs
   */
  private async determineNextStageFromJobs(documentId: string): Promise<ProcessingStage | null> {
    // Get all completed jobs for this document
    const completedJobs = await prisma.processingJob.findMany({
      where: {
        documentId,
        status: JobStatus.FINISHED
      },
      select: {
        stage: true
      }
    });

    const completedStages = completedJobs.map(job => job.stage);
    
    // Define the processing pipeline
    const allStages: ProcessingStage[] = [
      ProcessingStage.MARKDOWN_CONVERSION,
      ProcessingStage.MARKDOWN_OPTIMIZER,
      ProcessingStage.CHUNKER,
      ProcessingStage.FACT_GENERATOR,
      ProcessingStage.INGESTOR
    ];

    // Find the first stage that hasn't been completed
    for (const stage of allStages) {
      if (!completedStages.includes(stage)) {
        return stage;
      }
    }

    // All stages completed
    return null;
  }

  /**
   * Find the source URL for a document by checking various sources
   */
  private async findSourceUrlForDocument(documentId: string): Promise<string | null> {
    try {
      console.log(`🔍 [JobScheduler] Searching for source URL for document ${documentId}`);

      // First, check if there are any existing jobs with source URL metadata
      const existingJobs = await prisma.processingJob.findMany({
        where: {
          documentId,
          metadata: { not: null }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      console.log(`📋 [JobScheduler] Found ${existingJobs.length} jobs with metadata for document ${documentId}`);

      for (const job of existingJobs) {
        if (job.metadata) {
          try {
            const metadata = JSON.parse(job.metadata);
            console.log(`🔍 [JobScheduler] Checking job ${job.id} metadata:`, metadata);
            if (metadata.sourceUrl) {
              console.log(`📄 [JobScheduler] Found source URL in job ${job.id} metadata: ${metadata.sourceUrl}`);
              return metadata.sourceUrl;
            }
          } catch (error) {
            console.log(`⚠️ [JobScheduler] Failed to parse metadata for job ${job.id}:`, error);
            // Continue to next job if metadata parsing fails
          }
        }
      }

      // If no URL found in jobs, check document files
      const files = await prisma.documentFile.findMany({
        where: { documentId },
        orderBy: { createdAt: 'asc' },
        take: 10
      });

      console.log(`📁 [JobScheduler] Found ${files.length} files for document ${documentId}`);

      for (const file of files) {
        if (file.metadata) {
          try {
            const metadata = JSON.parse(file.metadata);
            console.log(`🔍 [JobScheduler] Checking file ${file.id} metadata:`, metadata);
            if (metadata.sourceUrl) {
              console.log(`📄 [JobScheduler] Found source URL in file ${file.id} metadata: ${metadata.sourceUrl}`);
              return metadata.sourceUrl;
            }
          } catch (error) {
            console.log(`⚠️ [JobScheduler] Failed to parse metadata for file ${file.id}:`, error);
            // Continue to next file if metadata parsing fails
          }
        }
      }

      console.log(`❌ [JobScheduler] No source URL found for document ${documentId} in jobs or files`);
      return null;
    } catch (error) {
      console.error(`❌ [JobScheduler] Failed to find source URL for document ${documentId}:`, error);
      return null;
    }
  }

  /**
   * Schedule a job for a specific document with metadata (used for initial document creation)
   */
  async scheduleJobForDocument(documentId: string, stage: ProcessingStage, metadata?: Record<string, any>): Promise<string> {
    const job = await jobManager.createJob({
      documentId,
      stage,
      priority: 0,
      metadata
    });

    console.log(`📋 [JobScheduler] Manually scheduled job ${job.id} for document ${documentId}, stage ${stage}`);
    return job.id;
  }
}

export const jobScheduler = new JobScheduler();
