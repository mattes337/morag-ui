import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { authConfig } from './auth-config';
import { UserService } from './services/userService';

function getJwtSecret(): string {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return JWT_SECRET;
}

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

export async function validateSSOUser(headerData: HeaderAuthData): Promise<AuthUser | null> {
    try {
        // Try to find existing user by email or username
        let user = null;
        if (headerData.email) {
            user = await UserService.getUserByEmail(headerData.email);
        }
        
        if (!user) {
            // Create new SSO user if not exists
            const email = headerData.email || `${headerData.username}@sso.local`;
            const name = headerData.name || headerData.username;
            const role = headerData.role?.toUpperCase() || 'USER';
            
            user = await UserService.createUser({
                name,
                email,
                role: role as any
            });
            
            if (!user || !user.id) {
                console.error('Failed to create SSO user or user.id is missing:', { user, headerData });
                return null;
            }
        }

        if (!user.id) {
            console.error('User object missing id field:', user);
            return null;
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

        const jwtSecret = getJwtSecret();
        const decoded = verify(token, jwtSecret) as any;
        
        if (!decoded.userId) {
            console.error('JWT token missing userId field:', decoded);
            return null;
        }
        
        return {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name || decoded.email,
            authMethod: 'jwt'
        };
    } catch (error) {
        console.error('Auth verification error:', error);
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

/**
 * Get the user's current realm ID from request context
 * This checks for a realm ID in the request headers or cookies
 */
export async function getCurrentRealmId(request: NextRequest, userId: string): Promise<string | null> {
    // First check if realm ID is provided in headers (for API calls)
    const realmIdFromHeader = request.headers.get('x-realm-id');
    if (realmIdFromHeader) {
        return realmIdFromHeader;
    }

    // Check for realm ID in cookies (for web requests)
    const realmIdFromCookie = request.cookies.get('current-realm')?.value;
    if (realmIdFromCookie) {
        return realmIdFromCookie;
    }

    // If no realm specified, try to get the user's default realm
    try {
        const { RealmService } = await import('./services/realmService');
        const userRealms = await RealmService.getUserRealms(userId);

        // Return the first realm (which should be the default or most recently used)
        if (userRealms.length > 0) {
            return userRealms[0].id;
        }
    } catch (error) {
        console.error('Error getting user realms:', error);
    }

    return null;
}