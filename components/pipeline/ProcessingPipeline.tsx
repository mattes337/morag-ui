'use client';

import React, { useState, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Progress,
  Separator
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { StageIndicator } from './StageIndicator';
import { ProgressFlow } from './ProgressFlow';
import { usePipelineState } from './hooks/usePipelineState';
import { 
  PipelinePipeline, 
  PipelineStage, 
  formatDuration
} from '@/lib/mockData/pipelineMockData';

const processingPipelineVariants = cva(
  'w-full space-y-6',
  {
    variants: {
      layout: {
        horizontal: '',
        vertical: '',
        compact: 'space-y-4',
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

const pipelineContainerVariants = cva(
  'flex items-center justify-center gap-1 w-full',
  {
    variants: {
      layout: {
        horizontal: 'flex-row overflow-x-auto pb-2',
        vertical: 'flex-col max-w-md mx-auto',
        compact: 'flex-row flex-wrap justify-center',
      },
      responsive: {
        true: 'lg:flex-row lg:overflow-x-auto lg:pb-2',
        false: '',
      },
    },
    defaultVariants: {
      layout: 'horizontal',
      responsive: true,
    },
  }
);

export interface ProcessingPipelineProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof processingPipelineVariants> {
  /**
   * Pipeline data to display
   */
  pipeline?: PipelinePipeline;
  /**
   * Pipeline ID for loading from mock data
   */
  pipelineId?: string;
  /**
   * Layout orientation
   */
  layout?: 'horizontal' | 'vertical' | 'compact';
  /**
   * Size variant
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * Whether to show detailed stage information
   */
  showDetails?: boolean;
  /**
   * Whether to show progress information
   */
  showProgress?: boolean;
  /**
   * Whether to show duration information
   */
  showDuration?: boolean;
  /**
   * Whether to show action buttons
   */
  showActions?: boolean;
  /**
   * Whether to enable real-time updates
   */
  realTime?: boolean;
  /**
   * Whether to make stages interactive
   */
  interactive?: boolean;
  /**
   * Whether to auto-adapt layout for mobile
   */
  responsive?: boolean;
  /**
   * Callback when a stage is clicked
   */
  onStageClick?: (stage: PipelineStage) => void;
  /**
   * Callback when retry is clicked
   */
  onRetry?: (stageId: string) => void;
  /**
   * Callback when skip is clicked
   */
  onSkip?: (stageId: string) => void;
  /**
   * Callback when pipeline status changes
   */
  onStatusChange?: (pipeline: PipelinePipeline) => void;
}

/**
 * ProcessingPipeline component displays a visual representation of the 5-stage pipeline
 */
const ProcessingPipeline = React.forwardRef<HTMLDivElement, ProcessingPipelineProps>(
  ({ 
    className,
    pipeline: externalPipeline,
    pipelineId,
    layout = 'horizontal',
    size = 'default',
    showDetails = true,
    showProgress = true,
    showDuration = true,
    showActions = true,
    realTime = true,
    interactive = true,
    responsive = true,
    onStageClick,
    onRetry,
    onSkip,
    onStatusChange,
    ...props 
  }, ref) => {
    const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

    // Use hook for state management if pipelineId is provided
    const {
      pipeline: hookPipeline,
      isLoading,
      error,
      actions,
    } = usePipelineState({
      pipelineId,
      enableRealTime: realTime,
    });

    // Use external pipeline or hook pipeline
    const pipeline = externalPipeline || hookPipeline;

    // Handle stage interactions
    const handleStageClick = useCallback((stage: PipelineStage) => {
      setSelectedStage(stage);
      if (onStageClick) {
        onStageClick(stage);
      }
    }, [onStageClick]);

    const handleRetry = useCallback((stageId: string) => {
      if (onRetry) {
        onRetry(stageId);
      } else if (actions) {
        actions.retryStage(stageId);
      }
    }, [onRetry, actions]);

    const handleSkip = useCallback((stageId: string) => {
      if (onSkip) {
        onSkip(stageId);
      } else if (actions) {
        actions.skipStage(stageId);
      }
    }, [onSkip, actions]);

    // Loading state
    if (isLoading) {
      return (
        <Card className={cn(className)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-muted-foreground">Loading pipeline...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Error state
    if (error) {
      return (
        <Card className={cn(className)}>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <p className="font-semibold">Error loading pipeline</p>
                <p className="text-sm">{error}</p>
              </div>
              {actions && (
                <Button onClick={actions.refresh} variant="outline" size="sm">
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // No pipeline data
    if (!pipeline) {
      return (
        <Card className={cn(className)}>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>No pipeline data available</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Determine if we should use vertical layout on mobile
    const shouldUseVerticalOnMobile = responsive && layout === 'horizontal';
    const containerLayout = shouldUseVerticalOnMobile ? 'horizontal' : layout;

    // Get overall status badge variant
    const getStatusVariant = () => {
      switch (pipeline.status) {
        case 'completed':
          return 'success';
        case 'failed':
          return 'destructive';
        case 'running':
          return 'default';
        case 'partial':
          return 'warning';
        default:
          return 'outline';
      }
    };

    return (
      <div
        className={cn(
          processingPipelineVariants({ layout, size }),
          className
        )}
        {...props}
        ref={ref}
      >
        {/* Pipeline Header */}
        <Card>
          <CardHeader className={cn(
            'pb-3',
            size === 'sm' ? 'p-4' : size === 'lg' ? 'p-8' : 'p-6'
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle className={cn(
                    'leading-tight',
                    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
                  )}>
                    Processing Pipeline
                  </CardTitle>
                  <Badge variant={getStatusVariant()} className="capitalize">
                    {pipeline.status}
                  </Badge>
                </div>
                
                <CardDescription className={cn(
                  'line-clamp-2',
                  size === 'sm' ? 'text-xs' : 'text-sm'
                )}>
                  {pipeline.documentName}
                </CardDescription>
                
                {showDuration && (pipeline.totalDuration || pipeline.startTime) && (
                  <div className={cn(
                    'text-muted-foreground',
                    size === 'sm' ? 'text-xs' : 'text-sm'
                  )}>
                    {pipeline.totalDuration ? (
                      <>Total Duration: {formatDuration(pipeline.totalDuration)}</>
                    ) : (
                      <>Started: {pipeline.startTime.toLocaleString()}</>
                    )}
                  </div>
                )}
              </div>

              {/* Overall Progress */}
              {showProgress && (
                <div className="flex-shrink-0 w-32">
                  <Progress
                    value={pipeline.overallProgress}
                    variant={
                      pipeline.status === 'completed' ? 'success' :
                      pipeline.status === 'failed' ? 'destructive' :
                      'default'
                    }
                    showValue
                    label="Overall"
                    size={size === 'sm' ? 'sm' : 'default'}
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className={cn(
            'space-y-6',
            size === 'sm' ? 'p-4 pt-0' : size === 'lg' ? 'p-8 pt-0' : 'p-6 pt-0'
          )}>
            {/* Pipeline Visualization */}
            <div className={cn(
              pipelineContainerVariants({ 
                layout: containerLayout,
                responsive: shouldUseVerticalOnMobile 
              }),
              shouldUseVerticalOnMobile && 'flex-col lg:flex-row'
            )}>
              {pipeline.stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  {/* Stage Indicator */}
                  <div className={cn(
                    'flex-shrink-0',
                    containerLayout === 'vertical' ? 'w-full max-w-xs' : '',
                    containerLayout === 'compact' ? 'w-auto' : 'min-w-[200px]'
                  )}>
                    <StageIndicator
                      stage={stage}
                      size={size}
                      interactive={interactive}
                      showDetails={showDetails}
                      showProgress={showProgress}
                      showDuration={showDuration}
                      showActions={showActions}
                      onStageClick={handleStageClick}
                      onRetry={handleRetry}
                      onSkip={handleSkip}
                    />
                  </div>

                  {/* Progress Flow Connection */}
                  {index < pipeline.stages.length - 1 && (
                    <div className={cn(
                      'flex-shrink-0',
                      containerLayout === 'vertical' ? 'h-8 w-full flex justify-center' : 'w-16'
                    )}>
                      <ProgressFlow
                        stages={[stage, pipeline.stages[index + 1]]}
                        orientation={containerLayout === 'vertical' ? 'vertical' : 'horizontal'}
                        size={size}
                        animated={realTime}
                        showProgress={showProgress && stage.status === 'running'}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Pipeline Controls */}
            {showActions && realTime && actions && (
              <>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Real-time updates enabled
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={actions.refresh}
                      disabled={isLoading}
                    >
                      Refresh
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={realTime ? actions.stopRealTime : actions.startRealTime}
                    >
                      {realTime ? 'Pause' : 'Resume'} Updates
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Selected Stage Details */}
        {selectedStage && showDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stage Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">General Information</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Stage:</dt>
                      <dd>{selectedStage.displayName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status:</dt>
                      <dd className="capitalize">
                        <Badge 
                          variant={
                            selectedStage.status === 'completed' ? 'success' :
                            selectedStage.status === 'failed' ? 'destructive' :
                            selectedStage.status === 'running' ? 'default' :
                            'outline'
                          }
                          size="sm"
                        >
                          {selectedStage.status}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Progress:</dt>
                      <dd>{selectedStage.progress}%</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Timing Information</h4>
                  <dl className="space-y-1 text-sm">
                    {selectedStage.startTime && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Started:</dt>
                        <dd>{selectedStage.startTime.toLocaleString()}</dd>
                      </div>
                    )}
                    {selectedStage.endTime && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Completed:</dt>
                        <dd>{selectedStage.endTime.toLocaleString()}</dd>
                      </div>
                    )}
                    {selectedStage.duration && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Duration:</dt>
                        <dd>{formatDuration(selectedStage.duration)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedStage.description}</p>
              </div>

              {selectedStage.errorMessage && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Error Details</h4>
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    {selectedStage.errorMessage}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedStage(null)}>
                  Close
                </Button>
                {selectedStage.canRetry && (
                  <Button size="sm" onClick={() => handleRetry(selectedStage.id)}>
                    Retry Stage
                  </Button>
                )}
                {selectedStage.canSkip && (
                  <Button variant="outline" size="sm" onClick={() => handleSkip(selectedStage.id)}>
                    Skip Stage
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);

ProcessingPipeline.displayName = 'ProcessingPipeline';

export { ProcessingPipeline, processingPipelineVariants, pipelineContainerVariants };