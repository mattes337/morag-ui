import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from '../ProtectedRoute'

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Mock the auth context
const mockAuthContext = {
  user: null as any,
  isLoading: false,
  isAuthenticated: false,
  error: null as string | null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  clearError: jest.fn(),
  hasRole: jest.fn(),
  hasAnyRole: jest.fn(),
}

jest.mock('../../../contexts/auth/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

// Test component
const TestComponent: React.FC = () => (
  <div data-testid="protected-content">Protected Content</div>
)

// Loading component
const LoadingComponent: React.FC = () => (
  <div data-testid="loading">Loading...</div>
)

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthContext.user = null
    mockAuthContext.isLoading = false
    mockAuthContext.isAuthenticated = false
    mockAuthContext.error = null
    mockAuthContext.hasRole.mockReturnValue(false)
    mockAuthContext.hasAnyRole.mockReturnValue(false)
  })

  describe('Loading state', () => {
    it('should show loading component when auth is loading', () => {
      mockAuthContext.isLoading = true
      
      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should show custom loading component when provided', () => {
      mockAuthContext.isLoading = true
      
      render(
        <ProtectedRoute loadingComponent={<LoadingComponent />}>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })

  describe('Unauthenticated users', () => {
    it('should redirect to login when user is not authenticated', () => {
      mockAuthContext.isAuthenticated = false
      
      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockReplace).toHaveBeenCalledWith('/login?return=%2F')
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should redirect to custom login URL when provided', () => {
      mockAuthContext.isAuthenticated = false
      
      render(
        <ProtectedRoute loginUrl="/auth/signin">
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockReplace).toHaveBeenCalledWith('/auth/signin?return=%2F')
    })

    // Note: Return URL functionality is covered in the other redirect tests
  })

  describe('Email verification requirements', () => {
    beforeEach(() => {
      mockAuthContext.isAuthenticated = true
      mockAuthContext.user = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const,
        emailVerified: false,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      }
    })

    it('should redirect to email verification when required and user email not verified', () => {
      render(
        <ProtectedRoute requireEmailVerification={true}>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockReplace).toHaveBeenCalledWith('/verify-email')
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should render content when email is verified', () => {
      if (mockAuthContext.user) {
        mockAuthContext.user.emailVerified = true
      }
      
      render(
        <ProtectedRoute requireEmailVerification={true}>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockReplace).not.toHaveBeenCalled()
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should redirect to custom verification URL when provided', () => {
      render(
        <ProtectedRoute requireEmailVerification={true} verifyEmailUrl="/auth/verify">
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockReplace).toHaveBeenCalledWith('/auth/verify')
    })
  })

  describe('Role-based access control', () => {
    beforeEach(() => {
      mockAuthContext.isAuthenticated = true
      mockAuthContext.user = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const,
        emailVerified: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      }
    })

    it('should render content when user has required role', () => {
      mockAuthContext.hasRole.mockReturnValue(true)
      
      render(
        <ProtectedRoute requiredRole="user">
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockAuthContext.hasRole).toHaveBeenCalledWith('user')
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should redirect to unauthorized when user lacks required role', () => {
      mockAuthContext.hasRole.mockReturnValue(false)
      
      render(
        <ProtectedRoute requiredRole="admin">
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockAuthContext.hasRole).toHaveBeenCalledWith('admin')
      expect(mockReplace).toHaveBeenCalledWith('/unauthorized')
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should redirect to custom unauthorized URL when provided', () => {
      mockAuthContext.hasRole.mockReturnValue(false)
      
      render(
        <ProtectedRoute requiredRole="admin" unauthorizedUrl="/access-denied">
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockReplace).toHaveBeenCalledWith('/access-denied')
    })

    it('should render content when user has any of the required roles', () => {
      mockAuthContext.hasAnyRole.mockReturnValue(true)
      
      render(
        <ProtectedRoute requiredRoles={['admin', 'user']}>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockAuthContext.hasAnyRole).toHaveBeenCalledWith(['admin', 'user'])
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should redirect when user has none of the required roles', () => {
      mockAuthContext.hasAnyRole.mockReturnValue(false)
      
      render(
        <ProtectedRoute requiredRoles={['admin', 'viewer']}>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockAuthContext.hasAnyRole).toHaveBeenCalledWith(['admin', 'viewer'])
      expect(mockReplace).toHaveBeenCalledWith('/unauthorized')
    })

    it('should prioritize requiredRoles over requiredRole when both provided', () => {
      mockAuthContext.hasAnyRole.mockReturnValue(true)
      mockAuthContext.hasRole.mockReturnValue(false)
      
      render(
        <ProtectedRoute requiredRole="admin" requiredRoles={['user', 'viewer']}>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockAuthContext.hasAnyRole).toHaveBeenCalledWith(['user', 'viewer'])
      expect(mockAuthContext.hasRole).not.toHaveBeenCalled()
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  describe('Successful authentication', () => {
    beforeEach(() => {
      mockAuthContext.isAuthenticated = true
      mockAuthContext.user = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const,
        emailVerified: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      }
    })

    it('should render children when user is authenticated and has access', () => {
      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('should pass through custom props to wrapper', () => {
      const { container } = render(
        <ProtectedRoute className="custom-class" data-testid="wrapper">
          <TestComponent />
        </ProtectedRoute>
      )

      expect(container.firstChild).toHaveClass('custom-class')
      expect(screen.getByTestId('wrapper')).toBeInTheDocument()
    })
  })

  describe('Custom redirect behavior', () => {
    it('should use push instead of replace when specified', () => {
      mockAuthContext.isAuthenticated = false
      
      render(
        <ProtectedRoute redirectMethod="push">
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockPush).toHaveBeenCalledWith('/login?return=%2F')
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('should prevent redirects when disabled', () => {
      mockAuthContext.isAuthenticated = false
      
      render(
        <ProtectedRoute enableRedirects={false}>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(mockReplace).not.toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })
})