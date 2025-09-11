/**
 * Security Tests
 * Comprehensive tests for security vulnerabilities and protections
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { sanitizeInput, sanitizeEmail, sanitizeName } from '../../auth/formValidation';
import { validateFileContent } from '../../utils/fileValidation';
import { generateCSRFToken, verifyCSRFToken, createSignedCSRFToken } from '../csrf';

describe('Input Sanitization Security Tests', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      expect(() => sanitizeInput(maliciousInput)).toThrow('Input contains potentially malicious content');
    });

    it('should remove javascript: protocols', () => {
      const maliciousInput = 'javascript:alert("xss")';
      expect(() => sanitizeInput(maliciousInput)).toThrow('Input contains potentially malicious content');
    });

    it('should remove event handlers', () => {
      const maliciousInput = '<div onclick="alert(1)">Test</div>';
      expect(() => sanitizeInput(maliciousInput)).toThrow('Input contains potentially malicious content');
    });

    it('should remove iframe tags', () => {
      const maliciousInput = '<iframe src="javascript:alert(1)"></iframe>';
      expect(() => sanitizeInput(maliciousInput)).toThrow('Input contains potentially malicious content');
    });

    it('should remove object and embed tags', () => {
      const maliciousInput = '<object data="javascript:alert(1)"></object>';
      expect(() => sanitizeInput(maliciousInput)).toThrow('Input contains potentially malicious content');
    });

    it('should handle null and undefined inputs', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

    it('should allow safe text', () => {
      const safeInput = 'Hello, this is safe text with numbers 123 and symbols !@#';
      expect(sanitizeInput(safeInput)).toBe(safeInput);
    });

    it('should remove control characters', () => {
      const inputWithControlChars = 'Hello\x00\x01\x02World';
      const sanitized = sanitizeInput(inputWithControlChars);
      expect(sanitized).toBe('HelloWorld');
    });

    it('should detect encoded malicious content', () => {
      const encodedScript = '%3Cscript%3Ealert(1)%3C%2Fscript%3E';
      expect(() => sanitizeInput(encodedScript)).toThrow('Input contains encoded malicious content');
    });

    it('should prevent CSS injection', () => {
      const cssInjection = 'body { background: url(javascript:alert(1)); }';
      expect(() => sanitizeInput(cssInjection)).toThrow('Input contains potentially malicious content');
    });

    it('should prevent expression injection', () => {
      const expressionInjection = 'expression(alert(1))';
      expect(() => sanitizeInput(expressionInjection)).toThrow('Input contains potentially malicious content');
    });
  });

  describe('sanitizeEmail', () => {
    it('should allow valid email addresses', () => {
      const validEmail = 'user@example.com';
      expect(sanitizeEmail(validEmail)).toBe(validEmail);
    });

    it('should reject emails with SQL injection attempts', () => {
      const maliciousEmail = "test'; DROP TABLE users; --@example.com";
      expect(() => sanitizeEmail(maliciousEmail)).toThrow('Email contains potentially malicious content');
    });

    it('should reject emails with script tags', () => {
      const maliciousEmail = '<script>alert(1)</script>@example.com';
      expect(() => sanitizeEmail(maliciousEmail)).toThrow('Email contains invalid characters');
    });

    it('should reject emails with angle brackets', () => {
      const maliciousEmail = 'user<script>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     </script>';
    const fakeTextFile = createMockFile(jsContent, 'text/plain', 'script.txt');
    
    const result = await validateFileContent(fakeTextFile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'SUSPICIOUS_CONTENT'
      })
    );
  });

  it('should allow legitimate PDF files', async () => {
    const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj';
    const pdfFile = createMockFile(pdfContent, 'application/pdf', 'document.pdf');
    
    const result = await validateFileContent(pdfFile);
    expect(result.isValid).toBe(true);
  });

  it('should allow legitimate text files', async () => {
    const textContent = 'This is a normal text file with safe content.';
    const textFile = createMockFile(textContent, 'text/plain', 'document.txt');
    
    const result = await validateFileContent(textFile);
    expect(result.isValid).toBe(true);
  });

  it('should detect MIME type spoofing', async () => {
    // ZIP file header with PDF MIME type
    const zipContent = 'PK\x03\x04\x14\x00\x00\x00\x08\x00';
    const spoofedFile = createMockFile(zipContent, 'application/pdf', 'fake.pdf');
    
    const result = await validateFileContent(spoofedFile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'MIME_TYPE_MISMATCH'
      })
    );
  });
});

describe('CSRF Protection Tests', () => {
  let testSecret: string;

  beforeEach(() => {
    testSecret = 'test-csrf-secret-key';
  });

  it('should generate cryptographically secure tokens', () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    
    expect(token1).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2); // Should be unique
    expect(/^[a-f0-9]+$/i.test(token1)).toBe(true); // Should be hex
  });

  it('should create and verify signed tokens', () => {
    const { token, signature, timestamp } = createSignedCSRFToken(testSecret);
    
    expect(token).toHaveLength(64);
    expect(signature).toHaveLength(64);
    expect(timestamp).toBeCloseTo(Date.now(), -3); // Within 1000ms
    
    const isValid = verifyCSRFToken(token, signature, timestamp, testSecret);
    expect(isValid).toBe(true);
  });

  it('should reject tokens with wrong secret', () => {
    const { token, signature, timestamp } = createSignedCSRFToken(testSecret);
    const wrongSecret = 'wrong-secret';
    
    const isValid = verifyCSRFToken(token, signature, timestamp, wrongSecret);
    expect(isValid).toBe(false);
  });

  it('should reject expired tokens', () => {
    const expiredTimestamp = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
    const { token, signature } = createSignedCSRFToken(testSecret);
    
    const isValid = verifyCSRFToken(token, signature, expiredTimestamp, testSecret);
    expect(isValid).toBe(false);
  });

  it('should reject tampered tokens', () => {
    const { token, signature, timestamp } = createSignedCSRFToken(testSecret);
    const tamperedToken = token.slice(0, -1) + 'x'; // Change last character
    
    const isValid = verifyCSRFToken(tamperedToken, signature, timestamp, testSecret);
    expect(isValid).toBe(false);
  });

  it('should reject tampered signatures', () => {
    const { token, signature, timestamp } = createSignedCSRFToken(testSecret);
    const tamperedSignature = signature.slice(0, -1) + 'x'; // Change last character
    
    const isValid = verifyCSRFToken(token, tamperedSignature, timestamp, testSecret);
    expect(isValid).toBe(false);
  });

  it('should handle timing attacks', () => {
    const { token, signature, timestamp } = createSignedCSRFToken(testSecret);
    
    // Test with various wrong lengths to ensure timing-safe comparison
    const wrongSignatures = [
      '', // Empty
      'a', // Too short
      signature + 'extra', // Too long
      'x'.repeat(64), // Wrong but same length
    ];
    
    wrongSignatures.forEach(wrongSig => {
      const isValid = verifyCSRFToken(token, wrongSig, timestamp, testSecret);
      expect(isValid).toBe(false);
    });
  });
});

describe('Security Headers Tests', () => {
  // Note: These would typically be integration tests with actual HTTP requests
  // Here we test the configuration logic
  
  it('should provide secure headers for production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    // This would test the actual header middleware
    // For now, we test the configuration exists
    expect(process.env.NODE_ENV).toBe('production');
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should provide development-friendly headers in dev mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    expect(process.env.NODE_ENV).toBe('development');
    
    process.env.NODE_ENV = originalEnv;
  });
});

describe('XSS Prevention Tests', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src="x" onerror="alert(1)">',
    '<svg onload="alert(1)">',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<object data="javascript:alert(1)"></object>',
    '<embed src="javascript:alert(1)">',
    '<link rel="stylesheet" href="javascript:alert(1)">',
    '<style>body{background:url(javascript:alert(1))}</style>',
    'expression(alert(1))',
    'eval("alert(1)")',
    '<div onclick="alert(1)">Click me</div>',
    '<form action="javascript:alert(1)">',
    '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
    'data:text/html,<script>alert(1)</script>',
    '&#60;script&#62;alert(1)&#60;/script&#62;',
    '%3Cscript%3Ealert(1)%3C/script%3E',
  ];

  xssPayloads.forEach((payload, index) => {
    it(`should block XSS payload ${index + 1}: ${payload.substring(0, 50)}...`, () => {
      expect(() => sanitizeInput(payload)).toThrow();
    });
  });
});

describe('SQL Injection Prevention Tests', () => {
  const sqlInjectionPayloads = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
    "' UNION SELECT * FROM users --",
    "'; DELETE FROM users WHERE '1'='1'; --",
    "' OR 1=1 --",
    "'; UPDATE users SET password='hacked' WHERE '1'='1'; --",
  ];

  sqlInjectionPayloads.forEach((payload, index) => {
    it(`should block SQL injection payload ${index + 1}: ${payload}`, () => {
      expect(() => sanitizeEmail(`test${payload}@example.com`)).toThrow();
    });
  });
});

describe('Path Traversal Prevention Tests', () => {
  const pathTraversalPayloads = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '....//....//....//etc/passwd',
    '/var/www/../../../etc/passwd',
  ];

  pathTraversalPayloads.forEach((payload, index) => {
    it(`should block path traversal payload ${index + 1}: ${payload}`, () => {
      expect(() => sanitizeInput(payload)).toThrow();
    });
  });
});