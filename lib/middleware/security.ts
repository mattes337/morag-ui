import { NextRequest, NextResponse } from 'next/server';

export interface CORSConfig {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

// Default CORS configuration
const DEFAULT_CORS_CONFIG: CORSConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.NEXTAUTH_URL || 'https://morag.drydev.de']
    : true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Total-Count'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Default security headers
const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-* should be removed in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "media-src 'self'",
    "object-src 'none'",
    "child-src 'self'",
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "manifest-src 'self'"
  ].join('; '),
  
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()'
  ].join(', ')
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string | string[] | boolean): boolean {
  if (!origin) return false;
  
  if (allowedOrigins === true) return true;
  if (allowedOrigins === false) return false;
  
  if (typeof allowedOrigins === 'string') {
    return origin === allowedOrigins;
  }
  
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin);
  }
  
  return false;
}

/**
 * Add CORS headers to response
 */
export function addCORSHeaders(
  request: NextRequest,
  response: NextResponse,
  config: CORSConfig = DEFAULT_CORS_CONFIG
): NextResponse {
  const origin = request.headers.get('origin');
  
  // Set Access-Control-Allow-Origin
  if (config.origin === true) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else if (origin && isOriginAllowed(origin, config.origin || false)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }
  
  // Set other CORS headers
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  if (config.methods) {
    response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
  }
  
  if (config.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  }
  
  if (config.exposedHeaders) {
    response.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
  }
  
  if (config.maxAge) {
    response.headers.set('Access-Control-Max-Age', config.maxAge.toString());
  }
  
  return response;
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = DEFAULT_SECURITY_HEADERS
): NextResponse {
  if (config.contentSecurityPolicy) {
    response.headers.set('Content-Security-Policy', config.contentSecurityPolicy);
  }
  
  if (config.strictTransportSecurity && process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', config.strictTransportSecurity);
  }
  
  if (config.xFrameOptions) {
    response.headers.set('X-Frame-Options', config.xFrameOptions);
  }
  
  if (config.xContentTypeOptions) {
    response.headers.set('X-Content-Type-Options', config.xContentTypeOptions);
  }
  
  if (config.referrerPolicy) {
    response.headers.set('Referrer-Policy', config.referrerPolicy);
  }
  
  if (config.permissionsPolicy) {
    response.headers.set('Permissions-Policy', config.permissionsPolicy);
  }
  
  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  return response;
}

/**
 * Handle preflight OPTIONS requests
 */
export function handlePreflight(
  request: NextRequest,
  config: CORSConfig = DEFAULT_CORS_CONFIG
): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }
  
  const response = new NextResponse(null, { status: 204 });
  return addCORSHeaders(request, response, config);
}

/**
 * Security middleware that adds CORS and security headers
 */
export function securityMiddleware(
  corsConfig: CORSConfig = DEFAULT_CORS_CONFIG,
  securityConfig: SecurityHeadersConfig = DEFAULT_SECURITY_HEADERS
) {
  return (request: NextRequest, response: NextResponse): NextResponse => {
    // Add CORS headers
    addCORSHeaders(request, response, corsConfig);
    
    // Add security headers
    addSecurityHeaders(response, securityConfig);
    
    return response;
  };
}

/**
 * Validate request origin for sensitive operations
 */
export function validateOrigin(
  request: NextRequest,
  allowedOrigins: string[]
): { isValid: boolean; error?: string } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // For same-origin requests, origin might be null
  if (!origin && !referer) {
    return { isValid: true }; // Allow same-origin requests
  }
  
  const requestOrigin = origin || (referer ? new URL(referer).origin : null);
  
  if (!requestOrigin) {
    return {
      isValid: false,
      error: 'Unable to determine request origin'
    };
  }
  
  if (!allowedOrigins.includes(requestOrigin)) {
    return {
      isValid: false,
      error: `Origin ${requestOrigin} is not allowed`
    };
  }
  
  return { isValid: true };
}

/**
 * Check for suspicious request patterns
 */
export function detectSuspiciousRequest(request: NextRequest): { isSuspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check for missing User-Agent (common in automated attacks)
  const userAgent = request.headers.get('user-agent');
  if (!userAgent || userAgent.length < 10) {
    reasons.push('Missing or suspicious User-Agent header');
  }
  
  // Check for suspicious User-Agent patterns
  if (userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /go-http-client/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        reasons.push(`Suspicious User-Agent pattern: ${pattern.source}`);
        break;
      }
    }
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-originating-ip',
    'x-remote-ip',
    'x-cluster-client-ip'
  ];
  
  for (const header of suspiciousHeaders) {
    if (request.headers.get(header)) {
      reasons.push(`Suspicious header present: ${header}`);
    }
  }
  
  // Check for excessively long headers
  request.headers.forEach((value, name) => {
    if (value.length > 8192) { // 8KB limit
      reasons.push(`Excessively long header: ${name}`);
    }
  });
  
  return {
    isSuspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Production-ready CSP for strict security
 */
export const PRODUCTION_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "child-src 'none'",
  "worker-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests"
].join('; ');
