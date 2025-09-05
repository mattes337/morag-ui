import React from 'react'
import { render, screen } from '@testing-library/react'
import { AuthLayout } from '../AuthLayout'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, ...props }: any) {
    return <a {...props}>{children}</a>
  }
})

describe('AuthLayout', () => {
  describe('Basic rendering', () => {
    it('should render children content', () => {
      const testContent = 'Test form content'
      
      render(
        <AuthLayout title="Test Title">
          <div>{testContent}</div>
        </AuthLayout>
      )

      expect(screen.getByText(testContent)).toBeInTheDocument()
    })

    it('should render title when provided', () => {
      const title = 'Sign In'
      
      render(
        <AuthLayout title={title}>
          <div>Content</div>
        </AuthLayout>
      )

      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    })

    it('should render subtitle when provided', () => {
      const subtitle = 'Welcome back to your account'
      
      render(
        <AuthLayout title="Sign In" subtitle={subtitle}>
          <div>Content</div>
        </AuthLayout>
      )

      expect(screen.getByText(subtitle)).toBeInTheDocument()
    })

    it('should not render subtitle section when subtitle is not provided', () => {
      render(
        <AuthLayout title="Sign In">
          <div>Content</div>
        </AuthLayout>
      )

      // Should only find the title, not subtitle text
      expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument()
    })
  })

  describe('Back button functionality', () => {
    it('should render back button when backHref is provided', () => {
      render(
        <AuthLayout title="Sign In" backHref="/dashboard" backText="Back to Dashboard">
          <div>Content</div>
        </AuthLayout>
      )

      const backButton = screen.getByText('Back to Dashboard')
      expect(backButton).toBeInTheDocument()
      expect(backButton.closest('a')).toHaveAttribute('href', '/dashboard')
    })

    it('should use default back text when backHref is provided but backText is not', () => {
      render(
        <AuthLayout title="Sign In" backHref="/dashboard">
          <div>Content</div>
        </AuthLayout>
      )

      expect(screen.getByText('← Back')).toBeInTheDocument()
    })

    it('should not render back button when backHref is not provided', () => {
      render(
        <AuthLayout title="Sign In">
          <div>Content</div>
        </AuthLayout>
      )

      expect(screen.queryByText(/back/i)).not.toBeInTheDocument()
    })
  })

  describe('Layout structure and accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <AuthLayout title="Sign In" subtitle="Welcome back">
          <form aria-label="test form">
            <input type="text" />
          </form>
        </AuthLayout>
      )

      // Should have main landmark
      expect(screen.getByRole('main')).toBeInTheDocument()
      
      // Should have proper heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      
      // Form should be accessible within the layout
      expect(screen.getByRole('form')).toBeInTheDocument()
    })

    it('should have responsive design classes for centering', () => {
      const { container } = render(
        <AuthLayout title="Sign In">
          <div>Content</div>
        </AuthLayout>
      )

      const mainElement = container.querySelector('main')
      expect(mainElement).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
    })

    it('should apply card styling to the content wrapper', () => {
      const { container } = render(
        <AuthLayout title="Sign In">
          <div>Content</div>
        </AuthLayout>
      )

      // Should have card-like styling for the content area
      const cardElement = container.querySelector('[class*="rounded-lg"]')
      expect(cardElement).toBeInTheDocument()
    })
  })

  describe('Custom styling', () => {
    it('should accept and apply custom className', () => {
      const customClass = 'custom-auth-layout'
      const { container } = render(
        <AuthLayout title="Sign In" className={customClass}>
          <div>Content</div>
        </AuthLayout>
      )

      expect(container.firstChild).toHaveClass(customClass)
    })

    it('should allow customization of card styling', () => {
      const customCardClass = 'custom-card-style'
      render(
        <AuthLayout title="Sign In" cardClassName={customCardClass}>
          <div>Content</div>
        </AuthLayout>
      )

      const cardElement = document.querySelector(`.${customCardClass}`)
      expect(cardElement).toBeInTheDocument()
    })
  })

  describe('Content organization', () => {
    it('should organize content with proper spacing', () => {
      render(
        <AuthLayout title="Sign In" subtitle="Welcome back">
          <div data-testid="form-content">Form</div>
        </AuthLayout>
      )

      // Check that content is properly organized
      const title = screen.getByText('Sign In')
      const subtitle = screen.getByText('Welcome back')
      const content = screen.getByTestId('form-content')

      // Title should come first
      expect(title.compareDocumentPosition(subtitle)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      // Subtitle should come before content
      expect(subtitle.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })

  describe('Loading state support', () => {
    it('should support loading state prop', () => {
      render(
        <AuthLayout title="Sign In" loading={true}>
          <div>Content</div>
        </AuthLayout>
      )

      // When loading, back button should be disabled if present
      // This will be useful for form submission states
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    it('should disable back button when loading', () => {
      render(
        <AuthLayout title="Sign In" backHref="/dashboard" loading={true}>
          <div>Content</div>
        </AuthLayout>
      )

      const backLink = screen.getByText('← Back').closest('a')
      expect(backLink).toHaveClass('pointer-events-none', 'opacity-50')
    })
  })
})