/**
 * Pipeline helpers for processing pipeline visualization
 * Utility functions for managing pipeline stages, progress, and status
 */

import { type ProcessingStage, type StageStatus } from '@/lib/shared/types';

// Pipeline stage definitions matching CLAUDE.md specifications
export const PIPELINE_STAGES: ProcessingStage[] = [
  'markdown-conversion',
  'markdown-optimizer', 
  'chunker',
  'fact-generator',
  'ingestor'
] as const;

// Stage display information
export const STAGE_INFO = {
  'markdown-conversion': {
    displayName: 'Markdown Conversion',
    description: 'Convert content to markdown format',
    icon: '📝',
    estimatedDuration: 2000, // ms
  },
  'markdown-optimizer': {
    displayName: 'Markdown Optimizer',
    description: 'LLM-based text improvement (optional)',
    icon: '✨',
    estimatedDuration: 4000, // ms
    optional: true,
  },
  'chunker': {
    displayName: 'Chunker',
    description: 'Split content into semantic chunks',
    icon: '🔪',
    estimatedDuration: 1500, // ms
  },
  'fact-generator': {
    displayName: 'Fact Generator',
    description: 'Extract facts, entities, and relations',
    icon: '🔍',
    estimatedDuration: 6000, // ms
  },
  'ingestor': {
    displayName: 'Ingestor',
    description: 'Store in vector and graph databases',
    icon: '💾',
    estimatedDuration: 3000, // ms
  },
} as const;

// Stage execution interface
export interface StageExecution {
  id: string;
  stage: ProcessingStage;
  status: StageStatus;
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  errorMessage?: string;
  canRetry?: boolean;
  canSkip?: boolean;
}

// Pipeline progress calculation
export interface PipelineProgress {
  overall: number;
  currentStage?: ProcessingStage;
  completedStages: ProcessingStage[];
  failedStages: ProcessingStage[];
  skippedStages: ProcessingStage[];
  estimatedTimeRemaining?: number;
}

/**
 * Calculate overall pipeline progress based on stage executions
 */
export function calculateProgress(executions: StageExecution[]): number {
  if (!executions || executions.length === 0) return 0;
  
  const totalProgress = executions.reduce((sum, execution) => {
    return sum + execution.progress;
  }, 0);
  
  return Math.round(totalProgress / executions.length);
}

/**
 * Get detailed pipeline progress information
 */
export function getPipelineProgress(executions: StageExecution[]): PipelineProgress {
  const completedStages: ProcessingStage[] = [];
  const failedStages: ProcessingStage[] = [];
  const skippedStages: ProcessingStage[] = [];
  let currentStage: ProcessingStage | undefined;
  
  executions.forEach(execution => {
    switch (execution.status) {
      case 'COMPLETED':
        completedStages.push(execution.stage);
        break;
      case 'FAILED':
        failedStages.push(execution.stage);
        break;
      case 'SKIPPED':
        skippedStages.push(execution.stage);
        break;
      case 'RUNNING':
        currentStage = execution.stage;
        break;
    }
  });
  
  const overall = calculateProgress(executions);
  const estimatedTimeRemaining = calculateEstimatedTimeRemaining(executions);
  
  const progress: PipelineProgress = {
    overall,
    completedStages,
    failedStages,
    skippedStages,
  };
  
  // Only add optional properties if they have values
  if (currentStage) {
    progress.currentStage = currentStage;
  }
  
  if (estimatedTimeRemaining !== undefined) {
    progress.estimatedTimeRemaining = estimatedTimeRemaining;
  }
  
  return progress;
}

/**
 * Calculate estimated time remaining for pipeline completion
 */
export function calculateEstimatedTimeRemaining(executions: StageExecution[]): number | undefined {
  const pendingStages = executions.filter(exec => exec.status === 'PENDING');
  const runningStages = executions.filter(exec => exec.status === 'RUNNING');
  
  if (pendingStages.length === 0 && runningStages.length === 0) {
    return undefined; // Pipeline completed or failed
  }
  
  let estimatedTime = 0;
  
  // Add time for pending stages
  pendingStages.forEach(execution => {
    const stageInfo = STAGE_INFO[execution.stage];
    estimatedTime += stageInfo.estimatedDuration;
  });
  
  // Add remaining time for running stages
  runningStages.forEach(execution => {
    const stageInfo = STAGE_INFO[execution.stage];
    const remainingProgress = 100 - execution.progress;
    const remainingTime = (stageInfo.estimatedDuration * remainingProgress) / 100;
    estimatedTime += remainingTime;
  });
  
  return Math.round(estimatedTime);
}

/**
 * Get status color class for different states
 */
export function getStatusColor(status: StageStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
    case 'RUNNING':
      return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800';
    case 'FAILED':
      return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
    case 'PENDING':
      return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800';
    case 'SKIPPED':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800';
  }
}

/**
 * Get status icon for different states
 */
export function getStatusIcon(status: StageStatus): string {
  switch (status) {
    case 'COMPLETED':
      return '✓';
    case 'RUNNING':
      return '⟳';
    case 'FAILED':
      return '✗';
    case 'PENDING':
      return '○';
    case 'SKIPPED':
      return '⊘';
    default:
      return '○';
  }
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

/**
 * Get next stage in the pipeline
 */
export function getNextStage(currentStage: ProcessingStage): ProcessingStage | null {
  const currentIndex = PIPELINE_STAGES.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === PIPELINE_STAGES.length - 1) {
    return null;
  }
  const nextStage = PIPELINE_STAGES[currentIndex + 1];
  return nextStage || null;
}

/**
 * Get previous stage in the pipeline
 */
export function getPreviousStage(currentStage: ProcessingStage): ProcessingStage | null {
  const currentIndex = PIPELINE_STAGES.indexOf(currentStage);
  if (currentIndex <= 0) {
    return null;
  }
  const previousStage = PIPELINE_STAGES[currentIndex - 1];
  return previousStage || null;
}

/**
 * Check if a stage can be retried
 */
export function canRetryStage(execution: StageExecution): boolean {
  return execution.status === 'FAILED' && (execution.canRetry ?? true);
}

/**
 * Check if a stage can be skipped
 */
export function canSkipStage(execution: StageExecution): boolean {
  const stageInfo = STAGE_INFO[execution.stage];
  const isOptional = 'optional' in stageInfo && stageInfo.optional === true;
  return execution.status === 'FAILED' && (execution.canSkip ?? isOptional);
}

/**
 * Get stage position in pipeline (0-indexed)
 */
export function getStagePosition(stage: ProcessingStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

/**
 * Calculate stage connection positions for visual display
 */
export interface StageConnection {
  from: ProcessingStage;
  to: ProcessingStage;
  status: 'completed' | 'active' | 'pending' | 'failed';
  progress?: number;
}

export function getStageConnections(executions: StageExecution[]): StageConnection[] {
  const connections: StageConnection[] = [];
  
  for (let i = 0; i < PIPELINE_STAGES.length - 1; i++) {
    const currentStage = PIPELINE_STAGES[i]!;
    const nextStage = PIPELINE_STAGES[i + 1]!;
    
    const currentExecution = executions.find(e => e.stage === currentStage);
    const nextExecution = executions.find(e => e.stage === nextStage);
    
    let status: StageConnection['status'] = 'pending';
    let progress: number | undefined;
    
    if (currentExecution?.status === 'COMPLETED' && nextExecution?.status === 'RUNNING') {
      status = 'active';
      progress = nextExecution.progress;
    } else if (currentExecution?.status === 'COMPLETED' && nextExecution?.status === 'COMPLETED') {
      status = 'completed';
    } else if (currentExecution?.status === 'FAILED' || nextExecution?.status === 'FAILED') {
      status = 'failed';
    }
    
    const connection: StageConnection = {
      from: currentStage,
      to: nextStage,
      status,
    };
    
    if (progress !== undefined) {
      connection.progress = progress;
    }
    
    connections.push(connection);
  }
  
  return connections;
}

/**
 * Create mock stage execution for testing
 */
export function createMockStageExecution(
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
  const id = `execution-${stage}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const execution: StageExecution = {
    id,
    stage,
    status,
    progress,
  };
  
  // Only add optional properties if they have values
  if (options.startTime) {
    execution.startTime = options.startTime;
  }
  
  if (options.endTime) {
    execution.endTime = options.endTime;
  }
  
  if (options.startTime && options.endTime) {
    execution.duration = options.endTime.getTime() - options.startTime.getTime();
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