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

        // Get user from database or create if not exists
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
        // This should verify the password against the hashed password in the database
        // For now, we'll accept any password until proper authentication is implemented
        console.log('⚠️ [Auth] Password verification not yet implemented');
        
        // Future implementation would look like:
        // const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
        // if (!isValidPassword) {
        //     return NextResponse.json(
        //         { error: 'Invalid credentials' },
        //         { status: 401 }
        //     );
        // }

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