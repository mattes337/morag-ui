// Sidebar.tsx - Navigation sidebar component
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { SidebarProps } from './types'

export const Sidebar: React.FC<SidebarProps> = ({
  navigation,
  currentPath,
  className,
}) => {
  return (
    <div 
      className={cn(
        'flex flex-col bg-card text-card-foreground',
        className
      )}
      data-testid="sidebar-content"
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold">MoRAG</h2>
      </div>
      
      <div className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.id} data-testid={`nav-item-${item.id}`}>
              <a
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                  item.isActive || currentPath === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span 
                    className="ml-auto bg-primary/20 text-primary text-xs px-2 py-1 rounded-full"
                    data-testid={`nav-badge-${item.id}`}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
              
              {/* Sub-navigation */}
              {item.children && (
                <ul className="mt-1 ml-4 space-y-1">
                  {item.children.map((child) => (
                    <li key={child.id} data-testid={`nav-subitem-${child.id}`}>
                      <a
                        href={child.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                          child.isActive || currentPath === child.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
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
      </div>
    </div>
  )
}