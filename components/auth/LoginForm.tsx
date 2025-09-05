'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/auth/AuthContext'
import { validateLoginForm } from '../../lib/auth/formValidation'
import { SocialAuthButtons } from './SocialAuthButtons'
import type { LoginCredentials } from '../../lib/auth/types'
import type { SocialProvider } from './SocialAuthButtons'

/**
 * Props for the LoginForm component
 */
export interface LoginFormProps {
  /**
   * Callback called when login succeeds
   */
  onSuccess?: () => void

  /**
   * Callback called when social authentication is attempted
   */
  onSocialAuth?: (provider: SocialProvider) => void

  /**
   * Whether to show social authentication buttons
   * @default true
   */
  showSocialAuth?: boolean

  /**
   * Whether to show the forgot password link
   * @default true
   */
  showForgotPassword?: boolean

  /**
   * Custom text for the submit button
   * @default "Sign In"
   */
  submitButtonText?: string

  /**
   * Custom CSS classes
   */
  className?: string
}

/**
 * Eye icon for password visibility toggle
 */
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('h-4 w-4', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

/**
 * Eye-off icon for password visibility toggle
 */
const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('h-4 w-4', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
    />
  </svg>
)

/**
 * Loading spinner component
 */
const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('animate-spin h-4 w-4', className)}
    viewBox="0 0 24 24"
    data-testid="loading-spinner"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

/**
 * Login form component with validation and authentication integration
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSocialAuth,
  showSocialAuth = true,
  showForgotPassword = true,
  submitButtonText = 'Sign In',
  className,
}) => {
  const { login, isLoading, error, clearError } = useAuth()

  // Form state
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  })

  // Local validation errors
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([])

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false)

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError()
    }
    setValidationErrors([])
  }, [formData, error, clearError])

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'email' && typeof value === 'string' ? value.trim() : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      return
    }

    // Validate form
    const validation = validateLoginForm(formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    try {
      setIsSubmitting(true)
      const result = await login(formData)
      
      if (result?.success) {
        onSuccess?.()
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialAuth = (provider: SocialProvider) => {
    if (isLoading) return
    onSocialAuth?.(provider)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const isFormDisabled = isLoading || isSubmitting

  // Get field-specific errors
  const validationEmailError = validationErrors.find(err => err.field === 'email')?.message
  const validationPasswordError = validationErrors.find(err => err.field === 'password')?.message
  
  // Determine if auth errors are field-specific
  const isEmailAuthError = error && (
    error.toLowerCase().includes('email') || 
    error.toLowerCase().includes('not found') ||
    error.toLowerCase().includes('invalid email')
  )
  const isPasswordAuthError = error && (
    error.toLowerCase().includes('password') ||
    error.toLowerCase().includes('credentials') ||
    error.toLowerCase().includes('invalid password')
  )
  
  // Combine validation and auth errors
  const emailError = validationEmailError || (isEmailAuthError ? error : undefined)
  const passwordError = validationPasswordError || (isPasswordAuthError ? error : undefined)
  const generalError = error && !isEmailAuthError && !isPasswordAuthError ? error : undefined

  return (
    <div className={cn('w-full space-y-6', className)} data-testid="login-form">
      <form 
        onSubmit={handleSubmit}
        aria-label="Sign in form"
        className="space-y-4"
      >
        {/* General error message */}
        {generalError && (
          <div
            className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm"
            role="alert"
            aria-live="polite"
          >
            {generalError}
          </div>
        )}

        {/* Email field */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            disabled={isFormDisabled}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            aria-describedby={emailError ? 'email-error' : undefined}
            className={cn(
              'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              emailError
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300',
              isFormDisabled && 'bg-gray-50 cursor-not-allowed opacity-50'
            )}
            placeholder="Enter your email"
          />
          {emailError && (
            <p id="email-error" className="text-sm text-red-600" role="alert" aria-live="polite">
              {emailError}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isFormDisabled}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className={cn(
                'block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                passwordError
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300',
                isFormDisabled && 'bg-gray-50 cursor-not-allowed opacity-50'
              )}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={isFormDisabled}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={cn(
                'absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600',
                isFormDisabled && 'cursor-not-allowed'
              )}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
              {passwordError}
            </p>
          )}
        </div>

        {/* Remember me and Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              disabled={isFormDisabled}
              checked={formData.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              className={cn(
                'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                isFormDisabled && 'cursor-not-allowed opacity-50'
              )}
            />
            <label
              htmlFor="remember-me"
              className={cn(
                'ml-2 block text-sm text-gray-900',
                isFormDisabled && 'cursor-not-allowed opacity-50'
              )}
            >
              Remember me
            </label>
          </div>

          {showForgotPassword && (
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isFormDisabled}
          className={cn(
            'w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600'
          )}
        >
          {isFormDisabled && <LoadingSpinner />}
          {isFormDisabled ? 'Signing in...' : submitButtonText}
        </button>
      </form>

      {/* Social authentication */}
      {showSocialAuth && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <SocialAuthButtons
            onProviderClick={handleSocialAuth}
            loading={isFormDisabled}
            disabled={isFormDisabled}
            buttonText="Sign in with"
          />
        </div>
      )}
    </div>
  )
}