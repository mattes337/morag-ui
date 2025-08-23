import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Default rate limit configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again later'
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // 100 uploads per hour
    message: 'Upload rate limit exceeded, please try again later'
  },
  
  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 searches per minute
    message: 'Search rate limit exceeded, please slow down'
  },
  
  // API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'API rate limit exceeded'
  },
  
  // Document processing
  processing: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 processing requests per minute
    message: 'Processing rate limit exceeded'
  }
} as const;

/**
 * Generate rate limit key based on IP address and user ID
 */
function generateRateLimitKey(request: NextRequest, identifier?: string): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userAgentHash = hashString(userAgent);
  
  if (identifier) {
    return `rate_limit:${identifier}:${ip}:${userAgentHash}`;
  }
  
  return `rate_limit:${ip}:${userAgentHash}`;
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default value
  return 'unknown';
}

/**
 * Simple hash function for strings
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): RateLimitResult {
  const key = config.keyGenerator 
    ? config.keyGenerator(request)
    : generateRateLimitKey(request, identifier);
  
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Clean up expired entries
  cleanupExpiredEntries(windowStart);
  
  // Get current rate limit data
  let rateLimitData = rateLimitStore.get(key);
  
  if (!rateLimitData || rateLimitData.resetTime <= now) {
    // Create new rate limit window
    rateLimitData = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, rateLimitData);
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime: rateLimitData.resetTime
    };
  }
  
  // Check if limit exceeded
  if (rateLimitData.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: rateLimitData.resetTime,
      retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
    };
  }
  
  // Increment counter
  rateLimitData.count++;
  rateLimitStore.set(key, rateLimitData);
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - rateLimitData.count,
    resetTime: rateLimitData.resetTime
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(windowStart: number): void {
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((data, key) => {
    if (data.resetTime <= windowStart) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest, identifier?: string): NextResponse | null => {
    const result = checkRateLimit(request, config, identifier);
    
    if (!result.success) {
      const response = NextResponse.json(
        {
          error: config.message || 'Rate limit exceeded',
          retryAfter: result.retryAfter
        },
        { status: 429 }
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      
      if (result.retryAfter) {
        response.headers.set('Retry-After', result.retryAfter.toString());
      }
      
      return response;
    }
    
    return null; // Continue processing
  };
}

/**
 * Add rate limit headers to successful responses
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
  
  return response;
}

/**
 * Rate limit decorator for API routes
 */
export function withRateLimit(config: RateLimitConfig) {
  return function <T extends (...args: any[]) => Promise<NextResponse>>(
    target: T
  ): T {
    return (async (...args: any[]) => {
      const request = args[0] as NextRequest;
      const rateLimitMiddleware = rateLimit(config);
      const rateLimitResponse = rateLimitMiddleware(request);
      
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
      
      // Continue with original function
      const response = await target(...args);
      
      // Add rate limit headers to successful responses
      const result = checkRateLimit(request, config);
      return addRateLimitHeaders(response, result);
    }) as T;
  };
}

/**
 * Get rate limit status for a request
 */
export function getRateLimitStatus(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): RateLimitResult {
  return checkRateLimit(request, config, identifier);
}
