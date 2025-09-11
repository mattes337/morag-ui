/**
 * Security Headers Configuration
 * Implements comprehensive security headers for Next.js applications
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Enable XSS protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy for privacy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (feature policy replacement)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
    'fullscreen=(self)',
    'picture-in-picture=()'
  ].join(', '),
  
  // Content Security Policy (strict)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: Consider removing unsafe-* in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "child-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // HSTS (HTTPS Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
} as const;

/**
 * Development-specific headers (more permissive for dev tools)
 */
export const DEVELOPMENT_HEADERS = {
  ...SECURITY_HEADERS,
  
  // More permissive CSP for development
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:* 127.0.0.1:*",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss: localhost:* 127.0.0.1:*",
    "media-src 'self'",
    "object-src 'none'",
    "child-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; '),
  
  // Less strict CORS for development
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
  'Cross-Origin-Resource-Policy': 'cross-origin',
} as const;

/**
 * Get appropriate security headers based on environment
 */
export function getSecurityHeaders(): Record<string, string> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? DEVELOPMENT_HEADERS : SECURITY_HEADERS;
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Middleware function to add security headers
 */
export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request);
    return applySecurityHeaders(response);
  };
}

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Simple in-memory rate limiter (use Redis in production)
 */
class InMemoryRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  
  constructor(private config: RateLimitConfig) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.requests.get(key);
    
    if (!record || now > record.resetTime) {
      // Reset the window
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }
    
    if (record.count >= this.config.maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(config: RateLimitConfig) {
  const limiter = new InMemoryRateLimiter(config);
  
  // Cleanup expired entries every 5 minutes
  setInterval(() => limiter.cleanup(), 5 * 60 * 1000);
  
  return (handler: (request: NextRequest) => Promise<NextResponse> | NextResponse) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const key = config.keyGenerator 
        ? config.keyGenerator(request)
        : request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
      
      if (!limiter.isAllowed(key)) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
            },
          }
        );
      }
      
      return handler(request);
    };
  };
}

/**
 * IP-based rate limiting for API endpoints
 */
export const apiRateLimit = withRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  keyGenerator: (request) => {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    return forwardedFor?.split(',')[0] || realIp  || 'unknown';
  }
});

/**
 * Strict rate limiting for authentication endpoints
 */
export const authRateLimit = withRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
  keyGenerator: (request) => {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    return forwardedFor?.split(',')[0] || realIp  || 'unknown';
  }
});

/**
 * Content validation middleware
 */
export function withContentValidation(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Validate content type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type') || '';
      
      const allowedTypes = [
        'application/json',
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain'
      ];
      
      const isValidContentType = allowedTypes.some(type => 
        contentType.toLowerCase().includes(type)
      );
      
      if (!isValidContentType) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Invalid content type',
            code: 'INVALID_CONTENT_TYPE'
          }),
          {
            status: 415,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      // Check content length
      const contentLength = request.headers.get('content-length');
      if (contentLength) {
        const length = parseInt(contentLength, 10);
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (length > maxSize) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              error: 'Content too large',
              code: 'CONTENT_TOO_LARGE'
            }),
            {
              status: 413,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }
      }
    }
    
    return handler(request);
  };
}

/**
 * Combined security middleware
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  options: {
    csrf?: boolean;
    rateLimit?: 'api' | 'auth' | 'none';
    contentValidation?: boolean;
  } = {}
) {
  let securedHandler = handler;
  
  // Apply content validation
  if (options.contentValidation !== false) {
    securedHandler = withContentValidation(securedHandler);
  }
  
  // Apply rate limiting
  if (options.rateLimit === 'api') {
    securedHandler = apiRateLimit(securedHandler);
  } else if (options.rateLimit === 'auth') {
    securedHandler = authRateLimit(securedHandler);
  }
  
  // Apply security headers
  securedHandler = withSecurityHeaders(securedHandler);
  
  return securedHandler;
}