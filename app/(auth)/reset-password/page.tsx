'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthLayout } from '../../../components/auth/AuthLayout'
import { ResetPasswordForm } from '../../../components/auth/ResetPasswordForm'

/**
 * Reset password page component for setting new password
 */
export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const handlePasswordReset = () => {
    // Redirect to login with success message
    router.push('/login?message=Password reset successful')
  }

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="This password reset link is invalid or has expired"
        backHref="/forgot-password"
        backText="← Request new reset link"
      >
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Please request a new password reset link to continue.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter your new password below"
      backHref="/login"
      backText="← Back to sign in"
    >
      <ResetPasswordForm
        token={token}
        onSuccess={handlePasswordReset}
      />
    </AuthLayout>
  )
}