'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { mockAuthService } from '../../lib/auth/mockAuthService'
import type {
  AuthContextValue,
  AuthState,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  AuthSession,
  User,
  UserRole,
} from '../../lib/auth/types'

/**
 * Auth state actions
 */
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }

/**
 * Auth reducer function
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }

    default:
      return state
  }
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
}

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Auth provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const session = mockAuthService.getCurrentSession()
    if (session) {
      dispatch({ type: 'SET_USER', payload: session.user })
    }
  }, [])

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials): Promise<AuthResponse<AuthSession>> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await mockAuthService.login(credentials)

      if (response.success && response.data) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user })
      } else if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error.message })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      return {
        success: false,
        error: {
          type: 'unknown_error',
          message: errorMessage,
        },
      }
    }
  }

  /**
   * Register user
   */
  const register = async (data: RegisterData): Promise<AuthResponse<AuthSession>> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await mockAuthService.register(data)

      if (response.success && response.data) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user })
      } else if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error.message })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      return {
        success: false,
        error: {
          type: 'unknown_error',
          message: errorMessage,
        },
      }
    }
  }

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      await mockAuthService.logout()
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'LOGOUT' })
    }
  }

  /**
   * Send forgot password email
   */
  const forgotPassword = async (data: ForgotPasswordData): Promise<AuthResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await mockAuthService.forgotPassword(data)

      if (!response.success && response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error.message })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      return {
        success: false,
        error: {
          type: 'unknown_error',
          message: errorMessage,
        },
      }
    }
  }

  /**
   * Reset password with token
   */
  const resetPassword = async (data: ResetPasswordData): Promise<AuthResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await mockAuthService.resetPassword(data)

      if (!response.success && response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error.message })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      return {
        success: false,
        error: {
          type: 'unknown_error',
          message: errorMessage,
        },
      }
    }
  }

  /**
   * Clear error state
   */
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  /**
   * Check if user has specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role
  }

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false
  }

  // Context value
  const contextValue: AuthContextValue = {
    // State
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError,

    // Utilities
    hasRole,
    hasAnyRole,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}