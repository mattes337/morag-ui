'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '../../../components/auth/AuthLayout'
import { RegisterForm } from '../../../components/auth/RegisterForm'

/**
 * Registration page component for new user signup
 */
export default function RegisterPage() {
  const router = useRouter()

  const handleRegisterSuccess = () => {
    // Redirect to verification page or dashboard
    router.push('/verify-email')
  }

  const handleSocialAuth = (provider: string) => {
    // Handle social authentication
    console.log(`Social auth with ${provider}`)
    // Implementation would redirect to social provider
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us to get started with your workspace"
    >
      <div className="space-y-6">
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSocialAuth={handleSocialAuth}
          showSocialAuth={true}
        />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}