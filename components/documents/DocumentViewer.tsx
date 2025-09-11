'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Eye, X } from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';
import { PreviewModal } from './PreviewModal';
import { cn, focusRing } from '@/lib/utils';

export interface DocumentViewerProps {
  /** Document to view */
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
  };
  
  /** List of documents for navigation */
  documents?: DocumentViewerProps['document'][];
  
  /** Display mode */
  mode?: 'inline' | 'modal' | 'button';
  
  /** Size for inline mode */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Enable navigation between documents */
  enableNavigation?: boolean;
  
  /** Show metadata in modal */
  showMetadata?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Button text for button mode */
  buttonText?: string;
  
  /** Button variant for button mode */
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback when modal opens/closes */
  onOpenChange?: (open: boolean) => void;
  
  /** Callback when document changes */
  onDocumentChange?: (document: DocumentViewerProps['document']) => void;
  
  /** Callback for download action */
  onDownload?: (document: DocumentViewerProps['document']) => void;
  
  /** Callback for share action */
  onShare?: (document: DocumentViewerProps['document']) => void;
  
  /** Callback for edit metadata action */
  onEditMetadata?: (document: DocumentViewerProps['document']) => void;
}

/**
 * DocumentViewer Component
 * 
 * A versatile document viewer that can display documents inline,
 * in a modal, or as a preview button. Supports navigation between
 * multiple documents and various file types.
 */
export const DocumentViewer = React.forwardRef<HTMLDivElement, DocumentViewerProps>(({
  document,
  documents = [],
  mode = 'inline',
  size = 'md',
  enableNavigation = false,
  showMetadata = true,
  loading = false,
  error,
  buttonText = 'Preview Document',
  buttonVariant = 'outline',
  className,
  onOpenChange,
  onDocumentChange,
  onDownload,
  onShare,
  onEditMetadata,
  ...props
}, ref) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(document);

  // Update current document when prop changes
  useEffect(() => {
    setCurrentDocument(document);
  }, [document]);

  const handleModalOpenChange = useCallback((open: boolean) => {
    setModalOpen(open);
    onOpenChange?.(open);
  }, [onOpenChange]);

  const handleDocumentChange = useCallback((newDocument: DocumentViewerProps['document']) => {
    setCurrentDocument(newDocument);
    onDocumentChange?.(newDocument);
  }, [onDocumentChange]);

  const handleOpenModal = () => {
    setModalOpen(true);
    onOpenChange?.(true);
  };

  const handleFullscreen = () => {
    setModalOpen(true);
    onOpenChange?.(true);
  };

  const sizeClasses = {
    sm: 'h-64',
    md: 'h-96',
    lg: 'h-[32rem]',
    xl: 'h-[48rem]',
  };

  if (mode === 'button') {
    return (
      <>
        <Button
          ref={ref}
          onClick={handleOpenModal}
          variant={buttonVariant}
          className={cn(focusRing(), className)}
          {...props}
        >
          <Eye className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
        
        <PreviewModal
          open={modalOpen}
          onOpenChange={handleModalOpenChange}
          document={currentDocument}
          documents={documents}
          enableNavigation={enableNavigation}
          showMetadata={showMetadata}
          loading={loading}
          error={error}
          onDocumentChange={handleDocumentChange}
          onDownload={onDownload}
          onShare={onShare}
          onEditMetadata={onEditMetadata}
        />
      </>
    );
  }

  if (mode === 'modal') {
    return (
      <PreviewModal
        ref={ref}
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        document={currentDocument}
        documents={documents}
        enableNavigation={enableNavigation}
        showMetadata={showMetadata}
        loading={loading}
        error={error}
        className={className}
        onDocumentChange={handleDocumentChange}
        onDownload={onDownload}
        onShare={onShare}
        onEditMetadata={onEditMetadata}
        {...props}
      />
    );
  }

  // Inline mode
  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      <DocumentPreview
        document={currentDocument}
        height={sizeClasses[size]}
        showControls={true}
        showInfo={true}
        loading={loading}
        error={error}
        onFullscreen={handleFullscreen}
        onDownload={() => onDownload?.(currentDocument)}
      />
      
      {/* Navigation controls for inline mode */}
      {enableNavigation && documents.length > 1 && (
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2 px-3 py-2">
            <Button
              onClick={() => {
                const currentIndex = documents.findIndex(doc => doc.id === currentDocument.id);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : documents.length - 1;
                const prevDoc = documents[prevIndex];
                if (prevDoc) {
                  handleDocumentChange(prevDoc);
                }
              }}
              variant="ghost"
              size="sm"
              className={focusRing()}
              aria-label="Previous document"
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {documents.findIndex(doc => doc.id === currentDocument.id) + 1} of {documents.length}
            </span>
            
            <Button
              onClick={() => {
                const currentIndex = documents.findIndex(doc => doc.id === currentDocument.id);
                const nextIndex = currentIndex < documents.length - 1 ? currentIndex + 1 : 0;
                const nextDoc = documents[nextIndex];
                if (nextDoc) {
                  handleDocumentChange(nextDoc);
                }
              }}
              variant="ghost"
              size="sm"
              className={focusRing()}
              aria-label="Next document"
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleOpenModal}
              variant="ghost"
              size="sm"
              className={focusRing()}
              aria-label="Open in modal"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Modal for fullscreen */}
      <PreviewModal
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        document={currentDocument}
        documents={documents}
        enableNavigation={enableNavigation}
        showMetadata={showMetadata}
        loading={loading}
        error={error}
        onDocumentChange={handleDocumentChange}
        onDownload={onDownload}
        onShare={onShare}
        onEditMetadata={onEditMetadata}
      />
    </div>
  );
});

DocumentViewer.displayName = 'DocumentViewer';

export default DocumentViewer;

// Export additional interfaces for external use
export type { DocumentViewerProps };

/**
 * Hook for managing document viewer state
 */
export const useDocumentViewer = (initialDocument?: DocumentViewerProps['document']) => {
  const [currentDocument, setCurrentDocument] = useState(initialDocument);
  const [modalOpen, setModalOpen] = useState(false);

  const openViewer = useCallback((document: DocumentViewerProps['document']) => {
    setCurrentDocument(document);
    setModalOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setModalOpen(false);
  }, []);

  const changeDocument = useCallback((document: DocumentViewerProps['document']) => {
    setCurrentDocument(document);
  }, []);

  return {
    currentDocument,
    modalOpen,
    openViewer,
    closeViewer,
    changeDocument,
    setModalOpen,
  };
};