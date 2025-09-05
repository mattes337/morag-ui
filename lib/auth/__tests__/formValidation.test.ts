import {
  validateEmail,
  validateName,
  validateLoginForm,
  validateRegisterForm,
  validateForgotPasswordForm,
  isValidEmail,
  EMAIL_REGEX,
} from '../formValidation'
import type { LoginCredentials, RegisterData, ForgotPasswordData } from '../types'

describe('formValidation', () => {
  describe('EMAIL_REGEX constant', () => {
    it('should be a valid regex', () => {
      expect(EMAIL_REGEX).toBeInstanceOf(RegExp)
      expect(EMAIL_REGEX.global).toBe(false)
      expect(EMAIL_REGEX.ignoreCase).toBe(true)
    })

    it('should match valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@company.org',
        'email123@test-domain.net',
        'a@b.co',
        '123@456.com',
        'test_email@domain.info',
      ]

      validEmails.forEach(email => {
        expect(EMAIL_REGEX.test(email)).toBe(true)
      })
    })

    it('should not match invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        '@domain.com',
        'user@',
        'user name@domain.com',
        'user@domain',
      ]

      invalidEmails.forEach(email => {
        expect(EMAIL_REGEX.test(email)).toBe(false)
      })
    })
  })

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user+tag@domain.org')).toBe(true)
      expect(isValidEmail('firstname.lastname@company.co.uk')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidEmail(' test@example.com ')).toBe(true) // Should trim
      expect(isValidEmail('TEST@EXAMPLE.COM')).toBe(true) // Case insensitive
    })
  })

  describe('validateEmail', () => {
    it('should pass for valid emails', () => {
      const result = validateEmail('test@example.com')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail for empty email', () => {
      const result = validateEmail('')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.field).toBe('email')
      expect(result.errors[0]?.message).toBe('Email address is required')
    })

    it('should fail for invalid email format', () => {
      const result = validateEmail('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.field).toBe('email')
      expect(result.errors[0]?.message).toBe('Please enter a valid email address')
    })

    it('should trim whitespace', () => {
      const result = validateEmail('  test@example.com  ')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle very long emails', () => {
      const longEmail = 'a'.repeat(300) + '@example.com'
      const result = validateEmail(longEmail)
      expect(result.isValid).toBe(false)
      expect(result.errors[0]?.message).toBe('Email address is too long (maximum 254 characters)')
    })
  })

  describe('validateName', () => {
    it('should pass for valid names', () => {
      const validNames = ['John', 'Mary Jane', 'José María', "O'Connor", 'Jean-Claude']
      
      validNames.forEach(name => {
        const result = validateName(name)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should fail for empty name', () => {
      const result = validateName('')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]?.field).toBe('name')
      expect(result.errors[0]?.message).toBe('Name is required')
    })

    it('should fail for names that are too short', () => {
      const result = validateName('A')
      expect(result.isValid).toBe(false)
      expect(result.errors[0]?.message).toBe('Name must be at least 2 characters long')
    })

    it('should fail for names that are too long', () => {
      const longName = 'A'.repeat(101)
      const result = validateName(longName)
      expect(result.isValid).toBe(false)
      expect(result.errors[0]?.message).toBe('Name must be less than 100 characters long')
    })

    it('should fail for names with invalid characters', () => {
      const invalidNames = ['John123', 'Mary@Jane', 'Test<Name>', 'User&Name']
      
      invalidNames.forEach(name => {
        const result = validateName(name)
        expect(result.isValid).toBe(false)
        expect(result.errors[0]?.message).toBe('Name can only contain letters, spaces, hyphens, and apostrophes')
      })
    })

    it('should trim whitespace', () => {
      const result = validateName('  John Doe  ')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('validateLoginForm', () => {
    const validCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should pass for valid credentials', () => {
      const result = validateLoginForm(validCredentials)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail when email is invalid', () => {
      const result = validateLoginForm({
        ...validCredentials,
        email: 'invalid-email',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'email')).toBe(true)
    })

    it('should fail when password is empty', () => {
      const result = validateLoginForm({
        ...validCredentials,
        password: '',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'password')).toBe(true)
      expect(result.errors.find(e => e.field === 'password')?.message).toBe('Password is required')
    })

    it('should accumulate multiple errors', () => {
      const result = validateLoginForm({
        email: '',
        password: '',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors.some(e => e.field === 'email')).toBe(true)
      expect(result.errors.some(e => e.field === 'password')).toBe(true)
    })

    it('should handle rememberMe field', () => {
      const result = validateLoginForm({
        ...validCredentials,
        rememberMe: true,
      })
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateRegisterForm', () => {
    const validData: RegisterData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'MySecurePass123!',
      confirmPassword: 'MySecurePass123!',
      acceptTerms: true,
    }

    it('should pass for valid registration data', () => {
      const result = validateRegisterForm(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail when name is invalid', () => {
      const result = validateRegisterForm({
        ...validData,
        name: '',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'name')).toBe(true)
    })

    it('should fail when email is invalid', () => {
      const result = validateRegisterForm({
        ...validData,
        email: 'invalid-email',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'email')).toBe(true)
    })

    it('should fail when password is too weak', () => {
      const result = validateRegisterForm({
        ...validData,
        password: 'weak',
        confirmPassword: 'weak',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'password')).toBe(true)
    })

    it('should fail when passwords do not match', () => {
      const result = validateRegisterForm({
        ...validData,
        confirmPassword: 'DifferentPassword123!',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'confirmPassword')).toBe(true)
      expect(result.errors.find(e => e.field === 'confirmPassword')?.message).toBe('Passwords do not match')
    })

    it('should fail when terms are not accepted', () => {
      const result = validateRegisterForm({
        ...validData,
        acceptTerms: false,
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'acceptTerms')).toBe(true)
      expect(result.errors.find(e => e.field === 'acceptTerms')?.message).toBe('You must accept the terms and conditions')
    })

    it('should accumulate multiple errors', () => {
      const result = validateRegisterForm({
        name: '',
        email: 'invalid',
        password: 'weak',
        confirmPassword: 'different',
        acceptTerms: false,
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(3)
    })
  })

  describe('validateForgotPasswordForm', () => {
    it('should pass for valid email', () => {
      const data: ForgotPasswordData = { email: 'test@example.com' }
      const result = validateForgotPasswordForm(data)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail for invalid email', () => {
      const data: ForgotPasswordData = { email: 'invalid-email' }
      const result = validateForgotPasswordForm(data)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'email')).toBe(true)
    })

    it('should fail for empty email', () => {
      const data: ForgotPasswordData = { email: '' }
      const result = validateForgotPasswordForm(data)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'email')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined and null values gracefully', () => {
      expect(() => validateEmail(undefined as any)).not.toThrow()
      expect(() => validateName(null as any)).not.toThrow()
      
      const emailResult = validateEmail(undefined as any)
      expect(emailResult.isValid).toBe(false)
    })

    it('should handle very long inputs', () => {
      const longString = 'a'.repeat(10000)
      
      expect(() => validateEmail(longString)).not.toThrow()
      expect(() => validateName(longString)).not.toThrow()
      
      const emailResult = validateEmail(longString)
      const nameResult = validateName(longString)
      
      expect(emailResult.isValid).toBe(false)
      expect(nameResult.isValid).toBe(false)
    })

    it('should handle special characters in different contexts', () => {
      // Email can have some special characters
      expect(validateEmail('user+tag@domain.com').isValid).toBe(true)
      
      // Name has restricted special characters
      expect(validateName("O'Connor").isValid).toBe(true)
      expect(validateName("Jean-Pierre").isValid).toBe(true)
      expect(validateName("User@Name").isValid).toBe(false)
    })
  })
})