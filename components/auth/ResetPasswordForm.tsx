'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/auth/AuthContext'
import { validateResetPasswordForm } from '../../lib/auth/formValidation'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import type { ResetPasswordData } from '../../lib/auth/types'

/**
 * Props for the ResetPasswordForm component
 */
export interface ResetPasswordFormProps {
  /**
   * Reset token from URL
   */
  token: string

  /**
   * Callback called when password reset succeeds
   */
  onSuccess?: () => void

  /**
   * Custom text for the submit button
   * @default "Reset Password"
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
 * Reset password form component for setting new password
 */
export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onSuccess,
  submitButtonText = 'Reset Password',
  className,
}) => {
  // Mock resetPassword function for now
  const resetPassword = async (data: ResetPasswordData) => {
    console.log('Resetting password with data:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true }
  }

  const { isLoading, error, clearError } = useAuth()

  // Form state
  const [formData, setFormData] = useState<ResetPasswordData>({
    token: token || '',
    password: '',
    confirmPassword: '',
  })

  // Local validation errors
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([])

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update token when it changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, token: token || '' }))
  }, [token])

  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError()
    }
    setValidationErrors([])
  }, [formData, error, clearError])

  const handleInputChange = (field: keyof ResetPasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      return
    }

    // Validate form
    const validation = validateResetPasswordForm(formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    try {
      setIsSubmitting(true)
      const result = await resetPassword(formData)
      
      if (result?.success) {
        onSuccess?.()
      }
    } catch (err) {
      console.error('Reset password error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const isFormDisabled = isLoading || isSubmitting

  // Get field-specific errors
  const getFieldError = (fieldName: string) => {
    return validationErrors.find(err => err.field === fieldName)?.message
  }

  // For reset password, most errors are general
  const generalError = error

  return (
    <div className={cn('w-full space-y-6', className)} data-testid="reset-password-form">
      <form 
        onSubmit={handleSubmit}
        aria-label="Reset password form"
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

        {/* New Password field */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            New password
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
              placeholder="Enter your new password"
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
            Confirm new password
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
              placeholder="Confirm your new password"
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
          {isFormDisabled ? 'Resetting...' : submitButtonText}
        </button>
      </form>

      {/* Security info */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Make sure to choose a strong password that you haven't used before.
        </p>
      </div>
    </div>
  )
}