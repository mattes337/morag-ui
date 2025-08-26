import { ProcessingStage, JobStatus, ProcessingMode, StageStatus, DocumentState } from '@prisma/client';
import { prisma } from '../database';
import { stageExecutionService } from './stageExecutionService';
import { moragService } from './moragService';
import { unifiedFileService } from './unifiedFileService';

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
  private isPolling = false;
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
    this.processingInterval = setInterval(async () => {
      // Run job processing, status polling, and cleanup in parallel
      // Use Promise.allSettled to ensure one error doesn't stop the others
      const results = await Promise.allSettled([
        this.processNextJobs(),
        this.pollJobStatuses(),
        this.cleanupCompletedJobs()
      ]);

      // Log any errors but don't stop the processor
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operations = ['job processing', 'status polling', 'cleanup'];
          console.error(`Error in background ${operations[index]}:`, result.reason);
        }
      });
    }, intervalMs);

    // Process immediately on start
    Promise.allSettled([
      this.processNextJobs(),
      this.pollJobStatuses(),
      this.cleanupCompletedJobs()
    ]).then(results => {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operations = ['initial job processing', 'initial status polling', 'initial cleanup'];
          console.error(`Error in ${operations[index]}:`, result.reason);
        }
      });
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
    console.log(`🔧 [BackgroundJobService] Creating job for document ${input.documentId}, stage ${input.stage}`);

    try {
      const job = await prisma.processingJob.create({
        data: {
          documentId: input.documentId,
          stage: input.stage,
          priority: input.priority || 0,
          scheduledAt: input.scheduledAt || new Date(),
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });

      console.log(`✅ [BackgroundJobService] Job created successfully: ${job.id}`);
      return this.mapToOutput(job);
    } catch (error) {
      console.error(`❌ [BackgroundJobService] Failed to create job:`, error);
      throw error;
    }
  }

  /**
   * Get a job by MoRAG task ID
   */
  async getJobByTaskId(taskId: string): Promise<any> {
    const jobs = await prisma.processingJob.findMany({
      where: {
        metadata: {
          contains: taskId,
        },
      },
      include: {
        document: true,
      },
    });

    // Find the job that actually has this task ID in its metadata
    for (const job of jobs) {
      try {
        const metadata = job.metadata ? JSON.parse(job.metadata) : {};
        if (metadata.moragTaskId === taskId) {
          return job;
        }
      } catch (error) {
        console.warn(`Failed to parse metadata for job ${job.id}:`, error);
      }
    }

    return null;
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

      // Only log if there are jobs to process
      if (jobs.length > 0) {
        console.log(`🔄 [BackgroundJobService] Processing ${jobs.length} pending jobs`);
      }

      // Process each job
      for (const job of jobs) {
        try {
          // Atomically claim the job by updating its status to PROCESSING
          // This prevents race conditions with immediate completions
          const updatedJob = await prisma.processingJob.updateMany({
            where: {
              id: job.id,
              status: JobStatus.PENDING  // Only update if still pending
            },
            data: {
              status: JobStatus.PROCESSING,
              startedAt: new Date()
            }
          });

          // If no rows were updated, the job was already claimed or completed
          if (updatedJob.count === 0) {
            console.log(`⏭️ [BackgroundJobService] Job ${job.id} was already claimed or completed, skipping`);
            skipped++;
            continue;
          }

          console.log(`Started processing job ${job.id} for document ${job.documentId}, stage ${job.stage}`);
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
   * Poll job statuses for pending jobs and download files when completed
   */
  async pollJobStatuses(batchSize: number = 10): Promise<{
    polled: number;
    updated: number;
    failed: number;
  }> {
    if (this.isPolling) {
      return { polled: 0, updated: 0, failed: 0 };
    }

    this.isPolling = true;
    let polled = 0;
    let updated = 0;
    let failed = 0;

    try {
      // Get processing jobs that have MoRAG task IDs
      const jobs = await prisma.processingJob.findMany({
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

      for (const job of jobs) {
        try {
          const metadata = job.metadata ? JSON.parse(job.metadata) : {};
          const moragTaskId = metadata.moragTaskId;

          if (!moragTaskId) {
            continue; // Skip jobs without MoRAG task IDs
          }

          polled++;

          // Get task status from MoRAG backend with timeout handling
          let taskStatus;
          try {
            taskStatus = await moragService.getTaskStatus(moragTaskId);
          } catch (backendError) {
            console.warn(`⚠️ [Polling] MoRAG backend unavailable for job ${job.id}, task ${moragTaskId}:`, backendError);

            // Check if this job has been stuck for too long (e.g., more than 30 minutes)
            const jobAge = Date.now() - new Date(job.createdAt).getTime();
            const maxJobAge = 30 * 60 * 1000; // 30 minutes

            if (jobAge > maxJobAge) {
              console.warn(`⏰ [Polling] Job ${job.id} has been processing for ${Math.round(jobAge / 60000)} minutes, marking as failed due to backend unavailability`);
              await this.failJob(job.id, 'MoRAG backend unavailable for extended period');
              updated++;
            }
            continue; // Skip this job for now
          }

          // Check if status has changed
          if (taskStatus.status === 'completed') {
            // Try to download files and complete the job properly
            try {
              // Test if we can access the files endpoint before proceeding
              await moragService.getTaskFiles(moragTaskId);

              // Download files and complete the job
              await this.handleJobCompletion(job, taskStatus);
              updated++;
              console.log(`✅ [Polling] Job ${job.id} completed with files downloaded`);
            } catch (filesError) {
              console.warn(`⚠️ [Polling] Cannot access files for completed job ${job.id}, task ${moragTaskId}. Marking as complete anyway:`, filesError);

              // Even if we can't download files, mark the job as complete
              // The webhook might have already processed the files, or files might not be critical
              await this.completeJob(job.id, {
                completed_at: new Date().toISOString(),
                note: 'Completed via polling - files endpoint unavailable'
              });
              updated++;
              console.log(`✅ [Polling] Job ${job.id} marked complete despite file access issues`);
            }
          } else if (taskStatus.status === 'failed') {
            // Mark job as failed
            await this.failJob(job.id, taskStatus.error?.message || 'Task failed on MoRAG backend');
            updated++;
          } else if (taskStatus.status === 'in_progress') {
            // Update progress if available
            if (taskStatus.progress?.percentage !== undefined) {
              await prisma.processingJob.update({
                where: { id: job.id },
                data: {
                  metadata: JSON.stringify({
                    ...metadata,
                    progress: taskStatus.progress.percentage,
                    currentStep: taskStatus.progress.current_step,
                  }),
                },
              });
            }
          }
        } catch (error) {
          console.error(`Error polling status for job ${job.id}:`, error);
          failed++;
        }
      }
    } finally {
      this.isPolling = false;
    }

    if (polled > 0) {
      console.log(`Status polling completed: ${polled} polled, ${updated} updated, ${failed} failed`);
    }

    return { polled, updated, failed };
  }

  /**
   * Clean up completed jobs by calling the MoRAG backend cleanup endpoint
   */
  async cleanupCompletedJobs(batchSize: number = 5): Promise<{
    processed: number;
    cleaned: number;
    failed: number;
  }> {
    let processed = 0;
    let cleaned = 0;
    let failed = 0;

    try {
      // Get completed jobs that haven't been cleaned up yet
      const jobs = await prisma.processingJob.findMany({
        where: {
          status: JobStatus.FINISHED,
          cleanedUp: false,
          // Only cleanup jobs that completed at least 1 hour ago to ensure files are no longer needed
          completedAt: {
            lt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          },
        },
        take: batchSize,
        orderBy: {
          completedAt: 'asc', // Clean up oldest jobs first
        },
      });

      for (const job of jobs) {
        try {
          processed++;
          const metadata = job.metadata ? JSON.parse(job.metadata) : {};
          const moragTaskId = metadata.moragTaskId;

          if (!moragTaskId) {
            // Mark as cleaned up even if no MoRAG task ID (nothing to clean)
            await prisma.processingJob.update({
              where: { id: job.id },
              data: {
                cleanedUp: true,
                cleanedUpAt: new Date(),
                cleanupStats: JSON.stringify({
                  reason: 'no_morag_task_id',
                  message: 'No MoRAG task ID found, nothing to clean up',
                }),
              },
            });
            cleaned++;
            continue;
          }

          // Call MoRAG backend to cleanup job files
          const cleanupResult = await moragService.cleanupJob(moragTaskId, false);

          // Update job with cleanup information
          await prisma.processingJob.update({
            where: { id: job.id },
            data: {
              cleanedUp: true,
              cleanedUpAt: new Date(),
              cleanupStats: JSON.stringify({
                filesDeleted: cleanupResult.files_deleted,
                directoriesRemoved: cleanupResult.directories_removed,
                totalSizeFreed: cleanupResult.total_size_freed,
                deletedFiles: cleanupResult.deleted_files,
                message: cleanupResult.message,
              }),
            },
          });

          cleaned++;
          console.log(`Cleaned up job ${job.id} (MoRAG task ${moragTaskId}): ${cleanupResult.files_deleted} files, ${cleanupResult.total_size_freed} bytes freed`);
        } catch (error) {
          failed++;
          console.error(`Failed to cleanup job ${job.id}:`, error);

          // If cleanup fails, mark it as attempted but failed so we don't keep retrying immediately
          try {
            await prisma.processingJob.update({
              where: { id: job.id },
              data: {
                cleanupStats: JSON.stringify({
                  error: error instanceof Error ? error.message : 'Unknown error',
                  attemptedAt: new Date().toISOString(),
                  retryAfter: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Retry after 24 hours
                }),
              },
            });
          } catch (updateError) {
            console.error(`Failed to update cleanup error for job ${job.id}:`, updateError);
          }
        }
      }
    } catch (error) {
      console.error('Error in cleanup process:', error);
    }

    if (processed > 0) {
      console.log(`Cleanup completed: ${processed} processed, ${cleaned} cleaned, ${failed} failed`);
    }

    return { processed, cleaned, failed };
  }

  /**
   * Handle job completion by downloading files and updating the job status
   */
  private async handleJobCompletion(job: any, taskStatus: any): Promise<void> {
    const metadata = job.metadata ? JSON.parse(job.metadata) : {};
    const moragTaskId = metadata.moragTaskId;

    try {
      // Get available files from MoRAG backend
      const filesResponse = await moragService.getTaskFiles(moragTaskId);
      const availableFiles = filesResponse.files || [];

      console.log(`Starting file download for job ${job.id}: ${availableFiles.length} files available`);

      // Import the unified file service
      const { unifiedFileService } = await import('./unifiedFileService');

      // Check if files have already been downloaded to prevent duplicates
      const existingFiles = await unifiedFileService.getFilesByDocument(job.documentId, undefined, job.stage);
      const existingFilenames = existingFiles.map(f => f.filename);

      // Filter out files that have already been downloaded
      const filesToDownload = availableFiles.filter((fileInfo: any) =>
        !existingFilenames.includes(fileInfo.filename)
      );

      if (filesToDownload.length === 0 && availableFiles.length > 0) {
        console.log(`All ${availableFiles.length} files already downloaded for job ${job.id}, marking as complete`);
        // All files already exist, mark job as complete
        await this.completeJob(job.id, {
          ...metadata,
          taskResult: taskStatus.result,
          completedAt: new Date().toISOString(),
          downloadedFiles: availableFiles.length,
          downloadedFilesList: existingFilenames,
          note: 'Files already existed, no download needed',
        });
        return;
      }

      // Track successful downloads
      const downloadedFiles: string[] = [];
      const failedFiles: string[] = [];

      // Download and store each file - collect all errors instead of continuing on failure
      for (const fileInfo of filesToDownload) {
        try {
          console.log(`Downloading file ${fileInfo.filename} for job ${job.id}...`);
          const fileContent = await moragService.downloadFile(moragTaskId, fileInfo.filename);

          // Determine file type based on stage and filename
          const fileType = this.determineFileType(job.stage, fileInfo.filename);

          // Store the downloaded file
          await unifiedFileService.storeFile({
            documentId: job.documentId,
            fileType,
            stage: job.stage,
            filename: fileInfo.filename,
            originalName: fileInfo.original_name || fileInfo.filename,
            content: fileContent,
            contentType: fileInfo.content_type || 'application/octet-stream',
            isPublic: false,
            accessLevel: 'REALM_MEMBERS',
            metadata: {
              downloadedFrom: 'morag-backend',
              taskId: moragTaskId,
              downloadedAt: new Date().toISOString(),
              fileSize: fileContent.length,
              ...fileInfo.metadata,
            },
          });

          downloadedFiles.push(fileInfo.filename);
          console.log(`Successfully downloaded and stored file ${fileInfo.filename} for job ${job.id}`);
        } catch (fileError) {
          failedFiles.push(fileInfo.filename);
          console.error(`Failed to download file ${fileInfo.filename} for job ${job.id}:`, fileError);
        }
      }

      // Only mark job as completed if ALL files were downloaded successfully
      if (failedFiles.length === 0) {
        // All files downloaded successfully - complete the job
        const totalDownloadedFiles = downloadedFiles.length + existingFilenames.length;
        await this.completeJob(job.id, {
          ...metadata,
          taskResult: taskStatus.result,
          completedAt: new Date().toISOString(),
          downloadedFiles: totalDownloadedFiles,
          newlyDownloadedFiles: downloadedFiles.length,
          existingFiles: existingFilenames.length,
          downloadedFilesList: [...existingFilenames, ...downloadedFiles],
        });

        console.log(`Job ${job.id} completed successfully with ${downloadedFiles.length} new files downloaded (${existingFilenames.length} already existed, ${totalDownloadedFiles} total)`);
      } else {
        // Some files failed to download - fail the job so it can be retried
        const errorMessage = `Failed to download ${failedFiles.length} of ${filesToDownload.length} new files: ${failedFiles.join(', ')}. Successfully downloaded: ${downloadedFiles.join(', ')}. Existing files: ${existingFilenames.length}`;
        await this.failJob(job.id, errorMessage);
        console.error(`Job ${job.id} failed due to file download errors: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`Failed to handle job completion for ${job.id}:`, error);
      await this.failJob(job.id, `Failed to retrieve files from backend: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determine file type based on processing stage and filename
   */
  private determineFileType(stage: ProcessingStage, filename: string): any {
    // Map stage to appropriate file type
    switch (stage) {
      case ProcessingStage.MARKDOWN_CONVERSION:
        if (filename.endsWith('.md') || filename.endsWith('.markdown')) {
          return 'STAGE_OUTPUT';
        }
        break;
      case ProcessingStage.MARKDOWN_OPTIMIZER:
        return 'STAGE_OUTPUT';
      case ProcessingStage.CHUNKER:
        return 'STAGE_OUTPUT';
      case ProcessingStage.FACT_GENERATOR:
        return 'STAGE_OUTPUT';
      case ProcessingStage.INGESTOR:
        return 'STAGE_OUTPUT';
      default:
        return 'STAGE_OUTPUT';
    }

    return 'STAGE_OUTPUT';
  }

  /**
   * Process a specific job
   */
  async processJob(jobId: string): Promise<void> {
    const job = await prisma.processingJob.findUnique({
      where: { id: jobId },
      include: { document: true },
    });

    if (!job) {
      console.log(`⚠️ [BackgroundJobService] Job ${jobId} not found`);
      return;
    }

    // Check if job is in a processable state
    // Note: The job should already be claimed as PROCESSING by the caller
    if (job.status !== JobStatus.PROCESSING && job.status !== JobStatus.PENDING) {
      console.log(`⚠️ [BackgroundJobService] Job ${jobId} is not in a processable state (status: ${job.status})`);
      return;
    }

    // Ensure job is marked as processing (in case it was still PENDING)
    if (job.status === JobStatus.PENDING) {
      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.PROCESSING,
          startedAt: new Date(),
        },
      });
    }

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
    console.log(`🚀 [BackgroundJobService] Calling MoRAG backend for job ${job.id}, execution ${executionId}`);
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/stages`;

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
      const originalFile = document.files?.[0];
      if (!originalFile) {
        throw new Error(`No original file found for document ${job.documentId}`);
      }

      // Determine what content to use based on the stage
      let documentContent = '';
      let contentSource = 'none';

      if (job.stage === 'MARKDOWN_CONVERSION') {
        // For markdown conversion, we need the original file content
        try {
          const fileWithContent = await unifiedFileService.getFile(originalFile.id, true);
          if (fileWithContent && fileWithContent.content) {
            documentContent = fileWithContent.content;
            contentSource = 'original_file';
          } else {
            throw new Error(`Failed to retrieve content for original file ${originalFile.id}`);
          }
        } catch (error) {
          console.error(`Failed to read original file ${originalFile.id}:`, error);
          throw new Error(`Failed to read original file for document ${job.documentId}`);
        }
      } else {
        // For other stages, use the markdown content from previous stages
        documentContent = document.markdown || '';
        contentSource = 'markdown_field';
      }

      console.log(`📄 [BackgroundJob] Content for ${job.stage}: ${contentSource} (${documentContent.length} chars)`);

      // Prepare the stage processing request
      const stageRequest = {
        documentId: job.documentId,
        stage: job.stage,
        executionId,
        document: {
          id: document.id,
          title: document.name,
          content: documentContent,
          filePath: originalFile?.filepath || '',
          realmId: document.realmId
        },
        webhookUrl,
        metadata: {
          jobId: job.id,
          documentName: document.name,
          realmId: document.realmId,
          originalFile: originalFile?.filepath,
          databaseServers: document.realm?.servers?.map((realmServer: any) => ({
            type: realmServer.server.type.toLowerCase(),
            host: realmServer.server.host,
            port: realmServer.server.port,
            username: realmServer.server.username,
            password: realmServer.server.password,
            apiKey: realmServer.server.apiKey,
            database: realmServer.server.database,
            collection: realmServer.server.collection,
          })) || []
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

      // Check if this is an immediate completion
      if (response.taskId === 'IMMEDIATE_COMPLETION' && response.immediateResult) {
        console.log(`✅ [MoRAG] Job ${job.id} completed immediately, processing result`);

        // Process the immediate result
        await this.handleImmediateCompletion(job, response.immediateResult);

        console.log(`✅ [MoRAG] Job ${job.id} immediate completion processed successfully`);
        return;
      }

      // Store the task ID for tracking (async processing)
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
   * Handle immediate completion of a MoRAG stage
   */
  private async handleImmediateCompletion(job: any, result: any): Promise<void> {
    try {
      console.log(`Processing immediate completion for job ${job.id}:`, {
        stage: result.stage_type,
        status: result.status,
        outputFiles: result.output_files?.length || 0
      });

      // Atomically update job to completed status
      // This handles race conditions with background job processor
      const updatedJob = await prisma.processingJob.updateMany({
        where: {
          id: job.id,
          status: {
            in: [JobStatus.PENDING, JobStatus.PROCESSING]  // Only update if not already finished
          }
        },
        data: {
          status: JobStatus.FINISHED,
          completedAt: new Date(),
          metadata: JSON.stringify({
            ...JSON.parse(job.metadata || '{}'),
            immediateCompletion: true,
            result: result,
            executionTime: result.metadata?.execution_time || 0,
            summary: `${result.stage_type} completed immediately`,
            percentage: 100
          })
        }
      });

      // If no rows were updated, the job was already completed by another process
      if (updatedJob.count === 0) {
        console.log(`⚠️ [BackgroundJobService] Job ${job.id} was already completed by another process`);
        return;
      }

      // Process output files if available
      if (result.output_files && result.output_files.length > 0) {
        console.log(`Processing ${result.output_files.length} output files for job ${job.id}`);

        // Download and store output files for immediate completions
        await this.downloadAndStoreOutputFiles(job.documentId, job.stage, result.output_files);
      }

      // Complete the stage execution record
      const latestExecution = await stageExecutionService.getLatestExecution(job.documentId, job.stage);
      if (latestExecution) {
        await stageExecutionService.completeExecution(
          latestExecution.id,
          result.output_files?.map((file: any) => file.file_path || file) || [],
          {
            immediateCompletion: true,
            executionTime: result.metadata?.execution_time || 0,
            ...result.metadata
          }
        );
        console.log(`✅ [MoRAG] Stage execution ${latestExecution.id} completed for immediate result`);
      }

      // Update document state based on stage completion
      await this.updateDocumentForStageCompletion(job, result);

      // Check if we should schedule the next stage for automatic processing
      const jobWithDocument = await prisma.processingJob.findUnique({
        where: { id: job.id },
        include: { document: true },
      });

      if (jobWithDocument?.document.processingMode === ProcessingMode.AUTOMATIC) {
        const nextStage = await stageExecutionService.advanceToNextStage(jobWithDocument.documentId);
        if (nextStage) {
          console.log(`📋 [MoRAG] Scheduling next stage ${nextStage} for document ${jobWithDocument.documentId}`);
          await this.createJob({
            documentId: jobWithDocument.documentId,
            stage: nextStage,
            priority: jobWithDocument.priority,
          });
        } else {
          console.log(`✅ [MoRAG] No next stage available for document ${jobWithDocument.documentId} - processing complete`);
        }
      }

      console.log(`✅ [MoRAG] Job ${job.id} immediate completion processed successfully`);

    } catch (error) {
      console.error(`Failed to handle immediate completion for job ${job.id}:`, error);
      await this.failJob(job.id, `Failed to process immediate completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update document state based on stage completion
   */
  private async updateDocumentForStageCompletion(job: any, result: any): Promise<void> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: job.documentId }
      });

      if (!document) {
        console.warn(`Document ${job.documentId} not found for job ${job.id}`);
        return;
      }

      const updateData: any = {};

      // Handle different stage types
      switch (result.stage_type) {
        case 'markdown-conversion':
          // Store all output files from this stage
          await this.storeStageOutputFiles(job, result);

          // Update document with markdown content if available
          if (result.output_files && result.output_files.length > 0) {
            // Extract markdown content from the first output file
            const markdownFile = result.output_files.find((file: any) =>
              file.content_type === 'text/markdown' || file.filename.endsWith('.md')
            );

            let markdownContent = null;

            if (markdownFile && markdownFile.content) {
              markdownContent = markdownFile.content;
              console.log(`Document ${job.documentId} markdown content stored (${markdownFile.content.length} characters)`);
            } else if (markdownFile && markdownFile.file_path) {
              // If content is not directly available, try to read from file path
              try {
                const fs = require('fs');
                if (fs.existsSync(markdownFile.file_path)) {
                  markdownContent = fs.readFileSync(markdownFile.file_path, 'utf-8');
                  console.log(`Document ${job.documentId} markdown content read from file (${markdownContent.length} characters)`);
                }
              } catch (fileError) {
                console.warn(`Could not read markdown file for document ${job.documentId}:`, fileError);
              }
            }

            // Fallback: If no content available and this is a markdown document, use original file
            if (!markdownContent) {
              try {
                const { unifiedFileService } = await import('./unifiedFileService');
                const originalFile = await unifiedFileService.getOriginalFile(job.documentId);

                if (originalFile && (originalFile.filename.endsWith('.md') || originalFile.filename.endsWith('.markdown'))) {
                  const fileWithContent = await unifiedFileService.getFile(originalFile.id, true);
                  if (fileWithContent && fileWithContent.content) {
                    markdownContent = fileWithContent.content.toString();
                    console.log(`Document ${job.documentId} using original markdown file as fallback (${markdownContent.length} characters)`);
                  }
                }
              } catch (fallbackError) {
                console.warn(`Could not use original file as fallback for document ${job.documentId}:`, fallbackError);
              }
            }

            if (markdownContent) {
              // Store markdown content in document
              updateData.markdown = markdownContent;
            }
          }

          // Update document state based on processing progress
          await this.updateDocumentStateBasedOnProgress(job.documentId);
          console.log(`Document ${job.documentId} markdown conversion completed`);
          break;

        case 'markdown-optimizer':
          // Store all output files from this stage
          await this.storeStageOutputFiles(job, result);
          // Update document state based on processing progress
          await this.updateDocumentStateBasedOnProgress(job.documentId);
          console.log(`Document ${job.documentId} markdown optimization completed`);
          break;

        case 'chunking':
          // Store all output files from this stage
          await this.storeStageOutputFiles(job, result);
          // Update document state based on processing progress
          await this.updateDocumentStateBasedOnProgress(job.documentId);
          console.log(`Document ${job.documentId} chunking completed`);
          break;

        case 'embedding':
          // Store all output files from this stage
          await this.storeStageOutputFiles(job, result);
          // Update document state based on processing progress
          await this.updateDocumentStateBasedOnProgress(job.documentId);
          console.log(`Document ${job.documentId} embedding completed`);
          break;

        case 'ingestor':
          // Store all output files from this stage
          await this.storeStageOutputFiles(job, result);
          // Update document state based on processing progress (should be INGESTED now)
          await this.updateDocumentStateBasedOnProgress(job.documentId);
          console.log(`Document ${job.documentId} ingestor stage completed`);
          break;

        default:
          console.log(`No specific document update for stage type: ${result.stage_type}`);
      }

      // Apply updates if any
      if (Object.keys(updateData).length > 0) {
        await prisma.document.update({
          where: { id: job.documentId },
          data: updateData
        });
      }

    } catch (error) {
      console.error(`Failed to update document for stage completion:`, error);
      // Don't throw - this is not critical for job completion
    }
  }

  /**
   * Store all output files from a stage completion
   */
  private async storeStageOutputFiles(job: any, result: any): Promise<void> {
    if (!result.output_files || result.output_files.length === 0) {
      console.log(`No output files to store for job ${job.id}`);
      return;
    }

    try {
      const { unifiedFileService } = await import('./unifiedFileService');
      const metadata = job.metadata ? JSON.parse(job.metadata) : {};
      const moragTaskId = metadata.moragTaskId;

      // Check if we have files with content in the webhook payload
      const filesWithContent = result.output_files.filter((file: any) => file.content);
      const filesWithoutContent = result.output_files.filter((file: any) => !file.content);

      // Store files that have content directly
      for (const outputFile of filesWithContent) {
        try {
          const safeFilename = this.generateSafeFilename(outputFile.filename, job.stage);

          await unifiedFileService.storeFile({
            documentId: job.documentId,
            fileType: 'STAGE_OUTPUT',
            stage: job.stage,
            filename: safeFilename,
            originalName: outputFile.filename,
            content: outputFile.content,
            contentType: outputFile.content_type || 'application/octet-stream',
            isPublic: false,
            accessLevel: 'REALM_MEMBERS',
            metadata: {
              stageType: result.stage_type,
              taskId: job.id,
              createdAt: new Date().toISOString(),
              originalFileInfo: outputFile,
              jobMetadata: metadata,
            },
          });

          console.log(`✅ Stored output file with content: ${safeFilename} for stage ${job.stage}`);
        } catch (fileError) {
          console.warn(`Failed to store output file ${outputFile.filename}:`, fileError);
        }
      }

      // For files without content, download them from MoRAG backend
      if (filesWithoutContent.length > 0 && moragTaskId) {
        console.log(`Downloading ${filesWithoutContent.length} files without content from MoRAG backend for job ${job.id}`);

        try {
          const { moragService } = await import('./moragService');

          for (const outputFile of filesWithoutContent) {
            try {
              console.log(`Downloading file ${outputFile.filename} for job ${job.id}...`);
              const fileContent = await moragService.downloadFile(moragTaskId, outputFile.filename);

              const safeFilename = this.generateSafeFilename(outputFile.filename, job.stage);

              await unifiedFileService.storeFile({
                documentId: job.documentId,
                fileType: 'STAGE_OUTPUT',
                stage: job.stage,
                filename: safeFilename,
                originalName: outputFile.filename,
                content: fileContent,
                contentType: outputFile.content_type || 'application/octet-stream',
                isPublic: false,
                accessLevel: 'REALM_MEMBERS',
                metadata: {
                  stageType: result.stage_type,
                  taskId: job.id,
                  createdAt: new Date().toISOString(),
                  originalFileInfo: outputFile,
                  jobMetadata: metadata,
                  downloadedFrom: 'morag-backend',
                },
              });

              console.log(`✅ Downloaded and stored output file: ${safeFilename} for stage ${job.stage}`);
            } catch (fileError) {
              console.warn(`Failed to download and store output file ${outputFile.filename}:`, fileError);
            }
          }
        } catch (downloadError) {
          console.error(`Failed to download files from MoRAG backend for job ${job.id}:`, downloadError);
        }
      } else if (filesWithoutContent.length > 0) {
        console.warn(`${filesWithoutContent.length} files without content found for job ${job.id}, but no MoRAG task ID available for download`);
      }

    } catch (error) {
      console.error(`Failed to store stage output files for job ${job.id}:`, error);
    }
  }

  /**
   * Generate a safe filename for database storage
   */
  private generateSafeFilename(originalFilename: string, stage: string): string {
    // Remove problematic characters and limit length
    const cleanName = originalFilename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 50);

    // Add stage prefix for clarity
    const stagePrefix = stage.toLowerCase().replace('_', '-');
    return `${stagePrefix}_${cleanName}`;
  }

  /**
   * Update document state based on processing progress
   */
  private async updateDocumentStateBasedOnProgress(documentId: string): Promise<void> {
    try {
      const { stageExecutionService } = await import('./stageExecutionService');
      const pipelineStatus = await stageExecutionService.getDocumentPipelineStatus(documentId);

      let newState: DocumentState = DocumentState.INGESTING; // Default to INGESTING

      // Determine state based on progress
      if (pipelineStatus.completedStages.length === 0) {
        newState = DocumentState.PENDING;
      } else if (pipelineStatus.completedStages.length === 5) {
        // All stages complete
        newState = DocumentState.INGESTED;
      } else {
        // Some stages complete, still processing
        newState = DocumentState.INGESTING;
      }

      // Also update currentStage and stageStatus to match the pipeline status
      const updateData: any = {
        state: newState,
        currentStage: pipelineStatus.currentStage,
        stageStatus: pipelineStatus.stageStatus
      };

      await prisma.document.update({
        where: { id: documentId },
        data: updateData
      });

      console.log(`Document ${documentId} state updated:`, {
        state: newState,
        currentStage: pipelineStatus.currentStage,
        stageStatus: pipelineStatus.stageStatus,
        completedStages: pipelineStatus.completedStages.length
      });
    } catch (error) {
      console.warn(`Could not update document state for ${documentId}:`, error);
      // Fallback to INGESTING state with current stage info if available
      try {
        const { stageExecutionService } = await import('./stageExecutionService');
        const pipelineStatus = await stageExecutionService.getDocumentPipelineStatus(documentId);
        await prisma.document.update({
          where: { id: documentId },
          data: {
            state: DocumentState.INGESTING,
            currentStage: pipelineStatus.currentStage,
            stageStatus: pipelineStatus.stageStatus
          }
        });
      } catch (fallbackError) {
        // Final fallback - just update state
        await prisma.document.update({
          where: { id: documentId },
          data: { state: DocumentState.INGESTING }
        });
      }
    }
  }

  /**
   * Download and store output files from MoRAG backend for immediate completions
   */
  private async downloadAndStoreOutputFiles(documentId: string, stage: ProcessingStage, outputFiles: any[]): Promise<void> {
    try {
      console.log(`📥 [BackgroundJobService] Downloading and storing ${outputFiles.length} output files for stage ${stage}`);

      for (const outputFile of outputFiles) {
        try {
          const filePath = outputFile.file_path || outputFile;
          console.log(`🔽 [BackgroundJobService] Downloading file: ${filePath}`);

          // Download file content from MoRAG backend
          const fileContent = await this.downloadFileFromMorag(filePath);

          if (fileContent) {
            // Extract filename from path
            const filename = filePath.split('/').pop() || filePath.split('\\').pop() || 'output_file';

            // Store file in database and on disk
            const storedFile = await unifiedFileService.storeFile({
              documentId,
              fileType: 'STAGE_OUTPUT',
              stage,
              filename,
              originalName: filename,
              content: Buffer.from(fileContent, 'utf-8'),
              contentType: this.getContentTypeFromFilename(filename),
              isPublic: false,
              accessLevel: 'REALM_MEMBERS',
              metadata: {
                sourceStage: stage,
                originalPath: filePath,
                downloadedAt: new Date().toISOString(),
                immediateCompletion: true,
              },
            });

            console.log(`✅ [BackgroundJobService] Stored file ${filename} for stage ${stage} (ID: ${storedFile.id})`);

            // For markdown conversion stage, also update document markdown field
            if (stage === ProcessingStage.MARKDOWN_CONVERSION && filename.endsWith('.md')) {
              await prisma.document.update({
                where: { id: documentId },
                data: {
                  markdown: fileContent,
                },
              });
              console.log(`✅ [BackgroundJobService] Updated document ${documentId} with markdown content (${fileContent.length} chars)`);
            }
          } else {
            console.warn(`⚠️ [BackgroundJobService] Could not download file: ${filePath}`);
          }
        } catch (fileError) {
          console.error(`❌ [BackgroundJobService] Error processing file ${outputFile}:`, fileError);
        }
      }
    } catch (error) {
      console.error(`❌ [BackgroundJobService] Error downloading and storing output files:`, error);
      throw error;
    }
  }

  /**
   * Download a file from MoRAG backend
   */
  private async downloadFileFromMorag(filePath: string): Promise<string | null> {
    try {
      const moragBaseUrl = process.env.MORAG_API_URL || 'http://localhost:8000';
      const moragApiKey = process.env.MORAG_API_KEY;

      // Use the correct URL format: /api/v1/files/download/{encoded_path}?inline=true
      const encodedPath = encodeURIComponent(filePath);
      const downloadUrl = `${moragBaseUrl}/api/v1/files/download/${encodedPath}?inline=true`;

      console.log(`🔽 [BackgroundJobService] Downloading from (FIXED URL): ${downloadUrl}`);

      const headers: Record<string, string> = {
        'Accept': 'text/plain, text/markdown, application/octet-stream',
      };

      if (moragApiKey) {
        headers['Authorization'] = `Bearer ${moragApiKey}`;
      }

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const content = await response.text();
        console.log(`✅ [BackgroundJobService] Downloaded file content (${content.length} chars)`);
        return content;
      } else {
        console.error(`❌ [BackgroundJobService] Download failed: ${response.status} ${response.statusText}`);

        // Try to get error details
        try {
          const errorText = await response.text();
          console.error(`❌ [BackgroundJobService] Error response: ${errorText}`);
        } catch (e) {
          // Ignore error reading response
        }

        return null;
      }

    } catch (error) {
      console.error(`❌ [BackgroundJobService] Error downloading file from MoRAG:`, error);
      return null;
    }
  }

  /**
   * Determine content type from filename
   */
  private getContentTypeFromFilename(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    switch (extension) {
      case 'md':
      case 'markdown':
        return 'text/markdown';
      case 'json':
        return 'application/json';
      case 'txt':
        return 'text/plain';
      case 'csv':
        return 'text/csv';
      case 'xml':
        return 'application/xml';
      case 'html':
        return 'text/html';
      default:
        return 'application/octet-stream';
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
   * Get jobs by status
   */
  async getJobsByStatus(status: JobStatus): Promise<ProcessingJobOutput[]> {
    const jobs = await prisma.processingJob.findMany({
      where: { status },
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