// Header.test.tsx - Test header component
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Header } from '../Header'
import { mockUser, mockCurrentRealm, mockNotifications } from '../mockData'

describe('Header', () => {
  const defaultProps = {
    user: mockUser,
    currentRealm: mockCurrentRealm,
    notifications: mockNotifications,
    unreadCount: 3,
    className: 'test-header-class',
  }

  it('should render header content', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByTestId('header-content')).toBeInTheDocument()
  })

  it('should render mobile menu trigger', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByTestId('mobile-menu-trigger')).toBeInTheDocument()
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('should render search trigger', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByTestId('search-trigger')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('should render notifications with badge', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByTestId('notifications-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('notification-badge')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should not render notification badge when unread count is 0', () => {
    render(<Header {...defaultProps} unreadCount={0} />)
    
    expect(screen.getByTestId('notifications-trigger')).toBeInTheDocument()
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument()
  })

  it('should render realm switcher', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByTestId('realm-switcher')).toBeInTheDocument()
    expect(screen.getByText('Marketing Realm')).toBeInTheDocument()
  })

  it('should not render realm switcher when currentRealm is null', () => {
    render(<Header {...defaultProps} currentRealm={null} />)
    
    expect(screen.queryByTestId('realm-switcher')).not.toBeInTheDocument()
  })

  it('should render user menu', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render theme toggle', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
  })

  it('should render breadcrumbs on desktop', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Header {...defaultProps} className="custom-header-class" />)
    
    const header = screen.getByTestId('header-content')
    expect(header).toHaveClass('custom-header-class')
  })

  it('should handle different unread counts', () => {
    const { rerender } = render(<Header {...defaultProps} unreadCount={1} />)
    
    expect(screen.getByText('1')).toBeInTheDocument()
    
    rerender(<Header {...defaultProps} unreadCount={99} />)
    expect(screen.getByText('99')).toBeInTheDocument()
  })
})