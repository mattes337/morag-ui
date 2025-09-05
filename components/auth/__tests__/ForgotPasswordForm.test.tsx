import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForgotPasswordForm } from '../ForgotPasswordForm'

// Mock the auth context
const mockForgotPassword = jest.fn()
const mockClearError = jest.fn()

const mockAuthContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null as string | null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  forgotPassword: mockForgotPassword,
  resetPassword: jest.fn(),
  clearError: mockClearError,
  hasRole: jest.fn(),
  hasAnyRole: jest.fn(),
}

jest.mock('../../../contexts/auth/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

describe('ForgotPasswordForm', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthContext.isLoading = false
    mockAuthContext.error = null
  })

  describe('Form rendering', () => {
    it('should render email field and submit button', () => {
      render(<ForgotPasswordForm onSuccess={jest.fn()} />)

      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
    })

    it('should render custom submit button text', () => {
      render(
        <ForgotPasswordForm 
          onSuccess={jest.fn()} 
          submitButtonText="Request Password Reset" 
        />
      )

      expect(screen.getByRole('button', { name: 'Request Password Reset' })).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('should show validation error for empty email', async () => {
      render(<ForgotPasswordForm onSuccess={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email address is required')).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      render(<ForgotPasswordForm onSuccess={jest.fn()} />)

      const emailInput = screen.getByLabelText('Email address')
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })
  })

  describe('Form submission', () => {
    it('should submit form with valid email', async () => {
      mockForgotPassword.mockResolvedValue({ success: true })
      const onSuccess = jest.fn()

      render(<ForgotPasswordForm onSuccess={onSuccess} />)

      const emailInput = screen.getByLabelText('Email address')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' })
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('should show loading state during submission', async () => {
      mockAuthContext.isLoading = true
      render(<ForgotPasswordForm onSuccess={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: /sending/i })
      expect(submitButton).toBeDisabled()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should handle submission errors', async () => {
      mockAuthContext.error = 'User not found'
      render(<ForgotPasswordForm onSuccess={jest.fn()} />)

      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
  })

  describe('Form interaction', () => {
    it('should clear errors when email changes', async () => {
      mockAuthContext.error = 'Some error'
      render(<ForgotPasswordForm onSuccess={jest.fn()} />)

      expect(screen.getByText('Some error')).toBeInTheDocument()

      const emailInput = screen.getByLabelText('Email address')
      await user.type(emailInput, 'a')

      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure and labels', () => {
      render(<ForgotPasswordForm onSuccess={jest.fn()} />)

      expect(screen.getByRole('form')).toBeInTheDocument()
      
      const emailInput = screen.getByLabelText('Email address')
      expect(emailInput).toBeRequired()
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('autocomplete', 'email')
    })

    it('should announce errors to screen readers', async () => {
      render(<ForgotPasswordForm onSuccess={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
      await user.click(submitButton)

      await waitFor(() => {
        const errorElement = screen.getByText('Email address is required')
        expect(errorElement).toHaveAttribute('aria-live', 'polite')
        expect(errorElement).toHaveAttribute('role', 'alert')
      })
    })
  })
})