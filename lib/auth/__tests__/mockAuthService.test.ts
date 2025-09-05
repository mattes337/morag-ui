import { mockAuthService } from '../mockAuthService'
import type { LoginCredentials, RegisterData, ForgotPasswordData } from '../types'

// Mock timers for testing delays
jest.useFakeTimers()

// Type assertion for localStorage mock
const mockLocalStorage = localStorage as jest.Mocked<Storage>

describe('mockAuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
  })

  describe('login', () => {
    it('should fail with invalid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      }

      const loginPromise = mockAuthService.login(credentials)
      
      // Fast-forward time to resolve the promise
      jest.advanceTimersByTime(500)
      
      const result = await loginPromise
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('invalid_credentials')
      expect(result.error?.message).toBe('Invalid email or password')
    })

    it('should succeed with valid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      const loginPromise = mockAuthService.login(credentials)
      
      // Fast-forward time to resolve the promise
      jest.advanceTimersByTime(500)
      
      const result = await loginPromise
      
      expect(result.success).toBe(true)
      expect(result.data?.user.email).toBe('test@example.com')
      expect(result.data?.user.name).toBe('Test User')
      expect(result.data?.user.role).toBe('user')
      expect(result.data?.token.accessToken).toBeDefined()
      expect(result.data?.token.refreshToken).toBeDefined()
    })

    it('should store session in localStorage on successful login', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      }

      const loginPromise = mockAuthService.login(credentials)
      jest.advanceTimersByTime(500)
      const result = await loginPromise
      
      expect(result.success).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_session',
        expect.any(String)
      )
    })

    it('should not store session when rememberMe is false', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      }

      const loginPromise = mockAuthService.login(credentials)
      jest.advanceTimersByTime(500)
      await loginPromise
      
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('should handle network error simulation', async () => {
      const credentials: LoginCredentials = {
        email: 'network.error@example.com',
        password: 'password123',
      }

      const loginPromise = mockAuthService.login(credentials)
      jest.advanceTimersByTime(500)
      const result = await loginPromise
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('network_error')
      expect(result.error?.message).toBe('Network connection failed')
    })
  })

  describe('register', () => {
    it('should fail when email already exists', async () => {
      const registerData: RegisterData = {
        name: 'New User',
        email: 'test@example.com', // This email is already "taken"
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: true,
      }

      const registerPromise = mockAuthService.register(registerData)
      jest.advanceTimersByTime(500)
      const result = await registerPromise
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('email_already_exists')
      expect(result.error?.message).toBe('Email address is already registered')
    })

    it('should fail when passwords do not match', async () => {
      const registerData: RegisterData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'different password',
        acceptTerms: true,
      }

      const registerPromise = mockAuthService.register(registerData)
      jest.advanceTimersByTime(500)
      const result = await registerPromise
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('validation_error')
      expect(result.error?.message).toBe('Passwords do not match')
      expect(result.error?.field).toBe('confirmPassword')
    })

    it('should fail when password is too weak', async () => {
      const registerData: RegisterData = {
        name: 'New User',
        email: 'new@example.com',
        password: '123', // Too weak
        confirmPassword: '123',
        acceptTerms: true,
      }

      const registerPromise = mockAuthService.register(registerData)
      jest.advanceTimersByTime(500)
      const result = await registerPromise
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('weak_password')
      expect(result.error?.message).toBe('Password is too weak. Must be at least 8 characters long.')
    })

    it('should fail when terms are not accepted', async () => {
      const registerData: RegisterData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: false,
      }

      const registerPromise = mockAuthService.register(registerData)
      jest.advanceTimersByTime(500)
      const result = await registerPromise
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('validation_error')
      expect(result.error?.message).toBe('You must accept the terms and conditions')
      expect(result.error?.field).toBe('acceptTerms')
    })

    it('should succeed with valid registration data', async () => {
      const registerData: RegisterData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: true,
      }

      const registerPromise = mockAuthService.register(registerData)
      jest.advanceTimersByTime(500)
      const result = await registerPromise
      
      expect(result.success).toBe(true)
      expect(result.data?.user.email).toBe('new@example.com')
      expect(result.data?.user.name).toBe('New User')
      expect(result.data?.user.role).toBe('user')
      expect(result.data?.token).toBeDefined()
    })

    it('should store session in localStorage on successful registration', async () => {
      const registerData: RegisterData = {
        name: 'New User',
        email: 'newuser@example.com', // Use different email to avoid conflicts
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: true,
      }

      const registerPromise = mockAuthService.register(registerData)
      jest.advanceTimersByTime(500)
      const result = await registerPromise
      
      expect(result.success).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_session',
        expect.any(String)
      )
    })
  })

  describe('logout', () => {
    it('should remove session from localStorage', async () => {
      const logoutPromise = mockAuthService.logout()
      jest.advanceTimersByTime(200)
      await logoutPromise
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_session')
    })

    it('should complete successfully', async () => {
      const logoutPromise = mockAuthService.logout()
      jest.advanceTimersByTime(200)
      
      await expect(logoutPromise).resolves.toBeUndefined()
    })
  })

  describe('forgotPassword', () => {
    it('should succeed for registered email', async () => {
      const forgotPasswordData: ForgotPasswordData = {
        email: 'test@example.com',
      }

      const forgotPasswordPromise = mockAuthService.forgotPassword(forgotPasswordData)
      jest.advanceTimersByTime(500)
      const result = await forgotPasswordPromise
      
      expect(result.success).toBe(true)
      expect(result.data?.message).toBe('Password reset instructions sent to your email')
    })

    it('should fail for unregistered email', async () => {
      const forgotPasswordData: ForgotPasswordData = {
        email: 'nonexistent@example.com',
      }

      const forgotPasswordPromise = mockAuthService.forgotPassword(forgotPasswordData)
      jest.advanceTimersByTime(500)
      const result = await forgotPasswordPromise
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('user_not_found')
      expect(result.error?.message).toBe('Email address not found')
    })
  })

  describe('getCurrentSession', () => {
    it('should return null when no session exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const session = mockAuthService.getCurrentSession()
      
      expect(session).toBeNull()
    })

    it('should return session when valid session exists', () => {
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        token: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: Date.now() + 3600000, // 1 hour from now
        },
        lastActivity: '2025-01-01T00:00:00Z',
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSession))
      
      const session = mockAuthService.getCurrentSession()
      
      expect(session).toEqual(mockSession)
    })

    it('should return null when session is expired', () => {
      const expiredSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        token: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: Date.now() - 3600000, // 1 hour ago
        },
        lastActivity: '2025-01-01T00:00:00Z',
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredSession))
      
      const session = mockAuthService.getCurrentSession()
      
      expect(session).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_session')
    })

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      
      const session = mockAuthService.getCurrentSession()
      
      expect(session).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_session')
    })
  })


  describe('utility methods', () => {
    it('should check if user is authenticated correctly', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      expect(mockAuthService.isAuthenticated()).toBe(false)
      
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        token: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: Date.now() + 3600000, // 1 hour from now
        },
        lastActivity: '2025-01-01T00:00:00Z',
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSession))
      expect(mockAuthService.isAuthenticated()).toBe(true)
    })
    
    it('should get current user correctly', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      expect(mockAuthService.getCurrentUser()).toBeNull()
      
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        token: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: Date.now() + 3600000,
        },
        lastActivity: '2025-01-01T00:00:00Z',
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSession))
      expect(mockAuthService.getCurrentUser()).toEqual(mockSession.user)
    })
  })
})
