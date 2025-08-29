import { jobManager } from './jobManager';
import { moragService } from '../moragService';
import { unifiedFileService } from '../unifiedFileService';
import { stageExecutionService } from '../stageExecutionService';
import { ProcessingMode } from '@prisma/client';

/**
 * Background worker responsible for polling job statuses from MoRAG backend
 */
export class StatusPoller {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the status poller
   */
  start(intervalMs: number = 15000): void {
    if (this.isRunning) {
      console.log('⚠️ [StatusPoller] Already running');
      return;
    }

    console.log(`🚀 [StatusPoller] Starting with ${intervalMs}ms interval`);
    this.isRunning = true;

    // Poll immediately
    this.pollStatuses().catch(error => {
      console.error('❌ [StatusPoller] Initial polling failed:', error);
    });

    // Schedule periodic polling
    this.intervalId = setInterval(async () => {
      try {
        await this.pollStatuses();
      } catch (error) {
        console.error('❌ [StatusPoller] Periodic polling failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop the status poller
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 [StatusPoller] Stopping');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if poller is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Poll job statuses from MoRAG backend
   */
  private async pollStatuses(): Promise<void> {
    try {
      const jobs = await jobManager.getProcessingJobs(10);

      if (jobs.length === 0) {
        return;
      }

      let updatedCount = 0;

      for (const job of jobs) {
        try {
          const updated = await this.pollJobStatus(job);
          if (updated) {
            updatedCount++;
          }
        } catch (error) {
          console.error(`❌ [StatusPoller] Failed to poll job ${job.id}:`, error);
        }
      }

      if (updatedCount > 0) {
        console.log(`📊 [StatusPoller] Updated ${updatedCount} job statuses`);
      }
    } catch (error) {
      console.error('❌ [StatusPoller] Failed to get processing jobs:', error);
    }
  }

  /**
   * Poll status for a single job
   */
  private async pollJobStatus(job: any): Promise<boolean> {
    const metadata = job.metadata ? JSON.parse(job.metadata) : {};
    const moragTaskId = metadata.moragTaskId;

    if (!moragTaskId) {
      return false; // Skip jobs without MoRAG task IDs
    }

    // Skip polling for immediate completions
    if (moragTaskId === 'IMMEDIATE_COMPLETION') {
      console.log(`⏭️ [StatusPoller] Skipping poll for immediate completion job ${job.id}`);

      // Mark the job as completed since it was processed immediately
      await jobManager.completeJob(job.id, {
        immediateCompletion: true,
        completedAt: new Date().toISOString()
      });
      return true; // Job was handled
    }

    try {
      // Get task status from MoRAG backend
      const taskStatus = await moragService.getTaskStatus(moragTaskId);

      if (taskStatus.status === 'completed') {
        await this.handleJobCompletion(job, taskStatus);
        return true;
      } else if (taskStatus.status === 'failed') {
        await jobManager.failJob(job.id, taskStatus.error?.message || 'Task failed on MoRAG backend');
        return true;
      } else if (taskStatus.status === 'in_progress') {
        // Update progress if available
        if (taskStatus.progress?.percentage !== undefined) {
          const updatedMetadata = {
            ...metadata,
            progress: taskStatus.progress.percentage,
            currentStep: taskStatus.progress.current_step,
          };
          await jobManager.updateJobMetadata(job.id, updatedMetadata);
        }
        return false;
      }

      return false;
    } catch (backendError) {
      console.warn(`⚠️ [StatusPoller] MoRAG backend unavailable for job ${job.id}, task ${moragTaskId}:`, backendError);

      // Check if this job has been stuck for too long (e.g., more than 30 minutes)
      const jobAge = Date.now() - new Date(job.createdAt).getTime();
      const maxJobAge = 30 * 60 * 1000; // 30 minutes

      if (jobAge > maxJobAge) {
        console.warn(`⏰ [StatusPoller] Job ${job.id} has been processing for ${Math.round(jobAge / 60000)} minutes, marking as failed due to backend unavailability`);
        await jobManager.failJob(job.id, 'MoRAG backend unavailable for extended period');
        return true;
      }

      return false;
    }
  }

  /**
   * Handle job completion by downloading files and updating status
   */
  private async handleJobCompletion(job: any, taskStatus: any): Promise<void> {
    const metadata = job.metadata ? JSON.parse(job.metadata) : {};
    const moragTaskId = metadata.moragTaskId;

    try {
      // Try to download files
      const filesResult = await this.downloadJobFiles(job, moragTaskId);

      // Complete the job
      await jobManager.completeJob(job.id, {
        ...metadata,
        taskResult: taskStatus.result,
        completedAt: new Date().toISOString(),
        downloadedFiles: filesResult.downloadedCount,
        downloadErrors: filesResult.errors
      });

      // Schedule next stage if this is automatic processing
      if (job.document.processingMode === ProcessingMode.AUTOMATIC) {
        await this.scheduleNextStage(job);
      }

      console.log(`✅ [StatusPoller] Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`❌ [StatusPoller] Failed to handle completion for job ${job.id}:`, error);
      await jobManager.failJob(job.id, `Completion handling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download files for a completed job
   */
  private async downloadJobFiles(job: any, moragTaskId: string): Promise<{
    downloadedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let downloadedCount = 0;

    try {
      // Get available files from MoRAG backend
      const filesResponse = await moragService.getTaskFiles(moragTaskId);
      const availableFiles = filesResponse.files || [];

      console.log(`📁 [StatusPoller] Downloading ${availableFiles.length} files for job ${job.id}`);

      // Check if files have already been downloaded to prevent duplicates
      const existingFiles = await unifiedFileService.getFilesByDocument(job.documentId, undefined, job.stage);
      const existingFilenames = existingFiles.map(f => f.filename);

      const filesToDownload = availableFiles.filter(file => !existingFilenames.includes(file.filename));

      if (filesToDownload.length === 0) {
        console.log(`📁 [StatusPoller] All ${availableFiles.length} files already downloaded for job ${job.id}`);
        return { downloadedCount: availableFiles.length, errors: [] };
      }

      // Download each file
      for (const file of filesToDownload) {
        try {
          const fileContent = await moragService.downloadFile(moragTaskId, file.filename);

          await unifiedFileService.storeFile({
            documentId: job.documentId,
            fileType: 'STAGE_OUTPUT',
            stage: job.stage,
            filename: file.filename,
            originalName: file.filename,
            content: fileContent,
            contentType: file.content_type || 'application/octet-stream',
            isPublic: false,
            accessLevel: 'REALM_MEMBERS',
            metadata: {
              moragTaskId,
              jobId: job.id,
              downloadedAt: new Date().toISOString(),
              fileSize: file.size,
            }
          });

          downloadedCount++;
          console.log(`📁 [StatusPoller] Downloaded file: ${file.filename}`);
        } catch (fileError) {
          const errorMsg = `Failed to download ${file.filename}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`❌ [StatusPoller] ${errorMsg}`);
        }
      }

      return { downloadedCount, errors };
    } catch (error) {
      const errorMsg = `Failed to get file list: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      return { downloadedCount, errors };
    }
  }

  /**
   * Schedule the next stage for automatic processing
   */
  private async scheduleNextStage(job: any): Promise<void> {
    try {
      const nextStage = await stageExecutionService.advanceToNextStage(job.documentId);
      if (nextStage) {
        await jobManager.createJob({
          documentId: job.documentId,
          stage: nextStage,
          priority: job.priority,
        });
        console.log(`📋 [StatusPoller] Scheduled next stage ${nextStage} for document ${job.documentId}`);
      }
    } catch (error) {
      console.error(`❌ [StatusPoller] Failed to schedule next stage for document ${job.documentId}:`, error);
    }
  }
}

export const statusPoller = new StatusPoller();
