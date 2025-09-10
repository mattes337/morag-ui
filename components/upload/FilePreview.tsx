import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { 
  formatFileSize, 
  getFileIcon, 
  getFileTypeDisplayName 
} from '@/lib/utils/fileValidation';

export interface FileItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error: string | null;
  uploadSpeed?: number;
  timeRemaining?: number;
}

export interface FilePreviewProps {
  fileItem: FileItem;
  onRemove: (fileId: string) => void;
  onRetry: (fileId: string) => void;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileItem,
  onRemove,
  onRetry,
  className,
}) => {
  const { id, file, status, progress, error, uploadSpeed, timeRemaining } = fileItem;

  // Memoize file information
  const fileInfo = useMemo(() => {
    if (!file) {
      return {
        name: 'Unknown file',
        size: 0,
        type: '',
        displayType: 'Unknown',
        icon: 'file',
        formattedSize: '0 B'
      };
    }

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      displayType: getFileTypeDisplayName(file.type),
      icon: getFileIcon(file.type),
      formattedSize: formatFileSize(file.size)
    };
  }, [file]);

  // Format upload speed
  const formattedUploadSpeed = useMemo(() => {
    if (!uploadSpeed) return null;
    return `${formatFileSize(uploadSpeed)}/s`;
  }, [uploadSpeed]);

  // Format time remaining
  const formattedTimeRemaining = useMemo(() => {
    if (!timeRemaining) return null;
    
    if (timeRemaining < 60) {
      return `${Math.round(timeRemaining)}s remaining`;
    } else if (timeRemaining < 3600) {
      const minutes = Math.round(timeRemaining / 60);
      return `${minutes}m remaining`;
    } else {
      const hours = Math.round(timeRemaining / 3600);
      return `${hours}h remaining`;
    }
  }, [timeRemaining]);

  // Handle remove button click
  const handleRemove = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);

  // Handle retry button click
  const handleRetry = useCallback(() => {
    onRetry(id);
  }, [id, onRetry]);

  // Get status display text
  const statusText = useMemo(() => {
    switch (status) {
      case 'pending':
        return 'Waiting to upload';
      case 'uploading':
        return progress >= 0 ? `Uploading... ${progress}%` : 'Processing...';
      case 'completed':
        return 'Upload completed';
      case 'error':
        return 'Upload failed';
      default:
        return 'Unknown status';
    }
  }, [status, progress]);

  // Get accessible label for the file item
  const accessibleLabel = useMemo(() => {
    const parts = [
      `File: ${fileInfo.name}`,
      `Type: ${fileInfo.displayType}`,
      `Size: ${fileInfo.formattedSize}`,
      `Status: ${statusText}`
    ];
    
    if (error) {
      parts.push(`Error: ${error}`);
    }
    
    return parts.join(', ');
  }, [fileInfo, statusText, error]);

  // Generate unique IDs for accessibility
  const errorId = `${id}-error`;
  const progressId = `${id}-progress`;
  const statusId = `${id}-status`;

  return (
    <li
      aria-label={accessibleLabel}
      aria-describedby={error ? errorId : undefined}
      data-status={status}
      className={cn(
        'relative flex items-center gap-3 p-4 rounded-lg border transition-all duration-200',
        
        // Status-based styling
        status === 'pending' && 'border-muted bg-muted/20',
        status === 'uploading' && 'border-primary bg-primary/5',
        status === 'completed' && 'border-green-500 bg-green-50',
        status === 'error' && 'border-destructive bg-destructive/10',
        
        className
      )}
    >
      {/* File Icon */}
      <div className="flex-shrink-0">
        <div
          role="img"
          aria-label={`${fileInfo.displayType} icon`}
          className={cn(
            'w-10 h-10 rounded-md flex items-center justify-center text-lg font-medium',
            status === 'pending' && 'bg-muted text-muted-foreground',
            status === 'uploading' && 'bg-primary/20 text-primary',
            status === 'completed' && 'bg-green-100 text-green-700',
            status === 'error' && 'bg-destructive/20 text-destructive'
          )}
        >
          {/* Simple icon representation based on file type */}
          {fileInfo.icon === 'file-text' && '📄'}
          {fileInfo.icon === 'presentation' && '📊'}
          {fileInfo.icon === 'file-code' && '💻'}
          {fileInfo.icon === 'file' && '📁'}
        </div>
      </div>
      
      {/* File Information */}
      <div className="flex-1 min-w-0">
        {/* File name and type */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium truncate">
            {fileInfo.name}
          </h3>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {fileInfo.displayType}
          </span>
        </div>
        
        {/* File size */}
        <div className="text-xs text-muted-foreground mb-2">
          {fileInfo.formattedSize}
        </div>
        
        {/* Status and Progress */}
        <div className="space-y-2">
          {/* Status text */}
          <div
            id={statusId}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              'text-xs font-medium',
              status === 'pending' && 'text-muted-foreground',
              status === 'uploading' && 'text-primary',
              status === 'completed' && 'text-green-700',
              status === 'error' && 'text-destructive'
            )}
          >
            {statusText}
          </div>
          
          {/* Progress bar for uploading files */}
          {status === 'uploading' && (
            <div className="space-y-1">
              <Progress
                id={progressId}
                value={progress >= 0 ? progress : undefined}
                aria-label={`Upload progress for ${fileInfo.name}`}
                aria-valuenow={progress >= 0 ? progress : undefined}
                aria-valuemin={0}
                aria-valuemax={100}
                className={cn(
                  'h-2',
                  progress < 0 && 'animate-pulse' // Indeterminate progress
                )}
              />
              
              {/* Upload metrics */}
              {(formattedUploadSpeed || formattedTimeRemaining) && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  {formattedUploadSpeed && (
                    <span>{formattedUploadSpeed}</span>
                  )}
                  {formattedTimeRemaining && (
                    <span>{formattedTimeRemaining}</span>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Progress bar for completed files */}
          {status === 'completed' && (
            <Progress
              value={100}
              aria-label={`Upload complete for ${fileInfo.name}`}
              aria-valuenow={100}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2"
            />
          )}
          
          {/* Error message */}
          {status === 'error' && error && (
            <div
              id={errorId}
              role="alert"
              aria-live="assertive"
              className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20"
            >
              {error}
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Retry button for failed uploads */}
        {status === 'error' && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRetry}
            aria-label={`Retry upload for ${fileInfo.name}`}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </Button>
        )}
        
        {/* Remove button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleRemove}
          aria-label={`Remove ${fileInfo.name} from upload queue`}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m18 6 -12 12" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      </div>
      
      {/* Loading spinner overlay for uploading files */}
      {status === 'uploading' && progress < 0 && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <div
            role="img"
            aria-label="Processing upload"
            className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      )}
      
      {/* Success animation overlay for completed files */}
      {status === 'completed' && (
        <div className="absolute top-2 right-2">
          <div
            role="img"
            aria-label="Upload successful"
            className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center animate-scale-in"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
        </div>
      )}
    </li>
  );
};