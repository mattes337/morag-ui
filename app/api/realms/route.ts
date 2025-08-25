import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { RealmService } from '@/lib/services/realmService';
import { z } from 'zod';

const createRealmSchema = z.object({
    name: z.string().min(1, 'Realm name is required').max(100, 'Realm name too long'),
    description: z.string().optional(),
    domain: z.string().optional(),
    serverIds: z.array(z.string()).optional(),
    prompts: z.object({
        ingestion: z.string().optional(),
        system: z.string().optional(),
        extraction: z.string().optional(),
        domain: z.string().optional()
    }).optional(),
    // Legacy support for direct prompt fields
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

        // Merge prompts from both new and legacy formats
        const prompts = {
            ingestion: validatedData.prompts?.ingestion || validatedData.ingestionPrompt,
            system: validatedData.prompts?.system || validatedData.systemPrompt,
            extraction: validatedData.prompts?.extraction || validatedData.extractionPrompt,
            domain: validatedData.prompts?.domain || validatedData.domainPrompt,
        };

        // Filter out undefined values
        const filteredPrompts = Object.fromEntries(
            Object.entries(prompts).filter(([_, value]) => value !== undefined)
        );

        const realm = await RealmService.createRealm({
            name: validatedData.name,
            description: validatedData.description,
            domain: validatedData.domain,
            ownerId: user.userId,
            // Add prompts if any are provided
            ...(Object.keys(filteredPrompts).length > 0 && {
                ingestionPrompt: filteredPrompts.ingestion,
                systemPrompt: filteredPrompts.system,
                extractionPrompt: filteredPrompts.extraction,
                domainPrompt: filteredPrompts.domain,
            })
        });

        // TODO: Handle server associations if serverIds are provided
        if (validatedData.serverIds && validatedData.serverIds.length > 0) {
            console.log('Server associations not yet implemented:', validatedData.serverIds);
            // This would involve creating relationships between the realm and servers
        }

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