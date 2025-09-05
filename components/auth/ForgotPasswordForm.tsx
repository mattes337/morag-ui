'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/auth/AuthContext'
import { validateForgotPasswordForm } from '../../lib/auth/formValidation'
import type { ForgotPasswordData } from '../../lib/auth/types'

/**
 * Props for the ForgotPasswordForm component
 */
export interface ForgotPasswordFormProps {
  /**
   * Callback called when password reset request succeeds
   */
  onSuccess?: () => void

  /**
   * Custom text for the submit button
   * @default "Send Reset Link"
   */
  submitButtonText?: string

  /**
   * Custom CSS classes
   */
  className?: string
}

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
 * Forgot password form component for requesting password reset
 */
export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  submitButtonText = 'Send Reset Link',
  className,
}) => {
  const { forgotPassword, isLoading, error, clearError } = useAuth()

  // Form state
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: '',
  })

  // Local validation errors
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([])

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError()
    }
    setValidationErrors([])
  }, [formData, error, clearError])

  const handleInputChange = (field: keyof ForgotPasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'email' ? value.trim() : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      return
    }

    // Validate form
    const validation = validateForgotPasswordForm(formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    try {
      setIsSubmitting(true)
      const result = await forgotPassword(formData)
      
      if (result?.success) {
        onSuccess?.()
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error('Forgot password error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormDisabled = isLoading || isSubmitting

  // Get field-specific errors
  const getFieldError = (fieldName: string) => {
    return validationErrors.find(err => err.field === fieldName)?.message
  }

  // Determine if auth errors are field-specific
  const isEmailAuthError = error && (
    error.toLowerCase().includes('email') || 
    error.toLowerCase().includes('not found') ||
    error.toLowerCase().includes('invalid email')
  )
  
  // Combine validation and auth errors
  const emailError = getFieldError('email') || (isEmailAuthError ? error : undefined)
  const generalError = error && !isEmailAuthError ? error : undefined

  return (
    <div className={cn('w-full space-y-6', className)} data-testid="forgot-password-form">
      <form 
        onSubmit={handleSubmit}
        aria-label="Forgot password form"
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
            placeholder="Enter your email address"
          />
          {emailError && (
            <p id="email-error" className="text-sm text-red-600" role="alert" aria-live="polite">
              {emailError}
            </p>
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
          {isFormDisabled ? 'Sending...' : submitButtonText}
        </button>
      </form>

      {/* Success info */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          We'll send a password reset link to your email if an account exists.
        </p>
      </div>
    </div>
  )
}