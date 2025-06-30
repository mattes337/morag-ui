import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from './lib/auth-config';
import { getAuthUser } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files and API routes (except auth)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
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

    return NextResponse.next();
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