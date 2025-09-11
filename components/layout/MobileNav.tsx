/**
 * MobileNav Component - Comprehensive Mobile Navigation System
 * 
 * This component serves as the main entry point for mobile navigation,
 * combining the enhanced MobileMenu drawer with the TabBarNavigation
 * for a complete mobile-first navigation experience.
 */

'use client'

import React from 'react'
import { MobileMenu } from './MobileMenu'
import { TabBarNavigation, createDefaultTabs } from './TabBarNavigation'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'
import { NavigationItem } from './types'

interface MobileNavProps {
  /** Navigation drawer state */
  isDrawerOpen: boolean
  /** Close drawer callback */
  onDrawerClose: () => void
  /** Navigation items for drawer */
  navigation: NavigationItem[]
  /** Current page path */
  currentPath: string
  /** Show bottom tab bar navigation */
  showTabBar?: boolean
  /** Custom tab bar items (uses defaults if not provided) */
  tabBarItems?: Array<{
    id: string
    name: string
    href: string
    icon: React.ReactNode
    badge?: number | string
    isActive?: boolean
    disabled?: boolean
  }>
  /** Additional CSS classes for drawer */
  className?: string
  /** Enable advanced mobile features */
  enableAdvancedFeatures?: boolean
  /** Pull-to-refresh callback for drawer navigation */
  onRefresh?: () => Promise<void> | void
}

/**
 * Complete mobile navigation system combining drawer and tab bar
 * 
 * @example
 * ```tsx
 * // Basic usage with drawer only
 * <MobileNav
 *   isDrawerOpen={mobileMenuOpen}
 *   onDrawerClose={() => setMobileMenuOpen(false)}
 *   navigation={navItems}
 *   currentPath={pathname}
 * />
 * 
 * // With bottom tab bar
 * <MobileNav
 *   isDrawerOpen={mobileMenuOpen}
 *   onDrawerClose={() => setMobileMenuOpen(false)}
 *   navigation={navItems}
 *   currentPath={pathname}
 *   showTabBar={true}
 * />
 * 
 * // With custom tab bar items
 * <MobileNav
 *   isDrawerOpen={mobileMenuOpen}
 *   onDrawerClose={() => setMobileMenuOpen(false)}
 *   navigation={navItems}
 *   currentPath={pathname}
 *   showTabBar={true}
 *   tabBarItems={customTabs}
 *   enableAdvancedFeatures={true}
 *   onRefresh={handleRefresh}
 * />
 * ```
 */
export const MobileNav: React.FC<MobileNavProps> = ({
  isDrawerOpen,
  onDrawerClose,
  navigation,
  currentPath,
  showTabBar = false,
  tabBarItems,
  className,
  enableAdvancedFeatures = true,
  onRefresh,
}) => {
  const device = useMobileDetection()

  // Don't render on desktop unless forced
  if (!device.isMobile && !device.isTablet) {
    return null
  }

  // Use provided tab items or create defaults
  const tabs = tabBarItems || createDefaultTabs()

  return (
    <>
      {/* Enhanced Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        navigation={navigation}
        currentPath={currentPath}
        className={className}
        enablePullToRefresh={enableAdvancedFeatures}
        enableSwipeToClose={enableAdvancedFeatures}
        enableHaptics={enableAdvancedFeatures}
        onRefresh={onRefresh}
      />

      {/* Bottom Tab Bar Navigation */}
      {showTabBar && (
        <TabBarNavigation
          tabs={tabs}
          enableHaptics={enableAdvancedFeatures}
          hideOnScroll={true}
          maxTabs={5}
        />
      )}
    </>
  )
}

/**
 * Hook for managing mobile navigation state
 */
export function useMobileNav() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const device = useMobileDetection()

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true)
  }, [])

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  const toggleDrawer = React.useCallback(() => {
    setIsDrawerOpen(prev => !prev)
  }, [])

  // Close drawer when switching to desktop
  React.useEffect(() => {
    if (!device.isMobile && !device.isTablet && isDrawerOpen) {
      setIsDrawerOpen(false)
    }
  }, [device.isMobile, device.isTablet, isDrawerOpen])

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    isMobile: device.isMobile,
    isTablet: device.isTablet,
    deviceInfo: device,
  }
}

export default MobileNav