'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import { validatePassword, getPasswordStrengthText, getPasswordStrengthBgColor } from '../../lib/auth/passwordValidator'
import type { PasswordValidation } from '../../lib/auth/types'

/**
 * Props for the PasswordStrengthIndicator component
 */
export interface PasswordStrengthIndicatorProps {
  /**
   * The password to analyze
   */
  password: string

  /**
   * Whether to show the component when password is empty
   * @default true
   */
  showEmpty?: boolean

  /**
   * Whether to show the progress bar
   * @default true
   */
  showProgress?: boolean

  /**
   * Whether to show the strength text (Weak/Medium/Strong)
   * @default true
   */
  showStrengthText?: boolean

  /**
   * Whether to show the requirements list
   * @default true
   */
  showRequirements?: boolean

  /**
   * Custom CSS classes
   */
  className?: string
}

/**
 * CheckIcon component for met requirements
 */
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('h-4 w-4', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
    data-testid="requirement-met"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
)

/**
 * XIcon component for unmet requirements
 */
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('h-4 w-4', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
    data-testid="requirement-unmet"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
)

/**
 * Password strength indicator component with visual feedback and requirements checklist
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showEmpty = true,
  showProgress = true,
  showStrengthText = true,
  showRequirements = true,
  className,
}) => {
  // Don't render if password is empty and showEmpty is false
  if (!password && !showEmpty) {
    return null
  }

  // Validate the password
  const validation: PasswordValidation = validatePassword(password)
  const { strength, score, requirements } = validation

  const strengthText = getPasswordStrengthText(strength)
  const strengthBgColor = getPasswordStrengthBgColor(strength)

  // Calculate progress percentage (0-100)
  const progressPercentage = Math.max(0, Math.min(100, score))

  return (
    <div
      className={cn('w-full space-y-3', className)}
      data-testid="password-strength-indicator"
      aria-label={`Password strength: ${strengthText}`}
    >
      {/* Progress Bar and Strength Text */}
      {(showProgress || showStrengthText) && (
        <div className="space-y-2">
          {showProgress && (
            <progress
              className={cn(
                'w-full h-2 appearance-none',
                '[&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-bar]:rounded-full',
                '[&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-300',
                strengthBgColor.replace('bg-', '[&::-webkit-progress-value]:bg-')
              )}
              value={progressPercentage}
              max={100}
              data-testid="strength-bar"
              aria-label={`Password strength: ${strengthText}`}
            />
          )}

          {showStrengthText && (
            <div className="flex justify-between items-center">
              <span
                className={cn(
                  'text-sm font-medium',
                  strength === 'weak' && 'text-red-600',
                  strength === 'medium' && 'text-yellow-600',
                  strength === 'strong' && 'text-green-600'
                )}
                data-testid="strength-text"
                aria-live="polite"
              >
                {strengthText}
              </span>
              <span className="text-xs text-gray-500">
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          <p className="text-sm text-gray-600 mb-2">Password requirements:</p>
          <ul className="space-y-1">
            {requirements.map((requirement) => (
              <li
                key={requirement.id}
                className={cn(
                  'flex items-center gap-2 text-sm transition-colors duration-200',
                  requirement.isValid ? 'text-green-600' : 'text-red-600'
                )}
                data-testid={`requirement-${requirement.id}`}
                title={requirement.description}
              >
                <span className="flex-shrink-0">
                  {requirement.isValid ? (
                    <CheckIcon />
                  ) : (
                    <XIcon />
                  )}
                </span>
                <span className="flex-1">{requirement.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}