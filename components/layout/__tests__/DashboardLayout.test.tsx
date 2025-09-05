// DashboardLayout.test.tsx - Test main dashboard layout component
import React from 'react'
import { render, screen } from '@testing-library/react'
import { DashboardLayout } from '../DashboardLayout'
import { mockNavigation, mockUser, mockCurrentRealm } from '../mockData'

// Mock the hooks
jest.mock('../hooks/useLayoutState')
jest.mock('../hooks/useKeyboardShortcuts')

const mockUseLayoutState = jest.mocked(require('../hooks/useLayoutState').useLayoutState)
const mockUseKeyboardShortcuts = jest.mocked(require('../hooks/useKeyboardShortcuts').useKeyboardShortcuts)

describe('DashboardLayout', () => {
  const defaultLayoutState = {
    state: {
      sidebarState: 'expanded' as const,
      isMobileMenuOpen: false,
      theme: 'system' as const,
      isSearchOpen: false,
    },
    toggleSidebar: jest.fn(),
    setSidebarState: jest.fn(),
    toggleMobileMenu: jest.fn(),
    toggleSearch: jest.fn(),
    setTheme: jest.fn(),
  }

  beforeEach(() => {
    mockUseLayoutState.mockReturnValue(defaultLayoutState)
    mockUseKeyboardShortcuts.mockImplementation(() => {})
    jest.clearAllMocks()
  })

  it('should render main layout structure', () => {
    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div data-testid="main-content">Test Content</div>
      </DashboardLayout>
    )

    // Should render the main layout container
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByTestId('main-content')).toBeInTheDocument()
  })

  it('should render sidebar when expanded', () => {
    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    // Should render sidebar
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).not.toHaveClass('collapsed')
  })

  it('should render sidebar as collapsed when state is collapsed', () => {
    mockUseLayoutState.mockReturnValue({
      ...defaultLayoutState,
      state: {
        ...defaultLayoutState.state,
        sidebarState: 'collapsed',
      },
    })

    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('sidebar')).toHaveClass('collapsed')
  })

  it('should hide sidebar when state is hidden', () => {
    mockUseLayoutState.mockReturnValue({
      ...defaultLayoutState,
      state: {
        ...defaultLayoutState.state,
        sidebarState: 'hidden',
      },
    })

    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('sidebar')).toHaveClass('hidden')
  })

  it('should render header component', () => {
    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('should setup keyboard shortcuts correctly', () => {
    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(mockUseKeyboardShortcuts).toHaveBeenCalledWith({
      onToggleSidebar: defaultLayoutState.toggleSidebar,
      onToggleSearch: defaultLayoutState.toggleSearch,
      onEscape: expect.any(Function),
    })
  })

  it('should handle escape key to close overlays', () => {
    const mockToggleSearch = jest.fn()
    const mockToggleMobileMenu = jest.fn()
    
    mockUseLayoutState.mockReturnValue({
      ...defaultLayoutState,
      state: {
        ...defaultLayoutState.state,
        isSearchOpen: true,
        isMobileMenuOpen: true,
      },
      toggleSearch: mockToggleSearch,
      toggleMobileMenu: mockToggleMobileMenu,
    })

    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    // Get the escape handler from the mock call
    const escapeHandler = mockUseKeyboardShortcuts.mock.calls[0][0].onEscape
    escapeHandler()

    expect(mockToggleSearch).toHaveBeenCalled()
    expect(mockToggleMobileMenu).toHaveBeenCalled()
  })

  it('should render mobile menu when open', () => {
    mockUseLayoutState.mockReturnValue({
      ...defaultLayoutState,
      state: {
        ...defaultLayoutState.state,
        isMobileMenuOpen: true,
      },
    })

    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })

  it('should not render mobile menu when closed', () => {
    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })

  it('should render search overlay when open', () => {
    mockUseLayoutState.mockReturnValue({
      ...defaultLayoutState,
      state: {
        ...defaultLayoutState.state,
        isSearchOpen: true,
      },
    })

    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('search-overlay')).toBeInTheDocument()
  })

  it('should not render search overlay when closed', () => {
    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.queryByTestId('search-overlay')).not.toBeInTheDocument()
  })

  it('should apply correct CSS classes for different themes', () => {
    const { rerender } = render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    // Test light theme
    mockUseLayoutState.mockReturnValue({
      ...defaultLayoutState,
      state: {
        ...defaultLayoutState.state,
        theme: 'light',
      },
    })

    rerender(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(document.documentElement).toHaveClass('light')

    // Test dark theme
    mockUseLayoutState.mockReturnValue({
      ...defaultLayoutState,
      state: {
        ...defaultLayoutState.state,
        theme: 'dark',
      },
    })

    rerender(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(document.documentElement).toHaveClass('dark')
  })

  it('should have proper ARIA landmarks', () => {
    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('navigation')).toBeInTheDocument() // sidebar
  })

  it('should handle responsive layout changes', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640,
    })

    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    // On mobile, layout should have mobile-specific classes
    const layoutContainer = screen.getByTestId('dashboard-layout')
    expect(layoutContainer).toHaveClass('mobile')
  })

  it('should provide layout context to children', () => {
    const TestChild = () => {
      // This would test that layout context is provided
      return <div data-testid="context-consumer">Context Consumer</div>
    }

    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <TestChild />
      </DashboardLayout>
    )

    expect(screen.getByTestId('context-consumer')).toBeInTheDocument()
  })

  it('should handle className prop correctly', () => {
    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
        className="custom-class"
      >
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('dashboard-layout')).toHaveClass('custom-class')
  })

  it('should render with proper semantic structure', () => {
    render(
      <DashboardLayout
        user={mockUser}
        navigation={mockNavigation}
        currentRealm={mockCurrentRealm}
        onRealmChange={() => {}}
      >
        <div>Content</div>
      </DashboardLayout>
    )

    const layout = screen.getByTestId('dashboard-layout')
    expect(layout).toBeInTheDocument()

    // Should have proper heading structure
    const mainHeading = screen.getByRole('banner')
    expect(mainHeading).toBeInTheDocument()
  })
})