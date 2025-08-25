'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import {
  Play,
  FileText,
  Zap,
  Scissors,
  Brain,
  Database,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Settings
} from 'lucide-react';

type ProcessingStage = 'MARKDOWN_CONVERSION' | 'MARKDOWN_OPTIMIZER' | 'CHUNKER' | 'FACT_GENERATOR' | 'INGESTOR';
type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

interface StageInfo {
  stage: ProcessingStage;
  status: StageStatus;
  progress?: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  canExecute?: boolean;
  isOptional?: boolean;
}

interface StageControlPanelProps {
  documentId: string;
  stages: StageInfo[];
  processingMode: 'MANUAL' | 'AUTOMATIC';
  onExecuteStage?: (stage: ProcessingStage) => Promise<void>;
  onExecuteChain?: (fromStage: ProcessingStage) => Promise<void>;
  onResetToStage?: (stage: ProcessingStage) => Promise<void>;
  onToggleProcessingMode?: (mode: 'MANUAL' | 'AUTOMATIC') => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const STAGE_CONFIG = {
  MARKDOWN_CONVERSION: {
    name: 'Markdown Conversion',
    description: 'Convert input files to unified markdown format',
    icon: FileText,
    color: 'bg-blue-500',
    estimatedTime: '30s - 2m',
    isOptional: false
  },
  MARKDOWN_OPTIMIZER: {
    name: 'Markdown Optimizer',
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

const STATUS_CONFIG = {
  PENDING: { color: 'bg-gray-500', textColor: 'text-gray-700', icon: Clock, label: 'Pending' },
  RUNNING: { color: 'bg-blue-500', textColor: 'text-blue-700', icon: Loader2, label: 'Running' },
  COMPLETED: { color: 'bg-green-500', textColor: 'text-green-700', icon: CheckCircle, label: 'Completed' },
  FAILED: { color: 'bg-red-500', textColor: 'text-red-700', icon: XCircle, label: 'Failed' },
  SKIPPED: { color: 'bg-gray-400', textColor: 'text-gray-600', icon: AlertCircle, label: 'Skipped' }
};

export function StageControlPanel({
  documentId,
  stages,
  processingMode,
  onExecuteStage,
  onExecuteChain,
  onResetToStage,
  onToggleProcessingMode,
  isLoading = false,
  className = ''
}: StageControlPanelProps) {
  const [executingStage, setExecutingStage] = useState<ProcessingStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define the workflow order and dependencies
  const WORKFLOW_ORDER: ProcessingStage[] = [
    'MARKDOWN_CONVERSION',
    'MARKDOWN_OPTIMIZER',
    'CHUNKER',
    'FACT_GENERATOR',
    'INGESTOR'
  ];

  // Create a map of stages for quick lookup
  const stageMap = new Map(stages.map(stage => [stage.stage, stage]));

  // Get the effective status of a stage (handles logic for marking previous stages as completed)
  const getEffectiveStageStatus = (stage: ProcessingStage): StageStatus => {
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
    for (let i = stageIndex + 1; i < WORKFLOW_ORDER.length; i++) {
      const laterStage = WORKFLOW_ORDER[i];
      const laterStageInfo = stageMap.get(laterStage);

      if (laterStageInfo && (laterStageInfo.status === 'RUNNING' || laterStageInfo.status === 'COMPLETED')) {
        // Mark this stage as completed if it's required and currently pending
        if (stage !== 'MARKDOWN_OPTIMIZER' && currentStatus === 'PENDING') {
          return 'COMPLETED';
        }
      }
    }

    return currentStatus;
  };

  // Determine if a stage can be executed based on dependencies and processing state
  const canExecuteStage = (stage: ProcessingStage): boolean => {
    const stageIndex = WORKFLOW_ORDER.indexOf(stage);
    if (stageIndex === -1) return false;

    // Can't execute any stage if processing is currently active
    if (isLoading) return false;

    // Can't execute in automatic mode
    if (processingMode === 'AUTOMATIC') return false;

    // Can't execute if any stage is currently running
    const hasRunningStage = stages.some(s => s.status === 'RUNNING');
    if (hasRunningStage) return false;

    // First stage can always be executed (if not processing)
    if (stageIndex === 0) return true;

    // Check if all previous required stages are completed
    for (let i = 0; i < stageIndex; i++) {
      const prevStage = WORKFLOW_ORDER[i];
      const prevStageStatus = getEffectiveStageStatus(prevStage);

      // Skip optional stages (MARKDOWN_OPTIMIZER)
      if (prevStage === 'MARKDOWN_OPTIMIZER') continue;

      // Previous required stage must be completed
      if (prevStageStatus !== 'COMPLETED') {
        return false;
      }
    }

    return true;
  };

  // Calculate stage duration
  const getStageDuration = (stageInfo: StageInfo): string => {
    if (!stageInfo.startedAt) return '';

    const endTime = stageInfo.completedAt || new Date();
    const duration = endTime.getTime() - stageInfo.startedAt.getTime();

    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    if (duration < 3600000) return `${Math.round(duration / 60000)}m ${Math.round((duration % 60000) / 1000)}s`;

    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const handleExecuteStage = async (stage: ProcessingStage) => {
    if (!onExecuteStage || executingStage) return;
    
    try {
      setExecutingStage(stage);
      setError(null);
      await onExecuteStage(stage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute stage');
    } finally {
      setExecutingStage(null);
    }
  };

  const handleExecuteChain = async (fromStage: ProcessingStage) => {
    if (!onExecuteChain || executingStage) return;
    
    try {
      setExecutingStage(fromStage);
      setError(null);
      await onExecuteChain(fromStage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute stage chain');
    } finally {
      setExecutingStage(null);
    }
  };

  const handleResetToStage = async (stage: ProcessingStage) => {
    if (!onResetToStage || executingStage) return;
    
    try {
      setExecutingStage(stage);
      setError(null);
      await onResetToStage(stage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset to stage');
    } finally {
      setExecutingStage(null);
    }
  };

  const handleToggleMode = async () => {
    if (!onToggleProcessingMode) return;
    
    try {
      const newMode = processingMode === 'AUTOMATIC' ? 'MANUAL' : 'AUTOMATIC';
      await onToggleProcessingMode(newMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle processing mode');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Stage Control Panel</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={processingMode === 'AUTOMATIC' ? 'default' : 'secondary'}>
            {processingMode} Mode
          </Badge>
          
          {onToggleProcessingMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleMode}
              disabled={isLoading || !!executingStage}
            >
              Switch to {processingMode === 'AUTOMATIC' ? 'Manual' : 'Automatic'}
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Workflow Stages */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-md font-medium text-gray-900">Processing Workflow</h4>
          <div className="text-sm text-gray-500">Execute stages from left to right</div>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
          {WORKFLOW_ORDER.map((stageName, index) => {
            const stageInfo = stageMap.get(stageName);
            const stageConfig = STAGE_CONFIG[stageName];
            const effectiveStatus = getEffectiveStageStatus(stageName);
            const statusConfig = STATUS_CONFIG[effectiveStatus];
            const StageIcon = stageConfig.icon;
            const StatusIcon = statusConfig.icon;

            const isExecuting = executingStage === stageName;
            const canExecute = canExecuteStage(stageName) && !isExecuting && !isLoading && processingMode === 'MANUAL';
            const isRunning = effectiveStatus === 'RUNNING' || isExecuting;
            const isCompleted = effectiveStatus === 'COMPLETED';
            const isFailed = effectiveStatus === 'FAILED';
            const isSkipped = effectiveStatus === 'SKIPPED';
            const isOptional = stageConfig.isOptional;
            const duration = stageInfo ? getStageDuration(stageInfo) : '';

            return (
              <div key={stageName} className="flex items-center">
                {/* Stage Card */}
                <div className={`
                  relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 min-w-[180px]
                  ${isCompleted ? 'border-green-500 bg-green-50' :
                    isFailed ? 'border-red-500 bg-red-50' :
                    isRunning ? 'border-blue-500 bg-blue-50' :
                    effectiveStatus === 'SKIPPED' ? 'border-gray-400 bg-gray-100' :
                    canExecute ? 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-25' :
                    'border-gray-200 bg-gray-50'}
                  ${isOptional ? 'border-dashed' : ''}
                `}>

                  {/* Optional Badge */}
                  {isOptional && (
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="secondary" className="text-xs px-1 py-0">Optional</Badge>
                    </div>
                  )}

                  {/* Stage Icon and Status */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${stageConfig.color}`} />
                    <StageIcon className={`w-6 h-6 ${
                      isCompleted ? 'text-green-600' :
                      isFailed ? 'text-red-600' :
                      isRunning ? 'text-blue-600' :
                      canExecute ? 'text-gray-700' : 'text-gray-400'
                    }`} />
                    <StatusIcon className={`w-4 h-4 ${statusConfig.textColor} ${isRunning ? 'animate-spin' : ''}`} />
                  </div>

                  {/* Stage Name and Description */}
                  <div className="text-center mb-3">
                    <h4 className={`font-medium text-sm mb-1 ${
                      isCompleted ? 'text-green-800' :
                      isFailed ? 'text-red-800' :
                      isRunning ? 'text-blue-800' :
                      effectiveStatus === 'SKIPPED' ? 'text-gray-600' :
                      canExecute ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {stageConfig.name}
                    </h4>
                    <p className="text-xs text-gray-600 leading-tight mb-1">{stageConfig.description}</p>

                    {/* Timing Information */}
                    {stageInfo?.startedAt && (
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div>Started: {new Date(stageInfo.startedAt).toLocaleTimeString()}</div>
                        {stageInfo.completedAt && (
                          <div>Ended: {new Date(stageInfo.completedAt).toLocaleTimeString()}</div>
                        )}
                        {duration && (
                          <div className="font-medium">Duration: {duration}</div>
                        )}
                      </div>
                    )}

                    {/* Estimated time for pending stages */}
                    {!stageInfo?.startedAt && (
                      <p className="text-xs text-gray-500">Est: {stageConfig.estimatedTime}</p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {isRunning && stageInfo?.progress !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${stageInfo.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Status Badge */}
                  <Badge
                    variant={isCompleted ? 'default' :
                            isFailed ? 'destructive' :
                            isRunning ? 'secondary' :
                            effectiveStatus === 'SKIPPED' ? 'outline' : 'outline'}
                    className={`text-xs mb-3 ${
                      effectiveStatus === 'SKIPPED' ? 'bg-gray-100 text-gray-600' : ''
                    }`}
                  >
                    {statusConfig.label}
                  </Badge>

                  {/* Error Message */}
                  {stageInfo?.errorMessage && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      {stageInfo.errorMessage}
                    </div>
                  )}

                  {/* Action Button */}
                  {processingMode === 'MANUAL' && effectiveStatus !== 'SKIPPED' && (
                    <Button
                      size="sm"
                      variant={isCompleted ? 'outline' : canExecute ? 'default' : 'ghost'}
                      onClick={() => handleExecuteStage(stageName)}
                      disabled={!canExecute || isRunning}
                      className={`w-full text-xs ${
                        (!canExecute || isRunning) ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Running
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          {isCompleted ? 'Re-run' : 'Execute'}
                        </>
                      )}
                    </Button>
                  )}

                  {/* Skipped stage message */}
                  {effectiveStatus === 'SKIPPED' && (
                    <div className="w-full text-xs text-gray-500 text-center py-1">
                      Optional stage skipped
                    </div>
                  )}
                </div>

                {/* Workflow Arrow */}
                {index < WORKFLOW_ORDER.length - 1 && (
                  <div className="flex items-center px-3">
                    <ChevronRight className={`w-5 h-5 ${
                      canExecuteStage(WORKFLOW_ORDER[index + 1]) ? 'text-blue-500' : 'text-gray-300'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Workflow Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Execute stages in order. Optional stages can be skipped.
            </div>
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing active...</span>
              </div>
            )}
          </div>
          {processingMode === 'MANUAL' && (
            <div className="flex space-x-2">
              {onExecuteChain && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Find the first incomplete required stage
                    const nextStage = WORKFLOW_ORDER.find(stage => {
                      const stageInfo = stageMap.get(stage);
                      return stage !== 'MARKDOWN_OPTIMIZER' && (!stageInfo || stageInfo.status !== 'COMPLETED');
                    });
                    if (nextStage) {
                      handleExecuteChain(nextStage);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 mr-1" />
                      Execute Remaining
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StageControlPanel;