import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/database';
import { RealmRole } from '../../../../../types';

// GET /api/realms/[id]/users - Get all users in a realm
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await requireAuth(request);
        const realmId = params.id;

        // Check if user has access to this realm
        const userRealm = await prisma.userRealm.findFirst({
            where: {
                userId: user.userId,
                realmId: realmId
            }
        });

        if (!userRealm) {
            return NextResponse.json(
                { error: 'Access denied to this realm' },
                { status: 403 }
            );
        }

        // Get all users in the realm
        const realmUsers = await prisma.userRealm.findMany({
            where: { realmId },
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
            },
            orderBy: [
                { role: 'asc' }, // OWNER first, then ADMIN, etc.
                { user: { name: 'asc' } }
            ]
        });

        const users = realmUsers.map(ur => ({
            id: ur.user.id,
            name: ur.user.name,
            email: ur.user.email,
            avatar: ur.user.avatar,
            role: ur.role,
            createdAt: ur.createdAt.toISOString(),
            updatedAt: ur.updatedAt.toISOString()
        }));

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Get realm users error:', error);
        
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

// POST /api/realms/[id]/users - Add user to realm
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await requireAuth(request);
        const realmId = params.id;
        const body = await request.json();
        
        const { email, role } = body as { email: string; role: RealmRole };
        
        if (!email || !role) {
            return NextResponse.json(
                { error: 'Email and role are required' },
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
                { error: 'Insufficient permissions to add users' },
                { status: 403 }
            );
        }

        // Find the user to add
        const targetUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user is already in the realm
        const existingUserRealm = await prisma.userRealm.findFirst({
            where: {
                userId: targetUser.id,
                realmId: realmId
            }
        });

        if (existingUserRealm) {
            return NextResponse.json(
                { error: 'User is already in this realm' },
                { status: 400 }
            );
        }

        // Only owners can add other owners or admins
        if ((role === 'OWNER' || role === 'ADMIN') && currentUserRealm.role !== 'OWNER') {
            return NextResponse.json(
                { error: 'Only realm owners can assign OWNER or ADMIN roles' },
                { status: 403 }
            );
        }

        // Add user to realm
        const newUserRealm = await prisma.userRealm.create({
            data: {
                userId: targetUser.id,
                realmId: realmId,
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
            id: newUserRealm.user.id,
            name: newUserRealm.user.name,
            email: newUserRealm.user.email,
            avatar: newUserRealm.user.avatar,
            role: newUserRealm.role,
            createdAt: newUserRealm.createdAt.toISOString(),
            updatedAt: newUserRealm.updatedAt.toISOString()
        };

        return NextResponse.json({ user: responseUser });
    } catch (error) {
        console.error('Add realm user error:', error);
        
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