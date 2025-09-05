// Sidebar.test.tsx - Test sidebar navigation component
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '../Sidebar'
import { mockNavigation } from '../mockData'

describe('Sidebar', () => {
  const defaultProps = {
    navigation: mockNavigation,
    currentPath: '/',
    className: 'test-class',
  }

  it('should render sidebar content', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    expect(screen.getByText('MoRAG')).toBeInTheDocument()
  })

  it('should render navigation items', () => {
    render(<Sidebar {...defaultProps} />)
    
    // Check for dashboard item
    expect(screen.getByTestId('nav-item-dashboard')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    
    // Check for documents item with badge
    expect(screen.getByTestId('nav-item-documents')).toBeInTheDocument()
    expect(screen.getByTestId('nav-badge-documents')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('should render sub-navigation items', () => {
    render(<Sidebar {...defaultProps} />)
    
    // Check for documents sub-items
    expect(screen.getByTestId('nav-subitem-recent')).toBeInTheDocument()
    expect(screen.getByText('Recent')).toBeInTheDocument()
    
    expect(screen.getByTestId('nav-subitem-uploaded')).toBeInTheDocument()
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    
    expect(screen.getByTestId('nav-subitem-shared')).toBeInTheDocument()
    expect(screen.getByText('Shared')).toBeInTheDocument()
  })

  it('should highlight active navigation item', () => {
    render(<Sidebar {...defaultProps} currentPath="/" />)
    
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveClass('bg-primary text-primary-foreground')
  })

  it('should highlight non-active navigation items correctly', () => {
    render(<Sidebar {...defaultProps} currentPath="/other" />)
    
    const searchLink = screen.getByText('Search').closest('a')
    expect(searchLink).toHaveClass('text-muted-foreground hover:bg-accent hover:text-accent-foreground')
  })

  it('should apply custom className', () => {
    render(<Sidebar {...defaultProps} className="custom-sidebar-class" />)
    
    const sidebar = screen.getByTestId('sidebar-content')
    expect(sidebar).toHaveClass('custom-sidebar-class')
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

    render(<Sidebar {...defaultProps} navigation={navigationWithoutBadge} />)
    
    expect(screen.getByTestId('nav-item-test')).toBeInTheDocument()
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.queryByTestId('nav-badge-test')).not.toBeInTheDocument()
  })

  it('should render navigation items without children', () => {
    const navigationWithoutChildren = [
      {
        id: 'simple',
        name: 'Simple Item',
        href: '/simple',
        icon: 'simple-icon',
      }
    ]

    render(<Sidebar {...defaultProps} navigation={navigationWithoutChildren} />)
    
    expect(screen.getByTestId('nav-item-simple')).toBeInTheDocument()
    expect(screen.getByText('Simple Item')).toBeInTheDocument()
    expect(screen.queryByTestId('nav-subitem-simple')).not.toBeInTheDocument()
  })

  it('should have proper ARIA structure', () => {
    render(<Sidebar {...defaultProps} />)
    
    const navigationLists = screen.getAllByRole('list')
    expect(navigationLists.length).toBeGreaterThan(0)
  })
})