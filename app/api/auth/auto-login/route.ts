import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '../../../../lib/auth-config';
import { UserService } from '../../../../lib/services/userService';
import { sign } from 'jsonwebtoken';

function getJwtSecret(): string {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return JWT_SECRET;
}

/**
 * POST /api/auth/auto-login
 * Perform automatic login in development mode
 */
export async function POST(request: NextRequest) {
    try {
        // Only allow auto-login in development mode when enabled
        if (!authConfig.enableAutoLogin) {
            return NextResponse.json(
                { error: 'Auto-login is not enabled' },
                { status: 403 }
            );
        }

        // Get or create the auto-login user
        let user = await UserService.getUserByEmail(authConfig.autoLoginEmail);
        
        if (!user) {
            // Create the auto-login user if it doesn't exist
            user = await UserService.createUser({
                name: authConfig.autoLoginName,
                email: authConfig.autoLoginEmail,
                role: 'ADMIN',
                password: authConfig.autoLoginPassword
            });
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Failed to create or find auto-login user' },
                { status: 500 }
            );
        }

        // Create JWT token
        const jwtSecret = getJwtSecret();
        const token = sign(
            { 
                userId: user.id, 
                email: user.email, 
                role: user.role, 
                name: user.name 
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        // Set HTTP-only cookie
        const response = NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.toLowerCase()
            },
            authMethod: 'auto-login'
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 // 24 hours
        });

        return response;
    } catch (error) {
        console.error('Auto-login error:', error);
        return NextResponse.json(
            { error: 'Auto-login failed' },
            { status: 500 }
        );
    }
}
