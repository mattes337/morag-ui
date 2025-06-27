import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { RealmService } from '@/lib/services/realmService';
import { z } from 'zod';

const updateRealmSchema = z.object({
    name: z.string().min(1, 'Realm name is required').max(100, 'Realm name too long').optional(),
    description: z.string().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const realm = await RealmService.getRealmById(params.id, user.userId);
        if (!realm) {
            return NextResponse.json({ error: 'Realm not found' }, { status: 404 });
        }

        return NextResponse.json({ realm });
    } catch (error) {
        console.error('Error fetching realm:', error);
        return NextResponse.json(
            { error: 'Failed to fetch realm' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateRealmSchema.parse(body);

        const realm = await RealmService.updateRealm(params.id, user.userId, validatedData);
        if (!realm) {
            return NextResponse.json({ error: 'Realm not found' }, { status: 404 });
        }

        return NextResponse.json({ realm });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        if (error instanceof Error && error.message.includes('Insufficient permissions')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        console.error('Error updating realm:', error);
        return NextResponse.json(
            { error: 'Failed to update realm' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await RealmService.deleteRealm(params.id, user.userId);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Only realm owners') || error.message.includes('Cannot delete default')) {
                return NextResponse.json({ error: error.message }, { status: 403 });
            }
        }

        console.error('Error deleting realm:', error);
        return NextResponse.json(
            { error: 'Failed to delete realm' },
            { status: 500 }
        );
    }
}