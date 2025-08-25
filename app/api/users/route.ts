import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../lib/services/userService';
import { requireUnifiedAuth } from '../../../lib/middleware/unifiedAuth';
import { z } from 'zod';

const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    avatar: z.string().url().optional(),
    role: z.enum(['ADMIN', 'USER', 'VIEWER']).default('USER'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    createApiKey: z.boolean().default(false),
});

/**
 * GET /api/users
 * List all users with pagination and filtering
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
    try {
        const auth = await requireUnifiedAuth(request);
        
        // Only admins can list all users
        if (auth.user!.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || undefined;
        const role = searchParams.get('role') as 'ADMIN' | 'USER' | 'VIEWER' | undefined;
        
        const result = await UserService.getAllUsers({
            page,
            limit,
            search,
            role,
        });
        
        return NextResponse.json({
            ...result,
            authMethod: auth.authMethod,
        });
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch users' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

/**
 * POST /api/users
 * Create a new user (onboard)
 * Requires admin authentication or generic API key
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await requireUnifiedAuth(request);
        const body = await request.json();
        
        // Validate request body
        const validatedData = createUserSchema.parse(body);
        
        // Check permissions
        const isAdmin = auth.user!.role === 'ADMIN';
        const isGenericApiKey = auth.authMethod === 'apikey' && !auth.realm; // Generic API key has no realm
        
        if (!isAdmin && !isGenericApiKey) {
            return NextResponse.json({ 
                error: 'Admin access or generic API key required for user creation' 
            }, { status: 403 });
        }
        
        // Check if user already exists
        const existingUser = await UserService.getUserByEmail(validatedData.email);
        if (existingUser) {
            return NextResponse.json({ 
                error: 'User with this email already exists' 
            }, { status: 409 });
        }
        
        // Create user with defaults (realm, API key if requested)
        const newUser = await UserService.createUserWithDefaults(validatedData);
        
        return NextResponse.json({
            user: newUser,
            message: 'User created successfully',
            authMethod: auth.authMethod,
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }
        
        console.error('Failed to create user:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create user' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}
