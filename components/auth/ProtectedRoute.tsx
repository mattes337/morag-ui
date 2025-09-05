'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/auth/AuthContext'
import { cn } from '../../lib/utils'
import type { UserRole } from '../../lib/auth/types'

/**
 * Props for the ProtectedRoute component
 */
export interface ProtectedRouteProps {
  /**
   * Child components to render when access is granted
   */
  children: React.ReactNode

  /**
   * Required role for access (single role)
   */
  requiredRole?: UserRole

  /**
   * Required roles for access (any of the specified roles)
   * Takes precedence over requiredRole if both are provided
   */
  requiredRoles?: UserRole[]

  /**
   * Whether email verification is required
   * @default false
   */
  requireEmailVerification?: boolean

  /**
   * URL to redirect to when user is not authenticated
   * @default "/login"
   */
  loginUrl?: string

  /**
   * URL to redirect to when user is not authorized (lacks required role)
   * @default "/unauthorized"
   */
  unauthorizedUrl?: string

  /**
   * URL to redirect to when email verification is required
   * @default "/verify-email"
   */
  verifyEmailUrl?: string

  /**
   * Component to show while auth state is loading
   */
  loadingComponent?: React.ReactNode

  /**
   * Method to use for redirects
   * @default "replace"
   */
  redirectMethod?: 'push' | 'replace'

  /**
   * Whether to enable automatic redirects
   * @default true
   */
  enableRedirects?: boolean

  /**
   * Custom CSS classes for the wrapper
   */
  className?: string

  /**
   * Additional props to pass to the wrapper div
   */
  [key: string]: any
}

/**
 * Default loading component
 */
const DefaultLoadingComponent: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
)

/**
 * Route protection component with role-based access control and email verification
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  requireEmailVerification = false,
  loginUrl = '/login',
  unauthorizedUrl = '/unauthorized',
  verifyEmailUrl = '/verify-email',
  loadingComponent,
  redirectMethod = 'replace',
  enableRedirects = true,
  className,
  ...props
}) => {
  const { user, isLoading, isAuthenticated, hasRole, hasAnyRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!enableRedirects) {
      return
    }

    // Don't redirect while loading
    if (isLoading) {
      return
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      const returnUrl = currentPath ? `?return=${encodeURIComponent(currentPath)}` : ''
      const redirectUrl = `${loginUrl}${returnUrl}`
      
      if (redirectMethod === 'push') {
        router.push(redirectUrl)
      } else {
        router.replace(redirectUrl)
      }
      return
    }

    // Check email verification requirement
    if (requireEmailVerification && user && !user.emailVerified) {
      if (redirectMethod === 'push') {
        router.push(verifyEmailUrl)
      } else {
        router.replace(verifyEmailUrl)
      }
      return
    }

    // Check role-based authorization
    if (requiredRoles || requiredRole) {
      const hasRequiredAccess = requiredRoles 
        ? hasAnyRole(requiredRoles)
        : requiredRole 
          ? hasRole(requiredRole)
          : true

      if (!hasRequiredAccess) {
        if (redirectMethod === 'push') {
          router.push(unauthorizedUrl)
        } else {
          router.replace(unauthorizedUrl)
        }
        return
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    requiredRole,
    requiredRoles,
    requireEmailVerification,
    loginUrl,
    unauthorizedUrl,
    verifyEmailUrl,
    redirectMethod,
    enableRedirects,
    router,
    hasRole,
    hasAnyRole,
  ])

  // Show loading state
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <DefaultLoadingComponent />
    )
  }

  // Don't render if redirects are enabled (user will be redirected)
  if (enableRedirects) {
    // Check authentication
    if (!isAuthenticated) {
      return null
    }

    // Check email verification
    if (requireEmailVerification && user && !user.emailVerified) {
      return null
    }

    // Check role-based access
    if (requiredRoles || requiredRole) {
      const hasRequiredAccess = requiredRoles 
        ? hasAnyRole(requiredRoles)
        : requiredRole 
          ? hasRole(requiredRole)
          : true

      if (!hasRequiredAccess) {
        return null
      }
    }
  } else {
    // When redirects are disabled, just check access without redirecting
    if (!isAuthenticated) {
      return null
    }

    if (requireEmailVerification && user && !user.emailVerified) {
      return null
    }

    if (requiredRoles || requiredRole) {
      const hasRequiredAccess = requiredRoles 
        ? hasAnyRole(requiredRoles)
        : requiredRole 
          ? hasRole(requiredRole)
          : true

      if (!hasRequiredAccess) {
        return null
      }
    }
  }

  // Render protected content
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}