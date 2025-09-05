'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '../../../components/auth/AuthLayout'
import { useAuth } from '../../../contexts/auth/AuthContext'

/**
 * Email verification page component
 */
export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading')
  const [message, setMessage] = useState('')

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const verifyEmailWithToken = useCallback(async (verificationToken: string) => {
    try {
      // Simulate email verification API call with token
      console.log(`Verifying email with token: ${verificationToken}`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock success for now
      setVerificationStatus('success')
      setMessage('Your email has been verified successfully!')
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (error) {
      setVerificationStatus('error')
      setMessage('Verification failed. The link may be expired or invalid.')
    }
  }, [router])

  useEffect(() => {
    if (token) {
      // Verify email with token
      verifyEmailWithToken(token)
    } else if (user?.email || email) {
      // Show verification pending state
      setVerificationStatus('pending')
      setMessage(`We've sent a verification email to ${user?.email || email}. Please check your inbox and click the verification link.`)
    } else {
      // No token or email, redirect to login
      router.push('/login')
    }
  }, [token, user?.email, email, router, verifyEmailWithToken])

  const handleResendVerification = async () => {
    try {
      // Simulate resend verification API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Verification email sent! Please check your inbox.')
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.')
    }
  }

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-800">{message}</p>
            <p className="text-sm text-gray-600">You will be redirected to your dashboard shortly.</p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-800">{message}</p>
            <div className="space-y-2">
              <button
                onClick={handleResendVerification}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Resend Verification Email
              </button>
              <Link
                href="/register"
                className="block text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Back to registration
              </Link>
            </div>
          </div>
        )

      case 'pending':
      default:
        return (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-800">{message}</p>
            <div className="space-y-2">
              <button
                onClick={handleResendVerification}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Resend Verification Email
              </button>
              <Link
                href="/login"
                className="block text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        )
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={verificationStatus === 'success' ? 'Email verified successfully!' : 'Check your inbox for the verification link'}
    >
      {renderContent()}
    </AuthLayout>
  )
}