'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Trash2,
  MoreVertical,
  Clock,
  FileText,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  Cpu,
  HardDrive,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessingJob } from '@/lib/mockData/jobsMockData';
import { JobStatus } from './JobStatus';

interface JobCardProps {
  job: ProcessingJob;
  selected?: boolean;
  onSelect?: () => void;
  onCancel?: (jobId: string) => Promise<void>;
  onRetry?: (jobId: string) => Promise<void>;
  onDelete?: (jobId: string) => Promise<void>;
  onViewDetails?: (job: ProcessingJob) => void;
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

export function JobCard({
  job,
  selected = false,
  onSelect,
  onCancel,
  onRetry,
  onDelete,
  onViewDetails,
  showProgress = false,
  compact = false,
  className
}: JobCardProps) {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const handleAction = async (action: string, actionFn?: (jobId: string) => Promise<void>) => {
    if (!actionFn) return;
    
    setIsActionLoading(action);
    try {
      await actionFn(job.id);
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
    } finally {
      setIsActionLoading(null);
    }
  };

  const getStatusIcon = () => {
    switch (job.status) {
      case 'running':
        return <Play className="h-3 w-3" />;
      case 'pending':
      case 'queued':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'failed':
        return <XCircle className="h-3 w-3" />;
      case 'cancelled':
        return <StopCircle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'running':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'pending':
      case 'queued':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20';
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'failed':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'cancelled':
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20';
      default:
        return 'border-border bg-background';
    }
  };

  const getPriorityColor = () => {
    switch (job.priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const canCancel = ['pending', 'queued', 'running'].includes(job.status);
  const canRetry = ['failed', 'cancelled'].includes(job.status);
  const canDelete = !['running'].includes(job.status);

  if (compact) {
    return (
      <Card 
        className={cn(
          "transition-all duration-200 hover:shadow-md border-l-4",
          getStatusColor(),
          selected && "ring-2 ring-primary ring-offset-2",
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {onSelect && (
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className="text-sm font-medium truncate">{job.name}</span>
              </div>
              
              <Badge variant="outline" className={cn("text-xs", getPriorityColor())}>
                {job.priority}
              </Badge>
            </div>

            {showProgress && job.status === 'running' && (
              <div className="flex items-center gap-2 min-w-[100px]">
                <Progress value={job.progress} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {job.progress}%
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              {canCancel && onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('cancel', onCancel);
                  }}
                  disabled={isActionLoading === 'cancel'}
                  className="h-8 w-8 p-0"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              )}
              
              {canRetry && onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('retry', onRetry);
                  }}
                  disabled={isActionLoading === 'retry'}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={cn("h-4 w-4", isActionLoading === 'retry' && "animate-spin")} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
        getStatusColor(),
        selected && "ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={() => onViewDetails?.(job)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onViewDetails?.(job)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for job ${job.name}`}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {onSelect && (
                <Checkbox
                  checked={selected}
                  onCheckedChange={onSelect}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
              )}
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon()}
                  <h3 className="font-semibold truncate">{job.name}</h3>
                  <Badge variant="outline" className={cn("text-xs", getPriorityColor())}>
                    {job.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-mono">{job.id}</span>
                  <div className="flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    <span className="truncate">{job.realmName}</span>
                  </div>
                  {job.documentName && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{job.documentName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <JobStatus job={job} size="sm" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {onViewDetails && (
                    <DropdownMenuItem onClick={() => onViewDetails(job)}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  
                  {canCancel && onCancel && (
                    <DropdownMenuItem 
                      onClick={() => handleAction('cancel', onCancel)}
                      disabled={isActionLoading === 'cancel'}
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Cancel Job
                    </DropdownMenuItem>
                  )}
                  
                  {canRetry && onRetry && (
                    <DropdownMenuItem 
                      onClick={() => handleAction('retry', onRetry)}
                      disabled={isActionLoading === 'retry'}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Job
                    </DropdownMenuItem>
                  )}
                  
                  {canDelete && onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleAction('delete', onDelete)}
                        disabled={isActionLoading === 'delete'}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Job
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && ['running', 'failed'].includes(job.status) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-2" />
              {job.status === 'failed' && job.errorMessage && (
                <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-destructive">{job.errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {formatDuration(job.actualDuration || job.estimatedDuration)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {job.actualDuration ? 'Actual Duration' : 'Estimated Duration'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{job.resourceUsage.cpuPercent}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>CPU Usage</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {Math.round(job.resourceUsage.memoryMB)}MB
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Memory Usage</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {job.createdAt.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {job.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{job.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}