/**
 * TabBarNavigation Component
 * 
 * Mobile-optimized bottom tab bar navigation with touch-friendly design,
 * optimized touch targets, and haptic feedback support.
 */

'use client'

import React, { useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'

interface TabItem {
  id: string
  name: string
  href: string
  icon: React.ReactNode
  badge?: number | string
  isActive?: boolean
  disabled?: boolean
}

interface TabBarNavigationProps {
  /** Navigation tabs to display */
  tabs: TabItem[]
  /** Additional CSS classes */
  className?: string
  /** Enable haptic feedback on supported devices */
  enableHaptics?: boolean
  /** Hide tab bar when scrolling down */
  hideOnScroll?: boolean
  /** Custom active tab indicator */
  activeIndicator?: React.ReactNode
  /** Maximum number of tabs to show (others go to overflow) */
  maxTabs?: number
}

/**
 * Trigger haptic feedback on supported devices
 */
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    // Simple vibration fallback
    const vibrationPattern = {
      light: [10],
      medium: [20],
      heavy: [30]
    }
    navigator.vibrate(vibrationPattern[type])
  }
  
  // iOS Haptic Feedback (if available)
  if (typeof window !== 'undefined' && (window as any).DeviceMotionEvent) {
    try {
      const impact = new (window as any).UIImpactFeedbackGenerator()
      impact.impactOccurred(type)
    } catch {
      // Haptic feedback not available
    }
  }
}

export const TabBarNavigation: React.FC<TabBarNavigationProps> = ({
  tabs,
  className,
  enableHaptics = true,
  hideOnScroll = false,
  activeIndicator,
  maxTabs = 5,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const device = useMobileDetection()
  const [isVisible, setIsVisible] = React.useState(true)
  const [lastScrollY, setLastScrollY] = React.useState(0)

  // Handle scroll-based hide/show
  useEffect(() => {
    if (!hideOnScroll || typeof window === 'undefined') return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down, hide tab bar
        setIsVisible(false)
      } else {
        // Scrolling up, show tab bar
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    // Throttled scroll handler for performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [hideOnScroll, lastScrollY])

  // Handle tab navigation
  const handleTabPress = useCallback((tab: TabItem, event: React.TouchEvent | React.MouseEvent) => {
    if (tab.disabled) return

    // Prevent default to avoid double navigation
    event.preventDefault()

    // Trigger haptic feedback
    if (enableHaptics && device.isTouchDevice) {
      triggerHapticFeedback('light')
    }

    // Navigate to tab
    router.push(tab.href)
  }, [router, enableHaptics, device.isTouchDevice])

  // Don't render on desktop or when no tabs
  if (!device.isMobile || tabs.length === 0) {
    return null
  }

  // Handle tab overflow
  const visibleTabs = tabs.slice(0, maxTabs)
  const hasOverflow = tabs.length > maxTabs

  return (
    <nav
      className={cn(
        // Base styles
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-background/95 backdrop-blur-sm border-t border-border',
        'safe-area-inset-bottom', // iOS safe area support
        // Transition for hide/show
        'transform transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : 'translate-y-full',
        className
      )}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {visibleTabs.map((tab) => {
          const isActive = tab.isActive || pathname === tab.href || pathname.startsWith(tab.href + '/')
          
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              disabled={tab.disabled}
              className={cn(
                // Base styles - optimized touch targets (44px minimum)
                'flex flex-col items-center justify-center',
                'min-w-[44px] min-h-[44px] p-2 m-1',
                'rounded-lg transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'active:scale-95', // Touch feedback
                // States
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                tab.disabled && 'opacity-50 cursor-not-allowed',
                // Reduce motion for low-end devices
                device.isLowEndDevice && 'transition-none'
              )}
              onTouchStart={(e) => handleTabPress(tab, e)}
              onClick={(e) => handleTabPress(tab, e)}
              data-testid={`tab-${tab.id}`}
            >
              {/* Icon container with badge support */}
              <div className="relative flex items-center justify-center mb-1">
                <div className={cn(
                  'w-6 h-6 flex items-center justify-center',
                  isActive && 'scale-110'
                )}>
                  {tab.icon}
                </div>
                
                {/* Badge */}
                {tab.badge && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      'absolute -top-1 -right-1 min-w-[16px] h-4 p-0',
                      'text-[10px] font-medium leading-none',
                      'flex items-center justify-center'
                    )}
                  >
                    {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
                  </Badge>
                )}
              </div>

              {/* Label */}
              <span className={cn(
                'text-[10px] font-medium leading-none',
                'max-w-[60px] truncate',
                isActive && 'font-semibold'
              )}>
                {tab.name}
              </span>

              {/* Active indicator */}
              {isActive && (activeIndicator || (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              ))}
            </button>
          )
        })}

        {/* Overflow indicator */}
        {hasOverflow && (
          <button
            className={cn(
              'flex flex-col items-center justify-center',
              'min-w-[44px] min-h-[44px] p-2 m-1',
              'rounded-lg transition-all duration-200',
              'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-label="More navigation options"
            data-testid="tab-overflow"
          >
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </div>
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        )}
      </div>

      {/* Bottom safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-background/95" />
    </nav>
  )
}

// Default tab configurations for common app sections
export const createDefaultTabs = (): TabItem[] => [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'documents',
    name: 'Documents',
    href: '/documents',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'search',
    name: 'Search',
    href: '/search',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'jobs',
    name: 'Jobs',
    href: '/jobs',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ),
    badge: 3, // Example badge for pending jobs
  },
  {
    id: 'settings',
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

export default TabBarNavigation