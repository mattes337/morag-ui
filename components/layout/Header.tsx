// Header.tsx - Top navigation header component
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { HeaderProps } from './types'
import { RealmSelector } from '@/components/realms/RealmSelector'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Settings, User, LogOut, ChevronDown } from 'lucide-react'

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
        <RealmSelector 
          onManageRealms={() => {
            // Navigate to realms management page
            window.location.href = '/realms'
          }}
          data-testid="realm-switcher"
        />

        {/* Real-time notifications */}
        <NotificationBell 
          size="sm"
          className="notification-bell"
        />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="user-menu">
              <span>{user.name}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
              <User className="h-4 w-4 mr-2" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
              <Settings className="h-4 w-4 mr-2" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                // Handle logout logic
                console.log('Logging out...');
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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