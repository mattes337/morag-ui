import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/database';
import { RealmRole } from '../../../../../../types';

// PUT /api/realms/[id]/users/[userId] - Update user role in realm
export async function PUT(
    request: NextRequest, 
    { params }: { params: { id: string; userId: string } }
) {
    try {
        const user = await requireAuth(request);
        const realmId = params.id;
        const targetUserId = params.userId;
        const body = await request.json();
        
        const { role } = body as { role: RealmRole };
        
        if (!role) {
            return NextResponse.json(
                { error: 'Role is required' },
                { status: 400 }
            );
        }

        // Check if current user has admin/owner permissions in this realm
        const currentUserRealm = await prisma.userRealm.findFirst({
            where: {
                userId: user.userId,
                realmId: realmId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!currentUserRealm) {
            return NextResponse.json(
                { error: 'Insufficient permissions to update user roles' },
                { status: 403 }
            );
        }

        // Get the target user's current role
        const targetUserRealm = await prisma.userRealm.findFirst({
            where: {
                userId: targetUserId,
                realmId: realmId
            }
        });

        if (!targetUserRealm) {
            return NextResponse.json(
                { error: 'User not found in this realm' },
                { status: 404 }
            );
        }

        // Prevent users from modifying their own role
        if (targetUserId === user.userId) {
            return NextResponse.json(
                { error: 'Cannot modify your own role' },
                { status: 400 }
            );
        }

        // Only owners can modify owner roles or assign owner/admin roles
        if (
            (targetUserRealm.role === 'OWNER' || role === 'OWNER' || role === 'ADMIN') && 
            currentUserRealm.role !== 'OWNER'
        ) {
            return NextResponse.json(
                { error: 'Only realm owners can modify OWNER roles or assign OWNER/ADMIN roles' },
                { status: 403 }
            );
        }

        // Update the user's role
        const updatedUserRealm = await prisma.userRealm.update({
            where: {
                id: targetUserRealm.id
            },
            data: {
                role: role
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });

        const responseUser = {
            id: updatedUserRealm.user.id,
            name: updatedUserRealm.user.name,
            email: updatedUserRealm.user.email,
            avatar: updatedUserRealm.user.avatar,
            role: updatedUserRealm.role,
            createdAt: updatedUserRealm.createdAt.toISOString(),
            updatedAt: updatedUserRealm.updatedAt.toISOString()
        };

        return NextResponse.json({ user: responseUser });
    } catch (error) {
        console.error('Update realm user error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/realms/[id]/users/[userId] - Remove user from realm
export async function DELETE(
    request: NextRequest, 
    { params }: { params: { id: string; userId: string } }
) {
    try {
        const user = await requireAuth(request);
        const realmId = params.id;
        const targetUserId = params.userId;

        // Check if current user has admin/owner permissions in this realm
        const currentUserRealm = await prisma.userRealm.findFirst({
            where: {
                userId: user.userId,
                realmId: realmId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!currentUserRealm) {
            return NextResponse.json(
                { error: 'Insufficient permissions to remove users' },
                { status: 403 }
            );
        }

        // Get the target user's current role
        const targetUserRealm = await prisma.userRealm.findFirst({
            where: {
                userId: targetUserId,
                realmId: realmId
            }
        });

        if (!targetUserRealm) {
            return NextResponse.json(
                { error: 'User not found in this realm' },
                { status: 404 }
            );
        }

        // Prevent users from removing themselves
        if (targetUserId === user.userId) {
            return NextResponse.json(
                { error: 'Cannot remove yourself from the realm' },
                { status: 400 }
            );
        }

        // Only owners can remove other owners
        if (targetUserRealm.role === 'OWNER' && currentUserRealm.role !== 'OWNER') {
            return NextResponse.json(
                { error: 'Only realm owners can remove other owners' },
                { status: 403 }
            );
        }

        // Check if this is the last owner (prevent removing the last owner)
        if (targetUserRealm.role === 'OWNER') {
            const ownerCount = await prisma.userRealm.count({
                where: {
                    realmId: realmId,
                    role: 'OWNER'
                }
            });

            if (ownerCount <= 1) {
                return NextResponse.json(
                    { error: 'Cannot remove the last owner from the realm' },
                    { status: 400 }
                );
            }
        }

        // Remove the user from the realm
        await prisma.userRealm.delete({
            where: {
                id: targetUserRealm.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Remove realm user error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}