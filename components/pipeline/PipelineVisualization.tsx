import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';
import { 
  type StageExecution,
  STAGE_INFO,
  PIPELINE_STAGES,
  getPipelineProgress,
  formatDuration,
  getStatusIcon,
  canRetryStage,
  canSkipStage
} from '@/lib/utils/pipelineHelpers';

const pipelineVisualizationVariants = cva(
  'w-full',
  {
    variants: {
      layout: {
        horizontal: '',
        compact: 'max-w-4xl mx-auto',
      },
      size: {
        sm: 'text-sm',
        default: '',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      layout: 'horizontal',
      size: 'default',
    },
  }
);

const stageFlowVariants = cva(
  'flex items-center gap-2 w-full overflow-x-auto pb-2',
  {
    variants: {
      responsive: {
        true: 'md:gap-4',
        false: '',
      },
    },
    defaultVariants: {
      responsive: true,
    },
  }
);

const stageItemVariants = cva(
  'flex-shrink-0 min-w-[180px] max-w-[220px] p-3 rounded-lg border transition-all duration-200',
  {
    variants: {
      status: {
        pending: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900',
        running: 'border-blue-200 bg-blue-50 shadow-md dark:border-blue-700 dark:bg-blue-900 animate-pulse',
        completed: 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900',
        failed: 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900',
        skipped: 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        false: '',
      },
    },
    defaultVariants: {
      status: 'pending',
      interactive: false,
    },
  }
);

const connectionVariants = cva(
  'flex items-center justify-center flex-shrink-0',
  {
    variants: {
      status: {
        pending: 'text-gray-400',
        active: 'text-blue-500',
        completed: 'text-green-500',
        failed: 'text-red-500',
      },
      size: {
        sm: 'w-6',
        default: 'w-8',
        lg: 'w-10',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'default',
    },
  }
);

export interface PipelineVisualizationProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pipelineVisualizationVariants> {
  /**
   * Pipeline stage executions
   */
  executions: StageExecution[];
  /**
   * Document name being processed
   */
  documentName?: string;
  /**
   * Whether stages are clickable for details
   */
  interactive?: boolean;
  /**
   * Whether to show animated progress bars between stages
   */
  showAnimatedProgress?: boolean;
  /**
   * Whether to show detailed stage information
   */
  showDetails?: boolean;
  /**
   * Whether to show action buttons (retry/skip)
   */
  showActions?: boolean;
  /**
   * Whether to enable responsive design for mobile
   */
  responsive?: boolean;
  /**
   * Callback when a stage is clicked
   */
  onStageClick?: (execution: StageExecution) => void;
  /**
   * Callback when retry is clicked
   */
  onRetry?: (execution: StageExecution) => void;
  /**
   * Callback when skip is clicked
   */
  onSkip?: (execution: StageExecution) => void;
}

const PipelineVisualization = React.forwardRef<HTMLDivElement, PipelineVisualizationProps>(
  ({
    className,
    executions = [],
    documentName,
    interactive = false,
    showAnimatedProgress = true,
    showDetails = true,
    showActions = true,
    responsive = true,
    layout,
    size,
    onStageClick,
    onRetry,
    onSkip,
    ...props
  }, ref) => {
    // Calculate pipeline progress
    const progress = getPipelineProgress(executions);
    
    // Get stage connections for animated progress bars (for future use)
    // const connections = getStageConnections(executions);
    
    // Ensure we have executions for all pipeline stages
    const stageExecutions = PIPELINE_STAGES.map(stageName => {
      return executions.find(exec => exec.stage === stageName) || {
        id: `missing-${stageName}`,
        stage: stageName,
        status: 'PENDING' as const,
        progress: 0,
      };
    });

    // Handle stage interactions
    const handleStageClick = (execution: StageExecution) => {
      if (interactive && onStageClick) {
        onStageClick(execution);
      }
    };

    const handleRetry = (execution: StageExecution) => {
      if (onRetry && canRetryStage(execution)) {
        onRetry(execution);
      }
    };

    const handleSkip = (execution: StageExecution) => {
      if (onSkip && canSkipStage(execution)) {
        onSkip(execution);
      }
    };

    // Get stage status for styling
    const getStageStatus = (execution: StageExecution) => {
      switch (execution.status) {
        case 'PENDING': return 'pending';
        case 'RUNNING': return 'running';
        case 'COMPLETED': return 'completed';
        case 'FAILED': return 'failed';
        case 'SKIPPED': return 'skipped';
        default: return 'pending';
      }
    };

    // Get connection status for animated progress
    const getConnectionStatus = (fromExecution: StageExecution, toExecution: StageExecution) => {
      if (fromExecution.status === 'COMPLETED' && toExecution.status === 'RUNNING') {
        return 'active';
      } else if (fromExecution.status === 'COMPLETED' && toExecution.status === 'COMPLETED') {
        return 'completed';
      } else if (fromExecution.status === 'FAILED' || toExecution.status === 'FAILED') {
        return 'failed';
      }
      return 'pending';
    };

    return (
      <div
        ref={ref}
        className={cn(pipelineVisualizationVariants({ layout, size }), className)}
        {...props}
      >
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            {documentName && (
              <div className="mb-6">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Processing Pipeline
                  </h3>
                  <Badge 
                    variant={
                      progress.overall === 100 ? 'success' :
                      progress.failedStages.length > 0 ? 'destructive' :
                      progress.currentStage ? 'default' :
                      'secondary'
                    }
                  >
                    {progress.overall}% Complete
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {documentName}
                </p>
                
                {/* Overall progress bar */}
                <div className="mt-3">
                  <Progress
                    value={progress.overall}
                    variant={
                      progress.overall === 100 ? 'success' :
                      progress.failedStages.length > 0 ? 'destructive' :
                      'default'
                    }
                    size="sm"
                    showValue
                    label="Overall Progress"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Pipeline Stage Flow */}
            <div className={cn(stageFlowVariants({ responsive }))}>
              {stageExecutions.map((execution, index) => {
                const stageInfo = STAGE_INFO[execution.stage];
                const stageStatus = getStageStatus(execution);
                const isLastStage = index === stageExecutions.length - 1;
                
                return (
                  <React.Fragment key={execution.stage}>
                    {/* Stage Item */}
                    <div 
                      className={cn(stageItemVariants({ 
                        status: stageStatus, 
                        interactive 
                      }))}
                      onClick={() => handleStageClick(execution)}
                      role={interactive ? 'button' : undefined}
                      tabIndex={interactive ? 0 : undefined}
                      onKeyDown={interactive ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStageClick(execution);
                        }
                      } : undefined}
                      aria-label={interactive ? 
                        `View details for ${stageInfo.displayName}` : 
                        undefined
                      }
                    >
                      {/* Stage Icon and Status */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg" aria-hidden="true">
                            {execution.status === 'RUNNING' ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle 
                                  className="opacity-25" 
                                  cx="12" 
                                  cy="12" 
                                  r="10" 
                                  stroke="currentColor" 
                                  strokeWidth="4"
                                />
                                <path 
                                  className="opacity-75" 
                                  fill="currentColor" 
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            ) : (
                              stageInfo.icon
                            )}
                          </span>
                          <Badge
                            variant={
                              stageStatus === 'completed' ? 'success' :
                              stageStatus === 'running' ? 'default' :
                              stageStatus === 'failed' ? 'destructive' :
                              stageStatus === 'skipped' ? 'warning' :
                              'secondary'
                            }
                            size="sm"
                          >
                            {execution.progress}%
                          </Badge>
                        </div>
                        
                        <span className="text-xs text-muted-foreground">
                          {getStatusIcon(execution.status)}
                        </span>
                      </div>

                      {/* Stage Name and Description */}
                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-foreground leading-tight">
                          {stageInfo.displayName}
                        </h4>
                        {showDetails && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {stageInfo.description}
                          </p>
                        )}
                      </div>

                      {/* Progress bar for running stages */}
                      {execution.status === 'RUNNING' && execution.progress > 0 && (
                        <div className="mb-2">
                          <Progress
                            value={execution.progress}
                            size="sm"
                            variant="default"
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* Processing time */}
                      {showDetails && execution.duration && (
                        <div className="text-xs text-muted-foreground mb-2">
                          Duration: {formatDuration(execution.duration)}
                        </div>
                      )}

                      {/* Error message for failed stages */}
                      {execution.status === 'FAILED' && execution.errorMessage && (
                        <div className="text-xs text-red-600 dark:text-red-400 mb-2 p-2 bg-red-100 dark:bg-red-900/20 rounded border">
                          {execution.errorMessage}
                        </div>
                      )}

                      {/* Action buttons */}
                      {showActions && execution.status === 'FAILED' && (
                        <div className="flex gap-1">
                          {canRetryStage(execution) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRetry(execution);
                              }}
                              className="flex-1 text-xs h-7"
                            >
                              Retry
                            </Button>
                          )}
                          {canSkipStage(execution) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSkip(execution);
                              }}
                              className="flex-1 text-xs h-7"
                            >
                              Skip
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Connection Arrow */}
                    {!isLastStage && stageExecutions[index + 1] && (
                      <div className={cn(connectionVariants({ 
                        status: getConnectionStatus(execution, stageExecutions[index + 1]!),
                        size 
                      }))}>
                        {showAnimatedProgress && 
                         execution.status === 'COMPLETED' && 
                         stageExecutions[index + 1]!.status === 'RUNNING' ? (
                          // Animated progress arrow
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative">
                              <svg 
                                className="w-6 h-6 text-blue-500" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                                />
                              </svg>
                              {/* Animated dots */}
                              <div className="absolute -top-1 -right-1">
                                <div className="flex space-x-0.5">
                                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
                                </div>
                              </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Processing in progress
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          // Static arrow
                          <svg 
                            className={cn(
                              'w-6 h-6',
                              getConnectionStatus(execution, stageExecutions[index + 1]!) === 'completed' && 'text-green-500',
                              getConnectionStatus(execution, stageExecutions[index + 1]!) === 'failed' && 'text-red-500'
                            )} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M13 7l5 5m0 0l-5 5m5-5H6" 
                            />
                          </svg>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pipeline Summary */}
            {showDetails && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {progress.completedStages.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {progress.currentStage ? 1 : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Running</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">
                      {progress.failedStages.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-yellow-600">
                      {progress.skippedStages.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Skipped</div>
                  </div>
                </div>
                
                {progress.estimatedTimeRemaining && (
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    Estimated time remaining: {formatDuration(progress.estimatedTimeRemaining)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Pipeline processing status: {progress.overall}% complete.
          {progress.currentStage && ` Currently processing ${progress.currentStage.replace('-', ' ')}.`}
          {progress.failedStages.length > 0 && ` ${progress.failedStages.length} stages failed.`}
        </div>
      </div>
    );
  }
);

PipelineVisualization.displayName = 'PipelineVisualization';

export { PipelineVisualization, pipelineVisualizationVariants, stageFlowVariants };