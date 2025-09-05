import type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  PasswordValidation,
  PasswordRequirement,
  AuthError,
  AuthResponse,
  AuthToken,
  AuthSession,
  FormError,
  ValidationResult,
} from '../types'

describe('Auth Types', () => {
  describe('User interface', () => {
    it('should have correct User interface structure', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        avatar: 'https://example.com/avatar.jpg',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      expect(user.id).toBe('1')
      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('Test User')
      expect(user.role).toBe('user')
      expect(user.avatar).toBe('https://example.com/avatar.jpg')
      expect(user.createdAt).toBe('2025-01-01T00:00:00Z')
      expect(user.updatedAt).toBe('2025-01-01T00:00:00Z')
    })

    it('should allow optional avatar field', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      expect(user.avatar).toBeUndefined()
    })

    it('should support all user roles', () => {
      const adminUser: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      const regularUser: User = {
        id: '2',
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      const viewerUser: User = {
        id: '3',
        email: 'viewer@example.com',
        name: 'Viewer User',
        role: 'viewer',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      expect(adminUser.role).toBe('admin')
      expect(regularUser.role).toBe('user')
      expect(viewerUser.role).toBe('viewer')
    })
  })

  describe('AuthState interface', () => {
    it('should have correct AuthState structure', () => {
      const authState: AuthState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      }

      expect(authState.user).toBeNull()
      expect(authState.isLoading).toBe(false)
      expect(authState.isAuthenticated).toBe(false)
      expect(authState.error).toBeNull()
    })

    it('should support authenticated state with user', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      const authState: AuthState = {
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      }

      expect(authState.user).toBe(user)
      expect(authState.isAuthenticated).toBe(true)
    })
  })

  describe('Credentials interfaces', () => {
    it('should have correct LoginCredentials structure', () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      }

      expect(credentials.email).toBe('test@example.com')
      expect(credentials.password).toBe('password123')
      expect(credentials.rememberMe).toBe(true)
    })

    it('should allow optional rememberMe field', () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      expect(credentials.rememberMe).toBeUndefined()
    })

    it('should have correct RegisterData structure', () => {
      const registerData: RegisterData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: true,
      }

      expect(registerData.name).toBe('Test User')
      expect(registerData.email).toBe('test@example.com')
      expect(registerData.password).toBe('password123')
      expect(registerData.confirmPassword).toBe('password123')
      expect(registerData.acceptTerms).toBe(true)
    })

    it('should have correct ForgotPasswordData structure', () => {
      const forgotPasswordData: ForgotPasswordData = {
        email: 'test@example.com',
      }

      expect(forgotPasswordData.email).toBe('test@example.com')
    })
  })

  describe('Password validation interfaces', () => {
    it('should have correct PasswordRequirement structure', () => {
      const requirement: PasswordRequirement = {
        id: 'length',
        label: 'At least 8 characters',
        isValid: true,
        description: 'Password must be at least 8 characters long',
      }

      expect(requirement.id).toBe('length')
      expect(requirement.label).toBe('At least 8 characters')
      expect(requirement.isValid).toBe(true)
      expect(requirement.description).toBe('Password must be at least 8 characters long')
    })

    it('should have correct PasswordValidation structure', () => {
      const validation: PasswordValidation = {
        strength: 'strong',
        score: 85,
        requirements: [
          {
            id: 'length',
            label: 'At least 8 characters',
            isValid: true,
            description: 'Password must be at least 8 characters long',
          },
        ],
        isValid: true,
      }

      expect(validation.strength).toBe('strong')
      expect(validation.score).toBe(85)
      expect(validation.requirements).toHaveLength(1)
      expect(validation.isValid).toBe(true)
    })

    it('should support all password strength levels', () => {
      const weakValidation: PasswordValidation = {
        strength: 'weak',
        score: 20,
        requirements: [],
        isValid: false,
      }

      const mediumValidation: PasswordValidation = {
        strength: 'medium',
        score: 60,
        requirements: [],
        isValid: true,
      }

      const strongValidation: PasswordValidation = {
        strength: 'strong',
        score: 90,
        requirements: [],
        isValid: true,
      }

      expect(weakValidation.strength).toBe('weak')
      expect(mediumValidation.strength).toBe('medium')
      expect(strongValidation.strength).toBe('strong')
    })
  })

  describe('Error interfaces', () => {
    it('should have correct AuthError structure', () => {
      const error: AuthError = {
        type: 'invalid_credentials',
        message: 'Invalid email or password',
        field: 'password',
      }

      expect(error.type).toBe('invalid_credentials')
      expect(error.message).toBe('Invalid email or password')
      expect(error.field).toBe('password')
    })

    it('should allow optional field property', () => {
      const error: AuthError = {
        type: 'network_error',
        message: 'Network connection failed',
      }

      expect(error.field).toBeUndefined()
    })

    it('should have correct FormError structure', () => {
      const formError: FormError = {
        field: 'email',
        message: 'Email is required',
      }

      expect(formError.field).toBe('email')
      expect(formError.message).toBe('Email is required')
    })

    it('should have correct ValidationResult structure', () => {
      const validationResult: ValidationResult = {
        isValid: false,
        errors: [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password is required' },
        ],
      }

      expect(validationResult.isValid).toBe(false)
      expect(validationResult.errors).toHaveLength(2)
    })
  })

  describe('Response interfaces', () => {
    it('should have correct AuthResponse structure for success', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      const response: AuthResponse<User> = {
        success: true,
        data: user,
      }

      expect(response.success).toBe(true)
      expect(response.data).toBe(user)
      expect(response.error).toBeUndefined()
    })

    it('should have correct AuthResponse structure for error', () => {
      const response: AuthResponse = {
        success: false,
        error: {
          type: 'invalid_credentials',
          message: 'Invalid email or password',
        },
      }

      expect(response.success).toBe(false)
      expect(response.data).toBeUndefined()
      expect(response.error?.type).toBe('invalid_credentials')
    })

    it('should have correct AuthToken structure', () => {
      const token: AuthToken = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresAt: 1672531200000,
      }

      expect(token.accessToken).toBe('access-token-123')
      expect(token.refreshToken).toBe('refresh-token-456')
      expect(token.expiresAt).toBe(1672531200000)
    })

    it('should have correct AuthSession structure', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      const session: AuthSession = {
        user,
        token: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
          expiresAt: 1672531200000,
        },
        lastActivity: '2025-01-01T00:00:00Z',
      }

      expect(session.user).toBe(user)
      expect(session.token.accessToken).toBe('access-token-123')
      expect(session.lastActivity).toBe('2025-01-01T00:00:00Z')
    })
  })
})