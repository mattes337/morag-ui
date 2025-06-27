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