'use client';

import React from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  isDragAndDropSupported, 
  getFileIcon, 
  formatFileSize,
  SUPPORTED_FILE_TYPES 
} from '@/lib/utils/fileValidation';

export interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxFiles?: number;
  className?: string;
  children?: React.ReactNode;
}

export function FileDropzone({
  onFilesSelected,
  selectedFiles = [],
  onRemoveFile,
  accept,
  multiple = true,
  disabled = false,
  maxFiles = 10,
  className,
  children
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [dragCounter, setDragCounter] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropzoneRef = React.useRef<HTMLDivElement>(null);

  const supportsDragAndDrop = React.useMemo(() => {
    return typeof window !== 'undefined' && isDragAndDropSupported();
  }, []);

  const handleFileSelect = React.useCallback((files: FileList | null) => {
    if (!files || disabled) return;
    
    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - selectedFiles.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);
    
    onFilesSelected(filesToAdd);
  }, [disabled, maxFiles, selectedFiles.length, onFilesSelected]);

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  }, [handleFileSelect]);

  const handleDragEnter = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (disabled) return;
    
    setDragCounter(prev => prev + 1);
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (disabled) return;
    
    // Provide visual feedback for valid drop zones
    event.dataTransfer.dropEffect = 'copy';
  }, [disabled]);

  const handleDragLeave = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, []);

  const handleDrop = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragOver(false);
    setDragCounter(0);
    
    if (disabled) return;
    
    const files = event.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleClick = React.useCallback(() => {
    if (disabled || !fileInputRef.current) return;
    fileInputRef.current.click();
  }, [disabled]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [disabled, handleClick]);

  const getFileTypeIcon = React.useCallback((file: File) => {
    const iconName = getFileIcon(file.type);
    switch (iconName) {
      case 'file-text':
        return <FileText className="h-8 w-8" />;
      default:
        return <FileText className="h-8 w-8" />;
    }
  }, []);

  const canAddMoreFiles = selectedFiles.length < maxFiles;
  const acceptedTypes = accept || Object.keys(SUPPORTED_FILE_TYPES).join(',');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="File upload input"
      />

      {/* Dropzone */}
      <Card
        ref={dropzoneRef}
        className={cn(
          'relative border-2 border-dashed transition-all duration-200 cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
          {
            'border-primary bg-primary/10': isDragOver && !disabled,
            'border-red-300 bg-red-50': !canAddMoreFiles,
            'border-gray-200': !isDragOver && canAddMoreFiles,
            'opacity-50 cursor-not-allowed': disabled,
          }
        )}
        onDragEnter={supportsDragAndDrop ? handleDragEnter : undefined}
        onDragOver={supportsDragAndDrop ? handleDragOver : undefined}
        onDragLeave={supportsDragAndDrop ? handleDragLeave : undefined}
        onDrop={supportsDragAndDrop ? handleDrop : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        aria-label={`Upload files. ${selectedFiles.length} of ${maxFiles} files selected.`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          {children || (
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <Upload 
                  className={cn(
                    'h-8 w-8 transition-colors',
                    isDragOver ? 'text-primary' : 'text-gray-600'
                  )} 
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {isDragOver 
                    ? 'Drop files here' 
                    : canAddMoreFiles 
                      ? 'Upload documents'
                      : 'Maximum files reached'
                  }
                </h3>
                
                {canAddMoreFiles ? (
                  <div className="space-y-1">
                    <p className="text-gray-600">
                      {supportsDragAndDrop 
                        ? 'Drag and drop files here, or click to browse'
                        : 'Click to browse and select files'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, Word documents, text files and more
                    </p>
                    <p className="text-xs text-gray-400">
                      Maximum {maxFiles} files, 50MB per file
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Remove some files to upload more ({selectedFiles.length}/{maxFiles})
                  </p>
                )}

                {canAddMoreFiles && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                    onClickCapture={handleClick}
                  >
                    Choose Files
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  Selected Files ({selectedFiles.length})
                </h4>
                {selectedFiles.length > 0 && onRemoveFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Remove all files
                      for (let i = selectedFiles.length - 1; i >= 0; i--) {
                        onRemoveFile(i);
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="text-gray-600 flex-shrink-0">
                        {getFileTypeIcon(file)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    {onRemoveFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFile(index)}
                        className="h-6 w-6 p-0 flex-shrink-0 ml-2"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drag overlay for better UX */}
      {isDragOver && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-primary border-dashed">
            <div className="flex items-center gap-3">
              <Upload className="h-6 w-6 text-primary" />
              <span className="text-lg font-medium">Drop files to upload</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileDropzone;