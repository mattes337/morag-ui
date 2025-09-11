'use client';

import React, { useMemo, useCallback, forwardRef } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { SearchResult } from '@/lib/mockData/searchMockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  FileAudio, 
  FileVideo, 
  FileImage, 
  File, 
  ExternalLink,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResultsVirtualizedProps {
  results: SearchResult[];
  query: string;
  onResultClick?: (result: SearchResult) => void;
  onViewDetails?: (result: SearchResult) => void;
  className?: string;
  height?: number;
  itemHeight?: number;
  overscanCount?: number;
  isLoading?: boolean;
  emptyMessage?: string;
}

interface VirtualizedResultItemProps extends ListChildComponentProps {
  data: {
    results: SearchResult[];
    query: string;
    onResultClick?: (result: SearchResult) => void;
    onViewDetails?: (result: SearchResult) => void;
  };
}

// Get appropriate icon for file type
const getFileTypeIcon = (documentType: string) => {
  switch (documentType.toLowerCase()) {
    case 'pdf':
    case 'document':
      return FileText;
    case 'audio':
      return FileAudio;
    case 'video':
      return FileVideo;
    case 'image':
      return FileImage;
    default:
      return File;
  }
};

// Get file type color
const getFileTypeColor = (documentType: string): string => {
  switch (documentType.toLowerCase()) {
    case 'pdf':
    case 'document':
      return 'text-blue-600 bg-blue-100';
    case 'audio':
      return 'text-green-600 bg-green-100';
    case 'video':
      return 'text-purple-600 bg-purple-100';
    case 'image':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Highlight search query in text
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
        {part}
      </mark>
    ) : part
  );
};

// Format date for display
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

// Individual result item component
const VirtualizedResultItem: React.FC<VirtualizedResultItemProps> = ({
  index,
  style,
  data: { results, query, onResultClick, onViewDetails }
}) => {
  const result = results[index];
  
  // Guard against undefined result
  if (!result) {
    return <div style={style} />;
  }
  
  const FileIcon = getFileTypeIcon(result.documentType);
  const fileTypeColor = getFileTypeColor(result.documentType);

  const handleClick = useCallback(() => {
    onResultClick?.(result);
  }, [result, onResultClick]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(result);
  }, [result, onViewDetails]);

  return (
    <div style={style} className="px-4 py-2">
      <Card 
        className={cn(
          "h-full cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800",
          "border-l-4 border-l-transparent hover:border-l-blue-500"
        )}
        onClick={handleClick}
      >
        <CardContent className="p-4 h-full flex flex-col">
          {/* Header with file type and relevance */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded", fileTypeColor)}>
                <FileIcon className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-xs">
                {result.documentType.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="text-xs"
              >
                {Math.round(result.relevanceScore * 100)}% match
              </Badge>
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleViewDetails}
                  title="View details"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
            {highlightText(result.title, query)}
          </h3>

          {/* Excerpt */}
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 flex-1">
            {highlightText(result.excerpt, query)}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              {result.author && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{result.author}</span>
                </div>
              )}
              {result.dateCreated && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(result.dateCreated)}</span>
                </div>
              )}
            </div>
            
            {result.realm && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-20">{result.realm}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton: React.FC<{ height: number; itemHeight: number }> = ({ 
  height, 
  itemHeight 
}) => {
  const skeletonCount = Math.ceil(height / itemHeight);
  
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: skeletonCount }, (_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="space-y-1 mb-3">
              <div className="w-full h-3 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
                <div className="w-20 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-3 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Empty state component
const EmptyState: React.FC<{ message: string; query: string }> = ({ 
  message, 
  query 
}) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <FileText className="h-16 w-16 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {query ? `No results found for "${query}"` : 'No search results'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md">
      {message || (query 
        ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
        : 'Enter a search query to find documents and content.'
      )}
    </p>
  </div>
);

/**
 * Virtualized search results component for efficient rendering of large result sets
 * 
 * Uses react-window for performant scrolling through thousands of search results.
 * Includes features like result highlighting, metadata display, and responsive design.
 * 
 * @example
 * ```tsx
 * <SearchResultsVirtualized
 *   results={searchResults}
 *   query={searchQuery}
 *   height={600}
 *   itemHeight={140}
 *   onResultClick={(result) => handleResultClick(result)}
 *   onViewDetails={(result) => openResultModal(result)}
 * />
 * ```
 */
export const SearchResultsVirtualized = forwardRef<
  List,
  SearchResultsVirtualizedProps
>(({
  results,
  query,
  onResultClick,
  onViewDetails,
  className,
  height = 600,
  itemHeight = 140,
  overscanCount = 5,
  isLoading = false,
  emptyMessage = ''
}, ref) => {
  // Memoize the data object to prevent unnecessary re-renders
  const listData = useMemo(() => ({
    results,
    query,
    onResultClick,
    onViewDetails
  }), [results, query, onResultClick, onViewDetails]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("border rounded-lg bg-white dark:bg-gray-900", className)}>
        <LoadingSkeleton height={height} itemHeight={itemHeight} />
      </div>
    );
  }

  // Show empty state
  if (!results || results.length === 0) {
    return (
      <div 
        className={cn("border rounded-lg bg-white dark:bg-gray-900", className)}
        style={{ height }}
      >
        <EmptyState message={emptyMessage} query={query} />
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg bg-white dark:bg-gray-900", className)}>
      {/* Results count header */}
      <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-semibold">{results.length}</span> results
            {query && (
              <>
                {' '}for "<span className="font-semibold">{query}</span>"
              </>
            )}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Virtualized for performance
          </div>
        </div>
      </div>

      {/* Virtualized list */}
      <List
        ref={ref}
        height={height - 60} // Account for header
        itemCount={results.length}
        itemSize={itemHeight}
        itemData={listData}
        overscanCount={overscanCount}
        className="custom-scrollbar"
      >
        {VirtualizedResultItem}
      </List>

      {/* Performance info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>
              Virtualized: {results.length} items × {itemHeight}px = {(results.length * itemHeight).toLocaleString()}px total
            </span>
            <span>
              Rendered: ~{Math.ceil(height / itemHeight) + (overscanCount * 2)} items
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

SearchResultsVirtualized.displayName = 'SearchResultsVirtualized';

export default SearchResultsVirtualized;