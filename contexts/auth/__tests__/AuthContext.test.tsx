import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { mockAuthService } from '../../../lib/auth/mockAuthService'
import type { LoginCredentials, RegisterData, ForgotPasswordData, AuthSession } from '../../../lib/auth/types'

// Mock the auth service
jest.mock('../../../lib/auth/mockAuthService', () => ({
  mockAuthService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    getCurrentSession: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}))

// Test component to access auth context
const TestComponent: React.FC<{
  onMount?: (auth: ReturnType<typeof useAuth>) => void
}> = ({ onMount }) => {
  const auth = useAuth()

  React.useEffect(() => {
    if (onMount) {
      onMount(auth)
    }
  }, [auth, onMount])

  return (
    <div>
      <div data-testid="user-email">{auth.user?.email || 'Not authenticated'}</div>
      <div data-testid="user-name">{auth.user?.name || 'No name'}</div>
      <div data-testid="user-role">{auth.user?.role || 'No role'}</div>
      <div data-testid="is-loading">{auth.isLoading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="is-authenticated">{auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <div data-testid="error">{auth.error || 'No error'}</div>
      <button onClick={() => auth.clearError()}>Clear Error</button>
    </div>
  )
}

const mockedAuthService = mockAuthService as jest.Mocked<typeof mockAuthService>

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('AuthProvider', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = jest.fn()

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      console.error = originalError
    })

    it('should provide initial state when no session exists', () => {
      mockedAuthService.getCurrentSession.mockReturnValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('user-email')).toHaveTextContent('Not authenticated')
      expect(screen.getByTestId('is-loading')).toHaveTextContent('Not loading')
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not authenticated')
      expect(screen.getByTestId('error')).toHaveTextContent('No error')
    })

    it('should initialize with existing session', () => {
      const mockSession: AuthSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          emailVerified: true,
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

      mockedAuthService.getCurrentSession.mockReturnValue(mockSession)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
      expect(screen.getByTestId('user-role')).toHaveTextContent('user')
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated')
    })
  })

  describe('login method', () => {
    it('should handle successful login', async () => {
      const mockSession: AuthSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          emailVerified: true,
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

      mockedAuthService.getCurrentSession.mockReturnValue(null)
      mockedAuthService.login.mockResolvedValue({
        success: true,
        data: mockSession,
      })

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      // Initially not authenticated
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not authenticated')

      // Perform login
      await act(async () => {
        const result = await authContext!.login(credentials)
        expect(result.success).toBe(true)
      })

      // Should now be authenticated
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated')
        expect(screen.getByTestId('is-loading')).toHaveTextContent('Not loading')
      })

      expect(mockedAuthService.login).toHaveBeenCalledWith(credentials)
    })

    it('should handle login failure', async () => {
      mockedAuthService.getCurrentSession.mockReturnValue(null)
      mockedAuthService.login.mockResolvedValue({
        success: false,
        error: {
          type: 'invalid_credentials',
          message: 'Invalid email or password',
        },
      })

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      const credentials: LoginCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      }

      await act(async () => {
        const result = await authContext!.login(credentials)
        expect(result.success).toBe(false)
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password')
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not authenticated')
        expect(screen.getByTestId('is-loading')).toHaveTextContent('Not loading')
      })
    })

    it('should set loading state during login', async () => {
      mockedAuthService.getCurrentSession.mockReturnValue(null)
      
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })
      
      mockedAuthService.login.mockReturnValue(loginPromise as any)

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      // Start login
      act(() => {
        authContext!.login(credentials)
      })

      // Should be loading
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('Loading')
      })

      // Resolve login
      await act(async () => {
        resolveLogin!({
          success: true,
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: 'user',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
            token: {
              accessToken: 'access-token',
              refreshToken: 'refresh-token',
              expiresAt: Date.now() + 3600000,
            },
            lastActivity: '2025-01-01T00:00:00Z',
          },
        })
        await loginPromise
      })

      // Should not be loading anymore
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('Not loading')
      })
    })
  })

  describe('register method', () => {
    it('should handle successful registration', async () => {
      const mockSession: AuthSession = {
        user: {
          id: '2',
          email: 'new@example.com',
          name: 'New User',
          role: 'user',
          emailVerified: false,
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

      mockedAuthService.getCurrentSession.mockReturnValue(null)
      mockedAuthService.register.mockResolvedValue({
        success: true,
        data: mockSession,
      })

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      const registerData: RegisterData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: true,
      }

      await act(async () => {
        const result = await authContext!.register(registerData)
        expect(result.success).toBe(true)
      })

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com')
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated')
      })

      expect(mockedAuthService.register).toHaveBeenCalledWith(registerData)
    })

    it('should handle registration failure', async () => {
      mockedAuthService.getCurrentSession.mockReturnValue(null)
      mockedAuthService.register.mockResolvedValue({
        success: false,
        error: {
          type: 'email_already_exists',
          message: 'Email address is already registered',
        },
      })

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      const registerData: RegisterData = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: true,
      }

      await act(async () => {
        const result = await authContext!.register(registerData)
        expect(result.success).toBe(false)
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Email address is already registered')
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not authenticated')
      })
    })
  })

  describe('logout method', () => {
    it('should handle logout successfully', async () => {
      const mockSession: AuthSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          emailVerified: true,
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

      mockedAuthService.getCurrentSession.mockReturnValue(mockSession)
      mockedAuthService.logout.mockResolvedValue(undefined)

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      // Should initially be authenticated
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated')

      await act(async () => {
        await authContext!.logout()
      })

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Not authenticated')
        expect(screen.getByTestId('user-email')).toHaveTextContent('Not authenticated')
      })

      expect(mockedAuthService.logout).toHaveBeenCalled()
    })
  })

  describe('forgotPassword method', () => {
    it('should handle forgot password successfully', async () => {
      mockedAuthService.getCurrentSession.mockReturnValue(null)
      mockedAuthService.forgotPassword.mockResolvedValue({
        success: true,
        data: {
          message: 'Password reset instructions sent to your email',
        },
      })

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      const forgotPasswordData: ForgotPasswordData = {
        email: 'test@example.com',
      }

      await act(async () => {
        const result = await authContext!.forgotPassword(forgotPasswordData)
        expect(result.success).toBe(true)
        expect(result.data?.message).toBe('Password reset instructions sent to your email')
      })

      expect(mockedAuthService.forgotPassword).toHaveBeenCalledWith(forgotPasswordData)
    })

    it('should handle forgot password failure', async () => {
      mockedAuthService.getCurrentSession.mockReturnValue(null)
      mockedAuthService.forgotPassword.mockResolvedValue({
        success: false,
        error: {
          type: 'user_not_found',
          message: 'Email address not found',
        },
      })

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      const forgotPasswordData: ForgotPasswordData = {
        email: 'nonexistent@example.com',
      }

      await act(async () => {
        const result = await authContext!.forgotPassword(forgotPasswordData)
        expect(result.success).toBe(false)
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Email address not found')
      })
    })
  })

  describe('clearError method', () => {
    it('should clear error state', async () => {
      mockedAuthService.getCurrentSession.mockReturnValue(null)
      mockedAuthService.login.mockResolvedValue({
        success: false,
        error: {
          type: 'invalid_credentials',
          message: 'Invalid email or password',
        },
      })

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      // Create an error
      await act(async () => {
        await authContext!.login({ email: 'test@example.com', password: 'wrong' })
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password')
      })

      // Clear the error
      act(() => {
        authContext!.clearError()
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('No error')
      })
    })
  })

  describe('utility methods', () => {
    it('should check hasRole correctly', () => {
      const mockSession: AuthSession = {
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          emailVerified: true,
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

      mockedAuthService.getCurrentSession.mockReturnValue(mockSession)

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      expect(authContext!.hasRole('admin')).toBe(true)
      expect(authContext!.hasRole('user')).toBe(false)
      expect(authContext!.hasRole('viewer')).toBe(false)
    })

    it('should check hasAnyRole correctly', () => {
      const mockSession: AuthSession = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          emailVerified: true,
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

      mockedAuthService.getCurrentSession.mockReturnValue(mockSession)

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      expect(authContext!.hasAnyRole(['admin', 'user'])).toBe(true)
      expect(authContext!.hasAnyRole(['admin', 'viewer'])).toBe(false)
      expect(authContext!.hasAnyRole(['user'])).toBe(true)
    })

    it('should return false for role checks when not authenticated', () => {
      mockedAuthService.getCurrentSession.mockReturnValue(null)

      let authContext: ReturnType<typeof useAuth>
      render(
        <AuthProvider>
          <TestComponent onMount={(auth) => { authContext = auth }} />
        </AuthProvider>
      )

      expect(authContext!.hasRole('admin')).toBe(false)
      expect(authContext!.hasAnyRole(['admin', 'user'])).toBe(false)
    })
  })
})