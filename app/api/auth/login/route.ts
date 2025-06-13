import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../lib/services/userService';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // For demo purposes, we'll use hardcoded credentials
        // In production, you'd verify against hashed passwords in the database
        const demoUsers = [
            { email: 'admin@example.com', password: 'admin123', role: 'ADMIN' },
            { email: 'user@example.com', password: 'user123', role: 'USER' },
            { email: 'viewer@example.com', password: 'viewer123', role: 'VIEWER' },
            { email: 'john.doe@example.com', password: 'password', role: 'ADMIN' }
        ];

        const demoUser = demoUsers.find(u => u.email === email && u.password === password);
        
        if (!demoUser) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Try to find existing user in database
        let user = await UserService.getUserByEmail(email);
        
        // If user doesn't exist, create them
        if (!user) {
            user = await UserService.createUser({
                name: demoUser.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                email: demoUser.email,
                role: demoUser.role as 'ADMIN' | 'USER' | 'VIEWER'
            });
        }

        // Create JWT token
        const token = sign(
            { userId: user.id, email: user.email, role: user.role },
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
            }
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