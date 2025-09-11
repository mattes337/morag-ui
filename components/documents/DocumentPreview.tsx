'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress, Skeleton } from '@/components/ui';
import { 
  ZoomIn,
  ZoomOut,
  Download,
  ExternalLink,
  RotateCw,
  Maximize,
  Eye,
  AlertCircle,
  FileText,
  FileImage,
  File
} from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';
import { 
  getPreviewCapability,
  getPreviewUrl,
  getDownloadUrl,
  getFileTypeInfo,
  formatFileSize,
  getFileAriaLabel
} from '@/lib/utils/documentPreview';

export interface DocumentPreviewProps {
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
  };
  
  /** Preview container height */
  height?: string | number;
  
  /** Show controls */
  showControls?: boolean;
  
  /** Show document info */
  showInfo?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback when preview loads successfully */
  onLoad?: () => void;
  
  /** Callback when preview fails to load */
  onError?: (error: string) => void;
  
  /** Callback for fullscreen toggle */
  onFullscreen?: () => void;
  
  /** Callback for download */
  onDownload?: () => void;
}

/**
 * DocumentPreview Component
 * 
 * A comprehensive document preview component that supports multiple file types
 * including PDFs, images, and text files with zoom, rotation, and fullscreen capabilities.
 */
export const DocumentPreview = React.forwardRef<HTMLDivElement, DocumentPreviewProps>(({
  document,
  height = 600,
  showControls = true,
  showInfo = true,
  loading: externalLoading = false,
  error: externalError,
  className,
  onLoad,
  onError,
  onFullscreen,
  onDownload,
  ...props
}, ref) => {
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [textContent, setTextContent] = useState<string | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const loading = externalLoading || internalLoading;
  const error = externalError || internalError;
  
  const fileInfo = getFileTypeInfo(document.filename, document.type);
  const previewCapability = getPreviewCapability(document.filename, document.type);
  const previewUrl = document.url || getPreviewUrl(document.filename, document.id);
  const downloadUrl = getDownloadUrl(document.id);
  const ariaLabel = getFileAriaLabel(document.filename, document.type);

  // Load text content for text files
  useEffect(() => {
    if (previewCapability.previewType === 'text' && previewUrl) {
      setInternalLoading(true);
      fetch(previewUrl)
        .then(response => response.text())
        .then(content => {
          setTextContent(content);
          setInternalLoading(false);
          onLoad?.();
        })
        .catch(err => {
          const errorMsg = 'Failed to load text content';
          setInternalError(errorMsg);
          setInternalLoading(false);
          onError?.(errorMsg);
        });
    } else if (previewCapability.canPreview) {
      setInternalLoading(false);
    }
  }, [document.id, previewUrl, previewCapability, onLoad, onError]);

  const handleImageLoad = () => {
    setInternalLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    const errorMsg = 'Failed to load image';
    setInternalError(errorMsg);
    setInternalLoading(false);
    onError?.(errorMsg);
  };

  const handleIframeLoad = () => {
    setInternalLoading(false);
    onLoad?.();
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      window.open(downloadUrl, '_blank');
    }
  };

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Preview Not Available</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="mt-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (!previewCapability.canPreview) {
      const IconComponent = fileInfo.icon === 'FileText' ? FileText :
                           fileInfo.icon === 'FileImage' ? FileImage : File;
      
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <IconComponent className={cn('w-16 h-16 mx-auto', fileInfo.color)} />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Preview Not Available</h3>
              <p className="text-sm text-muted-foreground">
                This file type cannot be previewed in the browser.
              </p>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="mt-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (previewCapability.previewType) {
      case 'pdf':
        return (
          <iframe
            ref={iframeRef}
            src={previewUrl || undefined}
            className="w-full h-full border-0"
            title={`PDF preview of ${document.filename}`}
            onLoad={handleIframeLoad}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          />
        );

      case 'image':
        return (
          <div className="flex items-center justify-center h-full overflow-auto">
            <img
              ref={imageRef}
              src={previewUrl || undefined}
              alt={document.filename}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        );

      case 'text':
        return (
          <div className="p-6 h-full overflow-auto">
            <pre 
              className="text-sm text-foreground whitespace-pre-wrap font-mono bg-muted/50 rounded-lg p-4"
              style={{ fontSize: `${zoom / 100}rem` }}
            >
              {textContent}
            </pre>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Eye className="w-16 h-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Unable to preview this file type</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card ref={ref} className={cn('flex flex-col', className)} {...props}>
      {/* Header with document info and controls */}
      {(showInfo || showControls) && (
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center justify-between">
            {showInfo && (
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate" title={document.name}>
                  {document.name}
                </CardTitle>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <span>{formatFileSize(document.size)}</span>
                  <Badge variant="secondary">{fileInfo.previewType}</Badge>
                  {document.status !== 'completed' && (
                    <Badge 
                      variant={document.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {document.status}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {showControls && (
              <div className="flex items-center space-x-2">
                {previewCapability.previewType === 'image' && (
                  <>
                    <Button
                      onClick={handleRotate}
                      variant="ghost"
                      size="sm"
                      className={focusRing()}
                      aria-label="Rotate image"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </>
                )}
                
                {(['image', 'text'].includes(previewCapability.previewType)) && (
                  <>
                    <Button
                      onClick={handleZoomOut}
                      variant="ghost"
                      size="sm"
                      disabled={zoom <= 25}
                      className={focusRing()}
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                      {zoom}%
                    </span>
                    
                    <Button
                      onClick={handleZoomIn}
                      variant="ghost"
                      size="sm"
                      disabled={zoom >= 300}
                      className={focusRing()}
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {onFullscreen && (
                  <Button
                    onClick={onFullscreen}
                    variant="ghost"
                    size="sm"
                    className={focusRing()}
                    aria-label="Open in fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="sm"
                  className={focusRing()}
                  aria-label="Download file"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Processing progress */}
          {document.status === 'processing' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Processing...</span>
                <span>Stage: {document.status}</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          )}
        </CardHeader>
      )}

      {/* Preview content */}
      <CardContent 
        className="flex-1 p-0 overflow-hidden" 
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="w-full h-full bg-muted/30 rounded-lg overflow-hidden" aria-label={ariaLabel}>
          {renderPreviewContent()}
        </div>
      </CardContent>

      {/* Tags and description */}
      {showInfo && (document.tags?.length || document.description) && (
        <div className="px-6 pb-6 pt-2 space-y-3">
          {document.description && (
            <p className="text-sm text-muted-foreground">{document.description}</p>
          )}
          
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
});

DocumentPreview.displayName = 'DocumentPreview';

export default DocumentPreview;