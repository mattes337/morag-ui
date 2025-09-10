'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchInterface } from '@/components/search/SearchInterface';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/components/search/hooks/useSearch';
import { SearchResult } from '@/lib/mockData/searchMockData';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get('q') || '';
  
  const {
    query,
    isLoading,
    results,
    totalResults,
    currentPage,
    totalPages,
    goToPage,
    error
  } = useSearch({
    initialQuery: urlQuery
  });

  const [hasSearched, setHasSearched] = useState(!!urlQuery);

  // Set up initial search from URL params
  useEffect(() => {
    if (urlQuery && !hasSearched) {
      setHasSearched(true);
    }
  }, [urlQuery, hasSearched]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
  };

  const handleFilter = (newFilters: any) => {
    // Filters are handled by the useSearch hook
    console.log('Filters updated:', newFilters);
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Result clicked:', result);
    // In a real app, this would navigate to the document or open it
    // For now, we'll just log it
  };

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Search
          </h1>
          <p className="text-muted-foreground">
            Search across your documents and knowledge base with AI-powered semantic search
          </p>
        </div>

        {/* Search Interface with Error Boundary */}
        <ErrorBoundary
          fallback={({ onRetry }) => (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center space-y-4">
              <h3 className="text-lg font-semibold text-destructive">Search Interface Error</h3>
              <p className="text-sm text-muted-foreground">
                There was a problem loading the search interface. Please try again.
              </p>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          onError={(error, errorInfo) => {
            console.error('Search interface error:', error, errorInfo)
          }}
        >
          <SearchInterface
            onSearch={handleSearch}
            onFilter={handleFilter}
            placeholder="Search documents, knowledge base, and more..."
            autoFocus
          />
        </ErrorBoundary>

        {/* Search Results with Error Boundary */}
        {hasSearched && (
          <div className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-destructive text-sm">
                  <strong>Search Error:</strong> {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-4 px-3 py-1 bg-destructive text-destructive-foreground rounded text-xs hover:bg-destructive/90 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            )}

            <ErrorBoundary
              fallback={({ onRetry }) => (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center space-y-4">
                  <h3 className="text-lg font-semibold text-destructive">Search Results Error</h3>
                  <p className="text-sm text-muted-foreground">
                    There was a problem displaying the search results. Please try searching again.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={onRetry}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      Retry Results
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                    >
                      Reload Page
                    </button>
                  </div>
                </div>
              )}
              onError={(searchError, errorInfo) => {
                console.error('Search results error:', searchError, errorInfo)
              }}
            >
              <SearchResults
                results={results}
                totalResults={totalResults}
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onResultClick={handleResultClick}
                query={query}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* Welcome message when no search has been performed */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-muted-foreground">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Start searching</h3>
              <p className="text-sm text-muted-foreground">
                Enter a query above to search through your documents, knowledge base, and more. 
                Use filters to narrow down your results by document type, date range, or relevance.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h4 className="text-sm font-medium mb-2">Search Tips:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use quotes for exact phrases: &quot;machine learning&quot;</li>
                  <li>• Exclude terms with minus: -draft</li>
                  <li>• Use Ctrl+K to quickly focus the search input</li>
                  <li>• Filter by document type, date, or sort by relevance</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600">Loading search...</p>
          </div>
        </div>
      </main>
    }>
      <SearchPageContent />
    </Suspense>
  );
}