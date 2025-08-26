'use client';

import React from 'react';
import { Badge } from '../badge';
import { Progress } from '../progress';
import { 
  Clock, 
  Loader, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Zap,
  Scissors,
  Brain,
  Database
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
}

interface ProcessingStatusDisplayProps {
  documentId: string;
  processingMode: 'MANUAL' | 'AUTOMATIC';
  currentStage?: ProcessingStage;
  stages?: StageInfo[];
  overallProgress?: number;
  className?: string;
  compact?: boolean;
  hideProcessingMode?: boolean; // Hide processing mode badge when already shown elsewhere
}

const STAGE_CONFIG = {
  MARKDOWN_CONVERSION: {
    name: 'Converter',
    icon: FileText,
    color: 'bg-blue-500'
  },
  MARKDOWN_OPTIMIZER: {
    name: 'Optimizer',
    icon: Zap,
    color: 'bg-yellow-500'
  },
  CHUNKER: {
    name: 'Chunker',
    icon: Scissors,
    color: 'bg-green-500'
  },
  FACT_GENERATOR: {
    name: 'Fact Generator',
    icon: Brain,
    color: 'bg-purple-500'
  },
  INGESTOR: {
    name: 'Ingestor',
    icon: Database,
    color: 'bg-indigo-500'
  }
};

const STATUS_CONFIG = {
  PENDING: { color: 'bg-gray-500', textColor: 'text-gray-700', icon: Clock, label: 'Pending' },
  RUNNING: { color: 'bg-blue-500', textColor: 'text-blue-700', icon: Loader, label: 'Running' },
  COMPLETED: { color: 'bg-green-500', textColor: 'text-green-700', icon: CheckCircle, label: 'Completed' },
  FAILED: { color: 'bg-red-500', textColor: 'text-red-700', icon: XCircle, label: 'Failed' },
  SKIPPED: { color: 'bg-gray-400', textColor: 'text-gray-600', icon: AlertCircle, label: 'Skipped' }
};

export function ProcessingStatusDisplay({
  documentId,
  processingMode,
  currentStage,
  stages = [],
  overallProgress = 0,
  className = '',
  compact = false,
  hideProcessingMode = false
}: ProcessingStatusDisplayProps) {
  const completedStages = stages.filter(s => s.status === 'COMPLETED').length;
  const totalStages = stages.length || 5; // Default to 5 stages if not provided
  const calculatedProgress = stages.length > 0 ? (completedStages / totalStages) * 100 : overallProgress;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {!hideProcessingMode && (
          <Badge variant={processingMode === 'AUTOMATIC' ? 'default' : 'secondary'} className="text-xs">
            {processingMode}
          </Badge>
        )}

        {currentStage && (
          <div className="flex items-center space-x-1">
            {React.createElement(STAGE_CONFIG[currentStage].icon, {
              className: "w-3 h-3 text-gray-500"
            })}
            <span className="text-xs text-gray-600">
              {STAGE_CONFIG[currentStage].name}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-1">
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${calculatedProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {Math.round(calculatedProgress)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Processing Status</h3>
          <Badge variant={processingMode === 'AUTOMATIC' ? 'default' : 'secondary'}>
            {processingMode}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-500">
          {completedStages}/{totalStages} stages
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {Math.round(calculatedProgress)}%
          </span>
        </div>
        <Progress value={calculatedProgress} className="h-2" />
      </div>

      {/* Stage List */}
      {stages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Processing Stages
          </h4>
          
          <div className="space-y-1">
            {stages.map((stageInfo, index) => {
              const stageConfig = STAGE_CONFIG[stageInfo.stage];
              const statusConfig = STATUS_CONFIG[stageInfo.status];
              const StageIcon = stageConfig.icon;
              const StatusIcon = statusConfig.icon;
              
              return (
                <div 
                  key={`${stageInfo.stage}-${index}`}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${stageConfig.color}`} />
                    <StageIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {stageConfig.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {stageInfo.status === 'RUNNING' && stageInfo.progress && (
                      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${stageInfo.progress}%` }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <StatusIcon className={`w-3 h-3 ${statusConfig.textColor} ${stageInfo.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                      <Badge 
                        variant={stageInfo.status === 'COMPLETED' ? 'default' : 
                                stageInfo.status === 'FAILED' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Current Stage Highlight */}
      {currentStage && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center space-x-2">
            {React.createElement(STAGE_CONFIG[currentStage].icon, { 
              className: "w-4 h-4 text-blue-600" 
            })}
            <span className="text-sm font-medium text-blue-900">
              Currently processing: {STAGE_CONFIG[currentStage].name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessingStatusDisplay;