/**
 * Password validation utilities for authentication
 * Implements comprehensive password strength checking with visual feedback
 */

import type { PasswordValidation, PasswordStrength, PasswordRequirement } from './types'

/**
 * Password requirement configuration
 */
interface PasswordRequirementConfig {
  id: string
  label: string
  description: string
  validate: (password: string) => boolean
}

/**
 * Password requirements with validation functions
 */
export const PASSWORD_REQUIREMENTS: PasswordRequirementConfig[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    description: 'Password must be at least 8 characters long',
    validate: (password: string) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    description: 'Password must contain at least one uppercase letter (A-Z)',
    validate: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    description: 'Password must contain at least one lowercase letter (a-z)',
    validate: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'One number',
    description: 'Password must contain at least one number (0-9)',
    validate: (password: string) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'One special character',
    description: 'Password must contain at least one special character (!@#$%^&* etc.)',
    validate: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
]

/**
 * Calculate password strength score based on various criteria
 */
const calculatePasswordScore = (password: string): number => {
  if (!password) return 0

  let score = 0
  const requirements = PASSWORD_REQUIREMENTS

  // Count how many requirements are met
  const metRequirements = requirements.filter(req => req.validate(password)).length
  
  // Base score based on requirements met
  // Need at least 3 requirements for medium, all 5 for strong
  switch (metRequirements) {
    case 0:
    case 1:
      score = 10 + metRequirements * 5
      break
    case 2:
      score = 25
      break
    case 3:
      score = 45 // Medium threshold
      break
    case 4:
      score = 65
      break
    case 5:
      score = 85 // Strong threshold with all requirements
      break
  }

  // Length bonuses
  if (password.length >= 12) score += 5
  if (password.length >= 16) score += 5

  // Complexity bonuses
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.6) score += 5

  // Penalize common patterns
  if (/(.)\1{3,}/.test(password)) score -= 10 // Repeated characters
  if (/qwerty|password|123456|abc123|asdf/i.test(password)) score -= 15

  // Sequential patterns
  if (/123|abc|bcd|cde|012|789/.test(password.toLowerCase())) score -= 5

  // For very long passwords with repeated chars, be more lenient
  if (password.length > 100 && metRequirements >= 4) {
    score = Math.max(score, 80)
  }

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, score))
}

/**
 * Determine password strength category based on score
 */
export const getPasswordStrength = (score: number): PasswordStrength => {
  if (score < 40) return 'weak'
  if (score < 80) return 'medium'
  return 'strong'
}

/**
 * Validate password and return comprehensive analysis
 */
export const validatePassword = (password: string): PasswordValidation => {
  const score = calculatePasswordScore(password)
  const strength = getPasswordStrength(score)

  // Evaluate each requirement
  const requirements: PasswordRequirement[] = PASSWORD_REQUIREMENTS.map(config => ({
    id: config.id,
    label: config.label,
    description: config.description,
    isValid: config.validate(password),
  }))

  // Password is considered valid if it meets all requirements and is strong
  const allRequirementsMet = requirements.every(req => req.isValid)
  const isValid = strength === 'strong' && allRequirementsMet

  return {
    strength,
    score,
    requirements,
    isValid,
  }
}

/**
 * Quick check if password meets minimum requirements
 */
export const isPasswordValid = (password: string): boolean => {
  return PASSWORD_REQUIREMENTS.every(req => req.validate(password))
}

/**
 * Get password strength color for UI
 */
export const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'text-red-500'
    case 'medium':
      return 'text-yellow-500'
    case 'strong':
      return 'text-green-500'
    default:
      return 'text-gray-500'
  }
}

/**
 * Get password strength background color for progress bars
 */
export const getPasswordStrengthBgColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'strong':
      return 'bg-green-500'
    default:
      return 'bg-gray-300'
  }
}

/**
 * Get readable strength text
 */
export const getPasswordStrengthText = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'Weak'
    case 'medium':
      return 'Medium'
    case 'strong':
      return 'Strong'
    default:
      return 'Unknown'
  }
}