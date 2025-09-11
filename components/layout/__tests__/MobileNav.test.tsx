/**
 * Tests for MobileNav wrapper component
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { MobileNav, useMobileNav } from '../MobileNav'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'
import { mockNavigation } from '../mockData'

// Mock mobile detection hook
jest.mock('@/lib/hooks/useMobileDetection', () => ({
  useMobileDetection: jest.fn(),
}))

const mockMobileDevice = {
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  isTouchDevice: true,
  isIOS: false,
  isAndroid: true,
  orientation: 'portrait',
  screenSize: 'small',
  supportsHover: false,
  isLowEndDevice: false,
  viewportWidth: 375,
  viewportHeight: 667,
}

const mockTabletDevice = {
  isMobile: false,
  isTablet: true,
  isDesktop: false,
  isTouchDevice: true,
  isIOS: true,
  isAndroid: false,
  orientation: 'landscape',
  screenSize: 'medium',
  supportsHover: false,
  isLowEndDevice: false,
  viewportWidth: 1024,
  viewportHeight: 768,
}

const mockDesktopDevice = {
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
  viewportWidth: 1920,
  viewportHeight: 1080,
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(useMobileDetection as jest.Mock).mockReturnValue(mockMobileDevice)
})

describe('MobileNav', () => {
  const defaultProps = {
    isDrawerOpen: true,
    onDrawerClose: jest.fn(),
    navigation: mockNavigation,
    currentPath: '/dashboard',
  }

  it('should render mobile menu on mobile devices', () => {
    render(<MobileNav {...defaultProps} />)
    
    expect(screen.getByTestId('mobile-menu-drawer')).toBeInTheDocument()
  })

  it('should render mobile menu on tablet devices', () => {
    ;(useMobileDetection as jest.Mock).mockReturnValue(mockTabletDevice)
    
    render(<MobileNav {...defaultProps} />)
    
    expect(screen.getByTestId('mobile-menu-drawer')).toBeInTheDocument()
  })

  it('should not render on desktop devices', () => {
    ;(useMobileDetection as jest.Mock).mockReturnValue(mockDesktopDevice)
    
    render(<MobileNav {...defaultProps} />)
    
    expect(screen.queryByTestId('mobile-menu-drawer')).not.toBeInTheDocument()
  })

  it('should render tab bar when enabled', () => {
    render(<MobileNav {...defaultProps} showTabBar={true} />)
    
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('should not render tab bar when disabled', () => {
    render(<MobileNav {...defaultProps} showTabBar={false} />)
    
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('should use default tabs when no custom tabs provided', () => {
    render(<MobileNav {...defaultProps} showTabBar={true} />)
    
    // Should render default tabs
    expect(screen.getByTestId('tab-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('tab-documents')).toBeInTheDocument()
    expect(screen.getByTestId('tab-search')).toBeInTheDocument()
    expect(screen.getByTestId('tab-jobs')).toBeInTheDocument()
    expect(screen.getByTestId('tab-settings')).toBeInTheDocument()
  })

  it('should use custom tabs when provided', () => {
    const customTabs = [
      {
        id: 'custom-tab',
        name: 'Custom',
        href: '/custom',
        icon: <div>🔧</div>,
      }
    ]
    
    render(
      <MobileNav 
        {...defaultProps} 
        showTabBar={true} 
        tabBarItems={customTabs}
      />
    )
    
    expect(screen.getByTestId('tab-custom-tab')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('should pass enhanced features props to mobile menu', () => {
    const mockRefresh = jest.fn()
    
    render(
      <MobileNav 
        {...defaultProps} 
        enableAdvancedFeatures={true}
        onRefresh={mockRefresh}
      />
    )
    
    // Should render without errors when advanced features are enabled
    expect(screen.getByTestId('mobile-menu-drawer')).toBeInTheDocument()
  })

  it('should pass className to mobile menu', () => {
    render(<MobileNav {...defaultProps} className="custom-mobile-nav" />)
    
    const drawer = screen.getByTestId('mobile-menu-drawer')
    expect(drawer).toHaveClass('custom-mobile-nav')
  })

  it('should render both drawer and tab bar when both enabled', () => {
    render(
      <MobileNav 
        {...defaultProps} 
        showTabBar={true}
        enableAdvancedFeatures={true}
      />
    )
    
    expect(screen.getByTestId('mobile-menu-drawer')).toBeInTheDocument()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})

describe('useMobileNav hook', () => {
  it('should provide drawer state management', () => {
    const TestComponent = () => {
      const { isDrawerOpen, openDrawer, closeDrawer, toggleDrawer } = useMobileNav()
      
      return (
        <div>
          <span data-testid="drawer-state">{isDrawerOpen ? 'open' : 'closed'}</span>
          <button data-testid="open-btn" onClick={openDrawer}>Open</button>
          <button data-testid="close-btn" onClick={closeDrawer}>Close</button>
          <button data-testid="toggle-btn" onClick={toggleDrawer}>Toggle</button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed')
    
    // Test open
    act(() => {
      screen.getByTestId('open-btn').click()
    })
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('open')
    
    // Test close
    act(() => {
      screen.getByTestId('close-btn').click()
    })
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed')
    
    // Test toggle
    act(() => {
      screen.getByTestId('toggle-btn').click()
    })
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('open')
    
    act(() => {
      screen.getByTestId('toggle-btn').click()
    })
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed')
  })

  it('should provide device information', () => {
    const TestComponent = () => {
      const { isMobile, isTablet, deviceInfo } = useMobileNav()
      
      return (
        <div>
          <span data-testid="is-mobile">{isMobile ? 'true' : 'false'}</span>
          <span data-testid="is-tablet">{isTablet ? 'true' : 'false'}</span>
          <span data-testid="device-width">{deviceInfo.viewportWidth}</span>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('is-mobile')).toHaveTextContent('true')
    expect(screen.getByTestId('is-tablet')).toHaveTextContent('false')
    expect(screen.getByTestId('device-width')).toHaveTextContent('375')
  })

  it('should auto-close drawer when switching to desktop', () => {
    let mockDevice = mockMobileDevice
    ;(useMobileDetection as jest.Mock).mockImplementation(() => mockDevice)
    
    const TestComponent = () => {
      const { isDrawerOpen, openDrawer } = useMobileNav()
      
      return (
        <div>
          <span data-testid="drawer-state">{isDrawerOpen ? 'open' : 'closed'}</span>
          <button data-testid="open-btn" onClick={openDrawer}>Open</button>
        </div>
      )
    }
    
    const { rerender } = render(<TestComponent />)
    
    // Open drawer on mobile
    act(() => {
      screen.getByTestId('open-btn').click()
    })
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('open')
    
    // Switch to desktop
    mockDevice = mockDesktopDevice
    
    rerender(<TestComponent />)
    
    // Drawer should auto-close
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed')
  })

  it('should keep drawer open when switching from mobile to tablet', () => {
    let mockDevice = mockMobileDevice
    ;(useMobileDetection as jest.Mock).mockImplementation(() => mockDevice)
    
    const TestComponent = () => {
      const { isDrawerOpen, openDrawer } = useMobileNav()
      
      return (
        <div>
          <span data-testid="drawer-state">{isDrawerOpen ? 'open' : 'closed'}</span>
          <button data-testid="open-btn" onClick={openDrawer}>Open</button>
        </div>
      )
    }
    
    const { rerender } = render(<TestComponent />)
    
    // Open drawer on mobile
    act(() => {
      screen.getByTestId('open-btn').click()
    })
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('open')
    
    // Switch to tablet
    mockDevice = mockTabletDevice
    
    rerender(<TestComponent />)
    
    // Drawer should remain open
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('open')
  })
})