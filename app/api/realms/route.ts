import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { RealmService } from '@/lib/services/realmService';
import { z } from 'zod';

const createRealmSchema = z.object({
    name: z.string().min(1, 'Realm name is required').max(100, 'Realm name too long'),
    description: z.string().optional(),
    domain: z.string().optional(),
    ingestionPrompt: z.string().optional(),
    systemPrompt: z.string().optional(),
    extractionPrompt: z.string().optional(),
    domainPrompt: z.string().optional()
});

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const realms = await RealmService.getUserRealms(user.userId);
        return NextResponse.json({ realms });
    } catch (error) {
        console.error('Error fetching realms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch realms' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createRealmSchema.parse(body);

        const realm = await RealmService.createRealm({
            ...validatedData,
            ownerId: user.userId
        });

        return NextResponse.json({ realm }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error creating realm:', error);
        return NextResponse.json(
            { error: 'Failed to create realm' },
            { status: 500 }
        );
    }
}