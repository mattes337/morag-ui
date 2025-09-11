/**
 * Mobile Detection Hook
 * 
 * Provides comprehensive mobile device detection and responsive utilities.
 * Includes device type detection, touch capabilities, orientation, and performance optimizations.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  isIOS: boolean
  isAndroid: boolean
  orientation: 'portrait' | 'landscape'
  screenSize: 'small' | 'medium' | 'large'
  supportsHover: boolean
  isLowEndDevice: boolean
  viewportWidth: number
  viewportHeight: number
}

interface MobileDetectionOptions {
  mobileBreakpoint?: number
  tabletBreakpoint?: number
  enableOrientationDetection?: boolean
  enablePerformanceDetection?: boolean
}

const DEFAULT_OPTIONS: Required<MobileDetectionOptions> = {
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  enableOrientationDetection: true,
  enablePerformanceDetection: true,
}

/**
 * Hook for detecting mobile devices and responsive behavior
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const device = useMobileDetection();
 *   
 *   if (device.isMobile) {
 *     return <MobileLayout />;
 *   }
 *   
 *   return <DesktopLayout />;
 * };
 * 
 * // With custom options
 * const device = useMobileDetection({
 *   mobileBreakpoint: 640,
 *   enablePerformanceDetection: false
 * });
 * ```
 */
/**
 * Helper function to detect device characteristics
 */
const detectDevice = (config: Required<MobileDetectionOptions>): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      isIOS: false,
      isAndroid: false,
      orientation: 'landscape',
      screenSize: 'large',
      supportsHover: true,
      isLowEndDevice: false,
      viewportWidth: 1024,
      viewportHeight: 768,
    }
  }

  const userAgent = navigator.userAgent.toLowerCase()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Device type detection
  const isMobile = viewportWidth < config.mobileBreakpoint
  const isTablet = viewportWidth >= config.mobileBreakpoint && viewportWidth < config.tabletBreakpoint
  const isDesktop = viewportWidth >= config.tabletBreakpoint
  
  // Platform detection
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isAndroid = /android/.test(userAgent)
  
  // Touch capabilities
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Hover support detection
  const supportsHover = window.matchMedia('(hover: hover)').matches
  
  // Screen size categorization
  let screenSize: 'small' | 'medium' | 'large' = 'large'
  if (viewportWidth < 640) {
    screenSize = 'small'
  } else if (viewportWidth < 1024) {
    screenSize = 'medium'
  }
  
  // Orientation detection
  let orientation: 'portrait' | 'landscape' = 'landscape'
  if (config.enableOrientationDetection) {
    orientation = viewportHeight > viewportWidth ? 'portrait' : 'landscape'
  }
  
  // Performance-based device detection
  let isLowEndDevice = false
  if (config.enablePerformanceDetection) {
    // Heuristics for low-end device detection
    const hardwareConcurrency = navigator.hardwareConcurrency || 2
    const deviceMemory = (navigator as any).deviceMemory || 2
    const connectionSpeed = (navigator as any).connection?.effectiveType
    
    isLowEndDevice = (
      hardwareConcurrency <= 2 ||
      deviceMemory <= 2 ||
      connectionSpeed === 'slow-2g' ||
      connectionSpeed === '2g'
    )
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isIOS,
    isAndroid,
    orientation,
    screenSize,
    supportsHover,
    isLowEndDevice,
    viewportWidth,
    viewportHeight,
  }
}

export function useMobileDetection(options: MobileDetectionOptions = {}): DeviceInfo {
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options])
  
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    return detectDevice(config)
  })

  // Handle resize events
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setDeviceInfo(detectDevice(config))
    }

    const handleOrientationChange = () => {
      // Delay to ensure viewport dimensions are updated
      setTimeout(() => {
        setDeviceInfo(detectDevice(config))
      }, 100)
    }

    // Debounced resize handler for performance
    let resizeTimeout: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(handleResize, 150)
    }

    window.addEventListener('resize', debouncedResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    // Initial detection
    handleResize()

    return () => {
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      clearTimeout(resizeTimeout)
    }
  }, [config])

  return deviceInfo
}

/**
 * Hook for specific mobile detection scenarios
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const device = useMobileDetection({ mobileBreakpoint: breakpoint })
  return device.isMobile
}

/**
 * Hook for touch device detection
 */
export function useIsTouchDevice(): boolean {
  const device = useMobileDetection()
  return device.isTouchDevice
}

/**
 * Hook for device orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const device = useMobileDetection()
  return device.orientation
}

/**
 * Hook for performance-aware mobile detection
 */
export function useDeviceCapabilities() {
  const device = useMobileDetection({ enablePerformanceDetection: true })
  
  return useMemo(() => ({
    shouldReduceAnimations: device.isLowEndDevice || !device.supportsHover,
    shouldUseLazyLoading: device.isMobile || device.isLowEndDevice,
    shouldPreloadImages: device.isDesktop && !device.isLowEndDevice,
    optimalImageQuality: device.isLowEndDevice ? 'low' : device.isMobile ? 'medium' : 'high',
    recommendedPageSize: device.isLowEndDevice ? 10 : device.isMobile ? 20 : 50,
  }), [device])
}