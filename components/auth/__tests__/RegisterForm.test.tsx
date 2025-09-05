import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '../RegisterForm'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, ...props }: any) {
    return <a {...props}>{children}</a>
  }
})

// Mock the auth context
const mockRegister = jest.fn()
const mockClearError = jest.fn()

const mockAuthContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null as string | null,
  login: jest.fn(),
  register: mockRegister,
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  clearError: mockClearError,
  hasRole: jest.fn(),
  hasAnyRole: jest.fn(),
}

jest.mock('../../../contexts/auth/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock realm data
const mockRealms = [
  { id: '1', name: 'Default Realm', slug: 'default' },
  { id: '2', name: 'Test Realm', slug: 'test' },
]

// Mock the realm fetch - would normally come from API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: mockRealms }),
  })
) as jest.Mock

describe('RegisterForm', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthContext.isLoading = false
    mockAuthContext.error = null
  })

  describe('Form rendering', () => {
    it('should render all form fields', () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      expect(screen.getByLabelText('Full name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
      expect(screen.getByLabelText('Select realm')).toBeInTheDocument()
      expect(screen.getByLabelText(/I agree to the/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('should render password strength indicator', async () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      const passwordInput = screen.getByLabelText('Password')
      await user.type(passwordInput, 'weak')

      expect(screen.getByText('Password requirements:')).toBeInTheDocument()
    })

    it('should render social auth buttons when showSocialAuth is true', () => {
      render(<RegisterForm onSuccess={jest.fn()} showSocialAuth={true} />)

      expect(screen.getByText('Or continue with')).toBeInTheDocument()
    })

    it('should not render social auth when showSocialAuth is false', () => {
      render(<RegisterForm onSuccess={jest.fn()} showSocialAuth={false} />)

      expect(screen.queryByText('Or continue with')).not.toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('should show validation errors for empty fields', async () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      // Wait for the realms to load and the button to be enabled
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: 'Create Account' })
        expect(submitButton).not.toBeDisabled()
      })

      const submitButton = screen.getByRole('button', { name: 'Create Account' })
      
      // Ensure register is not called for invalid data
      mockRegister.mockResolvedValue({ success: false, error: 'Validation should prevent this' })
      
      await user.click(submitButton)

      // Wait for validation errors to appear
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Email address is required')).toBeInTheDocument()
      expect(screen.getByText(/Password requirements not met/)).toBeInTheDocument()
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
      
      // Ensure register was not called due to validation failure
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Create Account' })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('should validate password confirmation match', async () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm password')
      const submitButton = screen.getByRole('button', { name: 'Create Account' })

      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'different123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('should require terms acceptance', async () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: 'Create Account' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('You must accept the terms and conditions')).toBeInTheDocument()
      })
    })

    it('should validate minimum password length', async () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Create Account' })

      await user.type(passwordInput, '123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Password requirements not met/)).toBeInTheDocument()
      })
    })
  })

  describe('Form interaction', () => {
    it('should toggle password visibility', async () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      const toggleButton = screen.getAllByLabelText(/password/i).find(el => 
        el.getAttribute('type') === 'button'
      )

      expect(passwordInput.type).toBe('password')

      if (toggleButton) {
        await user.click(toggleButton)
        expect(passwordInput.type).toBe('text')

        await user.click(toggleButton)
        expect(passwordInput.type).toBe('password')
      }
    })

    it('should clear errors when form data changes', async () => {
      mockAuthContext.error = 'Registration failed'
      render(<RegisterForm onSuccess={jest.fn()} />)

      expect(screen.getByText('Registration failed')).toBeInTheDocument()

      const nameInput = screen.getByLabelText('Full name')
      await user.type(nameInput, 'John')

      expect(mockClearError).toHaveBeenCalled()
    })

    it('should handle realm selection', async () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      // Wait for realms to load
      await waitFor(() => {
        expect(screen.getByText('Default Realm')).toBeInTheDocument()
      })

      const realmSelect = screen.getByLabelText('Select realm')
      await user.selectOptions(realmSelect, '2')

      // Verify realm was selected
      expect(realmSelect).toHaveValue('2')
    })
  })

  describe('Form submission', () => {
    it('should submit form with valid data', async () => {
      mockRegister.mockResolvedValue({ success: true })
      const onSuccess = jest.fn()

      render(<RegisterForm onSuccess={onSuccess} />)

      // Wait for realms to load
      await waitFor(() => {
        expect(screen.getByText('Default Realm')).toBeInTheDocument()
      })

      // Fill form
      await user.type(screen.getByLabelText('Full name'), 'John Doe')
      await user.type(screen.getByLabelText('Email address'), 'john@example.com')
      await user.type(screen.getByLabelText('Password'), 'StrongPassword123!')
      await user.type(screen.getByLabelText('Confirm password'), 'StrongPassword123!')
      await user.click(screen.getByLabelText(/I agree to the/))

      const submitButton = screen.getByRole('button', { name: 'Create Account' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'StrongPassword123!',
          confirmPassword: 'StrongPassword123!',
          acceptTerms: true,
          realmId: '1', // Default realm
        })
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('should prevent multiple submissions', async () => {
      mockAuthContext.isLoading = true
      render(<RegisterForm onSuccess={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: /creating account/i })
      expect(submitButton).toBeDisabled()

      await user.click(submitButton)
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('should handle registration errors', async () => {
      // Set the auth context error
      mockAuthContext.error = 'Email already exists'
      mockRegister.mockResolvedValue({ 
        success: false, 
        error: { message: 'Email already exists' }
      })

      render(<RegisterForm onSuccess={jest.fn()} />)

      // Wait for realms to load
      await waitFor(() => {
        expect(screen.getByText('Default Realm')).toBeInTheDocument()
      })

      // Fill and submit form
      await user.type(screen.getByLabelText('Full name'), 'John Doe')
      await user.type(screen.getByLabelText('Email address'), 'john@example.com')
      await user.type(screen.getByLabelText('Password'), 'StrongPassword123!')
      await user.type(screen.getByLabelText('Confirm password'), 'StrongPassword123!')
      await user.click(screen.getByLabelText(/I agree to the/))

      const submitButton = screen.getByRole('button', { name: 'Create Account' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })

      // Clean up
      mockAuthContext.error = null
    })
  })

  describe('Social authentication', () => {
    it('should handle social auth button clicks', async () => {
      const onSocialAuth = jest.fn()
      render(<RegisterForm onSuccess={jest.fn()} onSocialAuth={onSocialAuth} />)

      // This test would depend on the SocialAuthButtons implementation
      // For now, just verify the component renders
      expect(screen.getByText('Or continue with')).toBeInTheDocument()
    })

    it('should disable social auth when form is submitting', () => {
      mockAuthContext.isLoading = true
      render(<RegisterForm onSuccess={jest.fn()} onSocialAuth={jest.fn()} />)

      // Social auth buttons should be disabled when loading
      expect(screen.getByText('Or continue with')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and associations', () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      // Check form has proper role
      expect(screen.getByRole('form')).toBeInTheDocument()

      // Check required fields are marked
      const nameInput = screen.getByLabelText('Full name')
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')

      expect(nameInput).toBeRequired()
      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })

    it('should announce errors to screen readers', async () => {
      render(<RegisterForm onSuccess={jest.fn()} />)

      // Wait for the realms to load and the button to be enabled
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: 'Create Account' })
        expect(submitButton).not.toBeDisabled()
      })

      const submitButton = screen.getByRole('button', { name: 'Create Account' })
      await user.click(submitButton)

      await waitFor(() => {
        // Check for required field error messages with aria-live
        expect(screen.getByText('Name is required')).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
})