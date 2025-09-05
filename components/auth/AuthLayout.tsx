'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardHeader, CardDescription } from '../ui/Card'

/**
 * Props for the AuthLayout component
 */
export interface AuthLayoutProps {
  /**
   * Main title for the authentication page
   */
  title: string

  /**
   * Optional subtitle/description
   */
  subtitle?: string

  /**
   * URL for the back button navigation
   */
  backHref?: string

  /**
   * Text for the back button
   * @default "← Back"
   */
  backText?: string

  /**
   * Whether the layout is in a loading state
   * @default false
   */
  loading?: boolean

  /**
   * Custom className for the main container
   */
  className?: string

  /**
   * Custom className for the card container
   */
  cardClassName?: string

  /**
   * Children components (typically forms)
   */
  children: React.ReactNode
}

/**
 * Centered authentication layout component providing consistent structure
 * for authentication pages including login, register, forgot password, etc.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  backHref,
  backText = '← Back',
  loading = false,
  className,
  cardClassName,
  children,
}) => {
  return (
    <main className={cn(
      'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8',
      className
    )}>
      <div className="w-full max-w-md space-y-6">
        {/* Back button */}
        {backHref && (
          <div className="text-center">
            <Link
              href={backHref}
              className={cn(
                'inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1',
                loading && 'pointer-events-none opacity-50'
              )}
              aria-disabled={loading}
            >
              {backText}
            </Link>
          </div>
        )}

        {/* Main card */}
        <Card className={cn(
          'border-0 shadow-lg bg-white',
          cardClassName
        )}>
          <CardHeader className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <CardDescription className="text-gray-600">
                {subtitle}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}