import { PrismaClient, ProcessingStage, StageStatus, StageExecution } from '@prisma/client';
import { moragService } from './moragService';
// Removed backgroundJobService import - using dynamic import in executeStageAsync

const prisma = new PrismaClient();

export interface StageExecutionInput {
  documentId: string;
  stage: ProcessingStage;
  inputFiles?: string[];
  metadata?: Record<string, any>;
}

export interface StageExecutionUpdate {
  status: StageStatus;
  completedAt?: Date;
  errorMessage?: string;
  outputFiles?: string[];
  metadata?: Record<string, any>;
}

export interface StageExecutionOutput {
  id: string;
  documentId: string;
  stage: ProcessingStage;
  status: StageStatus;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  inputFiles?: string[];
  outputFiles?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

class StageExecutionService {
  /**
   * Start a new stage execution
   */
  async startExecution(input: StageExecutionInput): Promise<StageExecutionOutput> {
    // Check if there's already a running execution for this document and stage
    const existingRunningExecution = await prisma.stageExecution.findFirst({
      where: {
        documentId: input.documentId,
        stage: input.stage,
        status: 'RUNNING',
      },
      orderBy: { startedAt: 'desc' },
    });

    if (existingRunningExecution) {
      console.log(`Stage ${input.stage} is already running for document ${input.documentId}, returning existing execution`);
      return this.mapToOutput(existingRunningExecution);
    }

    // Check if any stage is currently running for this document
    const anyRunningExecution = await prisma.stageExecution.findFirst({
      where: {
        documentId: input.documentId,
        status: 'RUNNING',
      },
      orderBy: { startedAt: 'desc' },
    });

    if (anyRunningExecution) {
      throw new Error(`Cannot start stage ${input.stage} - stage ${anyRunningExecution.stage} is already running for document ${input.documentId}`);
    }

    const execution = await prisma.stageExecution.create({
      data: {
        documentId: input.documentId,
        stage: input.stage,
        status: 'RUNNING',
        inputFiles: input.inputFiles ? JSON.stringify(input.inputFiles) : null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });

    // Update document's current stage and status
    await prisma.document.update({
      where: { id: input.documentId },
      data: {
        currentStage: input.stage,
        stageStatus: 'RUNNING',
        lastStageError: null,
      },
    });

    console.log(`Started new execution for stage ${input.stage} on document ${input.documentId}`);
    return this.mapToOutput(execution);
  }

  /**
   * Update an existing stage execution
   */
  async updateExecution(id: string, update: StageExecutionUpdate): Promise<StageExecutionOutput | null> {
    const execution = await prisma.stageExecution.findUnique({
      where: { id },
    });

    if (!execution) return null;

    const updatedExecution = await prisma.stageExecution.update({
      where: { id },
      data: {
        status: update.status,
        completedAt: update.completedAt || (update.status === 'COMPLETED' || update.status === 'FAILED' ? new Date() : undefined),
        errorMessage: update.errorMessage,
        outputFiles: update.outputFiles ? JSON.stringify(update.outputFiles) : undefined,
        metadata: update.metadata ? JSON.stringify(update.metadata) : undefined,
      },
    });

    // Update document's stage status and error message
    await prisma.document.update({
      where: { id: execution.documentId },
      data: {
        stageStatus: update.status,
        lastStageError: update.errorMessage,
      },
    });

    return this.mapToOutput(updatedExecution);
  }

  /**
   * Complete a stage execution successfully
   */
  async completeExecution(id: string, outputFiles?: string[], metadata?: Record<string, any>): Promise<StageExecutionOutput | null> {
    return this.updateExecution(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
      outputFiles,
      metadata,
    });
  }

  /**
   * Fail a stage execution
   */
  async failExecution(id: string, errorMessage: string, metadata?: Record<string, any>): Promise<StageExecutionOutput | null> {
    return this.updateExecution(id, {
      status: 'FAILED',
      completedAt: new Date(),
      errorMessage,
      metadata,
    });
  }

  /**
   * Get a stage execution by ID
   */
  async getExecution(id: string): Promise<StageExecutionOutput | null> {
    const execution = await prisma.stageExecution.findUnique({
      where: { id },
    });

    if (!execution) return null;

    return this.mapToOutput(execution);
  }

  /**
   * Get all executions for a document
   */
  async getDocumentExecutions(documentId: string, stage?: ProcessingStage): Promise<StageExecutionOutput[]> {
    const where: any = { documentId };
    if (stage) {
      where.stage = stage;
    }

    const executions = await prisma.stageExecution.findMany({
      where,
      orderBy: { startedAt: 'desc' },
    });

    return executions.map(execution => this.mapToOutput(execution));
  }

  /**
   * Get the latest execution for a document and stage
   */
  async getLatestExecution(documentId: string, stage: ProcessingStage): Promise<StageExecutionOutput | null> {
    const execution = await prisma.stageExecution.findFirst({
      where: {
        documentId,
        stage,
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!execution) return null;

    return this.mapToOutput(execution);
  }

  /**
   * Check if any stage is currently running for a document
   */
  async isAnyStageRunning(documentId: string): Promise<boolean> {
    const runningExecution = await prisma.stageExecution.findFirst({
      where: {
        documentId,
        status: 'RUNNING',
      },
    });

    return !!runningExecution;
  }

  /**
   * Get the currently running stage for a document
   */
  async getRunningStage(documentId: string): Promise<ProcessingStage | null> {
    const runningExecution = await prisma.stageExecution.findFirst({
      where: {
        documentId,
        status: 'RUNNING',
      },
      orderBy: { startedAt: 'desc' },
    });

    return runningExecution?.stage || null;
  }

  /**
   * Get current running executions
   */
  async getRunningExecutions(): Promise<StageExecutionOutput[]> {
    const executions = await prisma.stageExecution.findMany({
      where: {
        status: 'RUNNING',
      },
      orderBy: { startedAt: 'desc' },
    });

    return executions.map(execution => this.mapToOutput(execution));
  }

  /**
   * Get execution statistics for a document
   */
  async getDocumentExecutionStats(documentId: string): Promise<{
    total: number;
    completed: number;
    failed: number;
    running: number;
    pending: number;
    byStage: Record<ProcessingStage, { total: number; completed: number; failed: number; running: number; pending: number }>;
  }> {
    const executions = await prisma.stageExecution.findMany({
      where: { documentId },
      select: { stage: true, status: true },
    });

    const stats = {
      total: executions.length,
      completed: 0,
      failed: 0,
      running: 0,
      pending: 0,
      byStage: {} as Record<ProcessingStage, { total: number; completed: number; failed: number; running: number; pending: number }>,
    };

    // Initialize stage stats
    const stages: ProcessingStage[] = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
    stages.forEach(stage => {
      stats.byStage[stage] = { total: 0, completed: 0, failed: 0, running: 0, pending: 0 };
    });

    // Count executions by status and stage
    executions.forEach(execution => {
      const status = execution.status.toLowerCase() as 'completed' | 'failed' | 'running' | 'pending';
      stats[status]++;
      stats.byStage[execution.stage].total++;
      stats.byStage[execution.stage][status]++;
    });

    return stats;
  }

  /**
   * Get the processing pipeline status for a document
   */
  async getDocumentPipelineStatus(documentId: string): Promise<{
    currentStage: ProcessingStage | null;
    stageStatus: StageStatus;
    completedStages: ProcessingStage[];
    failedStages: ProcessingStage[];
    nextStage: ProcessingStage | null;
    progress: number; // 0-100
  }> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { currentStage: true, stageStatus: true },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const executions = await prisma.stageExecution.findMany({
      where: { documentId },
      select: { stage: true, status: true },
      orderBy: { startedAt: 'desc' },
    });

    const stages: ProcessingStage[] = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
    const completedStages: ProcessingStage[] = [];
    const failedStages: ProcessingStage[] = [];

    // Get the latest execution for each stage
    const latestExecutions = new Map<ProcessingStage, StageStatus>();
    executions.forEach(execution => {
      if (!latestExecutions.has(execution.stage)) {
        latestExecutions.set(execution.stage, execution.status);
      }
    });

    // Categorize stages
    stages.forEach(stage => {
      const status = latestExecutions.get(stage);
      if (status === 'COMPLETED') {
        completedStages.push(stage);
      } else if (status === 'FAILED') {
        failedStages.push(stage);
      }
    });

    // Calculate progress (completed stages / total stages * 100)
    const progress = Math.round((completedStages.length / stages.length) * 100);

    // Determine next stage
    let nextStage: ProcessingStage | null = null;
    if (document.currentStage) {
      const currentIndex = stages.indexOf(document.currentStage);

      if (document.stageStatus === 'PENDING' || document.stageStatus === 'FAILED') {
        // If current stage is pending or failed, it's the next stage to execute
        nextStage = document.currentStage;
      } else if (document.stageStatus === 'COMPLETED' && currentIndex >= 0 && currentIndex < stages.length - 1) {
        // If current stage is completed, move to the next stage
        nextStage = stages[currentIndex + 1];
      }
    } else {
      // If no current stage is set, start with the first stage
      nextStage = stages[0];
    }

    return {
      currentStage: document.currentStage,
      stageStatus: document.stageStatus,
      completedStages,
      failedStages,
      nextStage,
      progress,
    };
  }

  /**
   * Advance document to next stage
   */
  async advanceToNextStage(documentId: string): Promise<ProcessingStage | null> {
    const pipelineStatus = await this.getDocumentPipelineStatus(documentId);
    
    if (pipelineStatus.nextStage) {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          currentStage: pipelineStatus.nextStage,
          stageStatus: 'PENDING',
          lastStageError: null,
        },
      });
      
      return pipelineStatus.nextStage;
    }
    
    return null;
  }

  /**
   * Reset document to a specific stage
   */
  async resetToStage(documentId: string, stage: ProcessingStage): Promise<void> {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        currentStage: stage,
        stageStatus: 'PENDING',
        lastStageError: null,
      },
    });
  }

  /**
   * Execute a stage asynchronously using the job orchestrator
   */
  async executeStageAsync(documentId: string, stage: ProcessingStage, priority: number = 5): Promise<string> {
    // Import the job orchestrator
    const { jobOrchestrator } = await import('./jobs');

    // Create a processing job for this stage
    const jobId = await jobOrchestrator.scheduleJobForDocument(documentId, stage, { priority });

    // Update document status to indicate processing has started
    await prisma.document.update({
      where: { id: documentId },
      data: {
        currentStage: stage,
        stageStatus: 'RUNNING',
        lastStageError: null,
      },
    });

    return jobId;
  }

  /**
   * Process a stage directly (called by background job service)
   */
  async processStageDirectly(documentId: string, stage: ProcessingStage): Promise<void> {
    try {
      // Start execution record
      const execution = await this.startExecution({
        documentId,
        stage,
        metadata: { processedAt: new Date().toISOString() }
      });

      // Get document details
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          realm: true,
          user: true
        }
      });

      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      // Call MoRAG backend for stage processing
      await moragService.processStage({
        documentId,
        stage,
        executionId: execution.id,
        document: {
          id: document.id,
          title: document.name,
          content: document.markdown || '',
          filePath: '', // Not available in current schema
          realmId: document.realmId
        },
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stages?documentId=${documentId}&executionId=${execution.id}&stage=${stage}`
      });

      // The webhook will handle completion/failure updates
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if this is a dependency resolution trigger
      if (errorMessage.includes('DEPENDENCY_RESOLUTION_TRIGGERED')) {
        console.log(`🔧 [StageExecution] Dependency resolution triggered for ${stage} on document ${documentId}`);

        // Mark the execution as failed with a special status
        const execution = await this.getLatestExecution(documentId, stage);
        if (execution) {
          await this.failExecution(execution.id, errorMessage, {
            dependencyResolutionTriggered: true,
            originalStage: stage
          });
        }

        // Update document status to indicate dependency resolution is in progress
        await prisma.document.update({
          where: { id: documentId },
          data: {
            stageStatus: 'DEPENDENCY_RESOLUTION',
            lastStageError: `Resolving dependencies for ${stage}`,
          },
        });

        // Don't throw the error - dependency resolution was successfully triggered
        console.log(`✅ [StageExecution] Dependency resolution initiated for ${stage}`);
        return;
      }

      // Check if this is a missing dependencies error for manual mode
      if (errorMessage.includes('MISSING_DEPENDENCIES')) {
        console.log(`⚠️ [StageExecution] Missing dependencies for ${stage} in manual mode`);

        const execution = await this.getLatestExecution(documentId, stage);
        if (execution) {
          await this.failExecution(execution.id, errorMessage);
        }

        await prisma.document.update({
          where: { id: documentId },
          data: {
            stageStatus: 'FAILED',
            lastStageError: errorMessage,
          },
        });

        throw error;
      }

      // Handle other errors normally
      const execution = await this.getLatestExecution(documentId, stage);
      if (execution) {
        await this.failExecution(execution.id, errorMessage);
      }

      // Get document to check processing mode
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      // If document is in AUTOMATIC mode, degrade to MANUAL on failure
      const updateData: any = {
        stageStatus: 'FAILED',
        lastStageError: errorMessage,
      };

      if (document?.processingMode === 'AUTOMATIC') {
        updateData.processingMode = 'MANUAL';
        console.log(`🔄 [StageExecution] Degrading document ${documentId} from AUTOMATIC to MANUAL mode due to failure`);
      }

      // Update document status
      await prisma.document.update({
        where: { id: documentId },
        data: updateData,
      });

      throw error;
    }
  }

  /**
   * Handle webhook completion of a stage
   */
  async handleStageCompletion(executionId: string, status: 'completed' | 'failed', data?: {
    outputFiles?: string[];
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const execution = await this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (status === 'completed') {
      await this.completeExecution(executionId, data?.outputFiles, data?.metadata);
      
      // Update document status and advance to next stage if applicable
      await prisma.document.update({
        where: { id: execution.documentId },
        data: {
          stageStatus: 'COMPLETED',
          lastStageError: null,
        },
      });
      
      // Check if we should advance to the next stage for automatic processing
      const document = await prisma.document.findUnique({
        where: { id: execution.documentId }
      });

      if (document?.processingMode === 'AUTOMATIC' && !document.isProcessingPaused) {
        const nextStage = await this.advanceToNextStage(execution.documentId);
        if (nextStage) {
          // The next stage will be automatically scheduled by the job scheduler
        } else {
          // No next stage - check if all stages are complete and mark document as INGESTED
          const pipelineStatus = await this.getDocumentPipelineStatus(execution.documentId);
          const allStagesComplete = pipelineStatus.completedStages.length === 5; // All 5 stages

          if (allStagesComplete) {
            await prisma.document.update({
              where: { id: execution.documentId },
              data: { state: 'INGESTED' }
            });
            console.log(`Document ${execution.documentId} marked as INGESTED - all stages complete`);
          }
        }
      }
    } else {
      await this.failExecution(executionId, data?.errorMessage || 'Stage processing failed', data?.metadata);

      // Get document to check processing mode
      const document = await prisma.document.findUnique({
        where: { id: execution.documentId }
      });

      // If document is in AUTOMATIC mode, degrade to MANUAL on failure
      const updateData: any = {
        stageStatus: 'FAILED',
        lastStageError: data?.errorMessage || 'Stage processing failed',
      };

      if (document?.processingMode === 'AUTOMATIC') {
        updateData.processingMode = 'MANUAL';
        console.log(`🔄 [StageExecution] Degrading document ${execution.documentId} from AUTOMATIC to MANUAL mode due to stage failure`);
      }

      // Update document status
      await prisma.document.update({
        where: { id: execution.documentId },
        data: updateData,
      });
    }
  }

  /**
   * Map database model to output interface
   */
  private mapToOutput(execution: StageExecution): StageExecutionOutput {
    return {
      id: execution.id,
      documentId: execution.documentId,
      stage: execution.stage,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt || undefined,
      errorMessage: execution.errorMessage || undefined,
      inputFiles: execution.inputFiles ? (() => {
        try {
          const parsed = JSON.parse(execution.inputFiles);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })() : [],
      outputFiles: execution.outputFiles ? (() => {
        try {
          const parsed = JSON.parse(execution.outputFiles);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })() : [],
      metadata: execution.metadata ? JSON.parse(execution.metadata) : undefined,
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
    };
  }
}

export const stageExecutionService = new StageExecutionService();
export default stageExecutionService;