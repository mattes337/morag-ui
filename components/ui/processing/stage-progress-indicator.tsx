'use client';

import React from 'react';
import { Badge } from '../badge';
import { Progress } from '../progress';
import { 
  FileText,
  Zap,
  Scissors,
  Brain,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  AlertCircle
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

interface StageProgressIndicatorProps {
  stages: StageInfo[];
  currentStage?: ProcessingStage;
  overallProgress?: number;
  compact?: boolean;
  showLabels?: boolean;
  showProgress?: boolean;
  className?: string;
}

const STAGE_CONFIG = {
  MARKDOWN_CONVERSION: {
    name: 'Markdown Conversion',
    shortName: 'Convert',
    icon: FileText,
    color: 'bg-blue-500',
    order: 1
  },
  MARKDOWN_OPTIMIZER: {
    name: 'Markdown Optimizer',
    shortName: 'Optimize',
    icon: Zap,
    color: 'bg-yellow-500',
    order: 2
  },
  CHUNKER: {
    name: 'Chunker',
    shortName: 'Chunk',
    icon: Scissors,
    color: 'bg-green-500',
    order: 3
  },
  FACT_GENERATOR: {
    name: 'Fact Generator',
    shortName: 'Extract',
    icon: Brain,
    color: 'bg-purple-500',
    order: 4
  },
  INGESTOR: {
    name: 'Ingestor',
    shortName: 'Ingest',
    icon: Database,
    color: 'bg-indigo-500',
    order: 5
  }
};

const STATUS_CONFIG = {
  PENDING: { 
    color: 'border-gray-300 bg-gray-50', 
    iconColor: 'text-gray-400', 
    icon: Clock,
    badgeVariant: 'secondary' as const
  },
  RUNNING: { 
    color: 'border-blue-500 bg-blue-50', 
    iconColor: 'text-blue-600', 
    icon: Loader,
    badgeVariant: 'default' as const
  },
  COMPLETED: { 
    color: 'border-green-500 bg-green-50', 
    iconColor: 'text-green-600', 
    icon: CheckCircle,
    badgeVariant: 'default' as const
  },
  FAILED: { 
    color: 'border-red-500 bg-red-50', 
    iconColor: 'text-red-600', 
    icon: XCircle,
    badgeVariant: 'destructive' as const
  },
  SKIPPED: { 
    color: 'border-gray-300 bg-gray-50', 
    iconColor: 'text-gray-400', 
    icon: AlertCircle,
    badgeVariant: 'secondary' as const
  }
};

export function StageProgressIndicator({
  stages,
  currentStage,
  overallProgress,
  compact = false,
  showLabels = true,
  showProgress = true,
  className = ''
}: StageProgressIndicatorProps) {
  // Sort stages by their configured order
  const sortedStages = [...stages].sort((a, b) => 
    STAGE_CONFIG[a.stage].order - STAGE_CONFIG[b.stage].order
  );

  // Calculate overall progress if not provided
  const calculatedProgress = overallProgress ?? (
    (stages.filter(s => s.status === 'COMPLETED').length / stages.length) * 100
  );

  // Find current stage info
  const currentStageInfo = currentStage ? stages.find(s => s.stage === currentStage) : null;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Compact Stage Icons */}
        <div className="flex items-center space-x-1">
          {sortedStages.map((stageInfo, index) => {
            const stageConfig = STAGE_CONFIG[stageInfo.stage];
            const statusConfig = STATUS_CONFIG[stageInfo.status];
            const StageIcon = stageConfig.icon;
            const isRunning = stageInfo.status === 'RUNNING';
            const isCurrent = currentStage === stageInfo.stage;
            
            return (
              <div key={stageInfo.stage} className="flex items-center">
                <div 
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${statusConfig.color}
                    ${isCurrent ? 'ring-2 ring-blue-300' : ''}
                  `}
                  title={`${stageConfig.name}: ${stageInfo.status}`}
                >
                  <StageIcon 
                    className={`w-3 h-3 ${statusConfig.iconColor} ${isRunning ? 'animate-spin' : ''}`} 
                  />
                </div>
                
                {/* Connector Line */}
                {index < sortedStages.length - 1 && (
                  <div className="w-4 h-0.5 bg-gray-300 mx-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Percentage */}
        {showProgress && (
          <Badge variant="outline" className="text-xs">
            {Math.round(calculatedProgress)}%
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{Math.round(calculatedProgress)}%</span>
          </div>
          <Progress value={calculatedProgress} className="h-2" />
        </div>
      )}

      {/* Current Stage Info */}
      {currentStageInfo && (
        <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Currently: {STAGE_CONFIG[currentStageInfo.stage].name}
            </p>
            {currentStageInfo.progress !== undefined && (
              <p className="text-xs text-blue-700">
                {currentStageInfo.progress}% complete
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stage Timeline */}
      <div className="space-y-3">
        {sortedStages.map((stageInfo, index) => {
          const stageConfig = STAGE_CONFIG[stageInfo.stage];
          const statusConfig = STATUS_CONFIG[stageInfo.status];
          const StageIcon = stageConfig.icon;
          const StatusIcon = statusConfig.icon;
          const isRunning = stageInfo.status === 'RUNNING';
          const isCurrent = currentStage === stageInfo.stage;
          const isLast = index === sortedStages.length - 1;
          
          return (
            <div key={stageInfo.stage} className="flex items-start space-x-3">
              {/* Stage Icon with Connector */}
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center
                    ${statusConfig.color}
                    ${isCurrent ? 'ring-2 ring-blue-300' : ''}
                  `}
                >
                  <StageIcon 
                    className={`w-4 h-4 ${statusConfig.iconColor} ${isRunning ? 'animate-spin' : ''}`} 
                  />
                </div>
                
                {/* Vertical Connector */}
                {!isLast && (
                  <div className="w-0.5 h-8 bg-gray-300 mt-1" />
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {showLabels && (
                      <h4 className="text-sm font-medium text-gray-900">
                        {stageConfig.name}
                      </h4>
                    )}
                    
                    <Badge variant={statusConfig.badgeVariant} className="text-xs">
                      <StatusIcon className={`w-3 h-3 mr-1 ${isRunning ? 'animate-spin' : ''}`} />
                      {stageInfo.status}
                    </Badge>
                  </div>
                  
                  {/* Stage Progress */}
                  {isRunning && stageInfo.progress !== undefined && (
                    <span className="text-xs text-gray-600">
                      {stageInfo.progress}%
                    </span>
                  )}
                </div>

                {/* Stage Progress Bar */}
                {isRunning && stageInfo.progress !== undefined && (
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${stageInfo.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {stageInfo.status === 'FAILED' && stageInfo.errorMessage && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {stageInfo.errorMessage}
                  </div>
                )}

                {/* Timestamps */}
                {(stageInfo.startedAt || stageInfo.completedAt) && (
                  <div className="mt-1 text-xs text-gray-500">
                    {stageInfo.startedAt && (
                      <span>Started: {stageInfo.startedAt.toLocaleTimeString()}</span>
                    )}
                    {stageInfo.completedAt && (
                      <span className="ml-3">
                        Completed: {stageInfo.completedAt.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StageProgressIndicator;