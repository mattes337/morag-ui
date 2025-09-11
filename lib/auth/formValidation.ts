/**
 * Form validation utilities for authentication forms
 * Provides comprehensive validation with detailed error messages and input sanitization
 */

import type {
  ValidationResult,
  FormError,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
} from './types'

export type { ValidationResult, FormError }
import { validatePassword } from './passwordValidator'
import DOMPurify from 'dompurify'

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
  
  let sanitizedEmail: string
  try {
    sanitizedEmail = sanitizeEmail(email)
  } catch (error) {
    errors.push({
      field: 'email',
      message: 'Email contains invalid or potentially unsafe content',
    })
    return { isValid: false, errors }
  }
  
  // Required check
  if (!sanitizedEmail) {
    errors.push({
      field: 'email',
      message: 'Email address is required',
    })
    return { isValid: false, errors }
  }
  
  // Length check
  if (sanitizedEmail.length > 254) {
    errors.push({
      field: 'email',
      message: 'Email address is too long (maximum 254 characters)',
    })
  }
  
  // Format check
  if (!isValidEmail(sanitizedEmail)) {
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
  
  // Basic trim to handle whitespace
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
  
  // Character validation - allow only letters, spaces, hyphens, and apostrophes
  // This regex excludes numbers and special characters like @, &, <, >, etc.
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/
  if (!nameRegex.test(trimmedName)) {
    errors.push({
      field: 'name',
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    })
  }
  
  // Check for potentially dangerous characters explicitly
  if (/[0-9@&<>{}[\]#$%^*+=|\\/"`;:.,?!~`]/.test(trimmedName)) {
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
 * Comprehensive input sanitization to prevent XSS and injection attacks
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (input == null) return ''
  
  // Basic trim and normalize
  let sanitized = input.trim()
  
  // Remove null bytes and control characters (except newlines, tabs, and carriage returns)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
  
  // Use DOMPurify to sanitize HTML content with strict settings
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content but remove tags
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
    USE_PROFILES: {
      html: false,
      svg: false,
      svgFilters: false,
      mathMl: false
    }
  })
  
  // Enhanced protection against various injection attacks
  const suspiciousPatterns = [
    // Script injection patterns
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<object[^>]*>[\s\S]*?<\/object>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /<style[^>]*>[\s\S]*?<\/style>/gi,
    
    // JavaScript protocol
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /livescript\s*:/gi,
    /mocha\s*:/gi,
    /data\s*:\s*text\/html/gi,
    
    // Event handlers
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /on\w+\s*=\s*[^>\s]+/gi,
    
    // Expression and eval patterns
    /expression\s*\([^)]*\)/gi,
    /eval\s*\([^)]*\)/gi,
    /setTimeout\s*\([^)]*\)/gi,
    /setInterval\s*\([^)]*\)/gi,
    
    // Data URIs with scripts
    /data\s*:\s*[^,]*script/gi,
    
    // CSS injection
    /@import/gi,
    /url\s*\(\s*["']?\s*javascript/gi,
    
    // HTML entity encoding bypass attempts
    /&#x?[0-9a-f]+;?/gi,
    
    // Unicode normalization attacks
    /[\u202a-\u202e\u2066-\u2069]/g,
    
    // Protocol relative URLs that could be dangerous
    /\/\/[^\/\s]*(javascript|data|vbscript)/gi,
    
    // SVG script injection
    /<svg[^>]*>[\s\S]*?<\/svg>/gi,
    
    // Form injection
    /<form[^>]*>[\s\S]*?<\/form>/gi,
    /<input[^>]*>/gi,
    /<textarea[^>]*>[\s\S]*?<\/textarea>/gi,
    /<select[^>]*>[\s\S]*?<\/select>/gi,
    /<button[^>]*>[\s\S]*?<\/button>/gi,
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Input contains potentially malicious content')
    }
  }
  
  // Additional check for encoded malicious content
  try {
    const decoded = decodeURIComponent(sanitized);
    for (const pattern of suspiciousPatterns.slice(0, 10)) { // Check core patterns on decoded content
      if (pattern.test(decoded)) {
        throw new Error('Input contains encoded malicious content')
      }
    }
  } catch (decodeError) {
    // If decoding fails, that's fine - continue with original sanitized content
  }
  
  return sanitized
}

/**
 * Sanitizes and validates email input with additional security checks
 */
export const sanitizeEmail = (email: string | null | undefined): string => {
  const sanitized = sanitizeInput(email)
  
  // Additional email-specific validation
  if (sanitized.includes('<') || sanitized.includes('>')) {
    throw new Error('Email contains invalid characters')
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /['";]/,
    /union\s+select/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /drop\s+table/i,
    /update\s+set/i,
  ]
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Email contains potentially malicious content')
    }
  }
  
  return sanitized
}

/**
 * Sanitizes name input with additional checks for special characters
 */
export const sanitizeName = (name: string | null | undefined): string => {
  const sanitized = sanitizeInput(name)
  
  // Names should not contain HTML entities or special characters beyond basic punctuation
  const dangerousPatterns = [
    /&[#\w]+;/, // HTML entities
    /[<>{}[\]]/,  // Brackets and braces
    /[\x00-\x1F\x7F-\x9F]/, // Control characters
  ]
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Name contains invalid characters')
    }
  }
  
  return sanitized
}