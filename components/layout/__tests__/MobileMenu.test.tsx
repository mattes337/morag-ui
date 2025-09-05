// MobileMenu.test.tsx - Test mobile menu component
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileMenu } from '../MobileMenu'
import { mockNavigation } from '../mockData'

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
})