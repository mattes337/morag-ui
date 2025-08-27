'use client';

import React from 'react';
import { ProcessingStage, StageStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  FileText, 
  Zap, 
  Scissors, 
  Brain, 
  Database,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface StageProgressProps {
  currentStage: ProcessingStage | null;
  stageStatus: StageStatus;
  completedStages: ProcessingStage[];
  failedStages: ProcessingStage[];
  progress: number;
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
}

const STAGE_CONFIG = {
  MARKDOWN_CONVERSION: {
    name: 'Converter',
    shortName: 'CVT',
    icon: FileText,
    color: 'text-blue-600',
  },
  MARKDOWN_OPTIMIZER: {
    name: 'Optimizer',
    shortName: 'OPT',
    icon: Zap,
    color: 'text-yellow-600',
  },
  CHUNKER: {
    name: 'Chunker',
    shortName: 'CHK',
    icon: Scissors,
    color: 'text-green-600',
  },
  FACT_GENERATOR: {
    name: 'Facts',
    shortName: 'FCT',
    icon: Brain,
    color: 'text-purple-600',
  },
  INGESTOR: {
    name: 'Ingestor',
    shortName: 'ING',
    icon: Database,
    color: 'text-indigo-600',
  },
};

const STATUS_ICONS = {
  PENDING: Clock,
  RUNNING: Loader2,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  SKIPPED: AlertTriangle,
  DEPENDENCY_RESOLUTION: Loader2,
};

const STATUS_COLORS = {
  PENDING: 'text-gray-400',
  RUNNING: 'text-blue-500 animate-spin',
  COMPLETED: 'text-green-500',
  FAILED: 'text-red-500',
  SKIPPED: 'text-yellow-500',
  DEPENDENCY_RESOLUTION: 'text-orange-500',
};

export function StageProgress({
  currentStage,
  stageStatus,
  completedStages,
  failedStages,
  progress,
  showLabels = true,
  compact = false,
  className,
}: StageProgressProps) {
  const stages: ProcessingStage[] = [
    'MARKDOWN_CONVERSION',
    'MARKDOWN_OPTIMIZER',
    'CHUNKER',
    'FACT_GENERATOR',
    'INGESTOR',
  ];

  const getStageStatus = (stage: ProcessingStage): StageStatus => {
    if (completedStages.includes(stage)) return 'COMPLETED';
    if (failedStages.includes(stage)) return 'FAILED';
    if (currentStage === stage) return stageStatus;
    return 'PENDING';
  };

  const getProgressColor = () => {
    if (failedStages.length > 0) return 'bg-red-500';
    if (currentStage && stageStatus === 'RUNNING') return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="flex items-center space-x-1">
          {stages.map((stage) => {
            const config = STAGE_CONFIG[stage];
            const status = getStageStatus(stage);
            const StatusIcon = STATUS_ICONS[status];
            const StageIcon = config.icon;
            const isActive = currentStage === stage;

            return (
              <div
                key={stage}
                className={cn(
                  'relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all',
                  {
                    'border-blue-500 bg-blue-50': isActive && status === 'RUNNING',
                    'border-green-500 bg-green-50': status === 'COMPLETED',
                    'border-red-500 bg-red-50': status === 'FAILED',
                    'border-gray-300 bg-gray-50': status === 'PENDING',
                    'border-orange-500 bg-orange-50': status === 'DEPENDENCY_RESOLUTION',
                  }
                )}
                title={`${config.name}: ${status}`}
              >
                <StageIcon className={cn('w-3 h-3', config.color)} />
                {status === 'RUNNING' ? (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <LoadingSpinner variant="inline" className="w-2 h-2" />
                  </div>
                ) : (
                  <StatusIcon 
                    className={cn(
                      'absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full',
                      STATUS_COLORS[status]
                    )} 
                  />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex-1 min-w-0">
          <Progress value={progress} className="h-2" />
        </div>
        
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
          {progress}%
        </span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Processing Progress
          </span>
          <span className="text-sm font-medium text-gray-600">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              getProgressColor()
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="grid grid-cols-5 gap-2">
        {stages.map((stage) => {
          const config = STAGE_CONFIG[stage];
          const status = getStageStatus(stage);
          const StatusIcon = STATUS_ICONS[status];
          const StageIcon = config.icon;
          const isActive = currentStage === stage;

          return (
            <div
              key={stage}
              className={cn(
                'flex flex-col items-center p-2 rounded-lg border transition-all',
                {
                  'border-blue-500 bg-blue-50': isActive && status === 'RUNNING',
                  'border-green-500 bg-green-50': status === 'COMPLETED',
                  'border-red-500 bg-red-50': status === 'FAILED',
                  'border-gray-200 bg-gray-50': status === 'PENDING',
                  'border-orange-500 bg-orange-50': status === 'DEPENDENCY_RESOLUTION',
                }
              )}
            >
              <div className="relative mb-1">
                <div className={cn(
                  'p-2 rounded-full',
                  {
                    'bg-blue-500 text-white': isActive && status === 'RUNNING',
                    'bg-green-500 text-white': status === 'COMPLETED',
                    'bg-red-500 text-white': status === 'FAILED',
                    'bg-gray-300 text-gray-600': status === 'PENDING',
                    'bg-orange-500 text-white': status === 'DEPENDENCY_RESOLUTION',
                  }
                )}>
                  <StageIcon className="w-4 h-4" />
                </div>
                <StatusIcon 
                  className={cn(
                    'absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full p-0.5',
                    STATUS_COLORS[status]
                  )} 
                />
              </div>
              
              {showLabels && (
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-700">
                    {config.shortName}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs mt-1',
                      {
                        'bg-blue-100 text-blue-700': isActive && status === 'RUNNING',
                        'bg-green-100 text-green-700': status === 'COMPLETED',
                        'bg-red-100 text-red-700': status === 'FAILED',
                        'bg-gray-100 text-gray-600': status === 'PENDING',
                      }
                    )}
                  >
                    {status.toLowerCase()}
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Stage Info */}
      {currentStage && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="p-1 bg-blue-500 rounded-full text-white">
            {React.createElement(STATUS_ICONS[stageStatus], {
              className: cn(
                'w-4 h-4',
                stageStatus === 'RUNNING' ? 'animate-spin' : ''
              )
            })}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              {stageStatus === 'RUNNING' ? 'Processing' :
               stageStatus === 'DEPENDENCY_RESOLUTION' ? 'Resolving Dependencies' :
               'Current Stage'}: {STAGE_CONFIG[currentStage].name}
            </p>
            {stageStatus === 'FAILED' && (
              <p className="text-xs text-red-600 mt-1">
                Stage execution failed. Check logs for details.
              </p>
            )}
            {stageStatus === 'DEPENDENCY_RESOLUTION' && (
              <p className="text-xs text-orange-600 mt-1">
                Missing dependencies are being processed automatically.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StageProgress;