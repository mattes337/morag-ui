/**
 * Authentication types and interfaces for the MoRAG platform
 */

/**
 * User role types
 */
export type UserRole = 'admin' | 'user' | 'viewer'

/**
 * User interface representing authenticated user data
 */
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Registration data interface
 */
export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

/**
 * Password reset data interface
 */
export interface ForgotPasswordData {
  email: string
}

/**
 * Reset password data interface
 */
export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong'

/**
 * Password requirements interface
 */
export interface PasswordRequirement {
  id: string
  label: string
  isValid: boolean
  description: string
}

/**
 * Password validation result
 */
export interface PasswordValidation {
  strength: PasswordStrength
  score: number
  requirements: PasswordRequirement[]
  isValid: boolean
}

/**
 * Social authentication providers
 */
export type SocialProvider = 'google' | 'github' | 'microsoft'

/**
 * Authentication error types
 */
export type AuthErrorType = 
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_already_exists'
  | 'weak_password'
  | 'network_error'
  | 'server_error'
  | 'validation_error'
  | 'unknown_error'

/**
 * Authentication error interface
 */
export interface AuthError {
  type: AuthErrorType
  message: string
  field?: string
}

/**
 * Authentication service response
 */
export interface AuthResponse<T = any> {
  success: boolean
  data?: T
  error?: AuthError
}

/**
 * Token interface
 */
export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/**
 * Authentication session interface
 */
export interface AuthSession {
  user: User
  token: AuthToken
  lastActivity: string
}

/**
 * Form validation error interface
 */
export interface FormError {
  field: string
  message: string
}

/**
 * Form validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: FormError[]
}

/**
 * Authentication context interface
 */
export interface AuthContextValue {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse<AuthSession>>
  register: (data: RegisterData) => Promise<AuthResponse<AuthSession>>
  logout: () => Promise<void>
  forgotPassword: (data: ForgotPasswordData) => Promise<AuthResponse>
  resetPassword: (data: ResetPasswordData) => Promise<AuthResponse>
  clearError: () => void
  
  // Utilities
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}