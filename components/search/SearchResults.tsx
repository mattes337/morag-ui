'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Skeleton
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
  User
} from 'lucide-react';
import { SearchResult } from '@/lib/mockData/searchMockData';
import { formatDistanceToNow } from 'date-fns';

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
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  totalResults,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  onResultClick,
  query,
  className = ''
}) => {
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

  // Highlight search terms in text
  const highlightText = (text: string, terms: string[]) => {
    if (!terms.length || !query) return text;
    
    let highlightedText = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} data-testid="highlight-content" />;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
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

  // Empty state
  const EmptyResults = () => (
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

  // Pagination component
  const Pagination = () => {
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
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Results header */}
      {!isLoading && totalResults > 0 && (
        <div className="flex items-center justify-between">
          <div aria-label={`${totalResults} search results`}>
            <p className="text-sm text-muted-foreground">
              {totalResults.toLocaleString()} results
              {query && <span> for "{query}"</span>}
              {totalPages > 1 && (
                <span> • Page {currentPage} of {totalPages}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && <LoadingSkeleton />}

      {/* Empty state */}
      {!isLoading && results.length === 0 && <EmptyResults />}

      {/* Results list */}
      {!isLoading && results.length > 0 && (
        <div role="list" className="space-y-4">
          {results.map((result) => (
            <Card
              key={result.id}
              className="transition-all hover:shadow-md cursor-pointer"
              role="listitem"
            >
              <CardContent className="p-6">
                <button
                  onClick={() => onResultClick(result)}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  aria-label={`Open ${result.title}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Document icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getDocumentIcon(result.documentType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title and relevance score */}
                      <div className="flex items-start justify-between gap-4">
                        <h3 role="heading" className="font-semibold text-lg leading-tight">
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
                    </div>

                    {/* External link indicator */}
                    <div className="flex-shrink-0">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && <Pagination />}
    </div>
  );
};

export default SearchResults;