'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '../../../components/auth/AuthLayout'
import { LoginForm } from '../../../components/auth/LoginForm'

/**
 * Login page component providing user authentication
 */
export default function LoginPage() {
  const router = useRouter()

  const handleLoginSuccess = () => {
    // Redirect to dashboard on successful login
    router.push('/dashboard')
  }

  const handleSocialAuth = (provider: string) => {
    // Handle social authentication
    console.log(`Social auth with ${provider}`)
    // Implementation would redirect to social provider
  }

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Welcome back! Please sign in to continue"
    >
      <div className="space-y-6">
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSocialAuth={handleSocialAuth}
          showSocialAuth={true}
          showForgotPassword={true}
        />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}