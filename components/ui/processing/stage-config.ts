import {
  FileText,
  Zap,
  Scissors,
  Brain,
  Database,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export type ProcessingStage = 'MARKDOWN_CONVERSION' | 'MARKDOWN_OPTIMIZER' | 'CHUNKER' | 'FACT_GENERATOR' | 'INGESTOR';
export type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'DEPENDENCY_RESOLUTION';

export interface StageInfo {
  stage: ProcessingStage;
  status: StageStatus;
  progress?: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  canExecute?: boolean;
  isOptional?: boolean;
}

export const STAGE_CONFIG = {
  MARKDOWN_CONVERSION: {
    name: 'Converter',
    description: 'Convert input files to unified markdown format',
    icon: FileText,
    color: 'bg-blue-500',
    estimatedTime: '30s - 2m',
    isOptional: false
  },
  MARKDOWN_OPTIMIZER: {
    name: 'Optimizer',
    description: 'LLM-based text improvement and error correction',
    icon: Zap,
    color: 'bg-yellow-500',
    estimatedTime: '1m - 3m',
    isOptional: true
  },
  CHUNKER: {
    name: 'Chunker',
    description: 'Create summary, chunks, and contextual embeddings',
    icon: Scissors,
    color: 'bg-green-500',
    estimatedTime: '30s - 1m',
    isOptional: false
  },
  FACT_GENERATOR: {
    name: 'Fact Generator',
    description: 'Extract facts, entities, relations, and keywords',
    icon: Brain,
    color: 'bg-purple-500',
    estimatedTime: '1m - 4m',
    isOptional: false
  },
  INGESTOR: {
    name: 'Ingestor',
    description: 'Database ingestion and storage',
    icon: Database,
    color: 'bg-indigo-500',
    estimatedTime: '10s - 30s',
    isOptional: false
  }
};

export const STATUS_CONFIG = {
  PENDING: { color: 'bg-gray-500', textColor: 'text-gray-700', icon: Clock, label: 'Pending' },
  RUNNING: { color: 'bg-blue-500', textColor: 'text-blue-700', icon: Loader2, label: 'Running' },
  COMPLETED: { color: 'bg-green-500', textColor: 'text-green-700', icon: CheckCircle, label: 'Completed' },
  FAILED: { color: 'bg-red-500', textColor: 'text-red-700', icon: XCircle, label: 'Failed' },
  SKIPPED: { color: 'bg-gray-400', textColor: 'text-gray-600', icon: AlertCircle, label: 'Skipped' },
  DEPENDENCY_RESOLUTION: { color: 'bg-orange-500', textColor: 'text-orange-700', icon: Loader2, label: 'Resolving Dependencies' }
};

export const WORKFLOW_ORDER: ProcessingStage[] = [
  'MARKDOWN_CONVERSION',
  'MARKDOWN_OPTIMIZER',
  'CHUNKER',
  'FACT_GENERATOR',
  'INGESTOR'
];

// Utility functions for stage logic
export function getEffectiveStageStatus(
  stage: ProcessingStage,
  stageMap: Map<ProcessingStage, StageInfo>
): StageStatus {
  const stageInfo = stageMap.get(stage);
  const currentStatus = stageInfo?.status || 'PENDING';

  // If stage is explicitly completed, failed, or running, return as-is
  if (currentStatus === 'COMPLETED' || currentStatus === 'FAILED' || currentStatus === 'RUNNING') {
    return currentStatus;
  }

  // Handle MARKDOWN_OPTIMIZER special case - mark as SKIPPED if a later stage is running/completed
  if (stage === 'MARKDOWN_OPTIMIZER') {
    const laterStages: ProcessingStage[] = ['CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
    const hasLaterStageProgress = laterStages.some(laterStage => {
      const laterStageInfo = stageMap.get(laterStage);
      return laterStageInfo && (laterStageInfo.status === 'RUNNING' || laterStageInfo.status === 'COMPLETED');
    });

    if (hasLaterStageProgress && currentStatus === 'PENDING') {
      return 'SKIPPED';
    }
  }

  // If any later stage is running or completed, mark previous required stages as completed
  const stageIndex = WORKFLOW_ORDER.indexOf(stage);
  if (stageIndex === -1) return currentStatus;

  for (let i = stageIndex + 1; i < WORKFLOW_ORDER.length; i++) {
    const laterStage = WORKFLOW_ORDER[i];
    const laterStageInfo = stageMap.get(laterStage);
    
    if (laterStageInfo && (laterStageInfo.status === 'RUNNING' || laterStageInfo.status === 'COMPLETED')) {
      // Only auto-complete non-optional stages
      if (!STAGE_CONFIG[stage].isOptional) {
        return 'COMPLETED';
      }
    }
  }

  return currentStatus;
}

export function canExecuteStage(
  stage: ProcessingStage,
  stageMap: Map<ProcessingStage, StageInfo>
): boolean {
  const stageIndex = WORKFLOW_ORDER.indexOf(stage);
  if (stageIndex === -1) return false;

  const effectiveStatus = getEffectiveStageStatus(stage, stageMap);
  
  // Can't execute if already running or completed
  if (effectiveStatus === 'RUNNING' || effectiveStatus === 'COMPLETED') {
    return false;
  }

  // Check if all previous required stages are completed
  for (let i = 0; i < stageIndex; i++) {
    const prevStage = WORKFLOW_ORDER[i];
    const prevStageConfig = STAGE_CONFIG[prevStage];
    
    // Skip optional stages
    if (prevStageConfig.isOptional) continue;
    
    const prevEffectiveStatus = getEffectiveStageStatus(prevStage, stageMap);
    if (prevEffectiveStatus !== 'COMPLETED') {
      return false;
    }
  }

  return true;
}

export function canExecuteChainFrom(
  stage: ProcessingStage,
  stageMap: Map<ProcessingStage, StageInfo>
): boolean {
  return canExecuteStage(stage, stageMap);
}
