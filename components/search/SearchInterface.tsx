'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

/**
 * Props for the SearchInterface component
 * 
 * A comprehensive search interface with advanced filtering, keyboard shortcuts, and accessibility features.
 * Includes debounced search, quick filters, search suggestions, and a collapsible advanced options panel.
 * 
 * @example
 * ```tsx
 * // Basic usage with search handling
 * <SearchInterface
 *   onSearch={(query) => {
 *     console.log('Searching for:', query);
 *     performDocumentSearch(query);
 *   }}
 *   onFilter={(filters) => {
 *     console.log('Applying filters:', filters);
 *     updateSearchFilters(filters);
 *   }}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Advanced usage with state management
 * const [searchState, setSearchState] = useState({
 *   query: '',
 *   results: [],
 *   isLoading: false
 * });
 * 
 * const handleSearch = useCallback(async (query: string) => {
 *   if (query.trim().length < 3) return;
 *   
 *   setSearchState(prev => ({ ...prev, isLoading: true }));
 *   try {
 *     const results = await searchApi.searchDocuments({
 *       query,
 *       filters: currentFilters,
 *       page: 1,
 *       limit: 20
 *     });
 *     setSearchState({ query, results: results.results, isLoading: false });
 *   } catch (error) {
 *     console.error('Search failed:', error);
 *     setSearchState(prev => ({ ...prev, isLoading: false }));
 *   }
 * }, [currentFilters]);
 * 
 * <SearchInterface
 *   onSearch={handleSearch}
 *   onFilter={updateFilters}
 *   placeholder="Search documents, knowledge base, and more..."
 *   autoFocus={true}
 *   className="mb-6"
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Integrated with search results display
 * const SearchPage = () => {
 *   const [query, setQuery] = useState('');
 *   const [filters, setFilters] = useState(defaultFilters);
 *   const [results, setResults] = useState([]);
 * 
 *   return (
 *     <div className="space-y-6">
 *       <SearchInterface
 *         onSearch={(newQuery) => {
 *           setQuery(newQuery);
 *           // Trigger search with current filters
 *           if (newQuery.trim()) {
 *             performSearch(newQuery, filters);
 *           } else {
 *             setResults([]);
 *           }
 *         }}
 *         onFilter={(newFilters) => {
 *           setFilters(newFilters);
 *           // Re-search with new filters if there's a query
 *           if (query.trim()) {
 *             performSearch(query, newFilters);
 *           }
 *         }}
 *         placeholder="What are you looking for?"
 *       />
 *       <SearchResults results={results} query={query} />
 *     </div>
 *   );
 * };
 * ```
 * 
 * @example
 * ```tsx
 * // With error handling and loading states
 * <SearchInterface
 *   onSearch={async (query) => {
 *     try {
 *       setIsSearching(true);
 *       const response = await searchDocuments(query, filters);
 *       setSearchResults(response.results);
 *       // Show success toast
 *       toast.success(`Found ${response.totalResults} documents`);
 *     } catch (error) {
 *       // Handle search errors gracefully
 *       toast.error('Search failed. Please try again.');
 *       console.error('Search error:', error);
 *     } finally {
 *       setIsSearching(false);
 *     }
 *   }}
 *   onFilter={(newFilters) => {
 *     // Validate filters before applying
 *     if (validateSearchFilters(newFilters)) {
 *       applyFilters(newFilters);
 *     } else {
 *       toast.error('Invalid filter configuration');
 *     }
 *   }}
 * />
 * ```
 */
export interface SearchInterfaceProps {
  /** 
   * Callback fired when search query changes or search is executed
   * Receives the current search query string. Called on form submission,
   * debounced input changes (3+ characters), and when query is cleared.
   * 
   * @param query - The search query string (trimmed)
   * 
   * @example
   * ```tsx
   * onSearch={(query) => {
   *   if (query) {
   *     // Perform search
   *     searchDocuments(query);
   *     // Track analytics
   *     analytics.track('search_performed', { query });
   *   } else {
   *     // Clear results when query is empty
   *     clearSearchResults();
   *   }
   * }}
   * ```
   */
  onSearch: (query: string) => void;
  
  /** 
   * Callback fired when filter options are changed
   * Receives the complete filter object with all current filter values.
   * Called when any filter changes through the UI or quick filter buttons.
   * 
   * @param filters - Complete filter object with current values
   * 
   * @example
   * ```tsx
   * onFilter={(filters) => {
   *   // Update URL params to maintain filter state
   *   const params = new URLSearchParams();
   *   Object.entries(filters).forEach(([key, value]) => {
   *     if (value !== 'all') params.set(key, value);
   *   });
   *   router.push(`/search?${params.toString()}`);
   *   
   *   // Update local state
   *   setCurrentFilters(filters);
   * }}
   * ```
   */
  onFilter: (filters: any) => void;
  
  /** 
   * Additional CSS classes to apply to the root element
   * Useful for spacing and layout adjustments in different contexts
   * 
   * @example
   * ```tsx
   * // Add margin and max width
   * <SearchInterface className="mx-auto max-w-4xl my-8" ... />
   * 
   * // Custom background in a modal
   * <SearchInterface className="bg-gray-50 p-4 rounded-lg" ... />
   * ```
   */
  className?: string;
  
  /** 
   * Placeholder text for the search input
   * Should be descriptive of what can be searched to guide users
   * 
   * @default "Search documents, knowledge base, and more..."
   * 
   * @example
   * ```tsx
   * // Context-specific placeholders
   * <SearchInterface placeholder="Search customer support articles..." />
   * <SearchInterface placeholder="Find research papers and publications..." />
   * <SearchInterface placeholder="Search meeting notes and documents..." />
   * ```
   */
  placeholder?: string;
  
  /** 
   * Whether to automatically focus the search input when component mounts
   * Useful for search-focused pages or modal dialogs
   * 
   * @default false
   * 
   * @example
   * ```tsx
   * // Auto-focus on search page
   * <SearchInterface autoFocus={true} ... />
   * 
   * // Don't auto-focus when search is secondary
   * <SearchInterface autoFocus={false} ... />
   * 
   * // Conditional auto-focus based on user preference
   * <SearchInterface autoFocus={!isMobile && userPreferences.autoFocusSearch} ... />
   * ```
   */
  autoFocus?: boolean;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = React.memo(({
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
    isPending,
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

  // Memoized search input change handler to prevent re-renders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Trigger debounced search and callback
    if (newQuery.trim().length >= 3) {
      searchDebounced();
      onSearch(newQuery);
    } else if (newQuery.trim().length === 0) {
      onSearch('');
    }
  }, [setQuery, searchDebounced, onSearch]);

  // Memoized filter change handler to prevent re-renders
  const handleFiltersChange = useCallback((newFilters: any) => {
    updateFilters(newFilters);
    onFilter(newFilters);
  }, [updateFilters, onFilter]);

  // Stable filter handlers that don't recreate on filters change to prevent cascade re-renders
  const handlePdfFilter = useCallback(() => {
    const newFilters = { documentType: 'pdf' as const };
    updateFilters(newFilters);
    onFilter(newFilters);
  }, [updateFilters, onFilter]);
  
  const handleLastWeekFilter = useCallback(() => {
    const newFilters = { dateRange: 'last-week' as const };
    updateFilters(newFilters);
    onFilter(newFilters);
  }, [updateFilters, onFilter]);
  
  const handleNewestFirstFilter = useCallback(() => {
    const newFilters = { sortBy: 'date-desc' as const };
    updateFilters(newFilters);
    onFilter(newFilters);
  }, [updateFilters, onFilter]);
  
  const handleClearAllFilters = useCallback(() => {
    const defaultFilters = { 
      documentType: 'all' as const,
      dateRange: 'all' as const,
      sortBy: 'relevance' as const
    };
    updateFilters(defaultFilters);
    onFilter(defaultFilters);
  }, [updateFilters, onFilter]);
  
  // Memoized active filters check to prevent recalculation on every render
  const hasActiveFilters = useMemo(() => {
    const defaults = ['all', 'all', 'relevance'];
    return Object.values(filters).some((filter, index) => filter !== defaults[index]);
  }, [filters]);

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
                className={`px-6 h-12 ${isPending ? 'opacity-75' : ''}`}
                aria-label="Search"
              >
                {isLoading ? (
                  <div data-testid="search-loading">
                    <Spinner className="h-4 w-4 mr-2" />
                    Searching...
                  </div>
                ) : isPending ? (
                  <div data-testid="search-pending">
                    <Spinner className="h-4 w-4 mr-2" />
                    Processing...
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
              {hasActiveFilters && (
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
                      <div>• Use quotes for exact phrases: &quot;machine learning&quot;</div>
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
          onClick={handlePdfFilter}
          className={`h-7 text-xs ${filters.documentType === 'pdf' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          PDF Documents
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLastWeekFilter}
          className={`h-7 text-xs ${filters.dateRange === 'last-week' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          Last Week
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewestFirstFilter}
          className={`h-7 text-xs ${filters.sortBy === 'date-desc' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          Newest First
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAllFilters}
          className="h-7 text-xs border-dashed border"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
});

SearchInterface.displayName = 'SearchInterface';

export default SearchInterface;