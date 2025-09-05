import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

// Mock the auth context to control authentication state
const mockLogin = jest.fn()
const mockUseAuth = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  login: mockLogin,
  register: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
  hasRole: jest.fn(),
  hasAnyRole: jest.fn(),
}

jest.mock('../../../contexts/auth/AuthContext', () => ({
  ...jest.requireActual('../../../contexts/auth/AuthContext'),
  useAuth: () => mockUseAuth,
}))

// Helper component to wrap LoginForm with providers (mock is used instead of real provider)
const LoginFormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
  </>
)

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.isLoading = false
    mockUseAuth.error = null
    mockLogin.mockReset()
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })

    it('should render all form fields', () => {
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('should render remember me checkbox', () => {
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
    })

    it('should render social auth buttons when enabled', () => {
      render(
        <LoginFormWrapper>
          <LoginForm showSocialAuth={true} />
        </LoginFormWrapper>
      )
      
      expect(screen.getByTestId('social-auth-buttons')).toBeInTheDocument()
    })

    it('should not render social auth buttons when disabled', () => {
      render(
        <LoginFormWrapper>
          <LoginForm showSocialAuth={false} />
        </LoginFormWrapper>
      )
      
      expect(screen.queryByTestId('social-auth-buttons')).not.toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('should show email validation error for empty email', async () => {
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const form = screen.getByRole('form')
      fireEvent.submit(form)
      
      expect(await screen.findByText('Email address is required')).toBeInTheDocument()
    })

    it('should show email validation error for invalid email', async () => {
      const user = userEvent.setup()
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const form = screen.getByRole('form')
      
      await user.type(emailInput, 'invalid-email')
      fireEvent.submit(form)
      
      expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument()
    })

    it('should show password validation error for empty password', async () => {
      const user = userEvent.setup()
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const form = screen.getByRole('form')
      
      await user.type(emailInput, 'test@example.com')
      fireEvent.submit(form)
      
      expect(await screen.findByText('Password is required')).toBeInTheDocument()
    })

    it('should clear validation errors when user starts typing', async () => {
      const user = userEvent.setup()
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const form = screen.getByRole('form')
      
      // Trigger validation error
      fireEvent.submit(form)
      expect(await screen.findByText('Email address is required')).toBeInTheDocument()
      
      // Start typing should clear error
      await user.type(emailInput, 'test@example.com')
      expect(screen.queryByText('Email address is required')).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should call login function with correct credentials', async () => {
      const user = userEvent.setup()
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })
    })

    it('should include rememberMe when checkbox is checked', async () => {
      const user = userEvent.setup()
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i })
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(rememberMeCheckbox)
      await user.click(submitButton)
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      })
    })

    it('should not submit form with validation errors', async () => {
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const form = screen.getByRole('form')
      fireEvent.submit(form)
      
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should call onSuccess callback when login succeeds', async () => {
      const mockOnSuccess = jest.fn()
      const user = userEvent.setup()
      
      mockLogin.mockResolvedValueOnce({ success: true })
      
      render(
        <LoginFormWrapper>
          <LoginForm onSuccess={mockOnSuccess} />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('loading states', () => {
    it('should disable form fields when loading', () => {
      mockUseAuth.isLoading = true
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      expect(screen.getByLabelText('Email address')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled()
    })

    it('should show loading spinner in submit button when loading', () => {
      mockUseAuth.isLoading = true
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const submitButton = screen.getByRole('button', { name: 'Signing in...' })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton.querySelector('[data-testid="loading-spinner"]')).toBeInTheDocument()
    })

    it('should disable social auth buttons when loading', () => {
      mockUseAuth.isLoading = true
      
      render(
        <LoginFormWrapper>
          <LoginForm showSocialAuth={true} />
        </LoginFormWrapper>
      )
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      expect(googleButton).toBeDisabled()
    })
  })

  describe('error handling', () => {
    it('should display authentication error', () => {
      mockUseAuth.error = 'Invalid credentials'
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    it('should display field-specific errors', () => {
      mockUseAuth.error = 'Email not found'
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      expect(screen.getByText(/email not found/i)).toBeInTheDocument()
    })

    it('should clear errors when form is modified', async () => {
      const user = userEvent.setup()
      const mockClearError = jest.fn()
      mockUseAuth.clearError = mockClearError
      mockUseAuth.error = 'Invalid credentials'
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      await user.type(emailInput, 'test')
      
      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('password visibility toggle', () => {
    it('should toggle password visibility when show/hide button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const passwordInput = screen.getByLabelText('Password')
      const toggleButton = screen.getByRole('button', { name: /show password/i })
      
      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      // Click show password button
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
      
      // Click hide password button
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('social authentication', () => {
    it('should handle social auth provider clicks', async () => {
      const mockOnSocialAuth = jest.fn()
      const user = userEvent.setup()
      
      render(
        <LoginFormWrapper>
          <LoginForm showSocialAuth={true} onSocialAuth={mockOnSocialAuth} />
        </LoginFormWrapper>
      )
      
      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)
      
      expect(mockOnSocialAuth).toHaveBeenCalledWith('google')
    })
  })

  describe('accessibility', () => {
    it('should have proper form labeling', () => {
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      expect(screen.getByRole('form')).toHaveAccessibleName('Sign in form')
    })

    it('should have proper error announcements', () => {
      mockUseAuth.error = 'Invalid credentials'
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const errorElement = screen.getByText(/invalid credentials/i)
      expect(errorElement).toHaveAttribute('role', 'alert')
      expect(errorElement).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper field associations when errors are present', () => {
      mockUseAuth.error = 'Email not found'
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      
      // Email field should have aria-describedby when there's an error
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
    })

    it('should support keyboard navigation', () => {
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i })
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      // Verify elements are focusable
      expect(emailInput).not.toBeDisabled()
      expect(passwordInput).not.toBeDisabled()
      expect(rememberMeCheckbox).not.toBeDisabled()
      expect(submitButton).not.toBeDisabled()
      
      // Check that form elements can receive focus
      emailInput.focus()
      expect(document.activeElement).toBe(emailInput)
      
      passwordInput.focus()
      expect(document.activeElement).toBe(passwordInput)
    })
  })

  describe('customization', () => {
    it('should apply custom className', () => {
      render(
        <LoginFormWrapper>
          <LoginForm className="custom-class" />
        </LoginFormWrapper>
      )
      
      expect(screen.getByTestId('login-form')).toHaveClass('custom-class')
    })

    it('should use custom submit button text', () => {
      render(
        <LoginFormWrapper>
          <LoginForm submitButtonText="Log In" />
        </LoginFormWrapper>
      )
      
      expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument()
    })

    it('should hide forgot password link when specified', () => {
      render(
        <LoginFormWrapper>
          <LoginForm showForgotPassword={false} />
        </LoginFormWrapper>
      )
      
      expect(screen.queryByRole('link', { name: /forgot password/i })).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle form submission with whitespace in email', async () => {
      const user = userEvent.setup()
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      await user.type(emailInput, '  test@example.com  ')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com', // Should be trimmed
        password: 'password123',
        rememberMe: false,
      })
    })

    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup()
      // Make login function async to simulate real behavior
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)))
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const form = screen.getByRole('form')
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      // Rapid form submissions should only submit once
      fireEvent.submit(form)
      fireEvent.submit(form)
      fireEvent.submit(form)
      
      // Wait for any async operations to complete
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      
      render(
        <LoginFormWrapper>
          <LoginForm />
        </LoginFormWrapper>
      )
      
      const emailInput = screen.getByLabelText('Email address')
      const form = screen.getByRole('form')
      
      // Use fireEvent for faster input
      fireEvent.change(emailInput, { target: { value: longEmail } })
      fireEvent.submit(form)
      
      expect(await screen.findByText('Email address is too long (maximum 254 characters)')).toBeInTheDocument()
    }, 10000)
  })
})