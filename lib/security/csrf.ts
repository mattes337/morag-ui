/**
 * CSRF Protection utilities for secure API requests
 * Implements double-submit cookie pattern with cryptographic verification
 */

import { createHash, randomBytes } from 'crypto';

/**
 * CSRF token configuration
 */
export const CSRF_CONFIG = {
  TOKEN_LENGTH: 32,
  COOKIE_NAME: 'csrf-token',
  HEADER_NAME: 'X-CSRF-Token',
  TOKEN_EXPIRY: 3600000, // 1 hour in milliseconds
} as const;

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_CONFIG.TOKEN_LENGTH).toString('hex');
}

/**
 * Create a signed CSRF token with timestamp for expiry checking
 */
export function createSignedCSRFToken(secret: string): {
  token: string;
  signature: string;
  timestamp: number;
} {
  const token = generateCSRFToken();
  const timestamp = Date.now();
  const signature = createCSRFSignature(token, timestamp, secret);
  
  return { token, signature, timestamp };
}

/**
 * Create HMAC signature for CSRF token
 */
function createCSRFSignature(token: string, timestamp: number, secret: string): string {
  const data = `${token}:${timestamp}`;
  return createHash('sha256')
    .update(data)
    .update(secret)
    .digest('hex');
}

/**
 * Verify CSRF token signature and expiry
 */
export function verifyCSRFToken(
  token: string,
  signature: string,
  timestamp: number,
  secret: string
): boolean {
  // Check token expiry
  if (Date.now() - timestamp > CSRF_CONFIG.TOKEN_EXPIRY) {
    return false;
  }

  // Verify signature
  const expectedSignature = createCSRFSignature(token, timestamp, secret);
  
  // Use timing-safe comparison to prevent timing attacks
  return timingSafeEqual(signature, expectedSignature);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
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
 * Client-side CSRF token management
 */
export class CSRFTokenManager {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get current CSRF token from cookie
   */
  getToken(): string | null {
    if (typeof document === 'undefined') {
      return null; // Server-side rendering
    }

    // Check if current token is still valid
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Get token from cookie
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${CSRF_CONFIG.COOKIE_NAME}=`)
    );

    if (csrfCookie) {
      const cookieValue = csrfCookie.split('=')[1];
      if (!cookieValue) {
        return null;
      }
      try {
        const tokenData = JSON.parse(decodeURIComponent(cookieValue));
        if (tokenData.token && tokenData.timestamp) {
          // Check if token is not expired
          if (Date.now() - tokenData.timestamp < CSRF_CONFIG.TOKEN_EXPIRY) {
            this.token = tokenData.token;
            this.tokenExpiry = tokenData.timestamp + CSRF_CONFIG.TOKEN_EXPIRY;
            return this.token;
          }
        }
      } catch (error) {
        console.warn('Failed to parse CSRF token from cookie:', error);
      }
    }

    return null;
  }

  /**
   * Set CSRF token in cookie (secure, httpOnly=false for client access)
   */
  setToken(token: string, signature: string, timestamp: number): void {
    if (typeof document === 'undefined') {
      return; // Server-side rendering
    }

    const tokenData = { token, signature, timestamp };
    const cookieValue = encodeURIComponent(JSON.stringify(tokenData));
    const maxAge = Math.floor(CSRF_CONFIG.TOKEN_EXPIRY / 1000);
    
    document.cookie = `${CSRF_CONFIG.COOKIE_NAME}=${cookieValue}; Max-Age=${maxAge}; Path=/; Secure; SameSite=Strict`;
    
    this.token = token;
    this.tokenExpiry = timestamp + CSRF_CONFIG.TOKEN_EXPIRY;
  }

  /**
   * Clear CSRF token
   */
  clearToken(): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${CSRF_CONFIG.COOKIE_NAME}=; Max-Age=0; Path=/`;
    }
    this.token = null;
    this.tokenExpiry = 0;
  }

  /**
   * Add CSRF token to request headers
   */
  addTokenToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers[CSRF_CONFIG.HEADER_NAME] = token;
    }
    return headers;
  }
}

/**
 * Global CSRF token manager instance
 */
export const csrfTokenManager = new CSRFTokenManager();

/**
 * Fetch wrapper that automatically includes CSRF token
 */
export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  
  // Add CSRF token for state-changing requests
  const method = options.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = csrfTokenManager.getToken();
    if (token) {
      headers.set(CSRF_CONFIG.HEADER_NAME, token);
    } else {
      console.warn('No CSRF token available for state-changing request');
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Express middleware for CSRF protection (for API routes)
 */
export function createCSRFMiddleware(secret: string) {
  return (req: any, res: any, next: any) => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const token = req.headers[CSRF_CONFIG.HEADER_NAME.toLowerCase()] || req.body?.csrfToken;
    const cookies = req.headers.cookie || '';
    
    // Extract CSRF token from cookie
    const csrfCookieMatch = cookies.match(new RegExp(`${CSRF_CONFIG.COOKIE_NAME}=([^;]+)`));
    if (!csrfCookieMatch) {
      return res.status(403).json({ 
        error: 'CSRF token missing',
        code: 'CSRF_TOKEN_MISSING' 
      });
    }

    try {
      const cookieData = JSON.parse(decodeURIComponent(csrfCookieMatch[1]));
      const { token: cookieToken, signature, timestamp } = cookieData;

      // Verify token matches cookie
      if (token !== cookieToken) {
        return res.status(403).json({ 
          error: 'CSRF token mismatch',
          code: 'CSRF_TOKEN_MISMATCH' 
        });
      }

      // Verify token signature and expiry
      if (!verifyCSRFToken(token, signature, timestamp, secret)) {
        return res.status(403).json({ 
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID' 
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({ 
        error: 'CSRF token validation failed',
        code: 'CSRF_TOKEN_VALIDATION_FAILED' 
      });
    }
  };
}

/**
 * React hook for CSRF token management
 */
export function useCSRFToken() {
  return {
    getToken: () => csrfTokenManager.getToken(),
    addToHeaders: (headers?: Record<string, string>) => csrfTokenManager.addTokenToHeaders(headers),
    fetch: csrfFetch,
  };
}