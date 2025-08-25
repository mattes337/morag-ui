import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from './lib/auth-config';
import { getAuthUser } from './lib/auth';
import { handlePreflight, addCORSHeaders, addSecurityHeaders } from './lib/middleware/security';
import { rateLimit, RATE_LIMIT_CONFIGS } from './lib/middleware/rateLimiting';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Handle preflight requests
    const preflightResponse = handlePreflight(request);
    if (preflightResponse) {
        return preflightResponse;
    }

    // Apply rate limiting to API routes
    if (pathname.startsWith('/api/')) {
        let rateLimitConfig;

        if (pathname.includes('/auth/login')) {
            rateLimitConfig = RATE_LIMIT_CONFIGS.login;
        } else if (pathname.includes('/upload')) {
            rateLimitConfig = RATE_LIMIT_CONFIGS.upload;
        } else if (pathname.includes('/search')) {
            rateLimitConfig = RATE_LIMIT_CONFIGS.search;
        } else if (pathname.includes('/processing')) {
            rateLimitConfig = RATE_LIMIT_CONFIGS.processing;
        } else {
            rateLimitConfig = RATE_LIMIT_CONFIGS.api;
        }

        const rateLimitMiddleware = rateLimit(rateLimitConfig);
        const rateLimitResponse = rateLimitMiddleware(request);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
    }

    // Skip auth middleware for static files and certain API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico'
    ) {
        const response = NextResponse.next();
        addCORSHeaders(request, response);
        addSecurityHeaders(response);
        return response;
    }

    // Only run middleware logic if header authentication is explicitly enabled
    if (!authConfig.enableHeaderAuth) {
        return NextResponse.next();
    }

    // Handle header authentication
    const user = await getAuthUser(request);
    
    // If on login page and user is authenticated via headers, redirect to home
    if (pathname === '/login' && user && user.authMethod === 'header') {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    // If not authenticated via headers and not on login page, redirect to login
    if (!user && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const response = NextResponse.next();
    addCORSHeaders(request, response);
    addSecurityHeaders(response);
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};