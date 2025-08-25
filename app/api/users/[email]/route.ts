import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../lib/services/userService';
import { requireUnifiedAuth } from '../../../../lib/middleware/unifiedAuth';
import { z } from 'zod';

const updateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    avatar: z.string().url().optional(),
    role: z.enum(['ADMIN', 'USER', 'VIEWER']).optional(),
    password: z.string().min(6).optional(),
});

/**
 * GET /api/users/[email]
 * Get user by email
 * Requires authentication and admin role or self-access
 */
export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
    try {
        const auth = await requireUnifiedAuth(request);

        // Check if user is admin or accessing their own profile
        const targetUser = await UserService.getUserByEmail(params.email);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (auth.user!.role !== 'ADMIN' && auth.user!.email !== params.email) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Return user with realm information
        const userWithRealms = await UserService.getUserWithRealms(targetUser.id);

        return NextResponse.json({
            user: userWithRealms,
            authMethod: auth.authMethod
        });
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch user' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

/**
 * PUT /api/users/[email]
 * Update user by email
 * Requires authentication and admin role or self-access
 */
export async function PUT(request: NextRequest, { params }: { params: { email: string } }) {
    try {
        const auth = await requireUnifiedAuth(request);
        const body = await request.json();

        // Validate request body
        const validatedData = updateUserSchema.parse(body);

        // Check if user exists
        const targetUser = await UserService.getUserByEmail(params.email);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check permissions
        const isAdmin = auth.user!.role === 'ADMIN';
        const isSelf = auth.user!.email === params.email;

        if (!isAdmin && !isSelf) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Non-admin users cannot change their role
        if (!isAdmin && validatedData.role) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 403 });
        }

        // Update user
        const updatedUser = await UserService.updateUser(targetUser.id, validatedData);

        return NextResponse.json({
            user: updatedUser,
            message: 'User updated successfully',
            authMethod: auth.authMethod
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Failed to update user:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update user' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

/**
 * DELETE /api/users/[email]
 * Delete user by email (offboard)
 * Requires admin authentication
 */
export async function DELETE(request: NextRequest, { params }: { params: { email: string } }) {
    try {
        const auth = await requireUnifiedAuth(request);

        // Only admins can delete users
        if (auth.user!.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Check if user exists
        const targetUser = await UserService.getUserByEmail(params.email);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent self-deletion
        if (auth.user!.email === params.email) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        // Delete user (this will cascade delete related data)
        await UserService.deleteUser(targetUser.id);

        return NextResponse.json({
            message: 'User deleted successfully',
            deletedUser: {
                id: targetUser.id,
                email: targetUser.email,
                name: targetUser.name
            },
            authMethod: auth.authMethod
        });
    } catch (error) {
        console.error('Failed to delete user:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete user' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}
