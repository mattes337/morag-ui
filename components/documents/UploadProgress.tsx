'use client';

import React from 'react';
import { Progress, Button, Card, CardContent } from '@/components/ui';
import { X, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/fileValidation';

export interface UploadFileProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  speed?: number; // bytes per second
  eta?: number; // seconds remaining
  error?: string;
}

export interface UploadProgressProps {
  files: UploadFileProgress[];
  onCancel?: (fileId: string) => void;
  onRetry?: (fileId: string) => void;
  onRemove?: (fileId: string) => void;
  showOverallProgress?: boolean;
  className?: string;
}

export function UploadProgress({
  files,
  onCancel,
  onRetry,
  onRemove,
  showOverallProgress = true,
  className = ''
}: UploadProgressProps) {
  const overallProgress = React.useMemo(() => {
    if (files.length === 0) return 0;
    const totalProgress = files.reduce((sum, file) => sum + file.progress, 0);
    return Math.round(totalProgress / files.length);
  }, [files]);

  const completedCount = files.filter(file => file.status === 'completed').length;
  const failedCount = files.filter(file => file.status === 'failed').length;
  const activeCount = files.filter(file => 
    file.status === 'uploading' || file.status === 'processing'
  ).length;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusIcon = (status: UploadFileProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'uploading':
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: UploadFileProgress['status']): string => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'failed':
      case 'cancelled':
        return 'text-red-700';
      case 'uploading':
      case 'processing':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };


  if (files.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      {showOverallProgress && files.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">
                  {completedCount} of {files.length} completed
                </span>
              </div>
              <Progress 
                value={overallProgress} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{overallProgress}% complete</span>
                <div className="flex items-center gap-4">
                  {activeCount > 0 && (
                    <span className="text-blue-600">
                      {activeCount} uploading
                    </span>
                  )}
                  {failedCount > 0 && (
                    <span className="text-red-600">
                      {failedCount} failed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual File Progress */}
      <div className="space-y-2">
        {files.map((fileProgress) => (
          <Card key={fileProgress.id} className="border-l-4 border-l-gray-200">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* File Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getStatusIcon(fileProgress.status)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileProgress.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileProgress.file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-2">
                    {/* Cancel/Retry/Remove Actions */}
                    {fileProgress.status === 'uploading' && onCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel(fileProgress.id)}
                        className="h-6 w-6 p-0"
                        aria-label="Cancel upload"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {fileProgress.status === 'failed' && onRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRetry(fileProgress.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Retry
                      </Button>
                    )}
                    
                    {(fileProgress.status === 'completed' || 
                      fileProgress.status === 'failed' || 
                      fileProgress.status === 'cancelled') && onRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(fileProgress.id)}
                        className="h-6 w-6 p-0"
                        aria-label="Remove file"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <Progress 
                    value={fileProgress.progress} 
                    className="h-1.5"
                  />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={getStatusColor(fileProgress.status)}>
                      {fileProgress.status === 'uploading' && 'Uploading...'}
                      {fileProgress.status === 'processing' && 'Processing...'}
                      {fileProgress.status === 'completed' && 'Completed'}
                      {fileProgress.status === 'failed' && 'Failed'}
                      {fileProgress.status === 'cancelled' && 'Cancelled'}
                      {fileProgress.status === 'pending' && 'Pending...'}
                    </span>
                    
                    <div className="flex items-center gap-2 text-gray-500">
                      {fileProgress.progress}%
                      {fileProgress.speed && fileProgress.status === 'uploading' && (
                        <span>• {formatFileSize(fileProgress.speed)}/s</span>
                      )}
                      {fileProgress.eta && fileProgress.eta > 0 && (
                        <span>• {formatTime(fileProgress.eta)} remaining</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {fileProgress.error && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {fileProgress.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default UploadProgress;