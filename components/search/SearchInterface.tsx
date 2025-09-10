'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Input,
  Button,
  Card,
  CardContent,
  Badge,
  Spinner,
  Collapsible,
  CollapsibleContent
} from '@/components/ui';
import { Search, Settings, Keyboard, ChevronDown } from 'lucide-react';
import { SearchFilters } from './SearchFilters';
import { useSearch } from './hooks/useSearch';

export interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  onFilter,
  className = '',
  placeholder = 'Search documents, knowledge base, and more...',
  autoFocus = false
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    query,
    setQuery,
    filters,
    updateFilters,
    isLoading,
    searchNow,
    searchDebounced
  } = useSearch();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K to focus search
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto focus on mount if requested
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchNow(query);
      onSearch(query);
    }
  };

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Trigger debounced search and callback
    if (newQuery.trim().length >= 3) {
      searchDebounced();
      onSearch(newQuery);
    } else if (newQuery.trim().length === 0) {
      onSearch('');
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: any) => {
    updateFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Search Interface */}
      <Card>
        <CardContent className="p-6">
          {/* Search Form */}
          <form onSubmit={handleSubmit} role="search">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="search"
                    role="searchbox"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    className="pl-10 pr-20 h-12 text-base"
                    aria-label="Search documents and content"
                    autoComplete="off"
                  />
                  
                  {/* Keyboard shortcut hint */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                      Ctrl+K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="px-6 h-12"
                aria-label="Search"
              >
                {isLoading ? (
                  <div data-testid="search-loading">
                    <Spinner className="h-4 w-4 mr-2" />
                    Searching...
                  </div>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>

              {/* Advanced Search Toggle */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="h-12 px-4"
                aria-expanded={isAdvancedOpen}
                aria-controls="advanced-search"
              >
                <Settings className="h-4 w-4 mr-2" />
                Advanced Search
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Search Hints */}
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <Keyboard className="h-3 w-3" />
                  <span>Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to search</span>
                </div>
                <span>Type at least 3 characters for suggestions</span>
              </div>
              
              {/* Active filters indicator */}
              {Object.values(filters).some((filter, index) => {
                const defaults = ['all', 'all', 'relevance'];
                return filter !== defaults[index];
              }) && (
                <Badge variant="secondary" className="text-xs">
                  Filters active
                </Badge>
              )}
            </div>
          </form>

          {/* Advanced Search Options */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleContent id="advanced-search" className="pt-6">
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Advanced Options
                  </h3>
                  
                  {/* Search Filters */}
                  <SearchFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                  />

                  {/* Advanced Search Tips */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium">Search Tips:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>• Use quotes for exact phrases: "machine learning"</div>
                      <div>• Exclude terms with minus: -draft</div>
                      <div>• Wildcard matching: develop*</div>
                      <div>• Filter by author: author:john</div>
                    </div>
                  </div>

                  {/* Relevance Score Info */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Relevance Score</h4>
                    <p className="text-xs text-muted-foreground">
                      Results are scored based on keyword matches, document importance, and semantic similarity. 
                      Scores range from 0% to 100%, with higher scores indicating better matches.
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Quick filters:</span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFiltersChange({ ...filters, documentType: 'pdf' })}
          className={`h-7 text-xs ${filters.documentType === 'pdf' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          PDF Documents
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFiltersChange({ ...filters, dateRange: 'last-week' })}
          className={`h-7 text-xs ${filters.dateRange === 'last-week' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          Last Week
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFiltersChange({ ...filters, sortBy: 'date-desc' })}
          className={`h-7 text-xs ${filters.sortBy === 'date-desc' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          Newest First
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFiltersChange({ 
            documentType: 'all',
            dateRange: 'all',
            sortBy: 'relevance'
          })}
          className="h-7 text-xs border-dashed border"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default SearchInterface;