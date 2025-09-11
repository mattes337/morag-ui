/**
 * Tests for useMobileDetection hook
 */

import { renderHook, act } from '@testing-library/react'
import { useMobileDetection, useIsMobile, useIsTouchDevice, useOrientation, useDeviceCapabilities } from '../useMobileDetection'

// Mock window and navigator
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  matchMedia: jest.fn(() => ({
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
}

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  maxTouchPoints: 0,
  hardwareConcurrency: 4,
  vibrate: jest.fn(),
}

// Store original values
const originalWindow = global.window
const originalNavigator = global.navigator

beforeEach(() => {
  // Mock window and navigator
  global.window = mockWindow as any
  global.navigator = mockNavigator as any
  
  // Reset mocks
  jest.clearAllMocks()
})

afterEach(() => {
  // Restore original values
  global.window = originalWindow
  global.navigator = originalNavigator
})

describe('useMobileDetection', () => {
  it('should detect desktop by default', () => {
    const { result } = renderHook(() => useMobileDetection())
    
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.screenSize).toBe('large')
  })

  it('should detect mobile device', () => {
    mockWindow.innerWidth = 375
    mockWindow.innerHeight = 667
    
    const { result } = renderHook(() => useMobileDetection())
    
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.screenSize).toBe('small')
  })

  it('should detect tablet device', () => {
    mockWindow.innerWidth = 768
    mockWindow.innerHeight = 1024
    
    const { result } = renderHook(() => useMobileDetection())
    
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.screenSize).toBe('medium')
  })

  it('should detect iOS devices', () => {
    mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
    
    const { result } = renderHook(() => useMobileDetection())
    
    expect(result.current.isIOS).toBe(true)
    expect(result.current.isAndroid).toBe(false)
  })

  it('should detect Android devices', () => {
    mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G973F)'
    
    const { result } = renderHook(() => useMobileDetection())
    
    expect(result.current.isAndroid).toBe(true)
    expect(result.current.isIOS).toBe(false)
  })

  it('should detect touch devices', () => {
    mockNavigator.maxTouchPoints = 5
    // Mock touch events
    global.window = {
      ...mockWindow,
      ontouchstart: {},
    } as any
    
    const { result } = renderHook(() => useMobileDetection())
    
    expect(result.current.isTouchDevice).toBe(true)
  })

  it('should detect orientation', () => {
    // Portrait
    mockWindow.innerWidth = 375
    mockWindow.innerHeight = 667
    
    const { result } = renderHook(() => useMobileDetection())
    
    expect(result.current.orientation).toBe('portrait')
    
    // Landscape
    mockWindow.innerWidth = 667
    mockWindow.innerHeight = 375
    
    const { rerender } = renderHook(() => useMobileDetection())
    rerender()
    
    expect(result.current.orientation).toBe('landscape')
  })

  it('should detect low-end devices', () => {
    mockNavigator.hardwareConcurrency = 2
    mockNavigator.deviceMemory = 1
    mockNavigator.connection = { effectiveType: 'slow-2g' }
    
    const { result } = renderHook(() => useMobileDetection({
      enablePerformanceDetection: true
    }))
    
    expect(result.current.isLowEndDevice).toBe(true)
  })

  it('should use custom breakpoints', () => {
    mockWindow.innerWidth = 640
    
    const { result } = renderHook(() => useMobileDetection({
      mobileBreakpoint: 640,
      tabletBreakpoint: 1024
    }))
    
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
  })

  it('should handle resize events', () => {
    const { result } = renderHook(() => useMobileDetection())
    
    // Initial state
    expect(result.current.isMobile).toBe(false)
    
    // Simulate resize to mobile
    act(() => {
      mockWindow.innerWidth = 375
      mockWindow.innerHeight = 667
      const resizeHandler = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1]
      if (resizeHandler) resizeHandler()
    })
    
    expect(result.current.isMobile).toBe(true)
  })

  it('should handle server-side rendering', () => {
    // Temporarily remove window
    const originalWindow = global.window
    delete (global as any).window
    
    const { result } = renderHook(() => useMobileDetection())
    
    // Should return safe defaults
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTouchDevice).toBe(false)
    expect(result.current.viewportWidth).toBe(1024)
    expect(result.current.viewportHeight).toBe(768)
    
    // Restore window
    global.window = originalWindow
  })
})

describe('useIsMobile', () => {
  it('should return mobile status', () => {
    mockWindow.innerWidth = 375
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should use custom breakpoint', () => {
    mockWindow.innerWidth = 600
    
    const { result } = renderHook(() => useIsMobile(640))
    
    expect(result.current).toBe(true)
  })
})

describe('useIsTouchDevice', () => {
  it('should return touch device status', () => {
    mockNavigator.maxTouchPoints = 5
    
    const { result } = renderHook(() => useIsTouchDevice())
    
    expect(result.current).toBe(true)
  })
})

describe('useOrientation', () => {
  it('should return current orientation', () => {
    mockWindow.innerWidth = 375
    mockWindow.innerHeight = 667
    
    const { result } = renderHook(() => useOrientation())
    
    expect(result.current).toBe('portrait')
  })
})

describe('useDeviceCapabilities', () => {
  it('should return performance recommendations for desktop', () => {
    mockWindow.innerWidth = 1920
    mockWindow.innerHeight = 1080
    mockNavigator.hardwareConcurrency = 8
    mockNavigator.deviceMemory = 8
    
    const { result } = renderHook(() => useDeviceCapabilities())
    
    expect(result.current.shouldReduceAnimations).toBe(false)
    expect(result.current.shouldPreloadImages).toBe(true)
    expect(result.current.optimalImageQuality).toBe('high')
    expect(result.current.recommendedPageSize).toBe(50)
  })

  it('should return performance recommendations for mobile', () => {
    mockWindow.innerWidth = 375
    mockWindow.innerHeight = 667
    mockNavigator.hardwareConcurrency = 4
    mockNavigator.deviceMemory = 4
    
    const { result } = renderHook(() => useDeviceCapabilities())
    
    expect(result.current.shouldUseLazyLoading).toBe(true)
    expect(result.current.optimalImageQuality).toBe('medium')
    expect(result.current.recommendedPageSize).toBe(20)
  })

  it('should return performance recommendations for low-end devices', () => {
    mockWindow.innerWidth = 375
    mockWindow.innerHeight = 667
    mockNavigator.hardwareConcurrency = 2
    mockNavigator.deviceMemory = 1
    
    const { result } = renderHook(() => useDeviceCapabilities())
    
    expect(result.current.shouldReduceAnimations).toBe(true)
    expect(result.current.shouldUseLazyLoading).toBe(true)
    expect(result.current.optimalImageQuality).toBe('low')
    expect(result.current.recommendedPageSize).toBe(10)
  })
})