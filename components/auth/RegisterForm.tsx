'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/auth/AuthContext'
import { validateRegisterForm } from '../../lib/auth/formValidation'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { SocialAuthButtons } from './SocialAuthButtons'
import type { RegisterData } from '../../lib/auth/types'
import type { SocialProvider } from './SocialAuthButtons'

/**
 * Interface for realm selection
 */
interface Realm {
  id: string
  name: string
  slug: string
}

/**
 * Extended registration data with realm selection
 */
interface ExtendedRegisterData extends RegisterData {
  realmId?: string
}

/**
 * Props for the RegisterForm component
 */
export interface RegisterFormProps {
  /**
   * Callback called when registration succeeds
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
   * Custom text for the submit button
   * @default "Create Account"
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
 * Registration form component with validation and realm selection
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSocialAuth,
  showSocialAuth = true,
  submitButtonText = 'Create Account',
  className,
}) => {
  const { register, isLoading, error, clearError } = useAuth()

  // Form state
  const [formData, setFormData] = useState<ExtendedRegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    realmId: '',
  })

  // Local validation errors
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([])

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Realm selection
  const [realms, setRealms] = useState<Realm[]>([])
  const [loadingRealms, setLoadingRealms] = useState(true)

  // Load available realms
  useEffect(() => {
    const loadRealms = async () => {
      try {
        // Mock realms for now - would fetch from API
        const mockRealms = [
          { id: '1', name: 'Default Realm', slug: 'default' },
          { id: '2', name: 'Test Realm', slug: 'test' },
        ]
        
        setRealms(mockRealms)
        // Set default realm
        if (mockRealms.length > 0 && !formData.realmId) {
          setFormData(prev => ({ ...prev, realmId: mockRealms[0]?.id || '' }))
        }
      } catch (err) {
        console.error('Failed to load realms:', err)
      } finally {
        setLoadingRealms(false)
      }
    }

    loadRealms()
  }, [formData.realmId])

  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError()
    }
    setValidationErrors([])
  }, [formData, error, clearError])

  const handleInputChange = (field: keyof ExtendedRegisterData, value: string | boolean) => {
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
    const validation = validateRegisterForm(formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    try {
      setIsSubmitting(true)
      const result = await register(formData)
      
      if (result?.success) {
        onSuccess?.()
      } else if (result?.error) {
        // Error display is handled by auth context, but could also handle here
        console.error('Registration error:', result.error)
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error('Registration error:', err)
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const isFormDisabled = isLoading || isSubmitting || loadingRealms

  // Get field-specific errors
  const getFieldError = (fieldName: string) => {
    return validationErrors.find(err => err.field === fieldName)?.message
  }

  // Determine if auth errors are field-specific
  const isEmailAuthError = error && (
    error.toLowerCase().includes('email') || 
    error.toLowerCase().includes('already exists') ||
    error.toLowerCase().includes('invalid email')
  )
  
  // Combine validation and auth errors
  const emailError = getFieldError('email') || (isEmailAuthError ? error : undefined)
  const generalError = error && !isEmailAuthError ? error : undefined

  return (
    <div className={cn('w-full space-y-6', className)} data-testid="register-form">
      <form 
        onSubmit={handleSubmit}
        aria-label="Registration form"
        role="form"
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

        {/* Name field */}
        <div className="space-y-1">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            disabled={isFormDisabled}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            aria-describedby={getFieldError('name') ? 'name-error' : undefined}
            className={cn(
              'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              getFieldError('name')
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300',
              isFormDisabled && 'bg-gray-50 cursor-not-allowed opacity-50'
            )}
            placeholder="Enter your full name"
          />
          {getFieldError('name') && (
            <p id="name-error" className="text-sm text-red-600" role="alert" aria-live="polite">
              {getFieldError('name')}
            </p>
          )}
        </div>

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
              autoComplete="new-password"
              required
              disabled={isFormDisabled}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              aria-describedby={getFieldError('password') ? 'password-error' : undefined}
              className={cn(
                'block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                getFieldError('password')
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
          {getFieldError('password') && (
            <p id="password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
              {getFieldError('password')}
            </p>
          )}
          
          {/* Password strength indicator */}
          {formData.password && (
            <PasswordStrengthIndicator password={formData.password} />
          )}
        </div>

        {/* Confirm Password field */}
        <div className="space-y-1">
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              disabled={isFormDisabled}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              aria-describedby={getFieldError('confirmPassword') ? 'confirm-password-error' : undefined}
              className={cn(
                'block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                getFieldError('confirmPassword')
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300',
                isFormDisabled && 'bg-gray-50 cursor-not-allowed opacity-50'
              )}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              disabled={isFormDisabled}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className={cn(
                'absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600',
                isFormDisabled && 'cursor-not-allowed'
              )}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {getFieldError('confirmPassword') && (
            <p id="confirm-password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
              {getFieldError('confirmPassword')}
            </p>
          )}
        </div>

        {/* Realm selection */}
        <div className="space-y-1">
          <label
            htmlFor="realm"
            className="block text-sm font-medium text-gray-700"
          >
            Select realm
          </label>
          <select
            id="realm"
            disabled={isFormDisabled || loadingRealms}
            value={formData.realmId || ''}
            onChange={(e) => handleInputChange('realmId', e.target.value)}
            className={cn(
              'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'border-gray-300',
              isFormDisabled && 'bg-gray-50 cursor-not-allowed opacity-50'
            )}
          >
            {loadingRealms ? (
              <option value="">Loading realms...</option>
            ) : (
              <>
                {realms.map((realm) => (
                  <option key={realm.id} value={realm.id}>
                    {realm.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Terms acceptance */}
        <div className="flex items-start">
          <input
            id="accept-terms"
            type="checkbox"
            disabled={isFormDisabled}
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className={cn(
              'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1',
              isFormDisabled && 'cursor-not-allowed opacity-50'
            )}
          />
          <div className="ml-2">
            <label
              htmlFor="accept-terms"
              className={cn(
                'text-sm text-gray-900',
                isFormDisabled && 'cursor-not-allowed opacity-50'
              )}
            >
              I agree to the{' '}
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                target="_blank"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </label>
            {getFieldError('acceptTerms') && (
              <p className="text-sm text-red-600 mt-1" role="alert" aria-live="polite">
                {getFieldError('acceptTerms')}
              </p>
            )}
          </div>
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
          {isFormDisabled ? 'Creating account...' : submitButtonText}
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
            buttonText="Sign up with"
          />
        </div>
      )}
    </div>
  )
}