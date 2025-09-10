/**
 * Security utilities module
 * Exports all security-related functions and utilities
 */

// File validation with magic byte checking
export {
  validateFile,
  validateFiles,
  validateFileContent,
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_COUNT,
  type FileValidationError,
  type FileValidationResult,
} from '../utils/fileValidation';

// Input sanitization and form validation
export {
  sanitizeInput,
  sanitizeEmail,
  sanitizeName,
  validateEmail,
  validateName,
  validateLoginForm,
  validateRegisterForm,
  validateForgotPasswordForm,
  validateResetPasswordForm,
  type ValidationResult,
  type FormError,
} from '../auth/formValidation';

// CSRF protection
export {
  generateCSRFToken,
  createSignedCSRFToken,
  verifyCSRFToken,
  CSRFTokenManager,
  csrfTokenManager,
  csrfFetch,
  createCSRFMiddleware,
  useCSRFToken,
  CSRF_CONFIG,
} from './csrf';

/**
 * Security headers for Next.js API routes
 */
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Strict transport security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // Content security policy
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:",
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

/**
 * Apply security headers to Next.js API response
 */
export function applySecurityHeaders(res: any): void {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

/**
 * Simple in-memory rate limiter
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests',
      skipSuccessfulRequests: false,
      keyGenerator: (req) => req.ip || req.socket?.remoteAddress || 'unknown',
      ...config,
    };
  }

  /**
   * Check if request is within rate limit
   */
  check(req: any): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let requests = this.requests.get(key) || [];
    
    // Remove expired requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Update requests array
    this.requests.set(key, requests);

    // Check if limit exceeded
    const allowed = requests.length < this.config.max;
    const remaining = Math.max(0, this.config.max - requests.length);
    const resetTime = requests.length > 0 ? 
      Math.min(...requests) + this.config.windowMs : 
      now + this.config.windowMs;

    if (allowed) {
      requests.push(now);
      this.requests.set(key, requests);
    }

    return { allowed, remaining, resetTime };
  }

  /**
   * Express middleware for rate limiting
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      const result = this.check(req);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.config.max);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

      if (!result.allowed) {
        return res.status(429).json({
          error: this.config.message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        });
      }

      next();
    };
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const entries = Array.from(this.requests.entries());
    for (const [key, requests] of entries) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

/**
 * Password strength validation
 */
export interface PasswordStrength {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  isStrong: boolean;
}

/**
 * Evaluate password strength
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 1;
  }

  // Character variety
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (varietyCount < 3) {
    feedback.push('Use a mix of uppercase, lowercase, numbers, and special characters');
  } else {
    score += varietyCount - 2; // 1-2 points for variety
  }

  // Common patterns
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters');
    score -= 1;
  }

  if (/123|abc|qwe/i.test(password)) {
    feedback.push('Avoid common sequences');
    score -= 1;
  }

  // Dictionary words (simplified check)
  const commonWords = ['password', 'admin', 'user', 'login', '12345'];
  if (commonWords.some(word => password.toLowerCase().includes(word))) {
    feedback.push('Avoid common words');
    score -= 1;
  }

  score = Math.max(0, Math.min(4, score));

  return {
    score,
    feedback,
    isStrong: score >= 3 && password.length >= 8,
  };
}

/**
 * Generate secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

/**
 * Constant-time string comparison for sensitive data
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Secure session token generation
 */
export function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('');
  
  return `${timestamp}-${randomPart}`;
}