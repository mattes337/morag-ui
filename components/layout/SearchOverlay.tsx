// SearchOverlay.tsx - Command palette search overlay
'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Input, Button } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/components/search/hooks/useSearch'
import { SearchOverlayProps } from './types'
import { Search, ArrowRight, Clock } from 'lucide-react'

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSearch,
  className,
}) => {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { searchNow, results, isLoading } = useSearch()
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'machine learning models',
    'quarterly reports',
    'user documentation'
  ])

  // Reset query when overlay opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
    }
  }, [isOpen])

  // Perform search and show preview results
  useEffect(() => {
    if (query.trim().length >= 2) {
      searchNow(query)
    }
  }, [query, searchNow])

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Save to recent searches
      setRecentSearches(prev => {
        const newSearches = [query.trim(), ...prev.filter(s => s !== query.trim())].slice(0, 5)
        return newSearches
      })
      
      onSearch(query.trim())
      onClose()
      // Navigate to search page with query
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Handle result click
  const handleResultClick = (resultQuery: string) => {
    setQuery(resultQuery)
    onSearch(resultQuery)
    onClose()
    router.push(`/search?q=${encodeURIComponent(resultQuery)}`)
  }

  // Handle recent search click
  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery)
    onSearch(recentQuery)
    onClose()
    router.push(`/search?q=${encodeURIComponent(recentQuery)}`)
  }


  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <button 
        className="fixed inset-0 bg-black/50 z-50 border-0 p-0"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close search overlay"
        data-testid="search-overlay-backdrop"
      />
      
      {/* Search Dialog */}
      <div 
        className={cn(
          'fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-card border rounded-lg shadow-lg z-50 p-6',
          className
        )}
        data-testid="search-overlay-dialog"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents, realms, users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 flex-1"
                data-testid="search-input"
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              disabled={!query.trim() || isLoading}
              data-testid="search-submit"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              data-testid="search-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Search Results Preview */}
        {query.length >= 2 && (
          <div className="mt-4 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Searching...</div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Quick Results ({results.slice(0, 5).length} of {results.length})
                </div>
                {results.slice(0, 5).map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result.title)}
                    className="w-full text-left p-3 hover:bg-muted/50 rounded-md border border-transparent hover:border-border transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{result.title}</div>
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {result.content.length > 80 ? result.content.substring(0, 80) + '...' : result.content}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.documentType} • {new Date(result.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                    </div>
                  </button>
                ))}
                {results.length > 5 && (
                  <button
                    onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    className="w-full text-center p-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    View all {results.length} results
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {query.length === 0 && recentSearches.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Recent Searches
            </div>
            <div className="space-y-1">
              {recentSearches.map((recentQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(recentQuery)}
                  className="w-full text-left p-2 hover:bg-muted/50 rounded-md text-sm transition-colors flex items-center justify-between"
                >
                  <span>{recentQuery}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard shortcuts */}
        <div className="mt-4 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div><kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd> to search</div>
              <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> to close</div>
            </div>
            <div className="text-xs">
              {query.length >= 2 ? `${results.length} results` : 'Start typing to search'}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}