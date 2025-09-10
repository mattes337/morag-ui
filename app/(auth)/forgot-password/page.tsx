'use client'

import React from 'react'
import Link from 'next/link'
import { AuthLayout } from '../../../components/auth/AuthLayout'
import { ForgotPasswordForm } from '../../../components/auth/ForgotPasswordForm'

/**
 * Forgot password page component for password reset requests
 */
export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
      backHref="/login"
      backText="← Back to sign in"
    >
      <div className="space-y-6">
        <ForgotPasswordForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}