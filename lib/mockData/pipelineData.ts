/**
 * Mock pipeline data for testing and development
 * Provides realistic processing pipeline scenarios with various states
 */

import { type ProcessingStage, type StageStatus } from '@/lib/shared/types';
import { type StageExecution } from '@/lib/utils/pipelineHelpers';

export interface PipelineDocument {
  id: string;
  name: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
}

export interface PipelineExecution {
  id: string;
  document: PipelineDocument;
  stages: StageExecution[];
  overallProgress: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  realtimeUpdates: boolean;
}

// Helper function to create stage execution
function createStageExecution(
  stage: ProcessingStage,
  status: StageStatus = 'PENDING',
  progress: number = 0,
  options: {
    startTime?: Date;
    endTime?: Date;
    errorMessage?: string;
    canRetry?: boolean;
    canSkip?: boolean;
  } = {}
): StageExecution {
  const id = `stage-${stage}-${Math.random().toString(36).substr(2, 9)}`;
  
  const execution: StageExecution = {
    id,
    stage,
    status,
    progress,
  };

  if (options.startTime) {
    execution.startTime = options.startTime;
  }
  
  if (options.endTime) {
    execution.endTime = options.endTime;
    if (execution.startTime) {
      execution.duration = options.endTime.getTime() - execution.startTime.getTime();
    }
  }
  
  if (options.errorMessage) {
    execution.errorMessage = options.errorMessage;
  }
  
  if (options.canRetry !== undefined) {
    execution.canRetry = options.canRetry;
  }
  
  if (options.canSkip !== undefined) {
    execution.canSkip = options.canSkip;
  }

  return execution;
}

// Mock pipeline executions with various scenarios
export const mockPipelineExecutions: PipelineExecution[] = [
  // Scenario 1: Successfully completed pipeline
  {
    id: 'pipeline-exec-1',
    document: {
      id: 'doc-1',
      name: 'Annual Report 2023.pdf',
      fileSize: 2457600, // 2.4MB
      fileType: 'application/pdf',
      uploadedAt: new Date(Date.now() - 300000), // 5 minutes ago
    },
    stages: [
      createStageExecution('markdown-conversion', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 18000),
        endTime: new Date(Date.now() - 15700),
      }),
      createStageExecution('markdown-optimizer', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 15700),
        endTime: new Date(Date.now() - 11200),
      }),
      createStageExecution('chunker', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 11200),
        endTime: new Date(Date.now() - 9400),
      }),
      createStageExecution('fact-generator', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 9400),
        endTime: new Date(Date.now() - 3200),
      }),
      createStageExecution('ingestor', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 3200),
        endTime: new Date(Date.now() - 100),
      }),
    ],
    overallProgress: 100,
    status: 'completed',
    startTime: new Date(Date.now() - 18000),
    endTime: new Date(Date.now() - 100),
    totalDuration: 17900,
    realtimeUpdates: false,
  },

  // Scenario 2: Currently running pipeline (chunker stage)
  {
    id: 'pipeline-exec-2',
    document: {
      id: 'doc-2',
      name: 'Research Paper - AI Ethics.pdf',
      fileSize: 1536000, // 1.5MB
      fileType: 'application/pdf',
      uploadedAt: new Date(Date.now() - 120000), // 2 minutes ago
    },
    stages: [
      createStageExecution('markdown-conversion', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 7500),
        endTime: new Date(Date.now() - 5600),
      }),
      createStageExecution('markdown-optimizer', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 5600),
        endTime: new Date(Date.now() - 2400),
      }),
      createStageExecution('chunker', 'RUNNING', 75, {
        startTime: new Date(Date.now() - 2400),
      }),
      createStageExecution('fact-generator', 'PENDING', 0),
      createStageExecution('ingestor', 'PENDING', 0),
    ],
    overallProgress: 55,
    status: 'running',
    startTime: new Date(Date.now() - 7500),
    realtimeUpdates: true,
  },

  // Scenario 3: Failed pipeline with retry option
  {
    id: 'pipeline-exec-3',
    document: {
      id: 'doc-3',
      name: 'Technical Specifications.docx',
      fileSize: 3145728, // 3MB
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(Date.now() - 420000), // 7 minutes ago
    },
    stages: [
      createStageExecution('markdown-conversion', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 12000),
        endTime: new Date(Date.now() - 10400),
      }),
      createStageExecution('markdown-optimizer', 'SKIPPED', 0),
      createStageExecution('chunker', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 10400),
        endTime: new Date(Date.now() - 8300),
      }),
      createStageExecution('fact-generator', 'FAILED', 45, {
        startTime: new Date(Date.now() - 8300),
        endTime: new Date(Date.now() - 6500),
        errorMessage: 'Failed to connect to vector database. Connection timeout after 30 seconds.',
        canRetry: true,
      }),
      createStageExecution('ingestor', 'PENDING', 0),
    ],
    overallProgress: 49,
    status: 'failed',
    startTime: new Date(Date.now() - 12000),
    realtimeUpdates: false,
  },

  // Scenario 4: Just started pipeline
  {
    id: 'pipeline-exec-4',
    document: {
      id: 'doc-4',
      name: 'User Manual v2.1.pdf',
      fileSize: 5242880, // 5MB
      fileType: 'application/pdf',
      uploadedAt: new Date(Date.now() - 60000), // 1 minute ago
    },
    stages: [
      createStageExecution('markdown-conversion', 'RUNNING', 25, {
        startTime: new Date(Date.now() - 800),
      }),
      createStageExecution('markdown-optimizer', 'PENDING', 0),
      createStageExecution('chunker', 'PENDING', 0),
      createStageExecution('fact-generator', 'PENDING', 0),
      createStageExecution('ingestor', 'PENDING', 0),
    ],
    overallProgress: 5,
    status: 'running',
    startTime: new Date(Date.now() - 800),
    realtimeUpdates: true,
  },

  // Scenario 5: Partial completion (optimizer failed but continued)
  {
    id: 'pipeline-exec-5',
    document: {
      id: 'doc-5',
      name: 'Marketing Campaign Analysis.xlsx',
      fileSize: 1048576, // 1MB
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(Date.now() - 600000), // 10 minutes ago
    },
    stages: [
      createStageExecution('markdown-conversion', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 12500),
        endTime: new Date(Date.now() - 9700),
      }),
      createStageExecution('markdown-optimizer', 'FAILED', 20, {
        startTime: new Date(Date.now() - 9700),
        endTime: new Date(Date.now() - 8500),
        errorMessage: 'LLM service unavailable. Skipping optimization step.',
        canSkip: true,
      }),
      createStageExecution('chunker', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 8500),
        endTime: new Date(Date.now() - 7000),
      }),
      createStageExecution('fact-generator', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 7000),
        endTime: new Date(Date.now() - 2800),
      }),
      createStageExecution('ingestor', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 2800),
        endTime: new Date(Date.now() - 0),
      }),
    ],
    overallProgress: 84,
    status: 'partial',
    startTime: new Date(Date.now() - 12500),
    endTime: new Date(),
    totalDuration: 12500,
    realtimeUpdates: false,
  },

  // Scenario 6: Large document with long processing time
  {
    id: 'pipeline-exec-6',
    document: {
      id: 'doc-6',
      name: 'Enterprise Architecture Guide (500 pages).pdf',
      fileSize: 52428800, // 50MB
      fileType: 'application/pdf',
      uploadedAt: new Date(Date.now() - 900000), // 15 minutes ago
    },
    stages: [
      createStageExecution('markdown-conversion', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 48600),
        endTime: new Date(Date.now() - 40400),
      }),
      createStageExecution('markdown-optimizer', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 40400),
        endTime: new Date(Date.now() - 25000),
      }),
      createStageExecution('chunker', 'COMPLETED', 100, {
        startTime: new Date(Date.now() - 25000),
        endTime: new Date(Date.now() - 18200),
      }),
      createStageExecution('fact-generator', 'RUNNING', 80, {
        startTime: new Date(Date.now() - 18200),
      }),
      createStageExecution('ingestor', 'PENDING', 0),
    ],
    overallProgress: 76,
    status: 'running',
    startTime: new Date(Date.now() - 48600),
    realtimeUpdates: true,
  },

  // Scenario 7: Multiple failures requiring intervention
  {
    id: 'pipeline-exec-7',
    document: {
      id: 'doc-7',
      name: 'Corrupted_File.pdf',
      fileSize: 204800, // 200KB
      fileType: 'application/pdf',
      uploadedAt: new Date(Date.now() - 1800000), // 30 minutes ago
    },
    stages: [
      createStageExecution('markdown-conversion', 'FAILED', 15, {
        startTime: new Date(Date.now() - 30000),
        endTime: new Date(Date.now() - 25000),
        errorMessage: 'Unable to parse PDF content. File may be corrupted or encrypted.',
        canRetry: true,
      }),
      createStageExecution('markdown-optimizer', 'PENDING', 0),
      createStageExecution('chunker', 'PENDING', 0),
      createStageExecution('fact-generator', 'PENDING', 0),
      createStageExecution('ingestor', 'PENDING', 0),
    ],
    overallProgress: 3,
    status: 'failed',
    startTime: new Date(Date.now() - 30000),
    realtimeUpdates: false,
  },

  // Scenario 8: Pending pipeline (in queue)
  {
    id: 'pipeline-exec-8',
    document: {
      id: 'doc-8',
      name: 'Quarterly Sales Report.pptx',
      fileSize: 15728640, // 15MB
      fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      uploadedAt: new Date(Date.now() - 30000), // 30 seconds ago
    },
    stages: [
      createStageExecution('markdown-conversion', 'PENDING', 0),
      createStageExecution('markdown-optimizer', 'PENDING', 0),
      createStageExecution('chunker', 'PENDING', 0),
      createStageExecution('fact-generator', 'PENDING', 0),
      createStageExecution('ingestor', 'PENDING', 0),
    ],
    overallProgress: 0,
    status: 'pending',
    startTime: new Date(),
    realtimeUpdates: false,
  },
];

// Helper functions for accessing mock data
export function getPipelineExecutionById(id: string): PipelineExecution | undefined {
  return mockPipelineExecutions.find(exec => exec.id === id);
}

export function getPipelineExecutionsByStatus(status: PipelineExecution['status']): PipelineExecution[] {
  return mockPipelineExecutions.filter(exec => exec.status === status);
}

export function getRecentPipelineExecutions(limit: number = 10): PipelineExecution[] {
  return [...mockPipelineExecutions]
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, limit);
}

export function getActivePipelineExecutions(): PipelineExecution[] {
  return mockPipelineExecutions.filter(exec => 
    exec.status === 'running' || exec.status === 'pending'
  );
}

export function getRealTimeUpdatingExecutions(): PipelineExecution[] {
  return mockPipelineExecutions.filter(exec => exec.realtimeUpdates);
}

// Simulate real-time progress updates
export function updatePipelineProgress(executionId: string): PipelineExecution | null {
  const execution = mockPipelineExecutions.find(exec => exec.id === executionId);
  
  if (!execution || !execution.realtimeUpdates || execution.status !== 'running') {
    return null;
  }

  // Find the currently running stage
  const runningStage = execution.stages.find(stage => stage.status === 'RUNNING');
  
  if (runningStage) {
    // Increase progress randomly
    const progressIncrease = Math.random() * 10 + 2; // 2-12% increase
    runningStage.progress = Math.min(100, runningStage.progress + progressIncrease);
    
    // If stage is complete, move to next stage
    if (runningStage.progress >= 100) {
      runningStage.status = 'COMPLETED';
      runningStage.endTime = new Date();
      
      // Find next pending stage
      const nextPendingStage = execution.stages.find(stage => stage.status === 'PENDING');
      if (nextPendingStage) {
        nextPendingStage.status = 'RUNNING';
        nextPendingStage.startTime = new Date();
      } else {
        // All stages complete
        execution.status = 'completed';
        execution.endTime = new Date();
        execution.realtimeUpdates = false;
        execution.totalDuration = execution.endTime.getTime() - execution.startTime.getTime();
      }
    }
  }
  
  // Recalculate overall progress
  const totalProgress = execution.stages.reduce((sum, stage) => sum + stage.progress, 0);
  execution.overallProgress = Math.round(totalProgress / execution.stages.length);
  
  return execution;
}

// Simulate retrying a failed stage
export function retryFailedStage(executionId: string, stageId: string): boolean {
  const execution = mockPipelineExecutions.find(exec => exec.id === executionId);
  if (!execution) return false;
  
  const stage = execution.stages.find(s => s.id === stageId);
  if (!stage || stage.status !== 'FAILED' || !stage.canRetry) return false;
  
  // Reset stage for retry
  stage.status = 'RUNNING';
  stage.progress = 0;
  stage.startTime = new Date();
  delete stage.endTime;
  delete stage.duration;
  delete stage.errorMessage;
  
  // Update execution status
  execution.status = 'running';
  execution.realtimeUpdates = true;
  
  return true;
}

// Simulate skipping a failed stage
export function skipFailedStage(executionId: string, stageId: string): boolean {
  const execution = mockPipelineExecutions.find(exec => exec.id === executionId);
  if (!execution) return false;
  
  const stage = execution.stages.find(s => s.id === stageId);
  if (!stage || stage.status !== 'FAILED' || !stage.canSkip) return false;
  
  // Skip the stage
  stage.status = 'SKIPPED';
  stage.progress = 0;
  stage.endTime = new Date();
  stage.duration = stage.startTime ? stage.endTime.getTime() - stage.startTime.getTime() : 0;
  
  // Start next pending stage if available
  const nextPendingStage = execution.stages.find(s => s.status === 'PENDING');
  if (nextPendingStage) {
    nextPendingStage.status = 'RUNNING';
    nextPendingStage.startTime = new Date();
    execution.status = 'running';
    execution.realtimeUpdates = true;
  } else {
    execution.status = 'partial';
    execution.endTime = new Date();
    execution.realtimeUpdates = false;
  }
  
  return true;
}

// Generate a new mock pipeline execution
export function generateMockPipelineExecution(
  documentName: string,
  fileSize: number,
  fileType: string
): PipelineExecution {
  const id = `pipeline-exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    document: {
      id: docId,
      name: documentName,
      fileSize,
      fileType,
      uploadedAt: new Date(),
    },
    stages: [
      createStageExecution('markdown-conversion', 'PENDING', 0),
      createStageExecution('markdown-optimizer', 'PENDING', 0),
      createStageExecution('chunker', 'PENDING', 0),
      createStageExecution('fact-generator', 'PENDING', 0),
      createStageExecution('ingestor', 'PENDING', 0),
    ],
    overallProgress: 0,
    status: 'pending',
    startTime: new Date(),
    realtimeUpdates: false,
  };
}