/**
 * Tests for TabBarNavigation component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { TabBarNavigation, createDefaultTabs } from '../TabBarNavigation'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
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

const mockTabs = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: <div data-testid="dashboard-icon">📊</div>,
  },
  {
    id: 'documents',
    name: 'Documents',
    href: '/documents',
    icon: <div data-testid="documents-icon">📄</div>,
    badge: 5,
  },
  {
    id: 'search',
    name: 'Search',
    href: '/search',
    icon: <div data-testid="search-icon">🔍</div>,
    isActive: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    href: '/settings',
    icon: <div data-testid="settings-icon">⚙️</div>,
    disabled: true,
  },
]

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  ;(usePathname as jest.Mock).mockReturnValue('/search')
  ;(useMobileDetection as jest.Mock).mockReturnValue(mockMobileDevice)
  
  // Mock navigator.vibrate
  global.navigator.vibrate = jest.fn()
})

describe('TabBarNavigation', () => {
  it('should render on mobile devices', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Main navigation')
  })

  it('should not render on desktop devices', () => {
    ;(useMobileDetection as jest.Mock).mockReturnValue(mockDesktopDevice)
    
    render(<TabBarNavigation tabs={mockTabs} />)
    
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('should not render when no tabs provided', () => {
    render(<TabBarNavigation tabs={[]} />)
    
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('should render all tabs with correct content', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    expect(screen.getByTestId('tab-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('tab-documents')).toBeInTheDocument()
    expect(screen.getByTestId('tab-search')).toBeInTheDocument()
    expect(screen.getByTestId('tab-settings')).toBeInTheDocument()
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should show badges correctly', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('5')).toHaveClass('bg-destructive')
  })

  it('should handle large badge numbers', () => {
    const tabsWithLargeBadge = [
      {
        id: 'notifications',
        name: 'Notifications',
        href: '/notifications',
        icon: <div>🔔</div>,
        badge: 150,
      }
    ]
    
    render(<TabBarNavigation tabs={tabsWithLargeBadge} />)
    
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('should highlight active tab', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    const searchTab = screen.getByTestId('tab-search')
    expect(searchTab).toHaveClass('text-primary', 'bg-primary/10')
  })

  it('should highlight tab based on current path', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    
    render(<TabBarNavigation tabs={mockTabs} />)
    
    const dashboardTab = screen.getByTestId('tab-dashboard')
    expect(dashboardTab).toHaveClass('text-primary', 'bg-primary/10')
  })

  it('should disable tabs when specified', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    const settingsTab = screen.getByTestId('tab-settings')
    expect(settingsTab).toBeDisabled()
    expect(settingsTab).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('should navigate on tab click', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    const dashboardTab = screen.getByTestId('tab-dashboard')
    fireEvent.click(dashboardTab)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
  })

  it('should navigate on touch start', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    const documentsTab = screen.getByTestId('tab-documents')
    fireEvent.touchStart(documentsTab)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/documents')
  })

  it('should not navigate disabled tabs', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    const settingsTab = screen.getByTestId('tab-settings')
    fireEvent.click(settingsTab)
    
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('should trigger haptic feedback when enabled', () => {
    render(<TabBarNavigation tabs={mockTabs} enableHaptics={true} />)
    
    const dashboardTab = screen.getByTestId('tab-dashboard')
    fireEvent.touchStart(dashboardTab)
    
    expect(navigator.vibrate).toHaveBeenCalledWith([10])
  })

  it('should not trigger haptic feedback when disabled', () => {
    render(<TabBarNavigation tabs={mockTabs} enableHaptics={false} />)
    
    const dashboardTab = screen.getByTestId('tab-dashboard')
    fireEvent.touchStart(dashboardTab)
    
    expect(navigator.vibrate).not.toHaveBeenCalled()
  })

  it('should handle tab overflow correctly', () => {
    const manyTabs = Array.from({ length: 8 }, (_, i) => ({
      id: `tab-${i}`,
      name: `Tab ${i}`,
      href: `/tab-${i}`,
      icon: <div>🔖</div>,
    }))
    
    render(<TabBarNavigation tabs={manyTabs} maxTabs={5} />)
    
    // Should show 5 tabs plus overflow indicator
    expect(screen.getAllByRole('tab')).toHaveLength(5)
    expect(screen.getByTestId('tab-overflow')).toBeInTheDocument()
    expect(screen.getByText('More')).toBeInTheDocument()
  })

  it('should hide/show based on scroll when enabled', async () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    })
    
    render(<TabBarNavigation tabs={mockTabs} hideOnScroll={true} />)
    
    const tabBar = screen.getByRole('tablist')
    expect(tabBar).toHaveClass('translate-y-0')
    
    // Simulate scroll down
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 150,
    })
    
    fireEvent.scroll(window)
    
    await waitFor(() => {
      expect(tabBar).toHaveClass('translate-y-full')
    })
  })

  it('should have proper accessibility attributes', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    const tabList = screen.getByRole('tablist')
    expect(tabList).toHaveAttribute('aria-label', 'Main navigation')
    
    const tabs = screen.getAllByRole('tab')
    tabs.forEach((tab, index) => {
      expect(tab).toHaveAttribute('aria-selected')
      expect(tab).toHaveAttribute('aria-controls', `panel-${mockTabs[index].id}`)
    })
  })

  it('should have proper touch target sizes', () => {
    render(<TabBarNavigation tabs={mockTabs} />)
    
    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveClass('min-w-[44px]', 'min-h-[44px]')
    })
  })

  it('should reduce animations on low-end devices', () => {
    ;(useMobileDetection as jest.Mock).mockReturnValue({
      ...mockMobileDevice,
      isLowEndDevice: true,
    })
    
    render(<TabBarNavigation tabs={mockTabs} />)
    
    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveClass('transition-none')
    })
  })
})

describe('createDefaultTabs', () => {
  it('should create default navigation tabs', () => {
    const tabs = createDefaultTabs()
    
    expect(tabs).toHaveLength(5)
    expect(tabs[0]).toMatchObject({
      id: 'dashboard',
      name: 'Dashboard',
      href: '/dashboard',
    })
    expect(tabs[1]).toMatchObject({
      id: 'documents',
      name: 'Documents',
      href: '/documents',
    })
    expect(tabs[2]).toMatchObject({
      id: 'search',
      name: 'Search',
      href: '/search',
    })
    expect(tabs[3]).toMatchObject({
      id: 'jobs',
      name: 'Jobs',
      href: '/jobs',
      badge: 3,
    })
    expect(tabs[4]).toMatchObject({
      id: 'settings',
      name: 'Settings',
      href: '/settings',
    })
  })

  it('should include proper icons', () => {
    const tabs = createDefaultTabs()
    
    tabs.forEach(tab => {
      expect(tab.icon).toBeDefined()
    })
  })
})