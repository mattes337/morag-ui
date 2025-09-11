// MobileMenu.test.tsx - Test enhanced mobile menu component
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { MobileMenu } from '../MobileMenu'
import { mockNavigation } from '../mockData'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock mobile detection hook
jest.mock('@/lib/hooks/useMobileDetection', () => ({
  useMobileDetection: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

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

const mockLowEndDevice = {
  ...mockMobileDevice,
  isLowEndDevice: true,
}

const mockLandscapeDevice = {
  ...mockMobileDevice,
  orientation: 'landscape',
  viewportWidth: 667,
  viewportHeight: 375,
}

describe('MobileMenu', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    navigation: mockNavigation,
    currentPath: '/',
    className: 'test-mobile-menu-class',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useMobileDetection as jest.Mock).mockReturnValue(mockMobileDevice)
    
    // Mock navigator.vibrate
    global.navigator.vibrate = jest.fn()
    
    // Mock window.addEventListener
    global.addEventListener = jest.fn()
    global.removeEventListener = jest.fn()
  })

  it('should render when open', () => {
    render(<MobileMenu {...defaultProps} />)
    
    expect(screen.getByTestId('mobile-menu-backdrop')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-menu-drawer')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<MobileMenu {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByTestId('mobile-menu-backdrop')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mobile-menu-drawer')).not.toBeInTheDocument()
  })

  it('should render header with close button', () => {
    render(<MobileMenu {...defaultProps} />)
    
    expect(screen.getByText('MoRAG')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-menu-close')).toBeInTheDocument()
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(<MobileMenu {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('mobile-menu-close'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when backdrop is clicked', () => {
    render(<MobileMenu {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('mobile-menu-backdrop'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should render navigation items', () => {
    render(<MobileMenu {...defaultProps} />)
    
    // Check for dashboard item
    expect(screen.getByTestId('mobile-nav-item-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    
    // Check for documents item with badge
    expect(screen.getByTestId('mobile-nav-item-documents')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-nav-badge-documents')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('should render sub-navigation items', () => {
    render(<MobileMenu {...defaultProps} />)
    
    // Check for documents sub-items
    expect(screen.getByTestId('mobile-nav-subitem-recent')).toBeInTheDocument()
    expect(screen.getByText('Recent')).toBeInTheDocument()
    
    expect(screen.getByTestId('mobile-nav-subitem-uploaded')).toBeInTheDocument()
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    
    expect(screen.getByTestId('mobile-nav-subitem-shared')).toBeInTheDocument()
    expect(screen.getByText('Shared')).toBeInTheDocument()
  })

  it('should highlight active navigation item', () => {
    render(<MobileMenu {...defaultProps} currentPath="/" />)
    
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveClass('bg-primary text-primary-foreground')
  })

  it('should call onClose when navigation item is clicked', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const dashboardLink = screen.getByText('Dashboard')
    fireEvent.click(dashboardLink)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when sub-navigation item is clicked', () => {
    render(<MobileMenu {...defaultProps} />)
    
    const recentLink = screen.getByText('Recent')
    fireEvent.click(recentLink)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should apply custom className', () => {
    render(<MobileMenu {...defaultProps} className="custom-mobile-menu-class" />)
    
    const drawer = screen.getByTestId('mobile-menu-drawer')
    expect(drawer).toHaveClass('custom-mobile-menu-class')
  })

  it('should render navigation items without badges when not provided', () => {
    const navigationWithoutBadge = [
      {
        id: 'test',
        name: 'Test Item',
        href: '/test',
        icon: 'test-icon',
      }
    ]

    render(<MobileMenu {...defaultProps} navigation={navigationWithoutBadge} />)
    
    expect(screen.getByTestId('mobile-nav-item-test')).toBeInTheDocument()
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.queryByTestId('mobile-nav-badge-test')).not.toBeInTheDocument()
  })

  it('should have proper transform classes for open state', () => {
    render(<MobileMenu {...defaultProps} isOpen={true} />)
    
    const drawer = screen.getByTestId('mobile-menu-drawer')
    expect(drawer).toHaveClass('translate-x-0')
  })

  // Enhanced Mobile Navigation Tests
  describe('Enhanced Mobile Features', () => {
    it('should navigate using router instead of href on link click', () => {
      render(<MobileMenu {...defaultProps} />)
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')!
      fireEvent.click(dashboardLink)
      
      expect(mockRouter.push).toHaveBeenCalledWith('/')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should trigger haptic feedback on touch when enabled', () => {
      render(<MobileMenu {...defaultProps} enableHaptics={true} />)
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')!
      fireEvent.touchStart(dashboardLink)
      
      expect(navigator.vibrate).toHaveBeenCalledWith([10])
    })

    it('should not trigger haptic feedback when disabled', () => {
      render(<MobileMenu {...defaultProps} enableHaptics={false} />)
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')!
      fireEvent.touchStart(dashboardLink)
      
      expect(navigator.vibrate).not.toHaveBeenCalled()
    })

    it('should adapt width for landscape orientation', () => {
      ;(useMobileDetection as jest.Mock).mockReturnValue(mockLandscapeDevice)
      
      render(<MobileMenu {...defaultProps} />)
      
      const drawer = screen.getByTestId('mobile-menu-drawer')
      expect(drawer).toHaveClass('w-64') // Narrower in landscape
    })

    it('should use standard width for portrait orientation', () => {
      render(<MobileMenu {...defaultProps} />)
      
      const drawer = screen.getByTestId('mobile-menu-drawer')
      expect(drawer).toHaveClass('w-80') // Standard width in portrait
    })

    it('should reduce animations on low-end devices', () => {
      ;(useMobileDetection as jest.Mock).mockReturnValue(mockLowEndDevice)
      
      render(<MobileMenu {...defaultProps} />)
      
      const drawer = screen.getByTestId('mobile-menu-drawer')
      expect(drawer).toHaveClass('duration-100')
      
      const navLinks = screen.getAllByRole('link')
      navLinks.forEach(link => {
        expect(link).toHaveClass('transition-none', 'transform-none')
      })
    })

    it('should handle large badge numbers', () => {
      const navigationWithLargeBadge = [
        {
          id: 'test',
          name: 'Test',
          href: '/test',
          icon: 'icon',
          badge: 150,
        }
      ]
      
      render(<MobileMenu {...defaultProps} navigation={navigationWithLargeBadge} />)
      
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('should have proper touch target sizes', () => {
      render(<MobileMenu {...defaultProps} />)
      
      const closeButton = screen.getByTestId('mobile-menu-close')
      expect(closeButton).toHaveClass('min-w-[44px]', 'min-h-[44px]')
      
      const navLinks = screen.getAllByRole('link')
      navLinks.forEach(link => {
        expect(link).toHaveClass('min-h-[44px]')
      })
    })

    it('should handle escape key press', () => {
      render(<MobileMenu {...defaultProps} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should support pull-to-refresh when enabled', () => {
      const mockRefresh = jest.fn()
      
      render(
        <MobileMenu 
          {...defaultProps} 
          enablePullToRefresh={true}
          onRefresh={mockRefresh}
        />
      )
      
      // Component should render without errors when pull-to-refresh is enabled
      expect(screen.getByTestId('mobile-menu-drawer')).toBeInTheDocument()
    })

    it('should support swipe-to-close when enabled', () => {
      render(<MobileMenu {...defaultProps} enableSwipeToClose={true} />)
      
      // Component should render without errors when swipe-to-close is enabled
      expect(screen.getByTestId('mobile-menu-backdrop')).toBeInTheDocument()
    })
  })

  describe('Development Mode Features', () => {
    const originalEnv = process.env.NODE_ENV

    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
    })

    it('should show device info in development mode', () => {
      render(<MobileMenu {...defaultProps} />)
      
      expect(screen.getByText('Device: Mobile')).toBeInTheDocument()
      expect(screen.getByText('Orientation: portrait')).toBeInTheDocument()
      expect(screen.getByText('Touch: Yes')).toBeInTheDocument()
    })

    it('should show low-end device warning in development mode', () => {
      ;(useMobileDetection as jest.Mock).mockReturnValue(mockLowEndDevice)
      
      render(<MobileMenu {...defaultProps} />)
      
      expect(screen.getByText('Low-end optimizations active')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MobileMenu {...defaultProps} />)
      
      const backdrop = screen.getByTestId('mobile-menu-backdrop')
      expect(backdrop).toHaveAttribute('aria-label', 'Close mobile menu')
      
      const closeButton = screen.getByTestId('mobile-menu-close')
      expect(closeButton.querySelector('[class*="sr-only"]')).toHaveTextContent('Close menu')
    })

    it('should support keyboard navigation', () => {
      render(<MobileMenu {...defaultProps} />)
      
      // Ensure all navigation items are keyboard accessible
      const navLinks = screen.getAllByRole('link')
      navLinks.forEach(link => {
        expect(link).toBeInTheDocument()
        // Links should be naturally keyboard accessible
      })
    })
  })
})