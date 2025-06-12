import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
    try {
        const token = request.cookies.get('auth-token')?.value;
        
        if (!token) {
            return null;
        }

        const decoded = verify(token, JWT_SECRET) as any;
        
        return {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

export function requireAuth(request: NextRequest): AuthUser {
    const user = getAuthUser(request);
    
    if (!user) {
        throw new Error('Authentication required');
    }
    
    return user;
}

export function requireRole(request: NextRequest, allowedRoles: string[]): AuthUser {
    const user = requireAuth(request);
    
    if (!allowedRoles.includes(user.role)) {
        throw new Error('Insufficient permissions');
    }
    
    return user;
}