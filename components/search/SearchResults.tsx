'use client';

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Skeleton,
  Checkbox
} from '@/components/ui';
import { 
  FileText,
  File,
  Presentation,
  Sheet,
  Image,
  Video,
  AudioLines,
  Globe,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  User,
  Eye,
  Download,
  Check
} from 'lucide-react';
import { SearchResult } from '@/lib/mockData/searchMockData';
import { formatDistanceToNow } from 'date-fns';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { BatchActionBar } from '@/components/documents/BatchActionBar';
import { useBatchSelection } from '@/lib/hooks/useBatchSelection';

export interface SearchResultsProps {
  results: SearchResult[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onResultClick: (result: SearchResult) => void;
  query?: string;
  className?: string;
  // New props for enhanced functionality
  enableBatchActions?: boolean;
  enableDocumentPreview?: boolean;
  onBatchDownload?: (resultIds: string[]) => void;
  onBatchDelete?: (resultIds: string[]) => void;
  onBatchTag?: (resultIds: string[]) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = React.memo(({
  results,
  totalResults,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  onResultClick,
  query,
  className = '',
  enableBatchActions = true,
  enableDocumentPreview = true,
  onBatchDownload,
  onBatchDelete,
  onBatchTag
}) => {
  // State for document preview
  const [previewDocument, setPreviewDocument] = useState<SearchResult | null>(null);
  
  // Batch selection state
  const batchSelection = useBatchSelection({
    onSelectionChange: (selectedIds) => {
      console.log('Selection changed:', selectedIds.size, 'items selected');
    }
  });

  // Convert SearchResult to DocumentViewer format
  const convertToDocumentFormat = (result: SearchResult) => ({
    id: result.id,
    name: result.title,
    filename: result.title,
    type: result.documentType,
    size: result.metadata.size || 0,
    status: 'completed' as const,
    url: result.metadata.url,
    description: result.excerpt,
    uploadedAt: new Date(result.createdAt),
    uploadedBy: result.metadata.author || 'Unknown',
    tags: result.metadata.tags,
  });

  // Handle batch actions
  const handleBatchDownload = () => {
    if (onBatchDownload) {
      onBatchDownload(batchSelection.getSelectedArray());
    }
  };

  const handleBatchDelete = () => {
    if (onBatchDelete) {
      onBatchDelete(batchSelection.getSelectedArray());
      batchSelection.clearSelection();
    }
  };

  const handleBatchTag = () => {
    if (onBatchTag) {
      onBatchTag(batchSelection.getSelectedArray());
    }
  };

  // Handle individual result selection
  const handleResultSelection = (resultId: string, selected: boolean) => {
    if (selected) {
      batchSelection.selectItem(resultId);
    } else {
      batchSelection.deselectItem(resultId);
    }
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (batchSelection.allSelected) {
      batchSelection.clearSelection();
    } else {
      batchSelection.selectAll(results.map(r => r.id));
    }
  };

  // Handle document preview
  const handlePreviewClick = (result: SearchResult, event: React.MouseEvent) => {
    event.stopPropagation();
    if (enableDocumentPreview) {
      setPreviewDocument(result);
    }
  };
  // Document type icons mapping
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" data-testid="pdf-icon" />;
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" data-testid="docx-icon" />;
      case 'pptx':
        return <Presentation className="h-5 w-5 text-orange-500" data-testid="pptx-icon" />;
      case 'xlsx':
        return <Sheet className="h-5 w-5 text-green-500" data-testid="xlsx-icon" />;
      case 'image':
        return <Image className="h-5 w-5 text-purple-500" data-testid="image-icon" />;
      case 'video':
        return <Video className="h-5 w-5 text-pink-500" data-testid="video-icon" />;
      case 'audio':
        return <AudioLines className="h-5 w-5 text-indigo-500" data-testid="audio-icon" />;
      case 'webpage':
        return <Globe className="h-5 w-5 text-cyan-500" data-testid="webpage-icon" />;
      default:
        return <File className="h-5 w-5 text-gray-500" data-testid="other-icon" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  // Memoized regex cache with proper memory management
  const regexCache = useMemo(() => {
    const cache = new Map<string, RegExp>();
    const MAX_CACHE_SIZE = 50; // Reduced from 100 to prevent memory issues
    
    return {
      get: (term: string) => {
        if (!cache.has(term)) {
          // Enforce cache size limit with LRU eviction
          if (cache.size >= MAX_CACHE_SIZE) {
            const firstKey = cache.keys().next().value;
            if (firstKey) cache.delete(firstKey);
          }
          
          // Escape special regex characters to prevent ReDoS attacks
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Limit term length to prevent catastrophic backtracking
          const safeTerm = escapedTerm.slice(0, 50);
          cache.set(term, new RegExp(`(${safeTerm})`, 'gi'));
        }
        return cache.get(term)!;
      },
      clear: () => cache.clear(),
      size: () => cache.size
    };
  }, []);

  // Optimized highlight function with better performance and memory management
  const highlightText = useMemo(() => {
    return (text: string, terms: string[]) => {
      if (!terms.length || !query || !text) return text;
      
      // Limit text length for highlighting to prevent performance issues
      const maxTextLength = 500;
      const textToHighlight = text.length > maxTextLength 
        ? text.slice(0, maxTextLength) + '...' 
        : text;
      
      let highlightedText = textToHighlight;
      
      // Process only first 5 terms to prevent performance degradation
      const limitedTerms = terms.slice(0, 5)
        .filter(term => term && term.trim() && term.length >= 2)
        .sort((a, b) => b.length - a.length);
      
      for (const term of limitedTerms) {
        try {
          const regex = regexCache.get(term.trim());
          highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        } catch (error) {
          // Skip problematic terms to prevent crashes
          console.warn('Regex error for term:', term, error);
          continue;
        }
      }
      
      return <span dangerouslySetInnerHTML={{ __html: highlightedText }} data-testid="highlight-content" />;
    };
  }, [query, regexCache]);

  // Loading skeleton
  const LoadingSkeleton = React.memo(function LoadingSkeleton() {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} data-testid="result-skeleton">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center gap-4 pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  });

  // Empty state
  const EmptyResults = React.memo(function EmptyResults() {
    return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium">No results found</h3>
        <p className="text-sm text-muted-foreground">
          {query 
            ? `No documents match your search for "${query}"`
            : "Try adjusting your search terms or filters"
          }
        </p>
        {query && (
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium mb-2">Suggestions:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Try different keywords</li>
              <li>• Check spelling</li>
              <li>• Use fewer filters</li>
              <li>• Search for broader terms</li>
            </ul>
          </div>
        )}
      </div>
    </div>
    );
  });

  // Pagination component
  const Pagination = React.memo(function Pagination() {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <nav role="navigation" aria-label="Pagination" className="flex items-center justify-center gap-2 pt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) =>
            page === '...' ? (
              <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    );
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Batch Action Bar */}
      {enableBatchActions && batchSelection.selectCount > 0 && (
        <BatchActionBar
          selectedCount={batchSelection.selectCount}
          totalCount={results.length}
          allSelected={batchSelection.allSelected}
          isPartialSelection={batchSelection.isPartialSelection}
          onSelectAll={handleSelectAll}
          onClearSelection={batchSelection.clearSelection}
          onDownload={handleBatchDownload}
          onDelete={handleBatchDelete}
          onAddTags={handleBatchTag}
        />
      )}

      {/* Results header */}
      {!isLoading && totalResults > 0 && (
        <div className="flex items-center justify-between">
          <div aria-label={`${totalResults} search results`}>
            <p className="text-sm text-muted-foreground">
              {totalResults.toLocaleString()} results
              {query && <span> for &quot;{query}&quot;</span>}
              {totalPages > 1 && (
                <span> • Page {currentPage} of {totalPages}</span>
              )}
              {batchSelection.selectCount > 0 && (
                <span> • {batchSelection.selectCount} selected</span>
              )}
            </p>
          </div>
          {enableBatchActions && results.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="ml-4"
            >
              {batchSelection.allSelected ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <Checkbox className="h-4 w-4 mr-2" />
                  Select All
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && <LoadingSkeleton />}

      {/* Empty state */}
      {!isLoading && results.length === 0 && <EmptyResults />}

      {/* Results list */}
      {!isLoading && results.length > 0 && (
        <ul className="space-y-4 list-none">
          {results.map((result) => (
            <li key={result.id} className="list-none">
              <Card
                className={`transition-all hover:shadow-md ${
                  batchSelection.isSelected(result.id) ? 'ring-2 ring-primary' : ''
                }`}
              >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Selection checkbox */}
                  {enableBatchActions && (
                    <div className="flex-shrink-0 mt-1">
                      <Checkbox
                        checked={batchSelection.isSelected(result.id)}
                        onCheckedChange={(checked) => 
                          handleResultSelection(result.id, checked as boolean)
                        }
                        aria-label={`Select ${result.title}`}
                      />
                    </div>
                  )}

                  {/* Document icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getDocumentIcon(result.documentType)}
                  </div>

                  <button
                    onClick={() => onResultClick(result)}
                    className="flex-1 min-w-0 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    aria-label={`Open ${result.title}`}
                  >
                      {/* Title and relevance score */}
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-lg leading-tight">
                          {result.highlights.length > 0 && query
                            ? highlightText(result.title, result.highlights)
                            : result.title
                          }
                        </h3>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {Math.round(result.relevanceScore * 100)}%
                        </Badge>
                      </div>

                      {/* Content excerpt */}
                      <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {result.highlights.length > 0 && query
                          ? highlightText(result.excerpt || result.content, result.highlights)
                          : (result.excerpt || result.content)
                        }
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {result.metadata.author && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {result.metadata.author}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                        </div>

                        {result.metadata.size && (
                          <span>{formatFileSize(result.metadata.size)}</span>
                        )}

                        {result.metadata.realm && (
                          <Badge variant="outline" className="text-xs">
                            {result.metadata.realm}
                          </Badge>
                        )}
                      </div>

                      {/* Tags */}
                      {result.metadata.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {result.metadata.tags.slice(0, 5).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {result.metadata.tags.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.metadata.tags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>

                  {/* Action buttons */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {enableDocumentPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handlePreviewClick(result, e)}
                        className="p-2"
                        aria-label={`Preview ${result.title}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResultClick(result);
                      }}
                      className="p-2"
                      aria-label={`Open ${result.title}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {!isLoading && <Pagination />}

      {/* Document Preview Modal */}
      {previewDocument && enableDocumentPreview && (
        <DocumentViewer
          document={convertToDocumentFormat(previewDocument)}
          documents={results.map(convertToDocumentFormat)}
          mode="modal"
          enableNavigation={true}
          showMetadata={true}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
});

SearchResults.displayName = 'SearchResults';

export default SearchResults;