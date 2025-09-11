/**
 * CSRF Token API Endpoint
 * Provides CSRF tokens for client-side applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSignedCSRFToken, CSRF_CONFIG } from '@/lib/security/csrf';

// Use a server-side secret for CSRF token signing
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'fallback-csrf-secret-change-in-production';

/**
 * GET /api/auth/csrf
 * Generate and return a new CSRF token
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Generate signed CSRF token
    const { token, signature, timestamp } = createSignedCSRFToken(CSRF_SECRET);
    
    // Create response with CSRF token
    const response = NextResponse.json({
      success: true,
      csrfToken: token,
      expiresAt: timestamp + CSRF_CONFIG.TOKEN_EXPIRY
    });

    // Set secure CSRF token cookie
    const tokenData = { token, signature, timestamp };
    const cookieValue = encodeURIComponent(JSON.stringify(tokenData));
    const maxAge = Math.floor(CSRF_CONFIG.TOKEN_EXPIRY / 1000);
    
    response.cookies.set(CSRF_CONFIG.COOKIE_NAME, cookieValue, {
      httpOnly: false, // Allow client-side access for CSRF header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CSRF token'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/csrf
 * Validate existing CSRF token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSRF token is required'
        },
        { status: 400 }
      );
    }

    // Get token data from cookie
    const csrfCookie = request.cookies.get(CSRF_CONFIG.COOKIE_NAME);
    if (!csrfCookie?.value) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSRF token cookie not found'
        },
        { status: 403 }
      );
    }

    try {
      const cookieData = JSON.parse(decodeURIComponent(csrfCookie.value));
      const { token: cookieToken, signature, timestamp } = cookieData;

      // Verify token matches cookie
      if (token !== cookieToken) {
        return NextResponse.json(
          {
            success: false,
            error: 'CSRF token mismatch'
          },
          { status: 403 }
        );
      }

      // Import verification function
      const { verifyCSRFToken } = await import('@/lib/security/csrf');
      
      // Verify token signature and expiry
      if (!verifyCSRFToken(token, signature, timestamp, CSRF_SECRET)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid CSRF token'
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'CSRF token is valid',
        expiresAt: timestamp + CSRF_CONFIG.TOKEN_EXPIRY
      });

    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid CSRF token format'
        },
        { status: 403 }
      );
    }

  } catch (error) {
    console.error('CSRF token validation failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'CSRF token validation failed'
      },
      { status: 500 }
    );
  }
}