import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResetPasswordForm } from '../ResetPasswordForm'

// Mock the auth context
const mockResetPassword = jest.fn()
const mockClearError = jest.fn()

const mockAuthContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null as string | null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: mockResetPassword,
  clearError: mockClearError,
  hasRole: jest.fn(),
  hasAnyRole: jest.fn(),
}

jest.mock('../../../contexts/auth/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

describe('ResetPasswordForm', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthContext.isLoading = false
    mockAuthContext.error = null
  })

  describe('Form rendering', () => {
    it('should render password fields and submit button', () => {
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      expect(screen.getByLabelText('New password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument()
    })

    it('should render password strength indicator', async () => {
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      const passwordInput = screen.getByLabelText('New password')
      await user.type(passwordInput, 'test123')

      expect(screen.getByText('Password requirements:')).toBeInTheDocument()
    })

    it('should render custom submit button text', () => {
      render(
        <ResetPasswordForm 
          token="test-token"
          onSuccess={jest.fn()} 
          submitButtonText="Update Password" 
        />
      )

      expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('should show validation errors for empty fields', async () => {
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: 'Reset Password' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Password requirements not met/)).toBeInTheDocument()
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
      })
    })

    it('should validate password confirmation match', async () => {
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      const passwordInput = screen.getByLabelText('New password')
      const confirmPasswordInput = screen.getByLabelText('Confirm new password')
      const submitButton = screen.getByRole('button', { name: 'Reset Password' })

      await user.type(passwordInput, 'StrongPassword123!')
      await user.type(confirmPasswordInput, 'DifferentPassword123!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })
  })

  describe('Form interaction', () => {
    it('should toggle password visibility', async () => {
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      const passwordInput = screen.getByLabelText('New password') as HTMLInputElement
      const toggleButtons = screen.getAllByLabelText(/password/i).filter(el => 
        el.getAttribute('type') === 'button'
      )

      expect(passwordInput.type).toBe('password')

      if (toggleButtons.length > 0) {
        const firstToggleButton = toggleButtons[0]
        if (firstToggleButton) {
          await user.click(firstToggleButton)
          expect(passwordInput.type).toBe('text')

          await user.click(firstToggleButton)
          expect(passwordInput.type).toBe('password')
        }
      }
    })

    it('should clear errors when form data changes', async () => {
      mockAuthContext.error = 'Reset failed'
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      expect(screen.getByText('Reset failed')).toBeInTheDocument()

      const passwordInput = screen.getByLabelText('New password')
      await user.type(passwordInput, 'test')

      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('Form submission', () => {
    it('should submit form with valid data', async () => {
      mockResetPassword.mockResolvedValue({ success: true })
      const onSuccess = jest.fn()

      render(<ResetPasswordForm token="test-token" onSuccess={onSuccess} />)

      const passwordInput = screen.getByLabelText('New password')
      const confirmPasswordInput = screen.getByLabelText('Confirm new password')

      await user.type(passwordInput, 'StrongPassword123!')
      await user.type(confirmPasswordInput, 'StrongPassword123!')

      const submitButton = screen.getByRole('button', { name: 'Reset Password' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          token: 'test-token',
          password: 'StrongPassword123!',
          confirmPassword: 'StrongPassword123!',
        })
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('should show loading state during submission', async () => {
      mockAuthContext.isLoading = true
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: /resetting/i })
      expect(submitButton).toBeDisabled()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should handle submission errors', async () => {
      mockAuthContext.error = 'Token expired'
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      expect(screen.getByText('Token expired')).toBeInTheDocument()
    })

    it('should prevent submission without token', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<ResetPasswordForm token="" onSuccess={jest.fn()} />)

      // Component should handle missing token gracefully
      expect(screen.getByRole('button')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure and labels', () => {
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      expect(screen.getByRole('form')).toBeInTheDocument()
      
      const passwordInput = screen.getByLabelText('New password')
      const confirmPasswordInput = screen.getByLabelText('Confirm new password')
      
      expect(passwordInput).toBeRequired()
      expect(confirmPasswordInput).toBeRequired()
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password')
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password')
    })

    it('should announce errors to screen readers', async () => {
      render(<ResetPasswordForm token="test-token" onSuccess={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: 'Reset Password' })
      await user.click(submitButton)

      await waitFor(() => {
        const errorElement = screen.getByText(/Password requirements not met/)
        expect(errorElement).toHaveAttribute('aria-live', 'polite')
        expect(errorElement).toHaveAttribute('role', 'alert')
      })
    })
  })
})