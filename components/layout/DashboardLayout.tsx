// DashboardLayout.tsx - Main dashboard layout container
'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLayoutState } from './hooks/useLayoutState'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileMenu } from './MobileMenu'
import { SearchOverlay } from './SearchOverlay'
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

  const layoutContextValue: LayoutContextType = layoutState

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
        <aside
          className={cn(
            'hidden lg:flex flex-col transition-all duration-200 ease-in-out border-r border-border',
            state.sidebarState === 'expanded' && 'w-60',
            state.sidebarState === 'collapsed' && 'w-16 collapsed',
            state.sidebarState === 'hidden' && 'w-0 hidden'
          )}
          role="navigation"
          aria-label="Main navigation"
          data-testid="sidebar"
        >
          <Sidebar
            navigation={mockNavigation}
            currentPath="/"
            className="h-full"
          />
        </aside>

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

        {/* Search Overlay */}
        {state.isSearchOpen && (
          <div data-testid="search-overlay">
            <SearchOverlay
              isOpen={state.isSearchOpen}
              onClose={toggleSearch}
              onSearch={(query) => {
                console.log('Search query:', query)
                // TODO: Implement search functionality
              }}
            />
          </div>
        )}
      </div>
    </LayoutContext.Provider>
  )
}

export default DashboardLayout