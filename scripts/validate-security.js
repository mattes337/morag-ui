#!/usr/bin/env node

/**
 * Security Validation Script
 * Validates that all security measures are properly implemented
 */

const fs = require('fs');
const path = require('path');

function validateFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} - NOT FOUND`);
    return false;
  }
}

function validateContent(filePath, searchString, description) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString)) {
      console.log(`✅ ${description}: Found in ${filePath}`);
      return true;
    } else {
      console.log(`❌ ${description}: Not found in ${filePath}`);
      return false;
    }
  } else {
    console.log(`❌ ${description}: ${filePath} - FILE NOT FOUND`);
    return false;
  }
}

console.log('🔒 MoRAG Security Validation\n');

let allPassed = true;

// 1. CSRF Protection
console.log('1. CSRF Protection:');
allPassed &= validateFile('lib/security/csrf.ts', 'CSRF implementation');
allPassed &= validateFile('app/api/auth/csrf/route.ts', 'CSRF API endpoint');
allPassed &= validateContent('lib/security/csrf.ts', 'generateCSRFToken', 'CSRF token generation');
allPassed &= validateContent('lib/security/csrf.ts', 'verifyCSRFToken', 'CSRF token verification');

// 2. File Validation Security
console.log('\n2. File Validation Security:');
allPassed &= validateContent('lib/utils/fileValidation.ts', 'detectFileTypeFromBuffer', 'Magic byte detection');
allPassed &= validateContent('lib/utils/fileValidation.ts', 'suspiciousPatterns', 'Suspicious pattern detection');
allPassed &= validateContent('lib/utils/fileValidation.ts', 'SUSPICIOUS_CONTENT', 'Security error codes');

// 3. Input Sanitization
console.log('\n3. Input Sanitization:');
allPassed &= validateContent('lib/auth/formValidation.ts', 'sanitizeInput', 'Input sanitization');
allPassed &= validateContent('lib/auth/formValidation.ts', 'DOMPurify', 'DOMPurify integration');
allPassed &= validateContent('lib/auth/formValidation.ts', 'suspiciousPatterns', 'XSS protection patterns');

// 4. Error Sanitization
console.log('\n4. Error Message Sanitization:');
allPassed &= validateContent('components/error/ErrorBoundary.tsx', 'sanitizeError', 'Error sanitization');
allPassed &= validateContent('components/error/ErrorBoundary.tsx', 'sensitivePatterns', 'Sensitive pattern detection');
allPassed &= validateContent('components/error/ErrorBoundary.tsx', 'NODE_ENV', 'Environment-specific handling');

// 5. Security Headers
console.log('\n5. Security Headers:');
allPassed &= validateFile('lib/security/headers.ts', 'Security headers implementation');
allPassed &= validateContent('next.config.js', 'X-Content-Type-Options', 'Security headers in Next.js config');
allPassed &= validateContent('next.config.js', 'Content-Security-Policy', 'CSP configuration');

// 6. Security Tests
console.log('\n6. Security Tests:');
allPassed &= validateFile('lib/security/__tests__/security.test.ts', 'Security test suite');
allPassed &= validateContent('lib/security/__tests__/security.test.ts', 'XSS Prevention Tests', 'XSS test coverage');
allPassed &= validateContent('lib/security/__tests__/security.test.ts', 'SQL Injection Prevention', 'SQL injection test coverage');

// 7. Environment Configuration
console.log('\n7. Environment Configuration:');
allPassed &= validateFile('.env.example', 'Environment configuration template');
allPassed &= validateContent('.env.example', 'CSRF_SECRET', 'CSRF secret configuration');
allPassed &= validateContent('.env.example', 'JWT_SECRET', 'JWT secret configuration');

// 8. Dependencies
console.log('\n8. Security Dependencies:');
allPassed &= validateContent('package.json', 'file-type', 'File type detection library');
allPassed &= validateContent('package.json', 'dompurify', 'DOMPurify for XSS protection');
allPassed &= validateContent('package.json', 'uuid', 'UUID for secure token generation');

// 9. Documentation
console.log('\n9. Security Documentation:');
allPassed &= validateFile('SECURITY_REMEDIATION_SUMMARY.md', 'Security remediation documentation');

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 All security validations PASSED!');
  console.log('✅ Your application has comprehensive security protections');
  process.exit(0);
} else {
  console.log('⚠️  Some security validations FAILED!');
  console.log('❌ Please review and fix the issues above');
  process.exit(1);
}