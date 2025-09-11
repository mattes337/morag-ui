import { render, screen, fireEvent } from '@testing-library/react'
import { GeneralSettings } from './GeneralSettings'

describe('GeneralSettings', () => {
  const mockOnSave = jest.fn()
  const mockOnReset = jest.fn()

  const defaultProps = {
    isSaving: false,
    error: null,
    onSave: mockOnSave,
    onReset: mockOnReset
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all settings sections', () => {
    render(<GeneralSettings {...defaultProps} />)
    
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Language & Region')).toBeInTheDocument()
    expect(screen.getByText('Default Preferences')).toBeInTheDocument()
    expect(screen.getByText('Advanced Options')).toBeInTheDocument()
  })

  it('shows theme options', () => {
    render(<GeneralSettings {...defaultProps} />)
    
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })

  it('shows language selector', () => {
    render(<GeneralSettings {...defaultProps} />)
    
    expect(screen.getByLabelText('Language')).toBeInTheDocument()
  })

  it('shows timezone selector', () => {
    render(<GeneralSettings {...defaultProps} />)
    
    expect(screen.getByLabelText('Timezone')).toBeInTheDocument()
  })

  it('calls onSave when save button is clicked', () => {
    render(<GeneralSettings {...defaultProps} />)
    
    // First need to make a change to enable save button
    const themeRadio = screen.getByRole('radio', { name: /light/i })
    fireEvent.click(themeRadio)
    
    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)
    
    expect(mockOnSave).toHaveBeenCalled()
  })

  it('calls onReset when reset button is clicked', () => {
    render(<GeneralSettings {...defaultProps} />)
    
    const resetButton = screen.getByText('Reset to Defaults')
    fireEvent.click(resetButton)
    
    expect(mockOnReset).toHaveBeenCalled()
  })

  it('shows loading state when isSaving is true', () => {
    render(<GeneralSettings {...defaultProps} isSaving={true} />)
    
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('shows error message when error is provided', () => {
    render(<GeneralSettings {...defaultProps} error="Save failed" />)
    
    expect(screen.getByText('Save failed')).toBeInTheDocument()
  })

  it('enables advanced options when toggle is turned on', () => {
    render(<GeneralSettings {...defaultProps} />)
    
    const advancedToggle = screen.getByLabelText('Show Advanced Options')
    fireEvent.click(advancedToggle)
    
    expect(screen.getByText('Export Config')).toBeInTheDocument()
    expect(screen.getByText('Import Config')).toBeInTheDocument()
  })
})