// SearchOverlay.tsx - Command palette search overlay
'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Input, Button } from '@/components/ui'
import { SearchOverlayProps } from './types'

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSearch,
  className,
}) => {
  const [query, setQuery] = useState('')

  // Reset query when overlay opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
    }
  }, [isOpen])

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      onClose()
    }
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
            <Input
              type="text"
              placeholder="Search documents, realms, users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              data-testid="search-input"
            />
            <Button 
              type="submit" 
              disabled={!query.trim()}
              data-testid="search-submit"
            >
              Search
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

        {/* Search suggestions/results would go here */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Start typing to search across your realms...</p>
          
          <div className="mt-2 space-y-1">
            <p><kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd> to search</p>
            <p><kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> to close</p>
          </div>
        </div>
      </div>
    </>
  )
}