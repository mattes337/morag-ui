import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsNav } from './SettingsNav'

describe('SettingsNav', () => {
  const mockOnSectionChange = jest.fn()
  const mockOnToggleCollapsed = jest.fn()

  const defaultProps = {
    activeSection: 'general',
    onSectionChange: mockOnSectionChange,
    isMobile: false,
    isCollapsed: false,
    onToggleCollapsed: mockOnToggleCollapsed
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all navigation items', () => {
    render(<SettingsNav {...defaultProps} />)
    
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Integrations')).toBeInTheDocument()
  })

  it('calls onSectionChange when a navigation item is clicked', () => {
    render(<SettingsNav {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Security'))
    
    expect(mockOnSectionChange).toHaveBeenCalledWith('security')
  })

  it('shows active state for current section', () => {
    render(<SettingsNav {...defaultProps} activeSection="security" />)
    
    const securityButton = screen.getByText('Security').closest('button')
    expect(securityButton).toHaveAttribute('aria-current', 'page')
  })

  it('shows mobile toggle button when isMobile is true', () => {
    render(<SettingsNav {...defaultProps} isMobile={true} />)
    
    expect(screen.getByLabelText(/settings menu/i)).toBeInTheDocument()
  })

  it('calls onToggleCollapsed when mobile toggle is clicked', () => {
    render(<SettingsNav {...defaultProps} isMobile={true} />)
    
    fireEvent.click(screen.getByLabelText(/settings menu/i))
    
    expect(mockOnToggleCollapsed).toHaveBeenCalled()
  })

  it('shows badges for items with badge data', () => {
    render(<SettingsNav {...defaultProps} />)
    
    expect(screen.getByText('2FA Enabled')).toBeInTheDocument()
    expect(screen.getByText('3 Active')).toBeInTheDocument()
  })
})