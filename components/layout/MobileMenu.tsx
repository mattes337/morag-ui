// MobileMenu.tsx - Mobile navigation drawer
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { MobileMenuProps } from './types'

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navigation,
  currentPath,
  className,
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        data-testid="mobile-menu-backdrop"
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          'fixed left-0 top-0 h-full w-80 bg-card border-r z-50 lg:hidden transform transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        data-testid="mobile-menu-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">MoRAG</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="mobile-menu-close"
          >
            Close
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.id} data-testid={`mobile-nav-item-${item.id}`}>
                <a
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                    item.isActive || currentPath === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={onClose}
                >
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span 
                      className="ml-auto bg-primary/20 text-primary text-xs px-2 py-1 rounded-full"
                      data-testid={`mobile-nav-badge-${item.id}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
                
                {/* Sub-navigation */}
                {item.children && (
                  <ul className="mt-1 ml-4 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.id} data-testid={`mobile-nav-subitem-${child.id}`}>
                        <a
                          href={child.href}
                          className={cn(
                            'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                            child.isActive || currentPath === child.href
                              ? 'bg-primary text-primary-foreground'
                              : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                          onClick={onClose}
                        >
                          <span className="truncate">{child.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}