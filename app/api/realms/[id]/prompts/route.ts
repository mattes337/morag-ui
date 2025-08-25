import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { RealmService } from '@/lib/services/realmService';
import { z } from 'zod';

const updatePromptsSchema = z.object({
    domain: z.string().optional(),
    ingestionPrompt: z.string().optional(),
    systemPrompt: z.string().optional(),
    extractionPrompt: z.string().optional(),
    domainPrompt: z.string().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prompts = await RealmService.getRealmPrompts(params.id, user.userId);
        if (!prompts) {
            return NextResponse.json({ error: 'Realm not found' }, { status: 404 });
        }

        return NextResponse.json({ prompts });
    } catch (error) {
        console.error('Error fetching realm prompts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch realm prompts' },
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
        const validatedData = updatePromptsSchema.parse(body);

        // Validate prompts
        const validationErrors = RealmService.validateRealmPrompts(validatedData);
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { error: 'Validation error', details: validationErrors },
                { status: 400 }
            );
        }

        const realm = await RealmService.updateRealmPrompts(params.id, user.userId, validatedData);
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

        console.error('Error updating realm prompts:', error);
        return NextResponse.json(
            { error: 'Failed to update realm prompts' },
            { status: 500 }
        );
    }
}
