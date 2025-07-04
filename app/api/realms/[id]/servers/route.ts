import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { RealmService } from '@/lib/services/realmService';
import { z } from 'zod';

const addServerSchema = z.object({
    serverId: z.string().min(1, 'Server ID is required')
});

const removeServerSchema = z.object({
    serverId: z.string().min(1, 'Server ID is required')
});

// GET /api/realms/[id]/servers - Get available servers for realm
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const availableServers = await RealmService.getAvailableServersForRealm(params.id, user.userId);
        return NextResponse.json({ servers: availableServers });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Insufficient permissions')) {
                return NextResponse.json({ error: error.message }, { status: 403 });
            }
        }

        console.error('Error fetching available servers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch available servers' },
            { status: 500 }
        );
    }
}

// POST /api/realms/[id]/servers - Add server to realm
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = addServerSchema.parse(body);

        await RealmService.addServerToRealm(params.id, validatedData.serverId, user.userId);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            if (error.message.includes('Insufficient permissions')) {
                return NextResponse.json({ error: error.message }, { status: 403 });
            }
            if (error.message.includes('Server not found') || 
                error.message.includes('already assigned')) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
        }

        console.error('Error adding server to realm:', error);
        return NextResponse.json(
            { error: 'Failed to add server to realm' },
            { status: 500 }
        );
    }
}

// DELETE /api/realms/[id]/servers - Remove server from realm
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = removeServerSchema.parse(body);

        await RealmService.removeServerFromRealm(params.id, validatedData.serverId, user.userId);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            if (error.message.includes('Insufficient permissions')) {
                return NextResponse.json({ error: error.message }, { status: 403 });
            }
            if (error.message.includes('not assigned')) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
        }

        console.error('Error removing server from realm:', error);
        return NextResponse.json(
            { error: 'Failed to remove server from realm' },
            { status: 500 }
        );
    }
}
