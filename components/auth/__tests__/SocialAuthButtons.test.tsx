import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SocialAuthButtons } from '../SocialAuthButtons'

describe('SocialAuthButtons', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<SocialAuthButtons />)
      
      expect(screen.getByTestId('social-auth-buttons')).toBeInTheDocument()
    })

    it('should render all supported providers by default', () => {
      render(<SocialAuthButtons />)
      
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /microsoft/i })).toBeInTheDocument()
    })

    it('should render only specified providers when providers prop is given', () => {
      render(<SocialAuthButtons providers={['google', 'github']} />)
      
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /microsoft/i })).not.toBeInTheDocument()
    })

    it('should not render when providers array is empty', () => {
      render(<SocialAuthButtons providers={[]} />)
      
      expect(screen.queryByTestId('social-auth-buttons')).not.toBeInTheDocument()
    })
  })

  describe('button interactions', () => {
    it('should call onProviderClick when Google button is clicked', () => {
      const mockOnClick = jest.fn()
      render(<SocialAuthButtons onProviderClick={mockOnClick} />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      fireEvent.click(googleButton)
      
      expect(mockOnClick).toHaveBeenCalledWith('google')
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should call onProviderClick when GitHub button is clicked', () => {
      const mockOnClick = jest.fn()
      render(<SocialAuthButtons onProviderClick={mockOnClick} />)
      
      const githubButton = screen.getByRole('button', { name: /github/i })
      fireEvent.click(githubButton)
      
      expect(mockOnClick).toHaveBeenCalledWith('github')
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should call onProviderClick when Microsoft button is clicked', () => {
      const mockOnClick = jest.fn()
      render(<SocialAuthButtons onProviderClick={mockOnClick} />)
      
      const microsoftButton = screen.getByRole('button', { name: /microsoft/i })
      fireEvent.click(microsoftButton)
      
      expect(mockOnClick).toHaveBeenCalledWith('microsoft')
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should not throw error when onProviderClick is not provided', () => {
      render(<SocialAuthButtons />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      
      expect(() => {
        fireEvent.click(googleButton)
      }).not.toThrow()
    })
  })

  describe('loading state', () => {
    it('should disable all buttons when loading', () => {
      render(<SocialAuthButtons loading={true} />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      const githubButton = screen.getByRole('button', { name: /github/i })
      const microsoftButton = screen.getByRole('button', { name: /microsoft/i })
      
      expect(googleButton).toBeDisabled()
      expect(githubButton).toBeDisabled()
      expect(microsoftButton).toBeDisabled()
    })

    it('should show loading spinner when loading', () => {
      render(<SocialAuthButtons loading={true} />)
      
      expect(screen.getAllByTestId('loading-spinner')).toHaveLength(3) // One per button
    })

    it('should not call onProviderClick when button is clicked in loading state', () => {
      const mockOnClick = jest.fn()
      render(<SocialAuthButtons loading={true} onProviderClick={mockOnClick} />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      fireEvent.click(googleButton)
      
      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<SocialAuthButtons disabled={true} />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      const githubButton = screen.getByRole('button', { name: /github/i })
      const microsoftButton = screen.getByRole('button', { name: /microsoft/i })
      
      expect(googleButton).toBeDisabled()
      expect(githubButton).toBeDisabled()
      expect(microsoftButton).toBeDisabled()
    })

    it('should not call onProviderClick when button is clicked in disabled state', () => {
      const mockOnClick = jest.fn()
      render(<SocialAuthButtons disabled={true} onProviderClick={mockOnClick} />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      fireEvent.click(googleButton)
      
      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })

  describe('styling and layout', () => {
    it('should apply custom className', () => {
      render(<SocialAuthButtons className="custom-class" />)
      
      const container = screen.getByTestId('social-auth-buttons')
      expect(container).toHaveClass('custom-class')
    })

    it('should render buttons in horizontal layout by default', () => {
      render(<SocialAuthButtons />)
      
      const container = screen.getByTestId('social-auth-buttons')
      expect(container).toHaveClass('flex-row')
    })

    it('should render buttons in vertical layout when specified', () => {
      render(<SocialAuthButtons layout="vertical" />)
      
      const container = screen.getByTestId('social-auth-buttons')
      expect(container).toHaveClass('flex-col')
    })

    it('should apply correct size classes for small size', () => {
      render(<SocialAuthButtons size="small" />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      expect(googleButton).toHaveClass('h-8', 'text-xs')
    })

    it('should apply correct size classes for medium size', () => {
      render(<SocialAuthButtons size="medium" />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      expect(googleButton).toHaveClass('h-10', 'text-sm')
    })

    it('should apply correct size classes for large size', () => {
      render(<SocialAuthButtons size="large" />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      expect(googleButton).toHaveClass('h-12', 'text-base')
    })
  })

  describe('icons and branding', () => {
    it('should display Google icon in Google button', () => {
      render(<SocialAuthButtons />)
      
      expect(screen.getByTestId('google-icon')).toBeInTheDocument()
    })

    it('should display GitHub icon in GitHub button', () => {
      render(<SocialAuthButtons />)
      
      expect(screen.getByTestId('github-icon')).toBeInTheDocument()
    })

    it('should display Microsoft icon in Microsoft button', () => {
      render(<SocialAuthButtons />)
      
      expect(screen.getByTestId('microsoft-icon')).toBeInTheDocument()
    })

    it('should use correct brand colors for Google button', () => {
      render(<SocialAuthButtons />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      expect(googleButton).toHaveClass('border-red-300', 'hover:bg-red-50')
    })

    it('should use correct brand colors for GitHub button', () => {
      render(<SocialAuthButtons />)
      
      const githubButton = screen.getByRole('button', { name: /github/i })
      expect(githubButton).toHaveClass('border-gray-300', 'hover:bg-gray-50')
    })

    it('should use correct brand colors for Microsoft button', () => {
      render(<SocialAuthButtons />)
      
      const microsoftButton = screen.getByRole('button', { name: /microsoft/i })
      expect(microsoftButton).toHaveClass('border-blue-300', 'hover:bg-blue-50')
    })
  })

  describe('accessibility', () => {
    it('should have proper button roles', () => {
      render(<SocialAuthButtons />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
    })

    it('should have descriptive aria-labels', () => {
      render(<SocialAuthButtons />)
      
      expect(screen.getByLabelText('Sign in with Google')).toBeInTheDocument()
      expect(screen.getByLabelText('Sign in with GitHub')).toBeInTheDocument()
      expect(screen.getByLabelText('Sign in with Microsoft')).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      const mockOnClick = jest.fn()
      render(<SocialAuthButtons onProviderClick={mockOnClick} />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      googleButton.focus()
      fireEvent.keyDown(googleButton, { key: 'Enter' })
      
      expect(mockOnClick).toHaveBeenCalledWith('google')
    })

    it('should support tab navigation', () => {
      render(<SocialAuthButtons />)
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      const githubButton = screen.getByRole('button', { name: /github/i })
      
      expect(googleButton).toHaveAttribute('tabIndex', '0')
      expect(githubButton).toHaveAttribute('tabIndex', '0')
    })

    it('should announce loading state to screen readers', () => {
      render(<SocialAuthButtons loading={true} />)
      
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should handle invalid provider gracefully', () => {
      const mockOnClick = jest.fn()
      
      expect(() => {
        render(<SocialAuthButtons providers={['invalid' as any]} onProviderClick={mockOnClick} />)
      }).not.toThrow()
    })

    it('should filter out unsupported providers', () => {
      render(<SocialAuthButtons providers={['google', 'unsupported' as any]} />)
      
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /unsupported/i })).not.toBeInTheDocument()
    })
  })

  describe('text customization', () => {
    it('should show "Sign in with" text by default', () => {
      render(<SocialAuthButtons />)
      
      expect(screen.getByText(/sign in with google/i)).toBeInTheDocument()
    })

    it('should show "Sign up with" text when specified', () => {
      render(<SocialAuthButtons buttonText="Sign up with" />)
      
      expect(screen.getByText(/sign up with google/i)).toBeInTheDocument()
    })

    it('should show custom text when specified', () => {
      render(<SocialAuthButtons buttonText="Continue with" />)
      
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
    })

    it('should show icon only when showText is false', () => {
      render(<SocialAuthButtons showText={false} />)
      
      expect(screen.queryByText(/sign in with google/i)).not.toBeInTheDocument()
      expect(screen.getByTestId('google-icon')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty providers array', () => {
      render(<SocialAuthButtons providers={[]} />)
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should handle duplicate providers', () => {
      render(<SocialAuthButtons providers={['google', 'google', 'github']} />)
      
      const googleButtons = screen.getAllByRole('button', { name: /google/i })
      const githubButtons = screen.getAllByRole('button', { name: /github/i })
      
      expect(googleButtons).toHaveLength(1)
      expect(githubButtons).toHaveLength(1)
    })

    it('should maintain provider order', () => {
      render(<SocialAuthButtons providers={['github', 'google', 'microsoft']} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toHaveTextContent(/github/i)
      expect(buttons[1]).toHaveTextContent(/google/i)
      expect(buttons[2]).toHaveTextContent(/microsoft/i)
    })
  })
})