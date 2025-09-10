'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Badge, Progress, Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { cn } from '@/lib/utils';
import { 
  PipelineStage, 
  PipelineStageStatus,
  getStageStatusIcon,
  formatDuration 
} from '@/lib/mockData/pipelineMockData';

const stageIndicatorVariants = cva(
  'relative flex flex-col items-center gap-3 p-4 rounded-lg border transition-all duration-200',
  {
    variants: {
      status: {
        pending: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
        running: 'bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-md animate-pulse',
        completed: 'bg-green-50 border-green-200 hover:bg-green-100',
        failed: 'bg-red-50 border-red-200 hover:bg-red-100',
        skipped: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      },
      size: {
        sm: 'p-2 gap-2',
        default: 'p-4 gap-3',
        lg: 'p-6 gap-4',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg transform hover:scale-105',
        false: 'cursor-default',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'default',
      interactive: false,
    },
  }
);

const statusBadgeVariants = cva(
  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border',
  {
    variants: {
      status: {
        pending: 'text-gray-700 bg-gray-100 border-gray-300',
        running: 'text-blue-700 bg-blue-100 border-blue-300 animate-pulse',
        completed: 'text-green-700 bg-green-100 border-green-300',
        failed: 'text-red-700 bg-red-100 border-red-300',
        skipped: 'text-yellow-700 bg-yellow-100 border-yellow-300',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  }
);

export interface StageIndicatorProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stageIndicatorVariants> {
  /**
   * Pipeline stage data
   */
  stage: PipelineStage;
  /**
   * Whether the indicator is interactive (clickable)
   */
  interactive?: boolean;
  /**
   * Size variant
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * Show detailed information
   */
  showDetails?: boolean;
  /**
   * Show progress bar
   */
  showProgress?: boolean;
  /**
   * Show duration information
   */
  showDuration?: boolean;
  /**
   * Show action buttons (retry, skip)
   */
  showActions?: boolean;
  /**
   * Callback when stage is clicked
   */
  onStageClick?: (stage: PipelineStage) => void;
  /**
   * Callback for retry action
   */
  onRetry?: (stageId: string) => void;
  /**
   * Callback for skip action
   */
  onSkip?: (stageId: string) => void;
}

/**
 * StageIndicator component displays the status and progress of a pipeline stage
 */
const StageIndicator = React.forwardRef<HTMLDivElement, StageIndicatorProps>(
  ({ 
    className,
    stage,
    interactive = false,
    size = 'default',
    showDetails = true,
    showProgress = true,
    showDuration = true,
    showActions = true,
    onStageClick,
    onRetry,
    onSkip,
    ...props 
  }, ref) => {
    const handleClick = () => {
      if (interactive && onStageClick) {
        onStageClick(stage);
      }
    };

    const handleRetry = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRetry && stage.canRetry) {
        onRetry(stage.id);
      }
    };

    const handleSkip = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onSkip && stage.canSkip) {
        onSkip(stage.id);
      }
    };

    const getStatusIcon = () => {
      const icon = getStageStatusIcon(stage.status);
      if (stage.status === 'running') {
        return (
          <span className="animate-spin inline-block">
            ⟳
          </span>
        );
      }
      return icon;
    };

    const getProgressVariant = () => {
      switch (stage.status) {
        case 'completed':
          return 'success';
        case 'failed':
          return 'destructive';
        case 'running':
          return 'default';
        default:
          return 'default';
      }
    };

    const stageContent = (
      <div
        className={cn(
          stageIndicatorVariants({ 
            status: stage.status, 
            size, 
            interactive 
          }),
          className
        )}
        onClick={handleClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        } : undefined}
        {...props}
        ref={ref}
      >
        {/* Stage Icon and Status Badge */}
        <div className="flex items-center gap-2">
          <div className={cn(
            statusBadgeVariants({ status: stage.status }),
            'rounded-full min-w-[2rem] h-8 justify-center'
          )}>
            <span className="text-sm font-bold">
              {getStatusIcon()}
            </span>
          </div>
          
          <Badge 
            variant={
              stage.status === 'completed' ? 'success' :
              stage.status === 'failed' ? 'destructive' :
              stage.status === 'running' ? 'default' :
              stage.status === 'skipped' ? 'warning' :
              'outline'
            }
            className="text-xs capitalize"
          >
            {stage.status}
          </Badge>
        </div>

        {/* Stage Name */}
        <div className="text-center min-w-0">
          <h3 className={cn(
            'font-semibold text-foreground mb-1',
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          )}>
            {stage.displayName}
          </h3>
          
          {showDetails && (
            <p className={cn(
              'text-muted-foreground leading-tight',
              size === 'sm' ? 'text-xs' : 'text-sm'
            )}>
              {stage.description}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && stage.progress > 0 && (
          <div className="w-full">
            <Progress
              value={stage.progress}
              variant={getProgressVariant()}
              size={size === 'sm' ? 'sm' : 'default'}
              showValue
              className="w-full"
            />
          </div>
        )}

        {/* Duration Information */}
        {showDuration && stage.duration && (
          <div className={cn(
            'text-muted-foreground text-center',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            <span>Duration: {formatDuration(stage.duration)}</span>
            {stage.startTime && (
              <div className="text-xs opacity-75 mt-1">
                Started: {stage.startTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {stage.status === 'failed' && stage.errorMessage && (
          <div className="w-full p-2 bg-red-100 border border-red-200 rounded text-red-800 text-xs">
            <strong>Error:</strong> {stage.errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && stage.status === 'failed' && (
          <div className="flex gap-2">
            {stage.canRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="text-xs"
              >
                Retry
              </Button>
            )}
            {stage.canSkip && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSkip}
                className="text-xs text-yellow-700 hover:text-yellow-800"
              >
                Skip
              </Button>
            )}
          </div>
        )}
      </div>
    );

    // Wrap with tooltip if we have detailed information and stage is not failed (error shows inline)
    if (showDetails && interactive && stage.status !== 'failed') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {stageContent}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-2">
                <div className="font-semibold">{stage.displayName}</div>
                <div className="text-sm">{stage.description}</div>
                {stage.startTime && (
                  <div className="text-xs opacity-75">
                    Started: {stage.startTime.toLocaleString()}
                  </div>
                )}
                {stage.endTime && (
                  <div className="text-xs opacity-75">
                    Completed: {stage.endTime.toLocaleString()}
                  </div>
                )}
                {stage.duration && (
                  <div className="text-xs opacity-75">
                    Duration: {formatDuration(stage.duration)}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return stageContent;
  }
);

StageIndicator.displayName = 'StageIndicator';

export { StageIndicator, stageIndicatorVariants, statusBadgeVariants };