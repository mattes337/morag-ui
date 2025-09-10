import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/Tooltip';
import { 
  type StageExecution, 
  formatDuration, 
  getStatusIcon,
  getPipelineProgress
} from '@/lib/utils/pipelineHelpers';

const statusVariants = cva(
  'rounded-lg border p-4 transition-all duration-200',
  {
    variants: {
      status: {
        pending: 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950',
        running: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
        completed: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
        failed: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
        partial: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
      },
      size: {
        sm: 'p-2',
        default: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'default',
    },
  }
);

export interface ProcessingStatusProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {
  /**
   * Pipeline execution data
   */
  executions: StageExecution[];
  /**
   * Document name being processed
   */
  documentName: string;
  /**
   * Whether to show detailed progress information
   */
  showDetails?: boolean;
  /**
   * Whether to show estimated time remaining
   */
  showTimeEstimate?: boolean;
  /**
   * Custom status text override
   */
  statusText?: string;
  /**
   * Callback when status is clicked (for navigation)
   */
  onStatusClick?: () => void;
}

const ProcessingStatus = React.forwardRef<HTMLDivElement, ProcessingStatusProps>(
  ({
    className,
    executions = [],
    documentName,
    showDetails = true,
    showTimeEstimate = true,
    statusText,
    onStatusClick,
    status: statusProp,
    size,
    ...props
  }, ref) => {
    const progress = getPipelineProgress(executions);
    
    // Determine overall status from executions
    const overallStatus = React.useMemo(() => {
      if (statusProp) return statusProp;
      
      if (progress.failedStages.length > 0) {
        return progress.completedStages.length > 0 ? 'partial' : 'failed';
      }
      
      if (progress.overall === 100) {
        return 'completed';
      }
      
      if (progress.currentStage) {
        return 'running';
      }
      
      return 'pending';
    }, [progress, statusProp]);

    // Get status display text
    const getStatusText = () => {
      if (statusText) return statusText;
      
      switch (overallStatus) {
        case 'pending':
          return 'Waiting to start';
        case 'running':
          return `Processing ${progress.currentStage?.replace('-', ' ') || 'document'}...`;
        case 'completed':
          return 'Processing complete';
        case 'failed':
          return 'Processing failed';
        case 'partial':
          return 'Partially complete';
        default:
          return 'Unknown status';
      }
    };

    // Calculate processing metrics
    const completedCount = progress.completedStages.length;
    const totalCount = executions.length;
    const failedCount = progress.failedStages.length;
    const skippedCount = progress.skippedStages.length;

    // Get current stage execution for detailed info
    const currentExecution = executions.find(
      exec => exec.stage === progress.currentStage
    );

    return (
      <div
        ref={ref}
        className={cn(statusVariants({ status: overallStatus, size }), className)}
        onClick={onStatusClick}
        role={onStatusClick ? 'button' : undefined}
        tabIndex={onStatusClick ? 0 : undefined}
        onKeyDown={onStatusClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onStatusClick();
          }
        } : undefined}
        {...props}
      >
        {/* Header with document name and overall status */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {documentName}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {getStatusText()}
            </p>
          </div>
          
          <Badge 
            variant={
              overallStatus === 'completed' ? 'success' :
              overallStatus === 'running' ? 'default' :
              overallStatus === 'failed' ? 'destructive' :
              overallStatus === 'partial' ? 'warning' :
              'secondary'
            }
            className="shrink-0"
          >
            <span className="mr-1" aria-hidden="true">
              {getStatusIcon(
                overallStatus === 'completed' ? 'COMPLETED' :
                overallStatus === 'running' ? 'RUNNING' :
                overallStatus === 'failed' ? 'FAILED' :
                overallStatus === 'partial' ? 'SKIPPED' :
                'PENDING'
              )}
            </span>
            {progress.overall}%
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <Progress
            value={progress.overall}
            variant={
              overallStatus === 'completed' ? 'success' :
              overallStatus === 'failed' ? 'destructive' :
              overallStatus === 'partial' ? 'warning' :
              'default'
            }
            size="sm"
            className="w-full"
            aria-label={`Processing progress: ${progress.overall}% complete`}
          />
        </div>

        {/* Detailed status information */}
        {showDetails && (
          <div className="mt-3 space-y-2">
            {/* Stage summary */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {completedCount} of {totalCount} stages complete
              </span>
              
              {currentExecution && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-blue-600 dark:text-blue-400 font-medium cursor-help">
                        {currentExecution.progress}% through current stage
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Currently processing: {currentExecution.stage.replace('-', ' ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Time estimate */}
            {showTimeEstimate && progress.estimatedTimeRemaining && (
              <div className="text-xs text-muted-foreground">
                <span>Estimated time remaining: </span>
                <span className="font-medium">
                  {formatDuration(progress.estimatedTimeRemaining)}
                </span>
              </div>
            )}

            {/* Error summary for failed stages */}
            {failedCount > 0 && (
              <div className="text-xs text-red-600 dark:text-red-400">
                {failedCount} stage{failedCount > 1 ? 's' : ''} failed
                {skippedCount > 0 && `, ${skippedCount} skipped`}
              </div>
            )}

            {/* Current stage details */}
            {currentExecution && showDetails && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Current: {currentExecution.stage.replace('-', ' ')}
                  </span>
                  {currentExecution.startTime && (
                    <span className="text-muted-foreground">
                      {formatDuration(Date.now() - currentExecution.startTime.getTime())} elapsed
                    </span>
                  )}
                </div>
                
                {currentExecution.progress > 0 && (
                  <Progress
                    value={currentExecution.progress}
                    size="sm"
                    className="mt-1"
                    aria-label={`Current stage progress: ${currentExecution.progress}%`}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Accessibility announcements for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Processing status for {documentName}: {getStatusText()}
          {progress.currentStage && `, currently processing ${progress.currentStage.replace('-', ' ')}`}
          {`, ${progress.overall}% complete`}
        </div>
      </div>
    );
  }
);

ProcessingStatus.displayName = 'ProcessingStatus';

export { ProcessingStatus, statusVariants };