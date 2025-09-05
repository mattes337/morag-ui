// Header.tsx - Top navigation header component
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { HeaderProps } from './types'

export const Header: React.FC<HeaderProps> = ({
  user,
  currentRealm,
  notifications: _notifications,
  unreadCount,
  className,
}) => {
  return (
    <div 
      className={cn(
        'flex items-center justify-between px-6 py-4 bg-background border-b',
        className
      )}
      data-testid="header-content"
    >
      {/* Left section - Mobile menu button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          data-testid="mobile-menu-trigger"
        >
          Menu
        </Button>
        
        {/* Breadcrumbs placeholder */}
        <div className="hidden lg:flex items-center text-sm text-muted-foreground">
          Dashboard
        </div>
      </div>

      {/* Right section - User actions */}
      <div className="flex items-center gap-4">
        {/* Search trigger */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:flex"
          data-testid="search-trigger"
        >
          Search
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            data-testid="notifications-trigger"
          >
            Notifications
            {unreadCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                data-testid="notification-badge"
              >
                {unreadCount}
              </span>
            )}
          </Button>
        </div>

        {/* Realm switcher */}
        {currentRealm && (
          <div data-testid="realm-switcher">
            <Button variant="ghost" size="sm">
              {currentRealm.name}
            </Button>
          </div>
        )}

        {/* User menu */}
        <div data-testid="user-menu">
          <Button variant="ghost" size="sm">
            {user.name}
          </Button>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          data-testid="theme-toggle"
        >
          Theme
        </Button>
      </div>
    </div>
  )
}