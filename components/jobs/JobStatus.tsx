'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/Progress';
import { Clock, AlertTriangle, CheckCircle, XCircle, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProcessingJob } from '@/lib/mockData/jobsMockData';

interface JobStatusProps {
  job: ProcessingJob;
  showProgress?: boolean;
  showETA?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function JobStatus({ 
  job, 
  showProgress = false, 
  showETA = false, 
  size = 'md',
  className 
}: JobStatusProps) {
  const statusConfig = getStatusConfig(job.status);
  const priorityConfig = getPriorityConfig(job.priority);

  // Calculate ETA for running jobs
  const calculateETA = () => {
    if (job.status !== 'running' || !job.startedAt || job.progress === 0) {
      return null;
    }

    const elapsed = Date.now() - job.startedAt.getTime();
    const rate = job.progress / elapsed; // progress per millisecond
    const remaining = 100 - job.progress;
    const eta = remaining / rate;

    return eta;
  };

  const eta = calculateETA();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Status Badge */}
      <Badge
        variant={statusConfig.variant}
        className={cn(
          'flex items-center gap-1',
          size === 'sm' && 'text-xs px-2 py-0.5',
          size === 'lg' && 'text-sm px-3 py-1'
        )}
      >
        <statusConfig.icon 
          className={cn(
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )} 
        />
        <span className="capitalize">{job.status.replace('_', ' ')}</span>
      </Badge>

      {/* Priority Badge */}
      {job.priority !== 'medium' && (
        <Badge
          variant="outline"
          className={cn(
            'border-current',
            priorityConfig.className,
            size === 'sm' && 'text-xs px-2 py-0.5',
            size === 'lg' && 'text-sm px-3 py-1'
          )}
        >
          {job.priority}
        </Badge>
      )}

      {/* Progress Bar for Running Jobs */}
      {showProgress && job.status === 'running' && (
        <div className="flex items-center gap-2 min-w-[100px]">
          <Progress
            value={job.progress}
            className={cn(
              'flex-1',
              size === 'sm' && 'h-1',
              size === 'md' && 'h-2',
              size === 'lg' && 'h-3'
            )}
          />
          <span
            className={cn(
              'text-muted-foreground font-mono',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {Math.round(job.progress)}%
          </span>
        </div>
      )}

      {/* ETA Display */}
      {showETA && eta && job.status === 'running' && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock
            className={cn(
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5'
            )}
          />
          <span
            className={cn(
              'font-mono',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {formatDuration(eta)}
          </span>
        </div>
      )}

      {/* Retry Count for Failed Jobs */}
      {job.status === 'failed' && job.retryCount > 0 && (
        <Badge variant="destructive" className="text-xs">
          Retry {job.retryCount}/{job.maxRetries}
        </Badge>
      )}
    </div>
  );
}

// Status Badge with Progress for Complex Display
interface JobStatusProgressProps {
  job: ProcessingJob;
  className?: string;
}

export function JobStatusProgress({ job, className }: JobStatusProgressProps) {
  const statusConfig = getStatusConfig(job.status);
  
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <Badge variant={statusConfig.variant} className="flex items-center gap-1">
          <statusConfig.icon className="h-4 w-4" />
          <span className="capitalize">{job.status.replace('_', ' ')}</span>
        </Badge>
        
        {job.status === 'running' && (
          <span className="text-sm font-mono text-muted-foreground">
            {Math.round(job.progress)}%
          </span>
        )}
      </div>
      
      {job.status === 'running' && (
        <Progress value={job.progress} className="h-2" />
      )}
      
      {job.status === 'failed' && job.errorMessage && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="h-3 w-3" />
            <span className="font-medium">Error</span>
          </div>
          <p className="truncate" title={job.errorMessage}>
            {job.errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}

// Processing Steps Visualization
interface JobProcessingStepsProps {
  job: ProcessingJob;
  className?: string;
}

export function JobProcessingSteps({ job, className }: JobProcessingStepsProps) {
  if (!job.metadata.processingSteps?.length) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-muted-foreground">
        Processing Steps
      </h4>
      <div className="space-y-1">
        {job.metadata.processingSteps.map((step, index) => {
          const stepStatusConfig = getStageStatusConfig(step.status);
          const isActive = step.status === 'RUNNING';
          
          return (
            <div
              key={`${step.stage}-${index}`}
              className={cn(
                'flex items-center gap-2 p-2 rounded-sm',
                isActive && 'bg-primary/5 border border-primary/20',
                step.status === 'FAILED' && 'bg-destructive/5 border border-destructive/20'
              )}
            >
              <stepStatusConfig.icon
                className={cn(
                  'h-4 w-4',
                  stepStatusConfig.className,
                  isActive && 'animate-spin'
                )}
              />
              <span className={cn(
                'flex-1 text-sm',
                step.status === 'COMPLETED' && 'text-muted-foreground',
                step.status === 'FAILED' && 'text-destructive'
              )}>
                {step.stage.replace(/_/g, ' ').toLowerCase()}
              </span>
              {step.duration && (
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDuration(step.duration * 1000)}
                </span>
              )}
              {step.error && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Performance Metrics Display
interface JobPerformanceMetricsProps {
  job: ProcessingJob;
  className?: string;
}

export function JobPerformanceMetrics({ job, className }: JobPerformanceMetricsProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      <div className="text-center p-3 border rounded-lg">
        <div className="text-2xl font-bold text-primary">
          {job.resourceUsage.cpuPercent}%
        </div>
        <div className="text-xs text-muted-foreground">CPU Usage</div>
      </div>
      
      <div className="text-center p-3 border rounded-lg">
        <div className="text-2xl font-bold text-primary">
          {Math.round(job.resourceUsage.memoryMB)}MB
        </div>
        <div className="text-xs text-muted-foreground">Memory</div>
      </div>
      
      <div className="text-center p-3 border rounded-lg">
        <div className="text-2xl font-bold text-primary">
          {Math.round(job.resourceUsage.diskIOKB)}KB
        </div>
        <div className="text-xs text-muted-foreground">Disk I/O</div>
      </div>
    </div>
  );
}

// Utility Functions
function getStatusConfig(status: ProcessingJob['status']) {
  const configs = {
    pending: {
      icon: Pause,
      variant: 'secondary' as const,
      className: 'text-muted-foreground'
    },
    queued: {
      icon: Clock,
      variant: 'outline' as const,
      className: 'text-blue-600'
    },
    running: {
      icon: Play,
      variant: 'default' as const,
      className: 'text-primary animate-pulse'
    },
    completed: {
      icon: CheckCircle,
      variant: 'default' as const,
      className: 'text-green-600'
    },
    failed: {
      icon: XCircle,
      variant: 'destructive' as const,
      className: 'text-destructive'
    },
    cancelled: {
      icon: XCircle,
      variant: 'outline' as const,
      className: 'text-muted-foreground'
    }
  };

  return configs[status] || configs.pending;
}

function getPriorityConfig(priority: ProcessingJob['priority']) {
  const configs = {
    low: {
      className: 'text-blue-600 border-blue-600'
    },
    medium: {
      className: 'text-gray-600 border-gray-600'
    },
    high: {
      className: 'text-orange-600 border-orange-600'
    },
    urgent: {
      className: 'text-red-600 border-red-600'
    }
  };

  return configs[priority] || configs.medium;
}

function getStageStatusConfig(status: string) {
  const configs = {
    PENDING: {
      icon: Clock,
      className: 'text-muted-foreground'
    },
    RUNNING: {
      icon: Play,
      className: 'text-primary'
    },
    COMPLETED: {
      icon: CheckCircle,
      className: 'text-green-600'
    },
    FAILED: {
      icon: XCircle,
      className: 'text-destructive'
    },
    SKIPPED: {
      icon: Pause,
      className: 'text-muted-foreground'
    }
  };

  return configs[status as keyof typeof configs] || configs.PENDING;
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}