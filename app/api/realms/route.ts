import { NextRequest, NextResponse } from 'next/server';
import { requireUnifiedAuth, getUnifiedAuth } from '@/lib/middleware/unifiedAuth';
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

/**
 * GET /api/realms
 * Get realm information
 * API key auth: returns associated realm with statistics
 * Session auth: returns user's realms
 */
export async function GET(request: NextRequest) {
    try {
        const auth = await requireUnifiedAuth(request);

        if (auth.authMethod === 'apikey' && auth.realm) {
            // For API key authentication, return the associated realm with statistics
            const realm = await RealmService.getRealmById(auth.realm.id, auth.user!.userId);

            if (!realm) {
                return NextResponse.json(
                    { error: 'Realm not found' },
                    { status: 404 }
                );
            }

            // Get realm statistics (simplified version)
            const statistics = {
                documentCount: 0, // Would be calculated from database
                userCount: 0,     // Would be calculated from database
                lastActivity: new Date().toISOString(),
            };

            return NextResponse.json({
                realm: {
                    id: realm.id,
                    name: realm.name,
                    description: realm.description,
                    createdAt: realm.createdAt,
                    updatedAt: realm.updatedAt,
                },
                statistics,
                user: {
                    id: auth.user!.userId,
                    email: auth.user!.email,
                    name: auth.user!.name,
                },
                authMethod: auth.authMethod
            });
        } else {
            // For session authentication, return user's realms
            const realms = await RealmService.getUserRealms(auth.user!.userId);
            return NextResponse.json({
                realms,
                authMethod: auth.authMethod
            });
        }
    } catch (error) {
        console.error('Error fetching realms:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch realms' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

/**
 * POST /api/realms
 * Create a new realm
 * Only available for session authentication (UI users)
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await requireUnifiedAuth(request);

        // Only allow realm creation for session users (not API keys)
        if (auth.authMethod === 'apikey') {
            return NextResponse.json(
                { error: 'Realm creation not available for API key authentication' },
                { status: 403 }
            );
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
            ownerId: auth.user!.userId,
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