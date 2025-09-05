/**
 * Form validation utilities for authentication forms
 * Provides comprehensive validation with detailed error messages
 */

import type {
  ValidationResult,
  FormError,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
} from './types'
import { validatePassword } from './passwordValidator'

/**
 * Email validation regex
 * Reasonable RFC 5322 compliant pattern for email validation
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

/**
 * Quick email validation check with additional business rules
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false
  const trimmedEmail = email.trim()
  
  // Basic checks
  if (trimmedEmail.length > 254) return false
  if (trimmedEmail.includes('..')) return false
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) return false
  if (trimmedEmail.includes('@.') || trimmedEmail.includes('.@')) return false
  
  return EMAIL_REGEX.test(trimmedEmail)
}

/**
 * Validate email address with detailed error messages
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: FormError[] = []
  
  // Handle undefined/null
  if (email == null) {
    email = ''
  }
  
  const trimmedEmail = email.trim()
  
  // Required check
  if (!trimmedEmail) {
    errors.push({
      field: 'email',
      message: 'Email address is required',
    })
    return { isValid: false, errors }
  }
  
  // Length check
  if (trimmedEmail.length > 254) {
    errors.push({
      field: 'email',
      message: 'Email address is too long (maximum 254 characters)',
    })
  }
  
  // Format check
  if (!isValidEmail(trimmedEmail)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate name with detailed error messages
 */
export const validateName = (name: string): ValidationResult => {
  const errors: FormError[] = []
  
  // Handle undefined/null
  if (name == null) {
    name = ''
  }
  
  const trimmedName = name.trim()
  
  // Required check
  if (!trimmedName) {
    errors.push({
      field: 'name',
      message: 'Name is required',
    })
    return { isValid: false, errors }
  }
  
  // Length checks
  if (trimmedName.length < 2) {
    errors.push({
      field: 'name',
      message: 'Name must be at least 2 characters long',
    })
  }
  
  if (trimmedName.length > 100) {
    errors.push({
      field: 'name',
      message: 'Name must be less than 100 characters long',
    })
  }
  
  // Character validation - allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u0386-\u03FF\u0400-\u04FF\s'-]+$/
  if (!nameRegex.test(trimmedName)) {
    errors.push({
      field: 'name',
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate login form data
 */
export const validateLoginForm = (credentials: LoginCredentials): ValidationResult => {
  const errors: FormError[] = []
  
  // Validate email
  const emailValidation = validateEmail(credentials.email)
  errors.push(...emailValidation.errors)
  
  // Validate password
  if (!credentials.password) {
    errors.push({
      field: 'password',
      message: 'Password is required',
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate registration form data
 */
export const validateRegisterForm = (data: RegisterData): ValidationResult => {
  const errors: FormError[] = []
  
  // Validate name
  const nameValidation = validateName(data.name)
  errors.push(...nameValidation.errors)
  
  // Validate email
  const emailValidation = validateEmail(data.email)
  errors.push(...emailValidation.errors)
  
  // Validate password strength
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    const failedRequirements = passwordValidation.requirements
      .filter(req => !req.isValid)
      .map(req => req.label)
      .join(', ')
      
    errors.push({
      field: 'password',
      message: `Password requirements not met: ${failedRequirements}`,
    })
  }
  
  // Validate password confirmation
  if (!data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Please confirm your password',
    })
  } else if (data.password !== data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match',
    })
  }
  
  // Validate terms acceptance
  if (!data.acceptTerms) {
    errors.push({
      field: 'acceptTerms',
      message: 'You must accept the terms and conditions',
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate forgot password form data
 */
export const validateForgotPasswordForm = (data: ForgotPasswordData): ValidationResult => {
  const errors: FormError[] = []
  
  // Validate email
  const emailValidation = validateEmail(data.email)
  errors.push(...emailValidation.errors)
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate reset password form data
 */
export const validateResetPasswordForm = (data: ResetPasswordData): ValidationResult => {
  const errors: FormError[] = []
  
  // Validate token
  if (!data.token) {
    errors.push({
      field: 'token',
      message: 'Reset token is required',
    })
  }
  
  // Validate password strength
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    const failedRequirements = passwordValidation.requirements
      .filter(req => !req.isValid)
      .map(req => req.label)
      .join(', ')
      
    errors.push({
      field: 'password',
      message: `Password requirements not met: ${failedRequirements}`,
    })
  }
  
  // Validate password confirmation
  if (!data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Please confirm your password',
    })
  } else if (data.password !== data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match',
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get validation error for a specific field
 */
export const getFieldError = (errors: FormError[], fieldName: string): string | undefined => {
  const fieldError = errors.find(error => error.field === fieldName)
  return fieldError?.message
}

/**
 * Check if a specific field has validation errors
 */
export const hasFieldError = (errors: FormError[], fieldName: string): boolean => {
  return errors.some(error => error.field === fieldName)
}

/**
 * Filter errors by field name
 */
export const getFieldErrors = (errors: FormError[], fieldName: string): FormError[] => {
  return errors.filter(error => error.field === fieldName)
}

/**
 * Combine multiple validation results
 */
export const combineValidationResults = (...results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(result => result.errors)
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  }
}

/**
 * Create a form error
 */
export const createFormError = (field: string, message: string): FormError => ({
  field,
  message,
})

/**
 * Sanitize input string by trimming and normalizing
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (input == null) return ''
  return input.trim()
}