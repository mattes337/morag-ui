'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { PipelineStage } from '@/lib/mockData/pipelineMockData';

const progressFlowVariants = cva(
  'flex items-center justify-center relative',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col h-full',
      },
      size: {
        sm: 'gap-2',
        default: 'gap-4',
        lg: 'gap-6',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      size: 'default',
    },
  }
);

const connectionLineVariants = cva(
  'bg-border transition-all duration-300',
  {
    variants: {
      orientation: {
        horizontal: 'h-0.5 min-w-8',
        vertical: 'w-0.5 min-h-8',
      },
      status: {
        inactive: 'bg-gray-300',
        active: 'bg-blue-500',
        completed: 'bg-green-500',
        failed: 'bg-red-500',
      },
      animated: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        status: 'active',
        animated: true,
        className: 'bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 bg-[length:200%_100%] animate-pulse',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      status: 'inactive',
      animated: false,
    },
  }
);

export interface ProgressFlowProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressFlowVariants> {
  /**
   * Array of pipeline stages to connect
   */
  stages: PipelineStage[];
  /**
   * Layout orientation
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Size variant
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * Whether to show animated flow for active connections
   */
  animated?: boolean;
  /**
   * Whether to show progress percentage on connections
   */
  showProgress?: boolean;
  /**
   * Custom render function for connections
   */
  renderConnection?: (fromStage: PipelineStage, toStage: PipelineStage, index: number) => React.ReactNode;
}

/**
 * Get the connection status between two stages
 */
function getConnectionStatus(fromStage: PipelineStage, toStage: PipelineStage): {
  status: 'inactive' | 'active' | 'completed' | 'failed';
  animated: boolean;
} {
  // If from stage is not completed, connection is inactive
  if (fromStage.status === 'pending') {
    return { status: 'inactive', animated: false };
  }
  
  // If from stage failed and can't be skipped, connection is failed
  if (fromStage.status === 'failed' && !fromStage.canSkip) {
    return { status: 'failed', animated: false };
  }
  
  // If to stage is running, connection is active
  if (toStage.status === 'running') {
    return { status: 'active', animated: true };
  }
  
  // If from stage is completed or skipped, and to stage has started, connection is completed
  if ((fromStage.status === 'completed' || fromStage.status === 'skipped') && 
      (toStage.status !== 'pending')) {
    return { status: 'completed', animated: false };
  }
  
  // If from stage is running but not complete yet
  if (fromStage.status === 'running') {
    return { status: 'active', animated: fromStage.progress > 80 };
  }
  
  return { status: 'inactive', animated: false };
}

/**
 * Default connection renderer
 */
function DefaultConnection({ 
  fromStage, 
  toStage, 
  orientation = 'horizontal',
  animated = true,
  showProgress = false,
  size = 'default'
}: {
  fromStage: PipelineStage;
  toStage: PipelineStage;
  orientation?: 'horizontal' | 'vertical';
  animated?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'default' | 'lg';
}) {
  const connectionState = getConnectionStatus(fromStage, toStage);
  
  const lineLength = size === 'sm' ? 'min-w-8' : size === 'lg' ? 'min-w-12' : 'min-w-10';
  const lineHeight = size === 'sm' ? 'min-h-8' : size === 'lg' ? 'min-h-12' : 'min-h-10';
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Connection Line */}
      <div 
        className={cn(
          connectionLineVariants({ 
            orientation, 
            status: connectionState.status,
            animated: animated && connectionState.animated
          }),
          orientation === 'horizontal' ? lineLength : lineHeight,
          connectionState.status === 'active' && animated && connectionState.animated && (
            'relative overflow-hidden'
          )
        )}
      >
        {/* Animated flow indicator */}
        {connectionState.status === 'active' && animated && connectionState.animated && (
          <div 
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60',
              'animate-ping'
            )}
            style={{
              animationDuration: '2s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}
          />
        )}
      </div>

      {/* Progress Indicator */}
      {showProgress && connectionState.status === 'active' && fromStage.progress > 0 && (
        <div className={cn(
          'absolute bg-white border border-blue-300 rounded px-1.5 py-0.5 text-xs font-medium text-blue-700 shadow-sm',
          orientation === 'horizontal' ? 'top-1/2 -translate-y-1/2' : 'left-1/2 -translate-x-1/2'
        )}>
          {fromStage.progress}%
        </div>
      )}

      {/* Connection Arrow */}
      <div className={cn(
        'absolute text-sm',
        orientation === 'horizontal' ? 'right-0 translate-x-1' : 'bottom-0 translate-y-1',
        connectionState.status === 'completed' ? 'text-green-500' :
        connectionState.status === 'active' ? 'text-blue-500' :
        connectionState.status === 'failed' ? 'text-red-500' :
        'text-gray-400'
      )}>
        {orientation === 'horizontal' ? '→' : '↓'}
      </div>
    </div>
  );
}

/**
 * ProgressFlow component shows the flow connections between pipeline stages
 */
const ProgressFlow = React.forwardRef<HTMLDivElement, ProgressFlowProps>(
  ({ 
    className,
    stages,
    orientation = 'horizontal',
    size = 'default',
    animated = true,
    showProgress = false,
    renderConnection,
    ...props 
  }, ref) => {
    if (stages.length < 2) {
      return null;
    }

    const connections = stages.slice(0, -1).map((stage, index) => {
      const nextStage = stages[index + 1];
      if (!nextStage) return null;
      
      const key = `connection-${stage.id}-${nextStage.id}`;

      if (renderConnection) {
        return (
          <React.Fragment key={key}>
            {renderConnection(stage, nextStage, index)}
          </React.Fragment>
        );
      }

      return (
        <DefaultConnection
          key={key}
          fromStage={stage}
          toStage={nextStage}
          orientation={orientation}
          animated={animated}
          showProgress={showProgress}
          size={size}
        />
      );
    });

    return (
      <div
        className={cn(
          progressFlowVariants({ orientation, size }),
          'select-none',
          className
        )}
        role="progressbar"
        aria-label="Pipeline flow progress"
        {...props}
        ref={ref}
      >
        {connections}
      </div>
    );
  }
);

ProgressFlow.displayName = 'ProgressFlow';

/**
 * PulseFlow component for animated connection indicators
 */
export function PulseFlow({
  isActive = false,
  orientation = 'horizontal',
  className,
  ...props
}: {
  isActive?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  if (!isActive) return null;

  return (
    <div
      className={cn(
        'absolute bg-blue-400 rounded-full animate-ping',
        orientation === 'horizontal' 
          ? 'w-2 h-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          : 'w-2 h-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
        className
      )}
      style={{
        animationDuration: '1.5s',
        animationTimingFunction: 'ease-out',
        animationIterationCount: 'infinite',
      }}
      {...props}
    />
  );
}

/**
 * FlowArrow component for direction indicators
 */
export function FlowArrow({
  status = 'inactive',
  orientation = 'horizontal',
  animated = false,
  className,
  ...props
}: {
  status?: 'inactive' | 'active' | 'completed' | 'failed';
  orientation?: 'horizontal' | 'vertical';
  animated?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const arrow = orientation === 'horizontal' ? '→' : '↓';
  
  return (
    <div
      className={cn(
        'flex items-center justify-center text-lg font-bold transition-all duration-300',
        status === 'completed' && 'text-green-500',
        status === 'active' && 'text-blue-500',
        status === 'failed' && 'text-red-500',
        status === 'inactive' && 'text-gray-400',
        animated && status === 'active' && 'animate-pulse',
        className
      )}
      {...props}
    >
      {arrow}
    </div>
  );
}

export { ProgressFlow, progressFlowVariants, connectionLineVariants };