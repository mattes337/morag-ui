import React, { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { isDragAndDropSupported } from '@/lib/utils/fileValidation';

export interface DropZoneProps {
  onDrop: (files: File[]) => void | Promise<void>;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onClick?: () => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onDrop,
  onDragEnter,
  onDragLeave,
  onClick,
  accept,
  maxSize,
  disabled = false,
  children,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [dragAccept, setDragAccept] = useState(false);
  const [dragReject, setDragReject] = useState(false);
  const [error, setError] = useState(false);
  
  const dragCounter = useRef(0);
  const isDragDropSupported = isDragAndDropSupported();
  
  // Determine the appropriate role and aria-label
  const role = isDragDropSupported ? "region" : "button";
  const ariaLabel = isDragDropSupported 
    ? "File drop zone - drag files here or click to browse"
    : "Click to select files";

  // Validate dragged files
  const validateDraggedFiles = useCallback((items: DataTransferItemList): boolean => {
    if (!accept) return true;
    
    const acceptedTypes = accept.split(',').map(type => type.trim());
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const isAccepted = acceptedTypes.some(acceptedType => {
          if (acceptedType.startsWith('.')) {
            // File extension check
            return item.type === '' || acceptedType === `.${item.type.split('/')[1]}`;
          } else {
            // MIME type check
            return item.type.match(acceptedType.replace('*', '.*'));
          }
        });
        
        if (!isAccepted) return false;
      }
    }
    
    return true;
  }, [accept]);

  // Handle drag enter
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    dragCounter.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const isValid = validateDraggedFiles(e.dataTransfer.items);
      setDragActive(true);
      setDragAccept(isValid);
      setDragReject(!isValid);
      setError(false);
      onDragEnter?.();
    }
  }, [disabled, validateDraggedFiles, onDragEnter]);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setDragActive(false);
      setDragAccept(false);
      setDragReject(false);
      setError(false);
      onDragLeave?.();
    }
  }, [disabled, onDragLeave]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    // Set appropriate drop effect
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = dragReject ? 'none' : 'copy';
    }
  }, [disabled, dragReject]);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragActive(false);
    setDragAccept(false);
    setDragReject(false);
    dragCounter.current = 0;
    
    try {
      const files = Array.from(e.dataTransfer.files);
      
      if (files.length > 0) {
        await onDrop(files);
      }
      
      setError(false);
    } catch (error) {
      console.error('Drop failed:', error);
      setError(true);
    }
  }, [disabled, onDrop]);

  // Handle click
  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
  }, [disabled, onClick]);

  // Handle keyboard activation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [disabled, handleClick]);

  // Format accepted file types for display
  const formatAcceptedTypes = useCallback(() => {
    if (!accept) return 'All files';
    
    const types = accept.split(',').map(type => type.trim());
    const extensions = types.filter(type => type.startsWith('.')).map(type => type.slice(1).toUpperCase());
    const mimeTypes = types.filter(type => !type.startsWith('.'));
    
    const displayTypes = [...extensions];
    
    // Convert common MIME types to readable names
    mimeTypes.forEach(mime => {
      if (mime.includes('pdf')) displayTypes.push('PDF');
      else if (mime.includes('word') || mime.includes('doc')) displayTypes.push('Word');
      else if (mime.includes('text')) displayTypes.push('Text');
      else if (mime.includes('image')) displayTypes.push('Images');
    });
    
    return displayTypes.length > 0 ? displayTypes.join(', ') : 'Supported files';
  }, [accept]);

  // Format max size for display
  const formatMaxSize = useCallback(() => {
    if (!maxSize) return null;
    
    const mb = Math.round(maxSize / (1024 * 1024));
    return `${mb} MB`;
  }, [maxSize]);

  // Determine announcement text for screen readers
  const getAnnouncementText = useCallback(() => {
    if (dragReject) return 'Invalid file type - files will be rejected';
    if (dragAccept) return 'Ready to drop files here';
    if (dragActive) return 'Drop files here to upload';
    return '';
  }, [dragActive, dragAccept, dragReject]);

  const announcementText = getAnnouncementText();

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-describedby="dropzone-instructions"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      data-drag-active={dragActive}
      data-drag-accept={dragAccept}
      data-drag-reject={dragReject}
      data-error={error}
      data-disabled={disabled}
      className={cn(
        // Base styles
        'relative flex flex-col items-center justify-center',
        'rounded-lg border-2 border-dashed transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        
        // Size and spacing
        'min-h-[200px] p-8',
        
        // Default state
        'border-muted-foreground/25 bg-background hover:bg-muted/20',
        
        // Drag active state
        dragActive && 'border-primary bg-primary/5 scale-[1.02]',
        
        // Drag accept state
        dragAccept && 'border-green-500 bg-green-50 text-green-700',
        
        // Drag reject state
        dragReject && 'border-destructive bg-destructive/5 text-destructive',
        
        // Error state
        error && 'border-destructive bg-destructive/10 text-destructive',
        
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        
        // Enabled cursor
        !disabled && 'cursor-pointer',
        
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Screen reader announcements */}
      {announcementText && (
        <div
          role="status"
          aria-live="polite"
          aria-label={announcementText}
          className="sr-only"
        >
          {announcementText}
        </div>
      )}
      
      {/* Content */}
      {children || (
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <svg
              className={cn(
                'h-12 w-12 transition-colors',
                dragAccept && 'text-green-500',
                dragReject && 'text-destructive',
                error && 'text-destructive',
                !dragActive && !error && 'text-muted-foreground'
              )}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
              role="img"
              aria-label={dragReject ? "Invalid file type icon" : "Upload icon"}
            >
              {dragReject || error ? (
                // Error/reject icon
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3m0 0v3m0-3h3m-3 0h-3m21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                // Upload icon
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              )}
            </svg>
          </div>
          
          {/* Main text */}
          <div className="text-lg font-medium">
            {dragActive ? (
              dragAccept ? 'Drop files here' : 'Invalid file type'
            ) : isDragDropSupported ? (
              'Drag and drop files here'
            ) : (
              'Click to select files'
            )}
          </div>
          
          {/* Secondary text */}
          <div className="text-sm text-muted-foreground space-y-1">
            {!dragActive && (
              <>
                {isDragDropSupported && (
                  <p>or click to browse files</p>
                )}
                <p>Press Enter or Space to select files</p>
              </>
            )}
            
            {dragActive && dragReject && (
              <p>Please select {formatAcceptedTypes().toLowerCase()} files</p>
            )}
          </div>
          
          {/* File constraints */}
          {!dragActive && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Accepted file types: {formatAcceptedTypes()}</p>
              {maxSize && (
                <p>Maximum file size: {formatMaxSize()}</p>
              )}
            </div>
          )}
          
          {/* Drag count indicator */}
          {dragActive && dragAccept && (
            <div className="text-sm font-medium">
              {dragActive && 'Ready to upload'}
            </div>
          )}
        </div>
      )}
      
      {/* Instructions for screen readers */}
      <div id="dropzone-instructions" className="sr-only">
        {isDragDropSupported
          ? `File upload area. Drag and drop files here or press Enter or Space to open file browser. Accepted file types: ${formatAcceptedTypes()}. ${maxSize ? `Maximum file size: ${formatMaxSize()}.` : ''}`
          : `Click to select files for upload. Accepted file types: ${formatAcceptedTypes()}. ${maxSize ? `Maximum file size: ${formatMaxSize()}.` : ''}`
        }
      </div>
    </div>
  );
};