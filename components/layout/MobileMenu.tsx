/**
 * Enhanced Mobile Navigation Menu - Mobile-Optimized Navigation Drawer
 * 
 * Features:
 * - Touch-optimized interaction targets (44px minimum)
 * - Swipe gestures for navigation and closing
 * - Pull-to-refresh on navigation list
 * - Haptic feedback for touch actions
 * - Landscape/portrait adaptations
 * - Reduced animations on low-end devices
 */

'use client'

import React, { useCallback, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button, Separator } from '@/components/ui'
import { SwipeGestures } from './SwipeGestures'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'
import { MobileMenuProps } from './types'

interface EnhancedMobileMenuProps extends MobileMenuProps {
  /** Enable pull-to-refresh on navigation list */
  enablePullToRefresh?: boolean
  /** Enable swipe to close gesture */
  enableSwipeToClose?: boolean
  /** Enable haptic feedback */
  enableHaptics?: boolean
  /** Callback for pull-to-refresh */
  onRefresh?: () => Promise<void> | void
}

/**
 * Trigger haptic feedback on supported devices
 */
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const vibrationPattern = {
      light: [10],
      medium: [20], 
      heavy: [30]
    }
    navigator.vibrate(vibrationPattern[type])
  }
}

export const MobileMenu: React.FC<EnhancedMobileMenuProps> = ({
  isOpen,
  onClose,
  navigation,
  currentPath,
  className,
  enablePullToRefresh = true,
  enableSwipeToClose = true,
  enableHaptics = true,
  onRefresh,
}) => {
  const router = useRouter()
  const device = useMobileDetection()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Handle pull-to-refresh
  const handlePullToRefresh = useCallback(async () => {
    if (!enablePullToRefresh || !onRefresh) return

    setIsRefreshing(true)
    if (enableHaptics) {
      triggerHapticFeedback('medium')
    }

    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }, [enablePullToRefresh, onRefresh, enableHaptics])

  // Handle navigation with haptic feedback
  const handleNavigation = useCallback((href: string, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    
    if (enableHaptics && device.isTouchDevice) {
      triggerHapticFeedback('light')
    }

    router.push(href)
    onClose()
  }, [router, onClose, enableHaptics, device.isTouchDevice])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with swipe-to-close support */}
      {enableSwipeToClose ? (
        <SwipeGestures
          onSwipeRight={() => onClose()}
          horizontalOnly
          threshold={100}
        >
          <button 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden border-0 p-0"
            onClick={onClose}
            aria-label="Close mobile menu"
            data-testid="mobile-menu-backdrop"
          />
        </SwipeGestures>
      ) : (
        <button 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden border-0 p-0"
          onClick={onClose}
          aria-label="Close mobile menu"
          data-testid="mobile-menu-backdrop"
        />
      )}
      
      {/* Drawer with enhanced mobile features */}
      <SwipeGestures
        onSwipeLeft={() => enableSwipeToClose && onClose()}
        horizontalOnly
        threshold={50}
        className={cn(
          'fixed left-0 top-0 h-full bg-card border-r z-50 lg:hidden transform transition-transform',
          // Adaptive width based on device orientation
          device.orientation === 'landscape' && device.isMobile 
            ? 'w-64' // Narrower in landscape
            : 'w-80', // Standard width in portrait
          // Reduced animations on low-end devices
          device.isLowEndDevice 
            ? 'duration-100' 
            : 'duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        data-testid="mobile-menu-drawer"
      >
        {/* Header with improved touch targets */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">MoRAG</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px]" // Touch-optimized size
            data-testid="mobile-menu-close"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        {/* Pull-to-refresh indicator */}
        {enablePullToRefresh && pullDistance > 0 && (
          <div 
            className="flex items-center justify-center py-2 bg-accent/50 border-b"
            style={{ height: Math.min(pullDistance / 2, 60) }}
          >
            {isRefreshing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Refreshing...
              </div>
            ) : pullDistance > 120 ? (
              <div className="text-sm text-primary font-medium">Release to refresh</div>
            ) : (
              <div className="text-sm text-muted-foreground">Pull to refresh</div>
            )}
          </div>
        )}

        {/* Navigation with enhanced touch interaction */}
        <SwipeGestures
          onSwipeDown={(event) => {
            if (enablePullToRefresh && event.startY < 100) {
              setPullDistance(event.distance)
              if (event.distance > 120) {
                handlePullToRefresh()
              }
            }
          }}
          verticalOnly
          threshold={60}
        >
          <nav 
            ref={scrollRef}
            className="flex-1 px-4 py-4 overflow-y-auto overscroll-contain"
            style={{ 
              // Smooth scrolling on supported devices
              scrollBehavior: device.isLowEndDevice ? 'auto' : 'smooth'
            }}
          >
            <ul className="space-y-1">
              {navigation.map((item, index) => (
                <li key={item.id} data-testid={`mobile-nav-item-${item.id}`}>
                  <a
                    href={item.href}
                    className={cn(
                      // Enhanced touch targets (44px minimum height)
                      'flex items-center px-3 py-3 text-sm rounded-lg transition-colors',
                      'min-h-[44px] w-full',
                      // Active state styling
                      item.isActive || currentPath === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-card-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
                      // Touch feedback
                      'active:scale-[0.98] transform transition-transform duration-75',
                      // Reduce transitions on low-end devices
                      device.isLowEndDevice && 'transition-none transform-none'
                    )}
                    onClick={(e) => handleNavigation(item.href, e)}
                    onTouchStart={() => enableHaptics && triggerHapticFeedback('light')}
                  >
                    {/* Icon if available */}
                    {item.icon && (
                      <span className="mr-3 w-5 h-5 flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    
                    <span className="truncate flex-1">{item.name}</span>
                    
                    {/* Badge with improved visibility */}
                    {item.badge && (
                      <span 
                        className={cn(
                          "ml-auto bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium",
                          "min-w-[20px] flex items-center justify-center"
                        )}
                        data-testid={`mobile-nav-badge-${item.id}`}
                      >
                        {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </a>
                  
                  {/* Sub-navigation with enhanced touch targets */}
                  {item.children && (
                    <>
                      <Separator className="my-2 ml-8" />
                      <ul className="ml-6 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.id} data-testid={`mobile-nav-subitem-${child.id}`}>
                            <a
                              href={child.href}
                              className={cn(
                                'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                                'min-h-[40px] w-full', // Slightly smaller for sub-items but still touch-friendly
                                child.isActive || currentPath === child.href
                                  ? 'bg-primary/80 text-primary-foreground'
                                  : 'text-card-foreground/80 hover:bg-accent hover:text-accent-foreground',
                                'active:scale-[0.98] transform transition-transform duration-75',
                                device.isLowEndDevice && 'transition-none transform-none'
                              )}
                              onClick={(e) => handleNavigation(child.href, e)}
                              onTouchStart={() => enableHaptics && triggerHapticFeedback('light')}
                            >
                              <span className="truncate">{child.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  {/* Separator between main nav items for better visual separation */}
                  {index < navigation.length - 1 && !item.children && (
                    <Separator className="my-2" />
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </SwipeGestures>

        {/* Footer with device-specific info (dev mode only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 border-t bg-muted/50">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Device: {device.isMobile ? 'Mobile' : device.isTablet ? 'Tablet' : 'Desktop'}</div>
              <div>Orientation: {device.orientation}</div>
              <div>Touch: {device.isTouchDevice ? 'Yes' : 'No'}</div>
              {device.isLowEndDevice && <div className="text-orange-500">Low-end optimizations active</div>}
            </div>
          </div>
        )}
      </SwipeGestures>
    </>
  )
}