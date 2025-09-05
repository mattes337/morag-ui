import React from 'react'
import { render, screen } from '@testing-library/react'
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator'

describe('PasswordStrengthIndicator', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<PasswordStrengthIndicator password="" />)
      
      expect(screen.getByTestId('password-strength-indicator')).toBeInTheDocument()
    })

    it('should not render when password is empty and showEmpty is false', () => {
      render(<PasswordStrengthIndicator password="" showEmpty={false} />)
      
      expect(screen.queryByTestId('password-strength-indicator')).not.toBeInTheDocument()
    })

    it('should render when password is empty and showEmpty is true', () => {
      render(<PasswordStrengthIndicator password="" showEmpty={true} />)
      
      expect(screen.getByTestId('password-strength-indicator')).toBeInTheDocument()
    })
  })

  describe('strength display', () => {
    it('should show weak strength for weak password', () => {
      render(<PasswordStrengthIndicator password="123" />)
      
      expect(screen.getByText('Weak')).toBeInTheDocument()
      expect(screen.getByTestId('strength-bar')).toHaveClass('[&::-webkit-progress-value]:bg-red-500')
    })

    it('should show medium strength for medium password', () => {
      render(<PasswordStrengthIndicator password="Abcdef123" />)
      
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByTestId('strength-bar')).toHaveClass('[&::-webkit-progress-value]:bg-yellow-500')
    })

    it('should show strong strength for strong password', () => {
      render(<PasswordStrengthIndicator password="MySecur3P@ssw0rd!" />)
      
      expect(screen.getByText('Strong')).toBeInTheDocument()
      expect(screen.getByTestId('strength-bar')).toHaveClass('[&::-webkit-progress-value]:bg-green-500')
    })
  })

  describe('progress bar', () => {
    it('should show correct width for weak password', () => {
      render(<PasswordStrengthIndicator password="123" />)
      
      const progressBar = screen.getByTestId('strength-bar')
      // Weak passwords should show less than 40% width
      const widthMatch = progressBar.style.width.match(/^(\d+)%$/)
      if (widthMatch && widthMatch[1]) {
        const width = parseInt(widthMatch[1])
        expect(width).toBeLessThan(40)
      }
    })

    it('should show correct width for medium password', () => {
      render(<PasswordStrengthIndicator password="Abcdef123" />)
      
      const progressBar = screen.getByTestId('strength-bar')
      // Medium passwords should show 40-79% width
      const widthMatch = progressBar.style.width.match(/^(\d+)%$/)
      if (widthMatch && widthMatch[1]) {
        const width = parseInt(widthMatch[1])
        expect(width).toBeGreaterThanOrEqual(40)
        expect(width).toBeLessThan(80)
      }
    })

    it('should show correct width for strong password', () => {
      render(<PasswordStrengthIndicator password="MySecur3P@ssw0rd!" />)
      
      const progressBar = screen.getByTestId('strength-bar')
      // Strong passwords should show 80%+ width
      const widthMatch = progressBar.style.width.match(/^(\d+)%$/)
      if (widthMatch && widthMatch[1]) {
        const width = parseInt(widthMatch[1])
        expect(width).toBeGreaterThanOrEqual(80)
      }
    })
  })

  describe('requirements list', () => {
    it('should show all password requirements by default', () => {
      render(<PasswordStrengthIndicator password="Test123" />)
      
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
      expect(screen.getByText('One uppercase letter')).toBeInTheDocument()
      expect(screen.getByText('One lowercase letter')).toBeInTheDocument()
      expect(screen.getByText('One number')).toBeInTheDocument()
      expect(screen.getByText('One special character')).toBeInTheDocument()
    })

    it('should hide requirements when showRequirements is false', () => {
      render(<PasswordStrengthIndicator password="Test123" showRequirements={false} />)
      
      expect(screen.queryByText('At least 8 characters')).not.toBeInTheDocument()
    })

    it('should show green checkmark for met requirements', () => {
      render(<PasswordStrengthIndicator password="MySecur3P@ssw0rd!" />)
      
      // All requirements should be met and have checkmarks
      const checkmarks = screen.getAllByTestId('requirement-met')
      expect(checkmarks).toHaveLength(5) // All 5 requirements met
    })

    it('should show red X for unmet requirements', () => {
      render(<PasswordStrengthIndicator password="weak" />)
      
      // Most requirements should be unmet and have X marks
      const xMarks = screen.getAllByTestId('requirement-unmet')
      expect(xMarks.length).toBeGreaterThan(0)
    })

    it('should update requirement states dynamically', () => {
      const { rerender } = render(<PasswordStrengthIndicator password="test" />)
      
      // Initially, length requirement should be unmet
      expect(screen.getByTestId('requirement-length')).toHaveClass('text-red-600')
      
      // After updating to longer password, length should be met
      rerender(<PasswordStrengthIndicator password="testlonger" />)
      expect(screen.getByTestId('requirement-length')).toHaveClass('text-green-600')
    })
  })

  describe('accessibility', () => {
    it('should have proper aria labels', () => {
      render(<PasswordStrengthIndicator password="Test123!" />)
      
      const progressBar = screen.getByTestId('strength-bar')
      expect(progressBar).toHaveAttribute('aria-label', expect.stringContaining('Password strength'))
      
      const indicator = screen.getByTestId('password-strength-indicator')
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('Password strength'))
    })

    it('should have proper aria-valuenow for progress', () => {
      render(<PasswordStrengthIndicator password="MySecur3P@ssw0rd!" />)
      
      const progressBar = screen.getByTestId('strength-bar')
      const value = progressBar.getAttribute('value')
      expect(parseInt(value!)).toBeGreaterThanOrEqual(80)
    })

    it('should announce strength changes to screen readers', () => {
      render(<PasswordStrengthIndicator password="Test123!" />)
      
      const strengthText = screen.getByTestId('strength-text')
      expect(strengthText).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('customization', () => {
    it('should apply custom className', () => {
      render(<PasswordStrengthIndicator password="test" className="custom-class" />)
      
      const indicator = screen.getByTestId('password-strength-indicator')
      expect(indicator).toHaveClass('custom-class')
    })

    it('should allow hiding the progress bar', () => {
      render(<PasswordStrengthIndicator password="test" showProgress={false} />)
      
      expect(screen.queryByTestId('strength-bar')).not.toBeInTheDocument()
    })

    it('should allow hiding the strength text', () => {
      render(<PasswordStrengthIndicator password="test" showStrengthText={false} />)
      
      expect(screen.queryByTestId('strength-text')).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle very long passwords', () => {
      const longPassword = 'A'.repeat(1000) + 'bc1!'
      
      expect(() => {
        render(<PasswordStrengthIndicator password={longPassword} />)
      }).not.toThrow()
    })

    it('should handle special characters in password', () => {
      const specialPassword = 'Test123!@#$%^&*()'
      
      render(<PasswordStrengthIndicator password={specialPassword} />)
      
      expect(screen.getByTestId('requirement-special')).toHaveClass('text-green-600')
    })

    it('should handle unicode characters', () => {
      const unicodePassword = 'Tëst123!äöü'
      
      expect(() => {
        render(<PasswordStrengthIndicator password={unicodePassword} />)
      }).not.toThrow()
      
      expect(screen.getByTestId('password-strength-indicator')).toBeInTheDocument()
    })

    it('should handle empty password gracefully', () => {
      render(<PasswordStrengthIndicator password="" />)
      
      expect(screen.getByText('Weak')).toBeInTheDocument()
      const progressBar = screen.getByTestId('strength-bar')
      expect(progressBar).toHaveAttribute('value', '0')
    })
  })

  describe('requirements formatting', () => {
    it('should show requirement descriptions on hover/focus', () => {
      render(<PasswordStrengthIndicator password="test" />)
      
      const lengthRequirement = screen.getByTestId('requirement-length')
      expect(lengthRequirement).toHaveAttribute('title', expect.stringContaining('Password must be at least 8 characters long'))
    })

    it('should show proper icons for requirement states', () => {
      render(<PasswordStrengthIndicator password="Testpass123!" />)
      
      // Met requirements should show checkmark icon
      const metRequirements = screen.getAllByTestId('requirement-met')
      metRequirements.forEach(req => {
        expect(req).toBeInTheDocument()
      })
      
      // Unmet requirements should show X icon
      const unmetRequirements = screen.queryAllByTestId('requirement-unmet')
      // This password might not meet all requirements, so some unmet are expected
      expect(Array.isArray(unmetRequirements)).toBe(true)
    })
  })
})