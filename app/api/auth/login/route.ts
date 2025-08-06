import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../lib/services/userService';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authConfig } from '../../../../lib/auth-config';
import { getAuthUser } from '../../../../lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
    try {
        // Check if user is already authenticated via headers
        if (authConfig.enableHeaderAuth) {
            const user = await getAuthUser(request);
            if (user && user.authMethod === 'header') {
                return NextResponse.json({
                    user: {
                        id: user.userId,
                        name: user.name,
                        email: user.email,
                        role: user.role.toLowerCase()
                    },
                    authMethod: 'header'
                });
            }
        }
        
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check if user is already authenticated via headers
        if (authConfig.enableHeaderAuth) {
            const user = await getAuthUser(request);
            if (user && user.authMethod === 'header') {
                return NextResponse.json({
                    user: {
                        id: user.userId,
                        name: user.name,
                        email: user.email,
                        role: user.role.toLowerCase()
                    },
                    authMethod: 'header'
                });
            }
        }
        
        // If header auth is enabled, don't allow password login
        if (authConfig.enableHeaderAuth) {
            return NextResponse.json(
                { error: 'Password authentication is disabled when SSO is enabled' },
                { status: 403 }
            );
        }
        
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
                const hashedPassword = await bcrypt.hash('admin123', 12);
                user = await UserService.createUser({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'ADMIN',
                    password: hashedPassword
                });
            } else {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }
        }

        // Verify password against hashed password in database
        if (!user.password) {
            // Check if this is the admin user with correct credentials
            if (email === 'admin@example.com' && password === 'admin123') {
                // Update the existing admin user with a password
                const hashedPassword = await bcrypt.hash('admin123', 12);
                user = await UserService.updateUser(user.id, {
                    password: hashedPassword
                });
            } else {
                // User doesn't have a password set (SSO user or legacy user)
                return NextResponse.json(
                    { error: 'Password authentication not available for this user' },
                    { status: 401 }
                );
            }
        }

        const isValidPassword = await bcrypt.compare(password, user.password || '');
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = sign(
            { userId: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
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
            authMethod: 'jwt'
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 // 24 hours
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