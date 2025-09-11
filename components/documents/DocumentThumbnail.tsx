'use client';

import React from 'react';
import { Badge, Tooltip } from '@/components/ui';
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  File, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { cn, hoverStyles, pressAnimation, focusRing } from '@/lib/utils';
import { 
  getFileTypeInfo, 
  generateThumbnailUrl,
  formatFileSize,
  getFileAriaLabel
} from '@/lib/utils/documentPreview';

export interface DocumentThumbnailProps {
  /** Document metadata */
  document: {
    id: string;
    name: string;
    filename: string;
    type: string;
    size: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    processingStage?: string;
    progress?: number;
    tags?: string[];
    thumbnailUrl?: string;
    uploadedAt: Date;
    uploadedBy: string;
  };
  
  /** Display variant */
  variant?: 'grid' | 'list';
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show file info overlay */
  showInfo?: boolean;
  
  /** Show processing status */
  showStatus?: boolean;
  
  /** Show quick actions on hover */
  showQuickActions?: boolean;
  
  /** Clickable thumbnail */
  clickable?: boolean;
  
  /** Selection state */
  selected?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Click handler */
  onClick?: (document: DocumentThumbnailProps['document']) => void;
  
  /** Quick action handlers */
  onPreview?: (document: DocumentThumbnailProps['document']) => void;
  onDownload?: (document: DocumentThumbnailProps['document']) => void;
}

// Icon mapping
const ICON_COMPONENTS = {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
};

// Status icons
const STATUS_ICONS = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

// Status colors
const STATUS_COLORS = {
  pending: 'text-yellow-500',
  processing: 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
};

/**
 * DocumentThumbnail Component
 * 
 * A thumbnail component for displaying documents with file type icons,
 * processing status, and quick actions.
 */
export const DocumentThumbnail = React.forwardRef<
  HTMLDivElement,
  DocumentThumbnailProps
>(({
  document,
  variant = 'grid',
  size = 'md',
  showInfo = true,
  showStatus = true,
  showQuickActions = false,
  clickable = true,
  selected = false,
  className,
  onClick,
  onPreview,
  onDownload,
  ...props
}, ref) => {
  const fileInfo = getFileTypeInfo(document.filename, document.type);
  const IconComponent = ICON_COMPONENTS[fileInfo.icon as keyof typeof ICON_COMPONENTS] || File;
  const StatusIcon = STATUS_ICONS[document.status];
  const statusColor = STATUS_COLORS[document.status];
  const thumbnailUrl = document.thumbnailUrl || generateThumbnailUrl(document.filename, document.id);
  
  const sizeClasses = {
    sm: variant === 'grid' ? 'w-24 h-24' : 'w-16 h-16',
    md: variant === 'grid' ? 'w-32 h-32' : 'w-20 h-20',
    lg: variant === 'grid' ? 'w-40 h-40' : 'w-24 h-24',
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick(document);
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(document);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(document);
    }
  };

  const ariaLabel = getFileAriaLabel(document.filename, document.type);

  if (variant === 'list') {
    const CardComponent = clickable ? 'button' : 'div';
    
    return (
      <CardComponent
        ref={ref as any}
        className={cn(
          'flex items-center p-3 space-x-3 transition-all duration-200',
          'rounded-lg border bg-card text-card-foreground', // Card styles
          selected && 'ring-2 ring-primary bg-primary/5',
          clickable && hoverStyles('hover:shadow-md cursor-pointer'),
          clickable && pressAnimation(),
          clickable && focusRing(),
          clickable && 'text-left', // Button specific styles
          className
        )}
        onClick={clickable ? handleClick : undefined}
        aria-label={clickable ? `Select ${ariaLabel}` : ariaLabel}
        {...props}
      >
        {/* Thumbnail/Icon */}
        <div className={cn(
          'relative flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center',
          sizeClasses[size]
        )}>
          {thumbnailUrl && fileInfo.previewType === 'image' ? (
            <img
              src={thumbnailUrl}
              alt={document.filename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <IconComponent className={cn('w-1/2 h-1/2', fileInfo.color)} />
          )}
          
          {/* Status overlay */}
          {showStatus && document.status !== 'completed' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <StatusIcon 
                className={cn(
                  'w-6 h-6', 
                  statusColor,
                  document.status === 'processing' && 'animate-spin'
                )} 
              />
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground truncate">
              {document.name}
            </h3>
            
            {/* Quick actions */}
            {showQuickActions && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip content="Preview">
                  <button
                    onClick={handlePreview}
                    className={cn(
                      'p-1 rounded-md hover:bg-muted',
                      focusRing(),
                      'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label={`Preview ${document.filename}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </Tooltip>
                
                <Tooltip content="Download">
                  <button
                    onClick={handleDownload}
                    className={cn(
                      'p-1 rounded-md hover:bg-muted',
                      focusRing(),
                      'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label={`Download ${document.filename}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground truncate">
            {document.filename}
          </p>
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {formatFileSize(document.size)}
            </span>
            
            {showStatus && (
              <Badge variant="secondary" className="text-xs">
                {document.status}
              </Badge>
            )}
          </div>
        </div>
      </CardComponent>
    );
  }

  // Grid variant
  const GridCardComponent = clickable ? 'button' : 'div';
  
  return (
    <GridCardComponent
      ref={ref as any}
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'rounded-lg border bg-card text-card-foreground', // Card styles
        selected && 'ring-2 ring-primary bg-primary/5',
        clickable && hoverStyles('hover:shadow-md cursor-pointer'),
        clickable && pressAnimation(),
        clickable && focusRing(),
        clickable && 'text-left p-0', // Button specific styles
        className
      )}
      onClick={clickable ? handleClick : undefined}
      aria-label={clickable ? `Select ${ariaLabel}` : ariaLabel}
      {...props}
    >
      <div className="p-4">
        {/* Thumbnail/Icon */}
        <div className={cn(
          'relative mx-auto mb-3 rounded-lg overflow-hidden bg-muted flex items-center justify-center',
          sizeClasses[size]
        )}>
          {thumbnailUrl && fileInfo.previewType === 'image' ? (
            <img
              src={thumbnailUrl}
              alt={document.filename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <IconComponent className={cn('w-1/2 h-1/2', fileInfo.color)} />
          )}
          
          {/* Status overlay */}
          {showStatus && document.status !== 'completed' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <StatusIcon 
                className={cn(
                  'w-8 h-8', 
                  statusColor,
                  document.status === 'processing' && 'animate-spin'
                )} 
              />
            </div>
          )}
          
          {/* Progress bar for processing */}
          {document.status === 'processing' && document.progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
              <div className="w-full bg-black/30 rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${document.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Quick actions overlay */}
          {showQuickActions && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex space-x-2">
                <Tooltip content="Preview">
                  <button
                    onClick={handlePreview}
                    className={cn(
                      'p-2 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30',
                      focusRing('focus-visible:ring-white'),
                      'text-white hover:text-white'
                    )}
                    aria-label={`Preview ${document.filename}`}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </Tooltip>
                
                <Tooltip content="Download">
                  <button
                    onClick={handleDownload}
                    className={cn(
                      'p-2 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30',
                      focusRing('focus-visible:ring-white'),
                      'text-white hover:text-white'
                    )}
                    aria-label={`Download ${document.filename}`}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        {/* File info */}
        {showInfo && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground truncate" title={document.name}>
              {document.name}
            </h3>
            
            <p className="text-xs text-muted-foreground truncate" title={document.filename}>
              {document.filename}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatFileSize(document.size)}
              </span>
              
              {showStatus && (
                <Badge 
                  variant={
                    document.status === 'completed' ? 'default' :
                    document.status === 'failed' ? 'destructive' :
                    'secondary'
                  }
                  className="text-xs"
                >
                  {document.status}
                </Badge>
              )}
            </div>
            
            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {document.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{document.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </GridCardComponent>
  );
});

DocumentThumbnail.displayName = 'DocumentThumbnail';

export default DocumentThumbnail;