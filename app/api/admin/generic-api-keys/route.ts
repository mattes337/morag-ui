import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyService } from '../../../../lib/services/apiKeyService';
import { requireUnifiedAuth } from '../../../../lib/middleware/unifiedAuth';
import { z } from 'zod';

const createGenericApiKeySchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    userId: z.string().uuid('Invalid user ID').optional(),
});

/**
 * GET /api/admin/generic-api-keys
 * List all generic API keys
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
    try {
        const auth = await requireUnifiedAuth(request);
        
        // Only admins can manage generic API keys
        if (auth.user!.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || undefined;
        
        const apiKeys = await ApiKeyService.getGenericApiKeys(userId);
        
        return NextResponse.json({
            apiKeys,
            authMethod: auth.authMethod,
        });
    } catch (error) {
        console.error('Failed to fetch generic API keys:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch generic API keys' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

/**
 * POST /api/admin/generic-api-keys
 * Create a new generic API key
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await requireUnifiedAuth(request);
        const body = await request.json();
        
        // Only admins can create generic API keys
        if (auth.user!.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        // Validate request body
        const validatedData = createGenericApiKeySchema.parse(body);
        
        // Use provided userId or default to current admin user
        const targetUserId = validatedData.userId || auth.user!.userId;
        
        // Create generic API key
        const apiKey = await ApiKeyService.createGenericApiKey({
            name: validatedData.name,
            userId: targetUserId,
        });
        
        return NextResponse.json({
            apiKey,
            message: 'Generic API key created successfully',
            authMethod: auth.authMethod,
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }
        
        console.error('Failed to create generic API key:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create generic API key' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}
