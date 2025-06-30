# Phase 1: Enhanced Authentication Implementation

## Overview

Implement dual authentication modes supporting both traditional username/password login and header-based SSO authentication. The system should seamlessly switch between modes based on environment configuration.

## Current State Analysis

### Existing Authentication Flow
1. User visits login page (`/app/login/page.tsx`)
2. Submits credentials to `/api/auth/login`
3. Server validates and returns JWT token
4. Token stored in cookies for subsequent requests
5. `AuthWrapper` component handles authentication state

### Current Files to Modify
- `lib/auth.ts` - Core authentication logic
- `app/api/auth/login/route.ts` - Login endpoint
- `app/login/page.tsx` - Login page component
- `components/layout/AuthWrapper.tsx` - Authentication wrapper
- `contexts/AppContext.tsx` - User state management

## Implementation Steps

### Step 1: Environment Configuration

#### 1.1 Update `.env.example`
```bash
# Authentication Configuration
ENABLE_HEADER_AUTH=false
SSO_HEADER_NAME=X-Remote-User
SSO_EMAIL_HEADER=X-Remote-Email
SSO_NAME_HEADER=X-Remote-Name
SSO_ROLE_HEADER=X-Remote-Role
```

#### 1.2 Create Authentication Configuration
Create `lib/auth-config.ts`:
```typescript
export interface AuthConfig {
  enableHeaderAuth: boolean;
  ssoHeaderName: string;
  ssoEmailHeader: string;
  ssoNameHeader: string;
  ssoRoleHeader: string;
}

export const authConfig: AuthConfig = {
  enableHeaderAuth: process.env.ENABLE_HEADER_AUTH === 'true',
  ssoHeaderName: process.env.SSO_HEADER_NAME || 'X-Remote-User',
  ssoEmailHeader: process.env.SSO_EMAIL_HEADER || 'X-Remote-Email',
  ssoNameHeader: process.env.SSO_NAME_HEADER || 'X-Remote-Name',
  ssoRoleHeader: process.env.SSO_ROLE_HEADER || 'X-Remote-Role',
};
```

### Step 2: Enhanced Authentication Library

#### 2.1 Update `lib/auth.ts`
```typescript
import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { authConfig } from './auth-config';
import { UserService } from './services/userService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
    userId: string;
    email: string;
    role: string;
    name: string;
    authMethod: 'jwt' | 'header';
}

export interface HeaderAuthData {
    username: string;
    email?: string;
    name?: string;
    role?: string;
}

// Extract SSO headers from request
export function extractSSOHeaders(request: NextRequest): HeaderAuthData | null {
    if (!authConfig.enableHeaderAuth) {
        return null;
    }

    const username = request.headers.get(authConfig.ssoHeaderName);
    if (!username) {
        return null;
    }

    return {
        username,
        email: request.headers.get(authConfig.ssoEmailHeader) || undefined,
        name: request.headers.get(authConfig.ssoNameHeader) || undefined,
        role: request.headers.get(authConfig.ssoRoleHeader) || undefined,
    };
}

// Validate and get/create SSO user
export async function validateSSOUser(headerData: HeaderAuthData): Promise<AuthUser | null> {
    try {
        // Try to find existing user by email or username
        let user = headerData.email 
            ? await UserService.getUserByEmail(headerData.email)
            : await UserService.getUserByEmail(headerData.username);

        if (!user) {
            // User doesn't exist - return null to show "user not enabled" error
            return null;
        }

        // Update user info from headers if provided
        if (headerData.name && headerData.name !== user.name) {
            user = await UserService.updateUser(user.id, { name: headerData.name });
        }

        return {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            authMethod: 'header'
        };
    } catch (error) {
        console.error('SSO user validation error:', error);
        return null;
    }
}

// Get authenticated user (JWT or Header)
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
    // Try header authentication first if enabled
    if (authConfig.enableHeaderAuth) {
        const headerData = extractSSOHeaders(request);
        if (headerData) {
            return await validateSSOUser(headerData);
        }
    }

    // Fall back to JWT authentication
    try {
        const token = request.cookies.get('auth-token')?.value;
        
        if (!token) {
            return null;
        }

        const decoded = verify(token, JWT_SECRET) as any;
        
        return {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name || decoded.email,
            authMethod: 'jwt'
        };
    } catch (error) {
        console.error('JWT verification error:', error);
        return null;
    }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
    const user = await getAuthUser(request);
    
    if (!user) {
        throw new Error('Authentication required');
    }
    
    return user;
}

export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<AuthUser> {
    const user = await requireAuth(request);
    
    if (!allowedRoles.includes(user.role)) {
        throw new Error('Insufficient permissions');
    }
    
    return user;
}
```

### Step 3: Authentication Middleware

#### 3.1 Create `middleware.ts` in project root
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from './lib/auth-config';
import { getAuthUser } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for static files and API routes (except auth)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Handle header authentication
    if (authConfig.enableHeaderAuth) {
        const user = await getAuthUser(request);
        
        // If on login page and user is authenticated via headers, redirect to home
        if (pathname === '/login' && user) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        // If not on login page and no valid user, show user not enabled error
        if (pathname !== '/login' && pathname !== '/user-not-enabled' && !user) {
            return NextResponse.redirect(new URL('/user-not-enabled', request.url));
        }
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
```

### Step 4: Update Login API

#### 4.1 Modify `app/api/auth/login/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../lib/services/userService';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authConfig } from '../../../../lib/auth-config';
import { getAuthUser } from '../../../../lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
    // Check if user is already authenticated via headers
    if (authConfig.enableHeaderAuth) {
        const user = await getAuthUser(request);
        if (user) {
            return NextResponse.json({ user });
        } else {
            return NextResponse.json(
                { error: 'User not enabled for this application' },
                { status: 403 }
            );
        }
    }
    
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}

export async function POST(request: NextRequest) {
    // If header auth is enabled, don't allow password login
    if (authConfig.enableHeaderAuth) {
        return NextResponse.json(
            { error: 'Password authentication is disabled when SSO is enabled' },
            { status: 400 }
        );
    }

    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get user from database
        let user = await UserService.getUserByEmail(email);
        
        if (!user) {
            // For demo purposes, create admin user if credentials match
            if (email === 'admin@example.com' && password === 'admin123') {
                user = await UserService.createUser({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'ADMIN'
                });
            } else {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }
        }

        // TODO: Implement proper password verification
        console.log('⚠️ [Auth] Password verification not yet implemented');
        
        // Create JWT token
        const token = sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        const response = NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                authMethod: 'jwt'
            }
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400 // 24 hours
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

### Step 5: Update Frontend Components

#### 5.1 Create User Not Enabled Page
Create `app/user-not-enabled/page.tsx`:
```typescript
'use client';

export default function UserNotEnabledPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Access Denied
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your user account is not enabled for this application.
                        </p>
                        <p className="mt-4 text-sm text-gray-500">
                            Please contact your administrator to request access.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

#### 5.2 Update AuthWrapper Component
Modify `components/layout/AuthWrapper.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { GlobalDialogs } from './GlobalDialogs';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { user, setUser, isLoading } = useApp();
    const pathname = usePathname();
    const router = useRouter();

    const isLoginPage = pathname === '/login';
    const isUserNotEnabledPage = pathname === '/user-not-enabled';
    const isPublicPage = isLoginPage || isUserNotEnabledPage;

    // Check for header authentication on mount
    useEffect(() => {
        const checkHeaderAuth = async () => {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'GET',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    
                    // If on login page and authenticated, redirect to home
                    if (isLoginPage) {
                        router.push('/');
                    }
                } else if (response.status === 403) {
                    // User not enabled - redirect to error page
                    if (!isUserNotEnabledPage) {
                        router.push('/user-not-enabled');
                    }
                }
            } catch (error) {
                console.error('Header auth check failed:', error);
            }
        };

        // Only check header auth if no user is set and not already on public pages
        if (!user && !isLoading) {
            checkHeaderAuth();
        }
    }, [user, isLoading, isLoginPage, isUserNotEnabledPage, setUser, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If user is not logged in and not on public page, show login page content
    if (!user && !isPublicPage) {
        return (
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        );
    }

    // If on public pages, show without header/nav
    if (isPublicPage) {
        return (
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        );
    }

    // Normal authenticated layout
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <Navigation />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-sm text-gray-500">
                        © 2024 Morag AI. All rights reserved.
                    </p>
                </div>
            </footer>
            <GlobalDialogs />
        </div>
    );
}
```

#### 5.3 Update Login Page
Modify `app/login/page.tsx` to handle header auth:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [headerAuthEnabled, setHeaderAuthEnabled] = useState(false);
    const router = useRouter();
    const { user, setUser } = useApp();

    // Check if header auth is enabled
    useEffect(() => {
        const checkAuthMode = async () => {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'GET',
                });
                
                if (response.ok) {
                    // User is already authenticated via headers
                    const data = await response.json();
                    setUser(data.user);
                    router.push('/');
                } else if (response.status === 403) {
                    // Header auth enabled but user not enabled
                    setHeaderAuthEnabled(true);
                    router.push('/user-not-enabled');
                } else {
                    // Normal login mode
                    setHeaderAuthEnabled(false);
                }
            } catch (error) {
                console.error('Auth mode check failed:', error);
                setHeaderAuthEnabled(false);
            }
        };

        if (!user) {
            checkAuthMode();
        } else {
            router.push('/');
        }
    }, [user, setUser, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                router.push('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    // Don't show login form if header auth is enabled
    if (headerAuthEnabled) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                SSO Authentication
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Please authenticate through your organization's SSO system.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Rest of the existing login form code...
    const demoCredentials = [
        { email: 'admin@example.com', password: 'admin123', role: 'Admin' },
        { email: 'user@example.com', password: 'user123', role: 'User' },
        { email: 'viewer@example.com', password: 'viewer123', role: 'Viewer' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Existing login form JSX */}
        </div>
    );
}
```

## Testing Requirements

### Unit Tests
1. **Authentication Library Tests**
   - Test header extraction
   - Test SSO user validation
   - Test JWT authentication
   - Test authentication mode switching

2. **API Endpoint Tests**
   - Test login with password auth
   - Test login with header auth
   - Test authentication mode detection
   - Test error scenarios

### Integration Tests
1. **Authentication Flow Tests**
   - Complete password login flow
   - Complete header auth flow
   - Authentication mode switching
   - User not enabled scenarios

### Manual Testing Scenarios
1. **Password Authentication**
   - Login with valid credentials
   - Login with invalid credentials
   - Logout functionality

2. **Header Authentication**
   - Access with valid SSO headers
   - Access with invalid headers
   - User not enabled scenario
   - Missing headers scenario

## Security Considerations

1. **Header Validation**
   - Ensure headers come from trusted sources
   - Validate header format and content
   - Prevent header injection attacks

2. **Session Management**
   - Secure cookie settings
   - Proper session expiration
   - Session invalidation on logout

3. **Error Handling**
   - Don't leak sensitive information in errors
   - Log security events appropriately
   - Rate limiting for authentication attempts

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Middleware deployed
- [ ] Authentication endpoints tested
- [ ] Frontend components updated
- [ ] Error pages created
- [ ] Security headers configured
- [ ] Logging implemented
- [ ] Documentation updated

## Rollback Plan

1. **Immediate Rollback**
   - Disable header authentication via environment variable
   - Revert to JWT-only authentication
   - Remove middleware if necessary

2. **Data Integrity**
   - No database changes in this phase
   - User data remains unchanged
   - Session data can be cleared if needed

## Next Phase

Once Phase 1 is complete and tested, proceed to **Phase 2: Realm Data Model** to implement the database schema changes for the realm system.