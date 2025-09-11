/**
 * RealmSelector - Dropdown realm switcher for header
 * Provides quick switching between realms with keyboard shortcuts
 */
'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useRealm } from '@/lib/hooks/useRealm'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ChevronDown,
  Building2,
  Settings,
  Plus,
  Clock,
  Check,
  Users
} from 'lucide-react'

interface RealmSelectorProps {
  className?: string
  onManageRealms?: () => void
  onCreateRealm?: () => void
  showCreateOption?: boolean
  compact?: boolean
}

export const RealmSelector: React.FC<RealmSelectorProps> = ({
  className,
  onManageRealms,
  onCreateRealm,
  showCreateOption = true,
  compact = false,
}) => {
  const {
    currentRealm,
    availableRealms,
    recentRealms,
    isLoading,
    isSwitching,
    switchRealm,
  } = useRealm()

  const [isOpen, setIsOpen] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+R to open realm selector
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault()
        setIsOpen(!isOpen)
        return
      }

      // Escape to close
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        return
      }

      // Number keys 1-5 for quick realm switching (when dropdown is open)
      if (isOpen && event.key >= '1' && event.key <= '5') {
        event.preventDefault()
        const index = parseInt(event.key) - 1
        const realm = recentRealms[index]
        if (realm && realm.id !== currentRealm?.id) {
          handleRealmSwitch(realm.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, recentRealms, currentRealm?.id])

  const handleRealmSwitch = async (realmId: string) => {
    if (realmId === currentRealm?.id) {
      setIsOpen(false)
      return
    }

    const success = await switchRealm(realmId)
    if (success) {
      setIsOpen(false)
    }
  }

  const getRealmIcon = (realmName: string) => {
    // Simple icon mapping based on realm name
    const name = realmName.toLowerCase()
    if (name.includes('marketing')) return '📈'
    if (name.includes('sales')) return '💰'
    if (name.includes('engineering')) return '⚙️'
    if (name.includes('executive')) return '👔'
    if (name.includes('support')) return '🎧'
    return '🏢'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'maintenance': return 'bg-yellow-500'
      case 'inactive': return 'bg-gray-500'
      case 'archived': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="w-8 h-8 rounded-full" />
        {!compact && <Skeleton className="w-32 h-6" />}
        <Skeleton className="w-4 h-4" />
      </div>
    )
  }

  if (!currentRealm) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <Building2 className="w-4 h-4" />
        {!compact && <span className="text-sm">No realm selected</span>}
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={cn(
            'flex items-center gap-2 font-medium',
            isSwitching && 'opacity-50 cursor-wait',
            className
          )}
          disabled={isSwitching}
          data-testid="realm-selector-trigger"
        >
          {/* Realm Icon */}
          <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs">
            {getRealmIcon(currentRealm.name)}
          </div>
          
          {/* Realm Name */}
          {!compact && (
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium truncate max-w-32">
                {currentRealm.name}
              </span>
              {currentRealm.status !== 'active' && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {currentRealm.status}
                </Badge>
              )}
            </div>
          )}
          
          {/* Status indicator */}
          <div className="flex items-center gap-1">
            <div className={cn(
              'w-2 h-2 rounded-full',
              getStatusColor(currentRealm.status)
            )} />
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="start" 
        className="w-80"
        data-testid="realm-selector-content"
      >
        {/* Current Realm */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Current Realm</span>
          <Badge variant="secondary" className="text-xs">
            {currentRealm.tier}
          </Badge>
        </DropdownMenuLabel>
        
        <DropdownMenuItem 
          disabled
          className="flex items-center gap-3 py-3"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
            {getRealmIcon(currentRealm.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{currentRealm.name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {currentRealm.description}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn(
                'w-2 h-2 rounded-full',
                getStatusColor(currentRealm.status)
              )} />
              <span className="text-xs text-muted-foreground capitalize">
                {currentRealm.status}
              </span>
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {currentRealm.memberships.filter(m => m.status === 'active').length}
              </span>
            </div>
          </div>
          <Check className="w-4 h-4 text-green-600" />
        </DropdownMenuItem>

        {/* Recent Realms */}
        {recentRealms.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Realms
            </DropdownMenuLabel>
            {recentRealms
              .filter(realm => realm.id !== currentRealm.id)
              .slice(0, 4)
              .map((realm, index) => (
                <DropdownMenuItem
                  key={realm.id}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                  onClick={() => handleRealmSwitch(realm.id)}
                  disabled={isSwitching}
                  data-testid={`recent-realm-${realm.id}`}
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-muted/50 rounded-full text-xs">
                    {getRealmIcon(realm.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{realm.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        getStatusColor(realm.status)
                      )} />
                      <span className="text-xs text-muted-foreground">
                        {realm.tier}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuShortcut>
                    {index < 4 ? (index + 2).toString() : ''}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            }
          </>
        )}

        {/* All Realms */}
        {availableRealms.length > recentRealms.length && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>All Realms</DropdownMenuLabel>
            {availableRealms
              .filter(realm => !recentRealms.some(r => r.id === realm.id))
              .slice(0, 5)
              .map(realm => (
                <DropdownMenuItem
                  key={realm.id}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                  onClick={() => handleRealmSwitch(realm.id)}
                  disabled={isSwitching}
                  data-testid={`realm-${realm.id}`}
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-muted/50 rounded-full text-xs">
                    {getRealmIcon(realm.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{realm.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        getStatusColor(realm.status)
                      )} />
                      <span className="text-xs text-muted-foreground">
                        {realm.tier}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            }
          </>
        )}

        {/* Actions */}
        <DropdownMenuSeparator />
        
        {showCreateOption && onCreateRealm && (
          <DropdownMenuItem
            className="flex items-center gap-3 py-2 cursor-pointer text-primary"
            onClick={() => {
              setIsOpen(false)
              onCreateRealm()
            }}
            data-testid="create-realm-option"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Realm</span>
          </DropdownMenuItem>
        )}
        
        {onManageRealms && (
          <DropdownMenuItem
            className="flex items-center gap-3 py-2 cursor-pointer"
            onClick={() => {
              setIsOpen(false)
              onManageRealms()
            }}
            data-testid="manage-realms-option"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Realms</span>
            <DropdownMenuShortcut>Ctrl+R</DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default RealmSelector