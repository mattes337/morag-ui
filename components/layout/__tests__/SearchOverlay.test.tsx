// SearchOverlay.test.tsx - Test search overlay component
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchOverlay } from '../SearchOverlay'

describe('SearchOverlay', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSearch: jest.fn(),
    className: 'test-search-overlay-class',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render when open', () => {
    render(<SearchOverlay {...defaultProps} />)
    
    expect(screen.getByTestId('search-overlay-backdrop')).toBeInTheDocument()
    expect(screen.getByTestId('search-overlay-dialog')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<SearchOverlay {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByTestId('search-overlay-backdrop')).not.toBeInTheDocument()
    expect(screen.queryByTestId('search-overlay-dialog')).not.toBeInTheDocument()
  })

  it('should render search input', () => {
    render(<SearchOverlay {...defaultProps} />)
    
    const input = screen.getByTestId('search-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Search documents, realms, users...')
  })

  it('should render search buttons', () => {
    render(<SearchOverlay {...defaultProps} />)
    
    expect(screen.getByTestId('search-submit')).toBeInTheDocument()
    expect(screen.getByTestId('search-cancel')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should call onClose when backdrop is clicked', () => {
    render(<SearchOverlay {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('search-overlay-backdrop'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when cancel button is clicked', () => {
    render(<SearchOverlay {...defaultProps} />)
    
    fireEvent.click(screen.getByTestId('search-cancel'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should handle text input', async () => {
    const user = userEvent.setup()
    render(<SearchOverlay {...defaultProps} />)
    
    const input = screen.getByTestId('search-input')
    await user.type(input, 'test query')
    
    expect(input).toHaveValue('test query')
  })

  it('should enable submit button when text is entered', async () => {
    const user = userEvent.setup()
    render(<SearchOverlay {...defaultProps} />)
    
    const input = screen.getByTestId('search-input')
    const submitButton = screen.getByTestId('search-submit')
    
    // Initially disabled
    expect(submitButton).toBeDisabled()
    
    // Type some text
    await user.type(input, 'test')
    
    // Should now be enabled
    expect(submitButton).not.toBeDisabled()
  })

  it('should call onSearch and onClose when form is submitted', async () => {
    const user = userEvent.setup()
    render(<SearchOverlay {...defaultProps} />)
    
    const input = screen.getByTestId('search-input')
    const form = input.closest('form')
    
    await user.type(input, 'test search query')
    
    fireEvent.submit(form!)
    
    expect(defaultProps.onSearch).toHaveBeenCalledWith('test search query')
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onSearch and onClose when submit button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchOverlay {...defaultProps} />)
    
    const input = screen.getByTestId('search-input')
    const submitButton = screen.getByTestId('search-submit')
    
    await user.type(input, 'test search query')
    fireEvent.click(submitButton)
    
    expect(defaultProps.onSearch).toHaveBeenCalledWith('test search query')
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should not submit when query is empty', async () => {
    render(<SearchOverlay {...defaultProps} />)
    
    const form = screen.getByTestId('search-input').closest('form')
    
    fireEvent.submit(form!)
    
    expect(defaultProps.onSearch).not.toHaveBeenCalled()
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('should not submit when query contains only whitespace', async () => {
    const user = userEvent.setup()
    render(<SearchOverlay {...defaultProps} />)
    
    const input = screen.getByTestId('search-input')
    const form = input.closest('form')
    
    await user.type(input, '   ')
    fireEvent.submit(form!)
    
    expect(defaultProps.onSearch).not.toHaveBeenCalled()
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('should trim whitespace from search query', async () => {
    const user = userEvent.setup()
    render(<SearchOverlay {...defaultProps} />)
    
    const input = screen.getByTestId('search-input')
    const form = input.closest('form')
    
    await user.type(input, '  test query  ')
    fireEvent.submit(form!)
    
    expect(defaultProps.onSearch).toHaveBeenCalledWith('test query')
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should reset query when overlay opens', () => {
    const { rerender } = render(<SearchOverlay {...defaultProps} isOpen={false} />)
    
    rerender(<SearchOverlay {...defaultProps} isOpen={true} />)
    
    const input = screen.getByTestId('search-input')
    expect(input).toHaveValue('')
  })

  it('should render search hints', () => {
    render(<SearchOverlay {...defaultProps} />)
    
    expect(screen.getByText('Start typing to search across your realms...')).toBeInTheDocument()
    expect(screen.getByText('to search')).toBeInTheDocument()
    expect(screen.getByText('to close')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<SearchOverlay {...defaultProps} className="custom-search-class" />)
    
    const dialog = screen.getByTestId('search-overlay-dialog')
    expect(dialog).toHaveClass('custom-search-class')
  })
})