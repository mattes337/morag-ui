/**
 * Mock authentication service for development and testing
 * Simulates real authentication behavior with delays and various scenarios
 */

import type {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  AuthSession,
  User,
  AuthToken,
} from './types'

/**
 * Simulates network delay
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a mock user based on email
 */
const generateMockUser = (email: string, name: string): User => {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    email,
    name,
    role: email.includes('admin') ? 'admin' : 'user',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    emailVerified: true, // Mock users are considered email verified by default
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Generate mock authentication token
 */
const generateMockToken = (): AuthToken => {
  const now = Date.now()
  return {
    accessToken: `access_${Math.random().toString(36).substring(2, 15)}`,
    refreshToken: `refresh_${Math.random().toString(36).substring(2, 15)}`,
    expiresAt: now + (24 * 60 * 60 * 1000), // 24 hours from now
  }
}

/**
 * Mock users database - predefined users for testing
 */
const mockUsers = new Map([
  ['test@example.com', { name: 'Test User', password: 'password123' }],
  ['admin@example.com', { name: 'Admin User', password: 'admin123' }],
  ['user@example.com', { name: 'Regular User', password: 'user123' }],
])

/**
 * Check if password meets strength requirements
 */
const isPasswordStrong = (password: string): boolean => {
  return password.length >= 8
}

/**
 * Storage key for authentication session
 */
const AUTH_SESSION_KEY = 'auth_session'

/**
 * Mock authentication service implementation
 */
export const mockAuthService = {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse<AuthSession>> {
    await delay(500)

    const { email, password, rememberMe } = credentials

    // Simulate network error for specific email
    if (email === 'network.error@example.com') {
      return {
        success: false,
        error: {
          type: 'network_error',
          message: 'Network connection failed',
        },
      }
    }

    // Check if user exists and password matches
    const mockUser = mockUsers.get(email)
    if (!mockUser || mockUser.password !== password) {
      return {
        success: false,
        error: {
          type: 'invalid_credentials',
          message: 'Invalid email or password',
          field: 'password',
        },
      }
    }

    // Generate user and session
    const user = generateMockUser(email, mockUser.name)
    const token = generateMockToken()
    const session: AuthSession = {
      user,
      token,
      lastActivity: new Date().toISOString(),
    }

    // Store session if remember me is enabled
    if (rememberMe !== false) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
    }

    return {
      success: true,
      data: session,
    }
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse<AuthSession>> {
    await delay(500)

    const { name, email, password, confirmPassword, acceptTerms } = data

    // Validate terms acceptance
    if (!acceptTerms) {
      return {
        success: false,
        error: {
          type: 'validation_error',
          message: 'You must accept the terms and conditions',
          field: 'acceptTerms',
        },
      }
    }

    // Validate password match
    if (password !== confirmPassword) {
      return {
        success: false,
        error: {
          type: 'validation_error',
          message: 'Passwords do not match',
          field: 'confirmPassword',
        },
      }
    }

    // Validate password strength
    if (!isPasswordStrong(password)) {
      return {
        success: false,
        error: {
          type: 'weak_password',
          message: 'Password is too weak. Must be at least 8 characters long.',
          field: 'password',
        },
      }
    }

    // Check if email already exists
    if (mockUsers.has(email)) {
      return {
        success: false,
        error: {
          type: 'email_already_exists',
          message: 'Email address is already registered',
          field: 'email',
        },
      }
    }

    // Register the new user
    mockUsers.set(email, { name, password })

    // Generate user and session
    const user = generateMockUser(email, name)
    const token = generateMockToken()
    const session: AuthSession = {
      user,
      token,
      lastActivity: new Date().toISOString(),
    }

    // Store session in localStorage
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))

    return {
      success: true,
      data: session,
    }
  },

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    await delay(200)
    localStorage.removeItem(AUTH_SESSION_KEY)
  },

  /**
   * Send password reset instructions
   */
  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse<{ message: string }>> {
    await delay(500)

    const { email } = data

    // Check if user exists
    if (!mockUsers.has(email)) {
      return {
        success: false,
        error: {
          type: 'user_not_found',
          message: 'Email address not found',
          field: 'email',
        },
      }
    }

    return {
      success: true,
      data: {
        message: 'Password reset instructions sent to your email',
      },
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<AuthResponse<{ message: string }>> {
    await delay(500)

    const { token, password, confirmPassword } = data

    // Validate password match
    if (password !== confirmPassword) {
      return {
        success: false,
        error: {
          type: 'validation_error',
          message: 'Passwords do not match',
          field: 'confirmPassword',
        },
      }
    }

    // Validate password strength
    if (!isPasswordStrong(password)) {
      return {
        success: false,
        error: {
          type: 'weak_password',
          message: 'Password is too weak. Must be at least 8 characters long.',
          field: 'password',
        },
      }
    }

    // Simulate token validation - in real implementation this would validate JWT/token
    if (!token || token.length < 10) {
      return {
        success: false,
        error: {
          type: 'validation_error',
          message: 'Invalid or expired reset token',
          field: 'token',
        },
      }
    }

    // For demo purposes, always succeed if token looks valid
    return {
      success: true,
      data: {
        message: 'Password has been reset successfully',
      },
    }
  },

  /**
   * Get current authentication session from localStorage
   */
  getCurrentSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem(AUTH_SESSION_KEY)
      if (!sessionData) {
        return null
      }

      const session: AuthSession = JSON.parse(sessionData)
      
      // Check if token is expired
      if (session.token.expiresAt <= Date.now()) {
        localStorage.removeItem(AUTH_SESSION_KEY)
        return null
      }

      return session
    } catch (error) {
      // Handle invalid JSON or other errors
      localStorage.removeItem(AUTH_SESSION_KEY)
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null
  },

  /**
   * Get current user if authenticated
   */
  getCurrentUser(): User | null {
    const session = this.getCurrentSession()
    return session?.user || null
  },
}