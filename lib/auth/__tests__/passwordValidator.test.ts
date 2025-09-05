import { validatePassword, getPasswordStrength, PASSWORD_REQUIREMENTS } from '../passwordValidator'

describe('passwordValidator', () => {
  describe('validatePassword', () => {
    it('should return weak strength for very short password', () => {
      const result = validatePassword('123')
      
      expect(result.strength).toBe('weak')
      expect(result.score).toBeLessThan(30)
      expect(result.isValid).toBe(false)
      expect(result.requirements).toHaveLength(PASSWORD_REQUIREMENTS.length)
      
      // Should fail length requirement
      const lengthRequirement = result.requirements.find(req => req.id === 'length')
      expect(lengthRequirement?.isValid).toBe(false)
    })

    it('should return weak strength for password with only lowercase letters', () => {
      const result = validatePassword('abcdefgh')
      
      expect(result.strength).toBe('weak')
      expect(result.score).toBeLessThan(50)
      expect(result.isValid).toBe(false)
      
      // Should pass length but fail other requirements
      const lengthRequirement = result.requirements.find(req => req.id === 'length')
      const uppercaseRequirement = result.requirements.find(req => req.id === 'uppercase')
      const numberRequirement = result.requirements.find(req => req.id === 'number')
      
      expect(lengthRequirement?.isValid).toBe(true)
      expect(uppercaseRequirement?.isValid).toBe(false)
      expect(numberRequirement?.isValid).toBe(false)
    })

    it('should return medium strength for password with mixed case and numbers', () => {
      const result = validatePassword('Abcdef123')
      
      expect(result.strength).toBe('medium')
      expect(result.score).toBeGreaterThanOrEqual(50)
      expect(result.score).toBeLessThan(80)
      expect(result.isValid).toBe(false) // Still not strong enough
      
      // Should pass most requirements but maybe lack special characters
      const lengthRequirement = result.requirements.find(req => req.id === 'length')
      const uppercaseRequirement = result.requirements.find(req => req.id === 'uppercase')
      const lowercaseRequirement = result.requirements.find(req => req.id === 'lowercase')
      const numberRequirement = result.requirements.find(req => req.id === 'number')
      
      expect(lengthRequirement?.isValid).toBe(true)
      expect(uppercaseRequirement?.isValid).toBe(true)
      expect(lowercaseRequirement?.isValid).toBe(true)
      expect(numberRequirement?.isValid).toBe(true)
    })

    it('should return strong strength for complex password', () => {
      const result = validatePassword('MySecur3P@ssw0rd!')
      
      expect(result.strength).toBe('strong')
      expect(result.score).toBeGreaterThanOrEqual(80)
      expect(result.isValid).toBe(true)
      
      // Should pass all requirements
      result.requirements.forEach(requirement => {
        expect(requirement.isValid).toBe(true)
      })
    })

    it('should handle empty password', () => {
      const result = validatePassword('')
      
      expect(result.strength).toBe('weak')
      expect(result.score).toBe(0)
      expect(result.isValid).toBe(false)
      
      // All requirements should fail
      result.requirements.forEach(requirement => {
        expect(requirement.isValid).toBe(false)
      })
    })

    it('should validate all password requirements', () => {
      const result = validatePassword('Test123!')
      
      expect(result.requirements).toHaveLength(5)
      
      const requirementIds = result.requirements.map(req => req.id)
      expect(requirementIds).toContain('length')
      expect(requirementIds).toContain('uppercase')
      expect(requirementIds).toContain('lowercase')
      expect(requirementIds).toContain('number')
      expect(requirementIds).toContain('special')
    })

    it('should correctly validate length requirement', () => {
      const shortResult = validatePassword('Test12!')
      const longResult = validatePassword('TestPass123!')
      
      const shortLength = shortResult.requirements.find(req => req.id === 'length')
      const longLength = longResult.requirements.find(req => req.id === 'length')
      
      expect(shortLength?.isValid).toBe(false)
      expect(longLength?.isValid).toBe(true)
    })

    it('should correctly validate uppercase requirement', () => {
      const noUpperResult = validatePassword('testpass123!')
      const withUpperResult = validatePassword('Testpass123!')
      
      const noUpper = noUpperResult.requirements.find(req => req.id === 'uppercase')
      const withUpper = withUpperResult.requirements.find(req => req.id === 'uppercase')
      
      expect(noUpper?.isValid).toBe(false)
      expect(withUpper?.isValid).toBe(true)
    })

    it('should correctly validate lowercase requirement', () => {
      const noLowerResult = validatePassword('TESTPASS123!')
      const withLowerResult = validatePassword('TESTpass123!')
      
      const noLower = noLowerResult.requirements.find(req => req.id === 'lowercase')
      const withLower = withLowerResult.requirements.find(req => req.id === 'lowercase')
      
      expect(noLower?.isValid).toBe(false)
      expect(withLower?.isValid).toBe(true)
    })

    it('should correctly validate number requirement', () => {
      const noNumberResult = validatePassword('TestPassword!')
      const withNumberResult = validatePassword('TestPassword1!')
      
      const noNumber = noNumberResult.requirements.find(req => req.id === 'number')
      const withNumber = withNumberResult.requirements.find(req => req.id === 'number')
      
      expect(noNumber?.isValid).toBe(false)
      expect(withNumber?.isValid).toBe(true)
    })

    it('should correctly validate special character requirement', () => {
      const noSpecialResult = validatePassword('TestPassword123')
      const withSpecialResult = validatePassword('TestPassword123!')
      
      const noSpecial = noSpecialResult.requirements.find(req => req.id === 'special')
      const withSpecial = withSpecialResult.requirements.find(req => req.id === 'special')
      
      expect(noSpecial?.isValid).toBe(false)
      expect(withSpecial?.isValid).toBe(true)
    })

    it('should calculate score based on met requirements', () => {
      const weak = validatePassword('abc')
      const medium = validatePassword('Abcdef123')
      const strong = validatePassword('MySecur3P@ss!')
      
      expect(weak.score).toBeLessThan(medium.score)
      expect(medium.score).toBeLessThan(strong.score)
    })
  })

  describe('getPasswordStrength', () => {
    it('should return weak for score less than 40', () => {
      expect(getPasswordStrength(0)).toBe('weak')
      expect(getPasswordStrength(20)).toBe('weak')
      expect(getPasswordStrength(39)).toBe('weak')
    })

    it('should return medium for score between 40 and 79', () => {
      expect(getPasswordStrength(40)).toBe('medium')
      expect(getPasswordStrength(60)).toBe('medium')
      expect(getPasswordStrength(79)).toBe('medium')
    })

    it('should return strong for score 80 and above', () => {
      expect(getPasswordStrength(80)).toBe('strong')
      expect(getPasswordStrength(90)).toBe('strong')
      expect(getPasswordStrength(100)).toBe('strong')
    })

    it('should handle edge cases', () => {
      expect(getPasswordStrength(-10)).toBe('weak')
      expect(getPasswordStrength(150)).toBe('strong')
    })
  })

  describe('PASSWORD_REQUIREMENTS constant', () => {
    it('should have correct structure', () => {
      expect(PASSWORD_REQUIREMENTS).toHaveLength(5)
      
      PASSWORD_REQUIREMENTS.forEach(requirement => {
        expect(requirement).toHaveProperty('id')
        expect(requirement).toHaveProperty('label')
        expect(requirement).toHaveProperty('description')
        expect(requirement).toHaveProperty('validate')
        expect(typeof requirement.validate).toBe('function')
      })
    })

    it('should have correct requirement IDs', () => {
      const ids = PASSWORD_REQUIREMENTS.map(req => req.id)
      
      expect(ids).toContain('length')
      expect(ids).toContain('uppercase')
      expect(ids).toContain('lowercase')
      expect(ids).toContain('number')
      expect(ids).toContain('special')
    })

    it('should have validation functions that work correctly', () => {
      const lengthReq = PASSWORD_REQUIREMENTS.find(req => req.id === 'length')
      const uppercaseReq = PASSWORD_REQUIREMENTS.find(req => req.id === 'uppercase')
      const lowercaseReq = PASSWORD_REQUIREMENTS.find(req => req.id === 'lowercase')
      const numberReq = PASSWORD_REQUIREMENTS.find(req => req.id === 'number')
      const specialReq = PASSWORD_REQUIREMENTS.find(req => req.id === 'special')

      expect(lengthReq?.validate('short')).toBe(false)
      expect(lengthReq?.validate('longenough')).toBe(true)
      
      expect(uppercaseReq?.validate('lowercase')).toBe(false)
      expect(uppercaseReq?.validate('Uppercase')).toBe(true)
      
      expect(lowercaseReq?.validate('UPPERCASE')).toBe(false)
      expect(lowercaseReq?.validate('lowercase')).toBe(true)
      
      expect(numberReq?.validate('nodigits')).toBe(false)
      expect(numberReq?.validate('has123')).toBe(true)
      
      expect(specialReq?.validate('nospecial')).toBe(false)
      expect(specialReq?.validate('has!')).toBe(true)
    })
  })

  describe('edge cases and security considerations', () => {
    it('should handle very long passwords', () => {
      const veryLongPassword = 'A'.repeat(995) + 'abc1!'
      const result = validatePassword(veryLongPassword)
      
      expect(result.strength).toBe('strong')
      expect(result.isValid).toBe(true)
    })

    it('should handle passwords with unicode characters', () => {
      const unicodePassword = 'Test123!äöü'
      const result = validatePassword(unicodePassword)
      
      // Should still validate correctly
      expect(result.requirements.find(req => req.id === 'length')?.isValid).toBe(true)
    })

    it('should handle common special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', '[', ']', '{', '}', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/']
      
      specialChars.forEach(char => {
        const password = `Test123${char}`
        const result = validatePassword(password)
        const specialReq = result.requirements.find(req => req.id === 'special')
        
        expect(specialReq?.isValid).toBe(true)
      })
    })
  })
})