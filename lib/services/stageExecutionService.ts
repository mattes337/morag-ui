import { PrismaClient, ProcessingStage, StageStatus, StageExecution } from '@prisma/client';
import { moragService } from './moragService';
import { backgroundJobService } from './backgroundJobService';

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
    if (document.stageStatus === 'COMPLETED' && document.currentStage) {
      const currentIndex = stages.indexOf(document.currentStage);
      if (currentIndex >= 0 && currentIndex < stages.length - 1) {
        nextStage = stages[currentIndex + 1];
      }
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
   * Execute a stage asynchronously using the background job service
   */
  async executeStageAsync(documentId: string, stage: ProcessingStage, priority: number = 5): Promise<string> {
    // Create a processing job for this stage
    const job = await backgroundJobService.createJob({ documentId, stage, priority });

    // Update document status to indicate processing has started
    await prisma.document.update({
      where: { id: documentId },
      data: {
        currentStage: stage,
        stageStatus: 'RUNNING',
        lastStageError: null,
      },
    });

    return job.id;
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
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stages`
      });

      // The webhook will handle completion/failure updates
    } catch (error) {
      // If there's an immediate error, fail the execution
      const execution = await this.getLatestExecution(documentId, stage);
      if (execution) {
        await this.failExecution(execution.id, error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Update document status
      await prisma.document.update({
        where: { id: documentId },
        data: {
          stageStatus: 'FAILED',
          lastStageError: error instanceof Error ? error.message : 'Unknown error',
        },
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
          // Schedule the next stage
          await backgroundJobService.scheduleAutomaticJobs();
        }
      }
    } else {
      await this.failExecution(executionId, data?.errorMessage || 'Stage processing failed', data?.metadata);
      
      // Update document status
      await prisma.document.update({
        where: { id: execution.documentId },
        data: {
          stageStatus: 'FAILED',
          lastStageError: data?.errorMessage || 'Stage processing failed',
        },
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
      inputFiles: execution.inputFiles ? JSON.parse(execution.inputFiles) : undefined,
      outputFiles: execution.outputFiles ? JSON.parse(execution.outputFiles) : undefined,
      metadata: execution.metadata ? JSON.parse(execution.metadata) : undefined,
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
    };
  }
}

export const stageExecutionService = new StageExecutionService();
export default stageExecutionService;