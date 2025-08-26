'use client';

import React, { useState, useEffect } from 'react';
import { ProcessingStage, StageStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RotateCcw, 
  FileText, 
  Zap, 
  Scissors, 
  Brain, 
  Database,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface StageExecutionOutput {
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

interface PipelineStatus {
  currentStage: ProcessingStage | null;
  stageStatus: StageStatus;
  completedStages: ProcessingStage[];
  failedStages: ProcessingStage[];
  nextStage: ProcessingStage | null;
  progress: number;
}

interface StageVisualizationProps {
  documentId: string;
  pipelineStatus: PipelineStatus;
  executions: StageExecutionOutput[];
  onExecuteStage?: (stage: ProcessingStage) => void;
  onExecuteChain?: (stages: ProcessingStage[]) => void;
  onResetToStage?: (stage: ProcessingStage) => void;
  isLoading?: boolean;
}

interface StageConfig {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  estimatedTime: string;
  optional?: boolean;
}

const STAGE_CONFIG: Record<ProcessingStage, StageConfig> = {
  MARKDOWN_CONVERSION: {
    name: 'Markdown Conversion',
    description: 'Convert input files to unified markdown format',
    icon: FileText,
    color: 'bg-blue-500',
    estimatedTime: '30s - 2m',
  },
  MARKDOWN_OPTIMIZER: {
    name: 'Markdown Optimizer',
    description: 'LLM-based text improvement and error correction',
    icon: Zap,
    color: 'bg-yellow-500',
    estimatedTime: '1m - 3m',
    optional: true,
  },
  CHUNKER: {
    name: 'Chunker',
    description: 'Create summary, chunks, and contextual embeddings',
    icon: Scissors,
    color: 'bg-green-500',
    estimatedTime: '30s - 1m',
  },
  FACT_GENERATOR: {
    name: 'Fact Generator',
    description: 'Extract facts, entities, relations, and keywords',
    icon: Brain,
    color: 'bg-purple-500',
    estimatedTime: '1m - 4m',
  },
  INGESTOR: {
    name: 'Ingestor',
    description: 'Database ingestion and storage',
    icon: Database,
    color: 'bg-indigo-500',
    estimatedTime: '10s - 30s',
  },
};

const STATUS_CONFIG = {
  PENDING: { color: 'bg-gray-500', icon: Clock, label: 'Pending' },
  RUNNING: { color: 'bg-blue-500', icon: LoadingSpinner, label: 'Running' },
  COMPLETED: { color: 'bg-green-500', icon: CheckCircle, label: 'Completed' },
  FAILED: { color: 'bg-red-500', icon: XCircle, label: 'Failed' },
  SKIPPED: { color: 'bg-gray-400', icon: ChevronRight, label: 'Skipped' },
};

export function StageVisualizationView({
  documentId,
  pipelineStatus,
  executions,
  onExecuteStage,
  onExecuteChain,
  onResetToStage,
  isLoading = false,
}: StageVisualizationProps) {
  const [selectedStage, setSelectedStage] = useState<ProcessingStage | null>(null);
  const [showExecutionHistory, setShowExecutionHistory] = useState(false);

  // Add debugging to track pipeline status changes
  useEffect(() => {
    console.log('🎯 [StageVisualizationView] Pipeline status updated:', {
      currentStage: pipelineStatus.currentStage,
      stageStatus: pipelineStatus.stageStatus,
      completedStages: pipelineStatus.completedStages,
      failedStages: pipelineStatus.failedStages,
      progress: pipelineStatus.progress
    });
  }, [pipelineStatus]);

  const stages: ProcessingStage[] = [
    'MARKDOWN_CONVERSION',
    'MARKDOWN_OPTIMIZER',
    'CHUNKER',
    'FACT_GENERATOR',
    'INGESTOR',
  ];

  const getStageStatus = (stage: ProcessingStage): StageStatus => {
    if (pipelineStatus.completedStages.includes(stage)) return 'COMPLETED';
    if (pipelineStatus.failedStages.includes(stage)) return 'FAILED';
    if (pipelineStatus.currentStage === stage) return pipelineStatus.stageStatus;
    return 'PENDING';
  };

  const getLatestExecution = (stage: ProcessingStage) => {
    return executions
      .filter(exec => exec.stage === stage)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
  };

  const formatDuration = (startedAt: Date, completedAt?: Date) => {
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const duration = Math.round((end - start) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.round(duration / 60)}m ${duration % 60}s`;
    return `${Math.round(duration / 3600)}h ${Math.round((duration % 3600) / 60)}m`;
  };

  const canExecuteStage = (stage: ProcessingStage) => {
    const stageIndex = stages.indexOf(stage);
    if (stageIndex === 0) return true; // First stage can always be executed
    
    // Check if previous required stages are completed
    for (let i = 0; i < stageIndex; i++) {
      const prevStage = stages[i];
      if (prevStage === 'MARKDOWN_OPTIMIZER') continue; // Optional stage
      if (!pipelineStatus.completedStages.includes(prevStage)) {
        return false;
      }
    }
    return true;
  };

  // Create a key that changes when pipeline status changes to force re-render
  const pipelineKey = `${pipelineStatus.currentStage}-${pipelineStatus.stageStatus}-${pipelineStatus.completedStages.join(',')}-${pipelineStatus.failedStages.join(',')}`;

  return (
    <div className="space-y-6" key={pipelineKey}>
      {/* Pipeline Progress */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Processing Pipeline</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {pipelineStatus.progress}% Complete
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${pipelineStatus.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stage Flow */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4">
          {stages.map((stage, index) => {
            const config = STAGE_CONFIG[stage];
            const status = getStageStatus(stage);
            const statusConfig = STATUS_CONFIG[status];
            const execution = getLatestExecution(stage);
            const isActive = pipelineStatus.currentStage === stage;
            const StatusIcon = statusConfig.icon;
            const StageIcon = config.icon;

            return (
              <React.Fragment key={stage}>
                <div
                  className={`relative flex flex-col items-center p-4 rounded-lg border-2 min-w-[200px] cursor-pointer transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : status === 'COMPLETED'
                      ? 'border-green-500 bg-green-50'
                      : status === 'FAILED'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  } ${selectedStage === stage ? 'ring-2 ring-blue-300' : ''}`}
                  onClick={() => setSelectedStage(selectedStage === stage ? null : stage)}
                >
                  {/* Stage Icon and Status */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`p-2 rounded-full ${config.color} text-white`}>
                      <StageIcon className="w-4 h-4" />
                    </div>
                    <div className={`p-1 rounded-full ${statusConfig.color} text-white`}>
                      <StatusIcon className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Stage Info */}
                  <div className="text-center">
                    <h4 className="font-medium text-sm">{config.name}</h4>
                    {config.optional && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Optional
                      </Badge>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {statusConfig.label}
                    </p>
                    {execution && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDuration(execution.startedAt, execution.completedAt)}
                      </p>
                    )}
                  </div>

                  {/* Error Indicator */}
                  {status === 'FAILED' && execution?.errorMessage && (
                    <div className="absolute -top-1 -right-1">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                </div>

                {/* Arrow */}
                {index < stages.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            onClick={() => onExecuteChain?.(stages)}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Run Full Pipeline</span>
          </Button>
          
          {pipelineStatus.nextStage && (
            <Button
              variant="outline"
              onClick={() => onExecuteStage?.(pipelineStatus.nextStage!)}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Run Next Stage</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setShowExecutionHistory(!showExecutionHistory)}
            className="flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Execution History</span>
          </Button>
        </div>
      </div>

      {/* Selected Stage Details */}
      {selectedStage && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {STAGE_CONFIG[selectedStage].name}
            </h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => onExecuteStage?.(selectedStage)}
                disabled={!canExecuteStage(selectedStage) || isLoading}
                className="flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Execute</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResetToStage?.(selectedStage)}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset To</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600">
                {STAGE_CONFIG[selectedStage].description}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Estimated Time</h4>
              <p className="text-sm text-gray-600">
                {STAGE_CONFIG[selectedStage].estimatedTime}
              </p>
            </div>
          </div>

          {/* Latest Execution Details */}
          {(() => {
            const execution = getLatestExecution(selectedStage);
            if (!execution) return null;

            return (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Latest Execution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge className={`ml-2 ${STATUS_CONFIG[execution.status].color}`}>
                      {execution.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2">
                      {formatDuration(execution.startedAt, execution.completedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Started:</span>
                    <span className="ml-2">
                      {new Date(execution.startedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {execution.completedAt && (
                    <div>
                      <span className="text-gray-600">Completed:</span>
                      <span className="ml-2">
                        {new Date(execution.completedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {execution.errorMessage && (
                  <div className="mt-2">
                    <span className="text-gray-600">Error:</span>
                    <p className="text-red-600 text-sm mt-1 p-2 bg-red-50 rounded">
                      {execution.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Execution History */}
      {showExecutionHistory && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Execution History</h3>
          <div className="space-y-3">
            {executions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No executions found for this document.
              </p>
            ) : (
              executions.map((execution) => {
                const config = STAGE_CONFIG[execution.stage];
                const statusConfig = STATUS_CONFIG[execution.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${statusConfig.color} text-white`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{config.name}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(execution.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={statusConfig.color}>
                        {execution.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDuration(execution.startedAt, execution.completedAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StageVisualizationView;