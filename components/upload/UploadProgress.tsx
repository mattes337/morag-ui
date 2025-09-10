import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { FilePreview, FileItem } from './FilePreview';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils/fileValidation';

export interface UploadProgressFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  uploadSpeed?: number;
  timeRemaining?: number;
}

export interface UploadProgressProps {
  files: UploadProgressFile[];
  onCancel: () => void;
  onRetry: (fileId: string | 'all') => void;
  onClear: () => void;
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  files,
  onCancel,
  onRetry,
  onClear,
  className,
}) => {
  // Calculate overall statistics
  const stats = useMemo(() => {
    const total = files.length;
    const completed = files.filter(f => f.status === 'completed').length;
    const uploading = files.filter(f => f.status === 'uploading').length;
    const errors = files.filter(f => f.status === 'error').length;
    const pending = files.filter(f => f.status === 'pending').length;
    
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const completedSize = files
      .filter(f => f.status === 'completed')
      .reduce((sum, file) => sum + file.size, 0);
    
    const hasActiveUploads = uploading > 0 || pending > 0;
    const allCompleted = completed === total && total > 0;
    const hasErrors = errors > 0;
    
    return {
      total,
      completed,
      uploading,
      errors,
      pending,
      overallProgress,
      totalSize,
      completedSize,
      hasActiveUploads,
      allCompleted,
      hasErrors
    };
  }, [files]);

  // Convert files to FileItem format for FilePreview
  const fileItems: FileItem[] = useMemo(() => {
    return files.map(file => {
      const fileItem: FileItem = {
        id: file.id,
        file: new File([''], file.name, { type: file.type }), // Mock File object
        status: file.status,
        progress: file.progress,
        error: file.error || null
      };
      
      // Only add optional properties if they exist
      if (file.uploadSpeed !== undefined) {
        fileItem.uploadSpeed = file.uploadSpeed;
      }
      if (file.timeRemaining !== undefined) {
        fileItem.timeRemaining = file.timeRemaining;
      }
      
      return fileItem;
    });
  }, [files]);

  // Handle individual file removal
  const handleRemoveFile = useCallback((_fileId: string) => {
    // For this implementation, we treat file removal as cancellation
    onCancel();
  }, [onCancel]);

  // Handle individual file retry
  const handleRetryFile = useCallback((fileId: string) => {
    onRetry(fileId);
  }, [onRetry]);

  // Handle retry all failed files
  const handleRetryAll = useCallback(() => {
    onRetry('all');
  }, [onRetry]);

  // Generate summary text for screen readers
  const summaryText = useMemo(() => {
    if (files.length === 0) {
      return 'No files to upload';
    }
    
    const parts = [`${stats.completed} of ${stats.total} files completed`];
    
    if (stats.uploading > 0) {
      parts.push(`${stats.uploading} uploading`);
    }
    if (stats.pending > 0) {
      parts.push(`${stats.pending} waiting`);
    }
    if (stats.errors > 0) {
      parts.push(`${stats.errors} failed`);
    }
    
    return parts.join(', ');
  }, [files.length, stats]);

  // Show empty state
  if (files.length === 0) {
    return (
      <div
        role="region"
        aria-label="Upload progress"
        className={cn(
          'text-center py-8 text-muted-foreground',
          className
        )}
      >
        <p>No files to upload</p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Upload progress"
      className={cn('space-y-4', className)}
    >
      {/* Overall Progress Header */}
      <div className="space-y-3">
        {/* Summary */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex items-center justify-between"
        >
          <h3 className="text-lg font-semibold">
            Upload Progress
          </h3>
          <div className="text-sm text-muted-foreground">
            {summaryText}
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={stats.overallProgress}
            aria-label="Overall upload progress"
            aria-valuenow={stats.overallProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-3"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {formatFileSize(stats.completedSize)} of {formatFileSize(stats.totalSize)}
            </span>
            <span>
              {stats.overallProgress}% complete
            </span>
          </div>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-4 text-xs">
          {stats.completed > 0 && (
            <div className="flex items-center gap-1 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{stats.completed} completed</span>
            </div>
          )}
          
          {stats.uploading > 0 && (
            <div className="flex items-center gap-1 text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>{stats.uploading} uploading</span>
            </div>
          )}
          
          {stats.errors > 0 && (
            <div className="flex items-center gap-1 text-destructive">
              <div className="w-2 h-2 bg-destructive rounded-full" />
              <span>{stats.errors} failed</span>
            </div>
          )}
          
          {stats.pending > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              <span>{stats.pending} waiting</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2 py-2 border-t">
        {stats.hasActiveUploads && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            aria-label="Cancel all uploads"
            className="text-destructive hover:text-destructive hover:border-destructive"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="mr-2"
            >
              <path d="m18 6 -12 12" />
              <path d="m6 6 12 12" />
            </svg>
            Cancel Upload
          </Button>
        )}
        
        {stats.hasErrors && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryAll}
            aria-label="Retry all failed uploads"
            className="text-primary hover:text-primary hover:border-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="mr-2"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Retry All Failed
          </Button>
        )}
        
        {stats.allCompleted && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            aria-label="Clear completed uploads"
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="mr-2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c0-1-1-2-1-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            Clear All
          </Button>
        )}
      </div>
      
      {/* File List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Files ({files.length})
        </h4>
        
        <ul
          aria-label="Upload file list"
          className="space-y-2 max-h-96 overflow-y-auto"
        >
          {fileItems.map((fileItem) => (
            <FilePreview
              key={fileItem.id}
              fileItem={fileItem}
              onRemove={handleRemoveFile}
              onRetry={handleRetryFile}
            />
          ))}
        </ul>
      </div>
      
      {/* Completion Announcement */}
      {stats.allCompleted && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800"
        >
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-green-600"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
            <span className="font-medium">
              All files uploaded successfully!
            </span>
          </div>
          <p className="text-sm mt-1">
            {stats.total} {stats.total === 1 ? 'file' : 'files'} ({formatFileSize(stats.totalSize)}) 
            uploaded and ready for processing.
          </p>
        </div>
      )}
      
      {/* Error Summary */}
      {stats.errors > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive"
        >
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-destructive"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="font-medium">
              {stats.errors} {stats.errors === 1 ? 'file' : 'files'} failed to upload
            </span>
          </div>
          <p className="text-sm mt-1">
            Please check individual file errors and try again. You can retry failed uploads using the retry button.
          </p>
        </div>
      )}
    </div>
  );
};