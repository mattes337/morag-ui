'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { 
  Settings, 
  Shield, 
  Bell, 
  Plug,
  Menu,
  X
} from 'lucide-react'

interface SettingsNavItem {
  id: string
  icon: React.ReactNode
  label: string
  description: string
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

interface SettingsNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isMobile?: boolean
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
  className?: string
}

const settingsNavItems: SettingsNavItem[] = [
  {
    id: 'general',
    icon: <Settings className="h-5 w-5" />,
    label: 'General',
    description: 'Theme, language, timezone, and default preferences'
  },
  {
    id: 'security',
    icon: <Shield className="h-5 w-5" />,
    label: 'Security',
    description: 'Password, 2FA, API keys, and active sessions',
    badge: {
      text: '2FA Enabled',
      variant: 'outline'
    }
  },
  {
    id: 'notifications',
    icon: <Bell className="h-5 w-5" />,
    label: 'Notifications',
    description: 'Email, push, and in-app notification preferences'
  },
  {
    id: 'integrations',
    icon: <Plug className="h-5 w-5" />,
    label: 'Integrations',
    description: 'Vector databases, LLM configurations, and external services',
    badge: {
      text: '3 Active',
      variant: 'secondary'
    }
  }
]

export function SettingsNav({
  activeSection,
  onSectionChange,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapsed,
  className
}: SettingsNavProps) {
  // Mobile collapse toggle
  const handleToggleCollapsed = () => {
    onToggleCollapsed?.()
  }

  return (
    <nav className={cn("flex flex-col", className)}>
      {/* Mobile header with toggle */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleCollapsed}
            aria-label={isCollapsed ? "Show settings menu" : "Hide settings menu"}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* Navigation items */}
      <div className={cn(
        "space-y-1 p-2",
        isMobile && isCollapsed && "hidden"
      )}>
        {settingsNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex flex-col items-start p-4 text-left rounded-lg transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "group relative",
              activeSection === item.id && [
                "bg-accent text-accent-foreground",
                "border-l-4 border-primary"
              ]
            )}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            {/* Active indicator */}
            {activeSection === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
            )}

            {/* Content container */}
            <div className="flex items-center gap-3 w-full">
              <div className={cn(
                "flex-shrink-0 transition-colors duration-200",
                activeSection === item.id 
                  ? "text-primary" 
                  : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <Badge variant={item.badge.variant || 'secondary'} className="text-xs">
                      {item.badge.text}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Hover effect */}
            <div className={cn(
              "absolute inset-0 rounded-lg border-2 border-transparent transition-colors duration-200",
              "group-hover:border-border/50",
              activeSection === item.id && "border-primary/20"
            )} />
          </button>
        ))}
      </div>

      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleToggleCollapsed}
        />
      )}
    </nav>
  )
}

SettingsNav.displayName = 'SettingsNav'