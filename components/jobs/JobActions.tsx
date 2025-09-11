'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Eye,
  Download,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProcessingJob } from '@/lib/mockData/jobsMockData';

interface SingleJobActionsProps {
  job: ProcessingJob;
  onCancel?: (jobId: string) => Promise<boolean>;
  onRetry?: (jobId: string) => Promise<boolean>;
  onDelete?: (jobId: string) => Promise<boolean>;
  onViewDetails?: (job: ProcessingJob) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function SingleJobActions({
  job,
  onCancel,
  onRetry,
  onDelete,
  onViewDetails,
  size = 'md',
  disabled = false
}: SingleJobActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAction = useCallback(async (
    action: string,
    handler?: (jobId: string) => Promise<boolean>
  ) => {
    if (!handler || disabled) return;

    setIsLoading(action);
    try {
      const success = await handler(job.id);
      if (success) {
        toast({
          title: 'Success',
          description: `Job ${action} completed successfully`,
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to ${action} job`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `An error occurred while trying to ${action} the job`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  }, [job.id, disabled, toast]);

  const canCancel = job.status === 'running' || job.status === 'queued' || job.status === 'pending';
  const canRetry = job.status === 'failed' && job.retryCount < job.maxRetries;
  const canDelete = job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === 'sm' ? 'sm' : 'default'}
          className={cn(
            size === 'sm' ? 'h-8 w-8 p-0' : 'h-9 w-9 p-0',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <MoreHorizontal className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
          <span className="sr-only">Open job actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => onViewDetails?.(job)}
          className="cursor-pointer"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(job.id)}
          className="cursor-pointer"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy ID
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {canCancel && (
          <DropdownMenuItem
            onClick={() => handleAction('cancel', onCancel)}
            disabled={isLoading === 'cancel'}
            className="cursor-pointer text-orange-600"
          >
            <Pause className="mr-2 h-4 w-4" />
            {isLoading === 'cancel' ? 'Cancelling...' : 'Cancel Job'}
          </DropdownMenuItem>
        )}

        {canRetry && (
          <DropdownMenuItem
            onClick={() => handleAction('retry', onRetry)}
            disabled={isLoading === 'retry'}
            className="cursor-pointer text-blue-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {isLoading === 'retry' ? 'Retrying...' : 'Retry Job'}
          </DropdownMenuItem>
        )}

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Job
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete job "{job.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleAction('delete', onDelete)}
                  disabled={isLoading === 'delete'}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLoading === 'delete' ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface BulkJobActionsProps {
  selectedJobs: string[];
  totalJobs: number;
  onBulkCancel?: (jobIds: string[]) => Promise<{ success: string[]; failed: string[] }>;
  onBulkRetry?: (jobIds: string[]) => Promise<{ success: string[]; failed: string[] }>;
  onBulkDelete?: (jobIds: string[]) => Promise<{ success: string[]; failed: string[] }>;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  disabled?: boolean;
}

export function BulkJobActions({
  selectedJobs,
  totalJobs,
  onBulkCancel,
  onBulkRetry,
  onBulkDelete,
  onSelectAll,
  onClearSelection,
  disabled = false
}: BulkJobActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBulkAction = useCallback(async (
    action: string,
    handler?: (jobIds: string[]) => Promise<{ success: string[]; failed: string[] }>
  ) => {
    if (!handler || !selectedJobs.length || disabled) return;

    setIsLoading(action);
    try {
      const result = await handler(selectedJobs);
      
      if (result.success.length > 0) {
        toast({
          title: 'Bulk Action Completed',
          description: `Successfully ${action}ed ${result.success.length} job(s)${
            result.failed.length > 0 ? `, ${result.failed.length} failed` : ''
          }`,
          variant: result.failed.length > 0 ? 'default' : 'default',
        });
      }
      
      if (result.failed.length > 0 && result.success.length === 0) {
        toast({
          title: 'Bulk Action Failed',
          description: `Failed to ${action} ${result.failed.length} job(s)`,
          variant: 'destructive',
        });
      }
      
      // Clear selection after successful bulk action
      if (result.success.length > 0) {
        onClearSelection?.();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `An error occurred during bulk ${action}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  }, [selectedJobs, disabled, toast, onClearSelection]);

  if (selectedJobs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2 flex-1">
        <Badge variant="outline" className="bg-background">
          {selectedJobs.length} selected
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          disabled={disabled}
          className="text-xs"
        >
          Select All ({totalJobs})
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={disabled}
          className="text-xs"
        >
          Clear
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {onBulkCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('cancel', onBulkCancel)}
            disabled={disabled || isLoading !== null}
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            <Pause className="mr-1 h-3 w-3" />
            {isLoading === 'cancel' ? 'Cancelling...' : 'Cancel'}
          </Button>
        )}

        {onBulkRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('retry', onBulkRetry)}
            disabled={disabled || isLoading !== null}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            {isLoading === 'retry' ? 'Retrying...' : 'Retry'}
          </Button>
        )}

        {onBulkDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled || isLoading !== null}
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete {selectedJobs.length} Job{selectedJobs.length !== 1 ? 's' : ''}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedJobs.length} selected job{selectedJobs.length !== 1 ? 's' : ''}? 
                  This action cannot be undone and will permanently remove the job data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleBulkAction('delete', onBulkDelete)}
                  disabled={isLoading === 'delete'}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLoading === 'delete' ? 'Deleting...' : `Delete ${selectedJobs.length} Job${selectedJobs.length !== 1 ? 's' : ''}`}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

// Quick Actions for different job states
interface QuickJobActionsProps {
  job: ProcessingJob;
  onCancel?: (jobId: string) => Promise<boolean>;
  onRetry?: (jobId: string) => Promise<boolean>;
  onDelete?: (jobId: string) => Promise<boolean>;
  onViewDetails?: (job: ProcessingJob) => void;
  compact?: boolean;
}

export function QuickJobActions({
  job,
  onCancel,
  onRetry,
  onDelete,
  onViewDetails,
  compact = false
}: QuickJobActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleQuickAction = useCallback(async (
    action: string,
    handler?: (jobId: string) => Promise<boolean>
  ) => {
    if (!handler) return;

    setIsLoading(action);
    try {
      const success = await handler(job.id);
      if (success) {
        toast({
          title: 'Success',
          description: `Job ${action} completed successfully`,
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to ${action} job`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `An error occurred while trying to ${action} the job`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  }, [job.id, toast]);

  const buttonSize = compact ? 'sm' : 'default';
  const iconSize = compact ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-1">
      {/* View Details - Always Available */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => onViewDetails?.(job)}
        className={compact ? 'h-7 px-2' : undefined}
      >
        <Eye className={iconSize} />
        {!compact && <span className="ml-1">Details</span>}
      </Button>

      {/* Status-specific actions */}
      {(job.status === 'running' || job.status === 'queued' || job.status === 'pending') && onCancel && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => handleQuickAction('cancel', onCancel)}
          disabled={isLoading === 'cancel'}
          className={cn(
            'text-orange-600 hover:text-orange-700 hover:bg-orange-50',
            compact ? 'h-7 px-2' : undefined
          )}
        >
          <Pause className={iconSize} />
          {!compact && <span className="ml-1">
            {isLoading === 'cancel' ? 'Cancelling...' : 'Cancel'}
          </span>}
        </Button>
      )}

      {job.status === 'failed' && job.retryCount < job.maxRetries && onRetry && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => handleQuickAction('retry', onRetry)}
          disabled={isLoading === 'retry'}
          className={cn(
            'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
            compact ? 'h-7 px-2' : undefined
          )}
        >
          <RotateCcw className={iconSize} />
          {!compact && <span className="ml-1">
            {isLoading === 'retry' ? 'Retrying...' : 'Retry'}
          </span>}
        </Button>
      )}

      {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size={buttonSize}
              className={cn(
                'text-destructive hover:text-destructive/90 hover:bg-destructive/10',
                compact ? 'h-7 px-2' : undefined
              )}
            >
              <Trash2 className={iconSize} />
              {!compact && <span className="ml-1">Delete</span>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete job "{job.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleQuickAction('delete', onDelete)}
                disabled={isLoading === 'delete'}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading === 'delete' ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}