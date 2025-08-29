import { ProcessingStage, ProcessingMode, DocumentState, JobStatus } from '@prisma/client';
// Removed backgroundJobService import - using dynamic import
import { stageExecutionService } from './stageExecutionService';
import { unifiedFileService } from './unifiedFileService';
import { prisma } from '../database';

export interface ProcessingRequest {
  documentId: string;
  stage?: ProcessingStage;
  stages?: ProcessingStage[];
  mode?: ProcessingMode;
  priority?: number;
  force?: boolean;
}

export interface ProcessingResult {
  success: boolean;
  jobIds?: string[];
  message: string;
  error?: string;
}

export class DocumentProcessingService {
  /**
   * Start processing for a document
   */
  static async startProcessing(request: ProcessingRequest): Promise<ProcessingResult> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: request.documentId },
        include: {
          processingJobs: {
            where: {
              status: { in: [JobStatus.PENDING, JobStatus.PROCESSING] }
            }
          }
        }
      });

      if (!document) {
        return {
          success: false,
          message: 'Document not found',
          error: 'DOCUMENT_NOT_FOUND'
        };
      }

      // Check if document is already being processed
      if (document.processingJobs.length > 0 && !request.force) {
        return {
          success: false,
          message: 'Document is already being processed',
          error: 'ALREADY_PROCESSING'
        };
      }

      const jobIds: string[] = [];

      if (request.stage) {
        // Process single stage
        const { jobManager } = await import('./jobs');
        const job = await jobManager.createJob({
          documentId: request.documentId,
          stage: request.stage,
          priority: request.priority || 0,
          scheduledAt: new Date()
        });
        jobIds.push(job.id);
      } else if (request.stages && request.stages.length > 0) {
        // Process multiple stages
        const { jobManager } = await import('./jobs');
        for (const stage of request.stages) {
          const job = await jobManager.createJob({
            documentId: request.documentId,
            stage,
            priority: request.priority || 0,
          });
          jobIds.push(job.id);
        }
      } else {
        // Start full processing pipeline
        const nextStage = this.getNextStage(document.state);
        if (nextStage) {
          const { jobManager } = await import('./jobs');
          const job = await jobManager.createJob({
            documentId: request.documentId,
            stage: nextStage,
            priority: request.priority || 0,
            scheduledAt: new Date()
          });
          jobIds.push(job.id);
        }
      }

      // Update processing mode if specified
      if (request.mode) {
        await prisma.document.update({
          where: { id: request.documentId },
          data: { processingMode: request.mode }
        });
      }

      return {
        success: true,
        jobIds,
        message: `Started processing with ${jobIds.length} job(s)`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to start processing',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the next stage to process based on document state
   */
  private static getNextStage(state: DocumentState): ProcessingStage | null {
    switch (state) {
      case DocumentState.PENDING:
        return ProcessingStage.MARKDOWN_CONVERSION;
      case DocumentState.INGESTING:
        // This would need more sophisticated logic to determine the actual next stage
        // For now, we'll assume CHUNKER is next
        return ProcessingStage.CHUNKER;
      default:
        return null;
    }
  }

  /**
   * Process a document through the complete pipeline
   */
  static async processDocumentPipeline(documentId: string, mode: ProcessingMode = 'AUTOMATIC'): Promise<ProcessingResult> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return {
          success: false,
          message: 'Document not found',
          error: 'DOCUMENT_NOT_FOUND'
        };
      }

      // Update document to processing mode
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingMode: mode,
          state: DocumentState.INGESTING
        }
      });

      // Create jobs for the complete pipeline
      const stages: ProcessingStage[] = [
        ProcessingStage.MARKDOWN_CONVERSION,
        ProcessingStage.MARKDOWN_OPTIMIZER,
        ProcessingStage.CHUNKER,
        ProcessingStage.FACT_GENERATOR,
        ProcessingStage.INGESTOR
      ];

      const jobIds: string[] = [];

      if (mode === 'AUTOMATIC') {
        // For automatic mode, only create the first job
        // Subsequent jobs will be created automatically as each stage completes
        const { jobOrchestrator } = await import('./jobs');
        const jobId = await jobOrchestrator.scheduleJobForDocument(documentId, stages[0]);
        const job = { id: jobId };
        jobIds.push(job.id);
      } else {
        // For manual mode, create all jobs but they won't auto-advance
        const { jobManager } = await import('./jobs');
        for (let i = 0; i < stages.length; i++) {
          const job = await jobManager.createJob({
            documentId,
            stage: stages[i],
            priority: 0,
            // Schedule later stages for the future so they don't run immediately
            scheduledAt: new Date(Date.now() + (i * 60000)) // 1 minute apart
          });
          jobIds.push(job.id);
        }
      }

      return {
        success: true,
        jobIds,
        message: `Started ${mode.toLowerCase()} processing pipeline with ${jobIds.length} job(s)`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to start processing pipeline',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Pause processing for a document
   */
  static async pauseProcessing(documentId: string): Promise<ProcessingResult> {
    try {
      // Cancel pending jobs
      const cancelledJobs = await prisma.processingJob.updateMany({
        where: {
          documentId,
          status: JobStatus.PENDING
        },
        data: {
          status: JobStatus.CANCELLED
        }
      });

      // Update document to indicate processing is paused
      await prisma.document.update({
        where: { id: documentId },
        data: {
          isProcessingPaused: true
        }
      });

      return {
        success: true,
        message: `Paused processing and cancelled ${cancelledJobs.count} pending job(s)`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to pause processing',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Resume processing for a document
   */
  static async resumeProcessing(documentId: string): Promise<ProcessingResult> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return {
          success: false,
          message: 'Document not found',
          error: 'DOCUMENT_NOT_FOUND'
        };
      }

      // Update document to indicate processing is not paused
      await prisma.document.update({
        where: { id: documentId },
        data: {
          isProcessingPaused: false
        }
      });

      // If in automatic mode, schedule the next stage
      if (document.processingMode === ProcessingMode.AUTOMATIC) {
        const nextStage = this.getNextStage(document.state);
        if (nextStage) {
          const { jobManager } = await import('./jobs');
          const job = await jobManager.createJob({
            documentId,
            stage: nextStage,
            priority: 0,
            scheduledAt: new Date()
          });

          return {
            success: true,
            jobIds: [job.id],
            message: 'Resumed processing and scheduled next stage'
          };
        }
      }

      return {
        success: true,
        message: 'Processing resumed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to resume processing',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get processing status for a document
   */
  static async getProcessingStatus(documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        processingJobs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        stageExecutions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return {
      documentId,
      state: document.state,
      processingMode: document.processingMode,
      isProcessingPaused: document.isProcessingPaused,
      currentStage: document.currentStage,
      stageStatus: document.stageStatus,
      lastStageError: document.lastStageError,
      jobs: document.processingJobs.map(job => ({
        id: job.id,
        stage: job.stage,
        status: job.status,
        priority: job.priority,
        scheduledAt: job.scheduledAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        errorMessage: job.errorMessage,
      })),
      executions: document.stageExecutions.map(execution => ({
        id: execution.id,
        stage: execution.stage,
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        errorMessage: execution.errorMessage,
        outputFiles: execution.outputFiles,
      })),
    };
  }

  /**
   * Retry failed processing
   */
  static async retryProcessing(documentId: string, stage?: ProcessingStage): Promise<ProcessingResult> {
    try {
      if (stage) {
        // Retry specific stage
        const { jobManager } = await import('./jobs');
        const job = await jobManager.createJob({
          documentId,
          stage,
          priority: 5, // Higher priority for retries
          scheduledAt: new Date()
        });

        return {
          success: true,
          jobIds: [job.id],
          message: `Retrying stage ${stage}`
        };
      } else {
        // Retry from the last failed stage
        const lastFailedJob = await prisma.processingJob.findFirst({
          where: {
            documentId,
            status: JobStatus.FAILED
          },
          orderBy: { createdAt: 'desc' }
        });

        if (lastFailedJob) {
          const { jobManager } = await import('./jobs');
          const job = await jobManager.createJob({
            documentId,
            stage: lastFailedJob.stage,
            priority: 5,
            scheduledAt: new Date()
          });

          return {
            success: true,
            jobIds: [job.id],
            message: `Retrying failed stage ${lastFailedJob.stage}`
          };
        } else {
          return {
            success: false,
            message: 'No failed stages found to retry',
            error: 'NO_FAILED_STAGES'
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retry processing',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
