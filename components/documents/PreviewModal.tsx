'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
} from '@/components/ui';
import {
  X,
  Download,
  Share,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';
import { DocumentPreview } from './DocumentPreview';
import { getDownloadUrl, formatFileSize } from '@/lib/utils/documentPreview';

export interface PreviewModalProps {
  /** Whether modal is open */
  open: boolean;
  
  /** Function to close modal */
  onOpenChange: (open: boolean) => void;
  
  /** Document to preview */
  document: {
    id: string;
    name: string;
    filename: string;
    type: string;
    size: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
    description?: string;
    uploadedAt: Date;
    uploadedBy: string;
    tags?: string[];
  } | null;
  
  /** List of documents for navigation */
  documents?: PreviewModalProps['document'][];
  
  /** Enable document navigation */
  enableNavigation?: boolean;
  
  /** Show metadata sidebar */
  showMetadata?: boolean;
  
  /** Fullscreen mode */
  fullscreen?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback when document changes (navigation) */
  onDocumentChange?: (document: NonNullable<PreviewModalProps['document']>) => void;
  
  /** Callback for download action */
  onDownload?: (document: NonNullable<PreviewModalProps['document']>) => void;
  
  /** Callback for share action */
  onShare?: (document: NonNullable<PreviewModalProps['document']>) => void;
  
  /** Callback for edit metadata action */
  onEditMetadata?: (document: NonNullable<PreviewModalProps['document']>) => void;
}

/**
 * PreviewModal Component
 * 
 * A full-featured modal for previewing documents with navigation,
 * metadata display, and action buttons.
 */
export const PreviewModal = React.forwardRef<HTMLDivElement, PreviewModalProps>(({
  open,
  onOpenChange,
  document,
  documents = [],
  enableNavigation = false,
  showMetadata = true,
  fullscreen = false,
  loading = false,
  error,
  className,
  onDocumentChange,
  onDownload,
  onShare,
  onEditMetadata,
  ...props
}, ref) => {
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update current index when document changes
  useEffect(() => {
    if (document && documents.length > 0) {
      const index = documents.findIndex(doc => doc?.id === document.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [document, documents]);

  const handlePrevious = useCallback(() => {
    if (!enableNavigation || documents.length <= 1) return;
    
    const newIndex = currentIndex > 0 ? currentIndex - 1 : documents.length - 1;
    const nextDoc = documents[newIndex];
    
    if (nextDoc) {
      setCurrentIndex(newIndex);
      onDocumentChange?.(nextDoc);
    }
  }, [enableNavigation, documents, currentIndex, onDocumentChange]);

  const handleNext = useCallback(() => {
    if (!enableNavigation || documents.length <= 1) return;
    
    const newIndex = currentIndex < documents.length - 1 ? currentIndex + 1 : 0;
    const nextDoc = documents[newIndex];
    
    if (nextDoc) {
      setCurrentIndex(newIndex);
      onDocumentChange?.(nextDoc);
    }
  }, [enableNavigation, documents, currentIndex, onDocumentChange]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open || !enableNavigation || documents.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, enableNavigation, documents.length, currentIndex, handlePrevious, handleNext, onOpenChange]);

  const handleDownload = () => {
    if (document) {
      if (onDownload) {
        onDownload(document);
      } else {
        window.open(getDownloadUrl(document.id), '_blank');
      }
    }
  };

  const handleShare = () => {
    if (document && onShare) {
      onShare(document);
    }
  };

  const handleEditMetadata = () => {
    if (document && onEditMetadata) {
      onEditMetadata(document);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!document) {
    return null;
  }

  const dialogSize = isFullscreen ? 'full' : 'xl';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        ref={ref}
        size={dialogSize}
        className={cn(
          'p-0 gap-0 max-h-[95vh]',
          isFullscreen && 'h-screen max-h-screen w-screen max-w-screen rounded-none',
          className
        )}
        {...props}
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg truncate pr-4" title={document.name}>
                {document.name}
              </DialogTitle>
              <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                <span>{formatFileSize(document.size)}</span>
                <span>By {document.uploadedBy}</span>
                <span>{document.uploadedAt.toLocaleDateString()}</span>
              </div>
            </div>

            {/* Navigation */}
            {enableNavigation && documents.length > 1 && (
              <div className="flex items-center space-x-2 mx-4">
                <Button
                  onClick={handlePrevious}
                  variant="ghost"
                  size="sm"
                  className={focusRing()}
                  aria-label="Previous document"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm text-muted-foreground px-2">
                  {currentIndex + 1} of {documents.length}
                </span>
                
                <Button
                  onClick={handleNext}
                  variant="ghost"
                  size="sm"
                  className={focusRing()}
                  aria-label="Next document"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                size="sm"
                className={focusRing()}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>

              {onEditMetadata && (
                <Button
                  onClick={handleEditMetadata}
                  variant="ghost"
                  size="sm"
                  className={focusRing()}
                  aria-label="Edit metadata"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}

              {onShare && (
                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="sm"
                  className={focusRing()}
                  aria-label="Share document"
                >
                  <Share className="w-4 h-4" />
                </Button>
              )}

              <Button
                onClick={handleDownload}
                variant="ghost"
                size="sm"
                className={focusRing()}
                aria-label="Download document"
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => onOpenChange(false)}
                variant="ghost"
                size="sm"
                className={focusRing()}
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 flex">
          {/* Preview */}
          <div className={cn(
            'flex-1 min-w-0',
            showMetadata && 'pr-6'
          )}>
            <DocumentPreview
              document={document}
              height="100%"
              showControls={false}
              showInfo={false}
              loading={loading}
              error={error}
              className="h-full border-0 shadow-none"
            />
          </div>

          {/* Metadata sidebar */}
          {showMetadata && (
            <div className="w-80 flex-shrink-0 border-l bg-muted/30 p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Document Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Filename:</span>
                    <p className="text-foreground break-all">{document.filename}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="text-foreground">{document.type}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <p className="text-foreground">{formatFileSize(document.size)}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge 
                      variant={
                        document.status === 'completed' ? 'default' :
                        document.status === 'failed' ? 'destructive' :
                        'secondary'
                      }
                      className="ml-2"
                    >
                      {document.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Uploaded by:</span>
                    <p className="text-foreground">{document.uploadedBy}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Uploaded:</span>
                    <p className="text-foreground">
                      {document.uploadedAt.toLocaleDateString()} at {document.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {document.description && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Description</h3>
                  <p className="text-sm text-muted-foreground">{document.description}</p>
                </div>
              )}

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
                
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>

                {onShare && (
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Document
                  </Button>
                )}

                {onEditMetadata && (
                  <Button
                    onClick={handleEditMetadata}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Metadata
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

PreviewModal.displayName = 'PreviewModal';

export default PreviewModal;