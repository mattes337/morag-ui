// DashboardLayout.tsx - Main dashboard layout container
'use client'

import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useLayoutState } from './hooks/useLayoutState'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useRenderTracking, useRerenderTracking } from '@/lib/hooks/usePerformanceTracking'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileMenu } from './MobileMenu'
import { SearchOverlay } from './SearchOverlay'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { DashboardLayoutProps, LayoutContextType } from './types'
import { mockNavigation, mockUser, mockCurrentRealm, mockNotifications, getUnreadCount } from './mockData'

// Layout Context
const LayoutContext = createContext<LayoutContextType | null>(null)

export const useLayoutContext = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayoutContext must be used within a DashboardLayout')
  }
  return context
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  className 
}) => {
  // Performance tracking for the layout component
  useRenderTracking('DashboardLayout', { debugMode: process.env.NODE_ENV === 'development' })
  useRerenderTracking('DashboardLayout', { 
    debugMode: process.env.NODE_ENV === 'development',
    debugInfo: { hasChildren: !!children, className }
  })

  const layoutState = useLayoutState()
  const { state, toggleSidebar, toggleSearch, toggleMobileMenu } = layoutState

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onToggleSidebar: toggleSidebar,
    onToggleSearch: toggleSearch,
    onEscape: () => {
      // Close any open overlays on escape
      if (state.isSearchOpen) {
        toggleSearch()
      }
      if (state.isMobileMenuOpen) {
        toggleMobileMenu()
      }
    },
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    
    if (state.theme === 'system') {
      // Use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(state.theme)
    }
  }, [state.theme])

  // Check if mobile viewport
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Memoize context value to prevent unnecessary re-renders across dashboard
  const layoutContextValue: LayoutContextType = useMemo(() => ({
    ...layoutState
  }), [
    layoutState
  ])

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div 
        className={cn(
          'flex h-screen bg-background text-foreground',
          isMobile && 'mobile',
          className
        )}
        data-testid="dashboard-layout"
      >
        {/* Sidebar - Desktop */}
        <nav
          className={cn(
            'hidden lg:flex flex-col transition-all duration-200 ease-in-out border-r border-border',
            state.sidebarState === 'expanded' && 'w-60',
            state.sidebarState === 'collapsed' && 'w-16 collapsed',
            state.sidebarState === 'hidden' && 'w-0 hidden'
          )}
          aria-label="Main navigation"
          data-testid="sidebar"
        >
          <Sidebar
            navigation={mockNavigation}
            currentPath="/"
            className="h-full"
          />
        </nav>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header 
            className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" 
            role="banner"
            data-testid="header"
          >
            <Header
              user={mockUser}
              currentRealm={mockCurrentRealm}
              notifications={mockNotifications}
              unreadCount={getUnreadCount()}
              className="h-16"
            />
          </header>

          {/* Main Content */}
          <main
            className="flex-1 overflow-auto bg-background p-6"
            role="main"
          >
            {children}
          </main>
        </div>

        {/* Mobile Menu Overlay */}
        {state.isMobileMenuOpen && (
          <div data-testid="mobile-menu">
            <MobileMenu
              isOpen={state.isMobileMenuOpen}
              onClose={toggleMobileMenu}
              navigation={mockNavigation}
              currentPath="/"
            />
          </div>
        )}

        {/* Search Overlay with Error Boundary */}
        {state.isSearchOpen && (
          <div data-testid="search-overlay">
            <ErrorBoundary
              fallback={({ error, onRetry }) => (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-card border rounded-lg shadow-lg z-50 p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-destructive">Search Error</h3>
                    <p className="text-sm text-muted-foreground">
                      There was a problem with the search overlay. Please try again.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      >
                        Retry Search
                      </button>
                      <button
                        onClick={toggleSearch}
                        className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
              onError={(error, errorInfo) => {
                console.error('Search overlay error:', error, errorInfo)
                // Could send to analytics/error reporting service
              }}
            >
              <SearchOverlay
                isOpen={state.isSearchOpen}
                onClose={toggleSearch}
                onSearch={(query) => {
                  // Search analytics tracking
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'search', {
                      event_category: 'engagement',
                      event_label: 'dashboard_search_overlay',
                      search_term: query
                    })
                  }
                  
                  // The SearchOverlay now handles navigation internally
                  console.log('Search performed:', query)
                }}
              />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </LayoutContext.Provider>
  )
}

export default DashboardLayout