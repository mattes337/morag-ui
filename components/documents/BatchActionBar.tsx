'use client';

import React, { useState } from 'react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  Tooltip,
  Separator,
  Progress
} from '@/components/ui';
import {
  Download,
  Trash2,
  Tag,
  FolderOpen,
  CheckSquare,
  Square,
  X,
  MoreHorizontal,
  Archive,
  Share2,
  Copy,
  Eye
} from 'lucide-react';
// Using CSS transitions instead of framer-motion for animations
import type { DocumentMetadata } from '@/lib/mockData/documentMockData';

export interface BatchActionBarProps {
  /** Number of selected documents */
  selectedCount: number;
  /** Total number of documents available for selection */
  totalCount: number;
  /** Whether all documents are selected */
  allSelected: boolean;
  /** Whether selection is partially complete */
  isPartialSelection: boolean;
  /** Array of selected document objects for context */
  selectedDocuments?: DocumentMetadata[];
  /** Callback to select all documents */
  onSelectAll: () => void;
  /** Callback to clear all selections */
  onClearSelection: () => void;
  /** Callback for download action */
  onDownload: (documentIds: string[]) => void;
  /** Callback for delete action */
  onDelete: (documentIds: string[]) => void;
  /** Callback for add tags action */
  onAddTags: (documentIds: string[]) => void;
  /** Callback for move to realm action */
  onMoveToRealm: (documentIds: string[], realmId: string) => void;
  /** Callback for archive action */
  onArchive?: (documentIds: string[]) => void;
  /** Callback for share action */
  onShare?: (documentIds: string[]) => void;
  /** Whether actions are currently processing */
  isProcessing?: boolean;
  /** Progress of current batch operation (0-100) */
  operationProgress?: number;
  /** Current operation being performed */
  currentOperation?: string;
  /** Custom CSS classes */
  className?: string;
  /** Whether to show the action bar even with no selection */
  alwaysVisible?: boolean;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  totalCount,
  allSelected,
  isPartialSelection,
  selectedDocuments = [],
  onSelectAll,
  onClearSelection,
  onDownload,
  onDelete,
  onAddTags,
  onMoveToRealm,
  onArchive,
  onShare,
  isProcessing = false,
  operationProgress,
  currentOperation,
  className = '',
  alwaysVisible = false
}) => {
  const [showMore, setShowMore] = useState(false);

  const hasSelection = selectedCount > 0;
  const shouldShow = alwaysVisible || hasSelection;

  const handleSelectToggle = () => {
    if (allSelected || isPartialSelection) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  const getSelectedDocumentIds = (): string[] => {
    return selectedDocuments.map(doc => doc.id);
  };

  const canDownload = selectedDocuments.every(doc => 
    doc.status === 'completed' || doc.status === 'failed'
  );
  
  const canDelete = selectedDocuments.length > 0;
  const canArchive = selectedDocuments.every(doc => doc.status === 'completed');

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-200 animate-in slide-in-from-bottom-4 ${className}`}>
        <Card className="shadow-lg border-2 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Progress indicator for operations */}
            {isProcessing && operationProgress !== undefined && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {currentOperation || 'Processing...'}
                  </span>
                  <span className="font-medium">{operationProgress}%</span>
                </div>
                <Progress value={operationProgress} className="h-2" />
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Selection controls */}
              <div className="flex items-center gap-2">
                <Tooltip content={allSelected ? 'Deselect all' : 'Select all'}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectToggle}
                    disabled={isProcessing}
                    className="h-8 w-8 p-0"
                  >
                    {allSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : isPartialSelection ? (
                      <div className="h-4 w-4 border border-current bg-current/20 rounded-sm flex items-center justify-center">
                        <div className="h-2 w-2 bg-current rounded-sm" />
                      </div>
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                </Tooltip>

                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-sm font-medium">
                    {selectedCount}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    of {totalCount} selected
                  </span>
                </div>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Primary actions */}
              <div className="flex items-center gap-1">
                <Tooltip content="Download selected documents">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(getSelectedDocumentIds())}
                    disabled={!canDownload || isProcessing}
                    className="h-8"
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Download</span>
                  </Button>
                </Tooltip>

                <Tooltip content="Add tags to selected documents">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddTags(getSelectedDocumentIds())}
                    disabled={!hasSelection || isProcessing}
                    className="h-8"
                  >
                    <Tag className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Tag</span>
                  </Button>
                </Tooltip>

                <Tooltip content="Move to realm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // This would open a realm selection dialog
                      // For now, we'll just call with a placeholder
                      onMoveToRealm(getSelectedDocumentIds(), 'current-realm');
                    }}
                    disabled={!hasSelection || isProcessing}
                    className="h-8"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Move</span>
                  </Button>
                </Tooltip>

                {/* More actions dropdown */}
                <div className="relative">
                  <Tooltip content="More actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMore(!showMore)}
                      disabled={!hasSelection || isProcessing}
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </Tooltip>

                  {showMore && (
                    <div className="absolute bottom-full mb-2 right-0 bg-background border rounded-lg shadow-lg p-1 min-w-[150px] z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150">
                      {onArchive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onArchive(getSelectedDocumentIds());
                            setShowMore(false);
                          }}
                          disabled={!canArchive || isProcessing}
                          className="w-full justify-start h-8"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </Button>
                      )}

                      {onShare && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onShare(getSelectedDocumentIds());
                            setShowMore(false);
                          }}
                          disabled={!hasSelection || isProcessing}
                          className="w-full justify-start h-8"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(getSelectedDocumentIds().join(', '));
                          setShowMore(false);
                        }}
                        disabled={!hasSelection || isProcessing}
                        className="w-full justify-start h-8"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy IDs
                      </Button>

                      <Separator className="my-1" />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onDelete(getSelectedDocumentIds());
                          setShowMore(false);
                        }}
                        disabled={!canDelete || isProcessing}
                        className="w-full justify-start h-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Close button */}
              <Tooltip content="Clear selection">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  disabled={isProcessing}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Selection summary */}
            {hasSelection && (
              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>
                    Selected: {selectedDocuments.filter(d => d.status === 'completed').length} completed,{' '}
                    {selectedDocuments.filter(d => d.status === 'processing').length} processing,{' '}
                    {selectedDocuments.filter(d => d.status === 'failed').length} failed
                  </span>
                  <span>
                    Total size: {formatFileSize(
                      selectedDocuments.reduce((sum, doc) => sum + doc.size, 0)
                    )}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default BatchActionBar;