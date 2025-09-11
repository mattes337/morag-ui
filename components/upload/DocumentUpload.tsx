import React, { useCallback, useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/Label';
import { DropZone } from './DropZone';
import { UploadProgress } from './UploadProgress';
import { cn } from '@/lib/utils';
import { 
  validateFiles, 
  SUPPORTED_FILE_TYPES, 
  MAX_FILE_SIZE,
  isDragAndDropSupported 
} from '@/lib/utils/fileValidation';
import { uploadFiles, UploadResult } from '@/lib/api/uploadApi';

export interface DocumentUploadProps {
  onUpload: (results: UploadResult[]) => void | Promise<void>;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface QueuedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  uploadSpeed?: number;
  timeRemaining?: number;
  file: File;
}

const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  accept,
  maxSize = MAX_FILE_SIZE,
  maxFiles = 10,
  disabled = false,
  className,
}) => {
  const [fileQueue, setFileQueue] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get supported file types for accept attribute
  const acceptedTypes = useMemo(() => {
    if (accept) return accept;
    
    // Use all supported types from file validation
    return Object.keys(SUPPORTED_FILE_TYPES).join(',');
  }, [accept]);

  // Check if drag and drop is supported
  const dragDropSupported = isDragAndDropSupported();

  // Add files to queue
  const addFilesToQueue = useCallback(async (newFiles: File[]) => {
    // Validate files
    const validation = await validateFiles(newFiles);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors.map(error => error.message));
      return;
    }
    
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Check total file count
    if (fileQueue.length + newFiles.length > maxFiles) {
      setValidationErrors([`Maximum ${maxFiles} files allowed. You have ${fileQueue.length} files and are trying to add ${newFiles.length} more.`]);
      return;
    }
    
    // Add new files to queue
    const queuedFiles: QueuedFile[] = newFiles.map(file => ({
      id: generateFileId(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      file
    }));
    
    setFileQueue(prev => [...prev, ...queuedFiles]);
  }, [fileQueue.length, maxFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      addFilesToQueue(files);
    }
    
    // Clear input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFilesToQueue]);

  // Handle drop zone drop
  const handleDrop = useCallback((files: File[]) => {
    addFilesToQueue(files);
  }, [addFilesToQueue]);

  // Handle drop zone click
  const handleDropZoneClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Remove file from queue (TODO: Connect to UI)
  // const handleRemoveFile = useCallback((fileId: string) => {
  //   setFileQueue(prev => prev.filter(file => file.id !== fileId));
  //   setValidationErrors([]);
  // }, []);

  // Clear all files
  const handleClearAll = useCallback(() => {
    setFileQueue([]);
    setValidationErrors([]);
  }, []);

  // Retry failed file
  const handleRetryFile = useCallback((fileId: string) => {
    if (fileId === 'all') {
      // Retry all failed files
      setFileQueue(prev => prev.map(file => {
        if (file.status === 'error') {
          const { error, ...fileWithoutError } = file;
          return { ...fileWithoutError, status: 'pending' as const, progress: 0 };
        }
        return file;
      }));
    } else {
      // Retry specific file
      setFileQueue(prev => prev.map(file => {
        if (file.id === fileId && file.status === 'error') {
          const { error, ...fileWithoutError } = file;
          return { ...fileWithoutError, status: 'pending' as const, progress: 0 };
        }
        return file;
      }));
    }
  }, []);

  // Start upload process
  const handleStartUpload = useCallback(async () => {
    const filesToUpload = fileQueue.filter(file => 
      file.status === 'pending' || file.status === 'error'
    );
    
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    setValidationErrors([]);
    
    try {
      // Mark files as uploading
      setFileQueue(prev => prev.map(file => 
        filesToUpload.some(f => f.id === file.id)
          ? { ...file, status: 'uploading', progress: 0 }
          : file
      ));
      
      // Upload files with progress tracking
      const results = await uploadFiles(
        filesToUpload.map(f => f.file),
        (progress) => {
          if (typeof progress === 'object') {
            // Batch progress update
            setFileQueue(prev => prev.map(file => {
              const progressFile = progress.files.find(f => f.filename === file.name);
              if (progressFile) {
                const updatedFile: QueuedFile = {
                  ...file,
                  progress: progressFile.progress,
                  status: progressFile.status as QueuedFile['status'],
                };
                
                // Only add error property if it exists
                if (progressFile.error) {
                  updatedFile.error = progressFile.error;
                }
                
                return updatedFile;
              }
              return file;
            }));
          }
        }
      );
      
      // Update final status
      results.forEach((result, index) => {
        const uploadedFile = filesToUpload[index];
        if (!uploadedFile) return; // Skip if no corresponding file
        
        setFileQueue(prev => prev.map(file => {
          if (file.id === uploadedFile.id) {
            if (result.success) {
              const { error, ...fileWithoutError } = file;
              return {
                ...fileWithoutError,
                status: 'completed' as const,
                progress: 100
              };
            } else {
              const updatedFile: QueuedFile = {
                ...file,
                status: 'error' as const,
                progress: file.progress
              };
              
              // Only add error property if it exists
              if (result.error) {
                updatedFile.error = result.error;
              }
              
              return updatedFile;
            }
          }
          return file;
        }));
      });
      
      // Call onUpload callback
      await onUpload(results);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setValidationErrors([error instanceof Error ? error.message : 'Upload failed']);
      
      // Mark all uploading files as failed
      setFileQueue(prev => prev.map(file => 
        file.status === 'uploading'
          ? { ...file, status: 'error', error: 'Upload failed' }
          : file
      ));
    } finally {
      setIsUploading(false);
    }
  }, [fileQueue, onUpload]);

  // Cancel upload
  const handleCancelUpload = useCallback(() => {
    setIsUploading(false);
    setFileQueue(prev => prev.map(file => 
      file.status === 'uploading'
        ? { ...file, status: 'pending', progress: 0 }
        : file
    ));
  }, []);

  // Statistics for display
  const stats = useMemo(() => {
    const total = fileQueue.length;
    const pending = fileQueue.filter(f => f.status === 'pending').length;
    const uploading = fileQueue.filter(f => f.status === 'uploading').length;
    const completed = fileQueue.filter(f => f.status === 'completed').length;
    const errors = fileQueue.filter(f => f.status === 'error').length;
    
    return { total, pending, uploading, completed, errors };
  }, [fileQueue]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* File Input (Hidden) */}
      <div className="sr-only">
        <Label htmlFor="file-upload">
          Select files to upload
        </Label>
        <Input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          name="files"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          aria-describedby="file-upload-description"
        />
        <div id="file-upload-description" className="text-sm text-muted-foreground mt-1">
          Supported file types: {Object.values(SUPPORTED_FILE_TYPES).map(type => type.name).join(', ')}. 
          Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB. 
          Maximum {maxFiles} files.
        </div>
      </div>

      {/* Drop Zone */}
      <DropZone
        onDrop={handleDrop}
        onClick={handleDropZoneClick}
        accept={acceptedTypes}
        maxSize={maxSize}
        disabled={disabled || isUploading}
        className="min-h-[200px]"
      />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-destructive flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <h4 className="font-medium text-destructive mb-2">
                File Validation Errors
              </h4>
              <ul className="text-sm text-destructive space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File Queue Controls */}
      {fileQueue.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {stats.total} {stats.total === 1 ? 'file' : 'files'} selected
            {stats.completed > 0 && ` • ${stats.completed} completed`}
            {stats.errors > 0 && ` • ${stats.errors} failed`}
          </div>
          
          <div className="flex items-center gap-2">
            {!isUploading && (stats.pending > 0 || stats.errors > 0) && (
              <Button
                onClick={handleStartUpload}
                disabled={disabled}
                aria-describedby="upload-button-description"
                className="min-w-[120px]"
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
                  className="mr-2"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Start Upload
              </Button>
            )}
            
            {isUploading && (
              <Button
                variant="destructive"
                onClick={handleCancelUpload}
                aria-label="Cancel upload"
                className="min-w-[120px]"
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
                  className="mr-2"
                  aria-hidden="true"
                >
                  <path d="m18 6 -12 12" />
                  <path d="m6 6 12 12" />
                </svg>
                Cancel
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={handleClearAll}
              disabled={isUploading}
              aria-label="Remove all files from queue"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {fileQueue.length > 0 && (
        <UploadProgress
          files={fileQueue}
          onCancel={handleCancelUpload}
          onRetry={handleRetryFile}
          onClear={handleClearAll}
        />
      )}

      {/* Instructions when no files */}
      {fileQueue.length === 0 && !validationErrors.length && (
        <div className="text-center py-6 text-muted-foreground space-y-2">
          <p>
            {dragDropSupported
              ? 'Drag and drop files above or click to browse'
              : 'Click above to select files for upload'
            }
          </p>
          <div className="text-xs space-y-1">
            <p>
              Supported formats: {Object.values(SUPPORTED_FILE_TYPES).slice(0, 4).map(type => type.name).join(', ')}
              {Object.values(SUPPORTED_FILE_TYPES).length > 4 && `, and ${Object.values(SUPPORTED_FILE_TYPES).length - 4} more`}
            </p>
            <p>
              Maximum {maxFiles} files, up to {Math.round(maxSize / (1024 * 1024))}MB each
            </p>
          </div>
        </div>
      )}

      {/* Hidden description for upload button */}
      <div id="upload-button-description" className="sr-only">
        Upload {stats.pending + stats.errors} files to the server for processing
      </div>
    </div>
  );
};