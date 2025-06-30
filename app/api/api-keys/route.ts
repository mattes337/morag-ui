import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyService } from '../../../lib/services/apiKeyService';
import { getAuthUser, requireAuth } from '../../../lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const realmId = searchParams.get('realmId');

        const apiKeys = await ApiKeyService.getApiKeysByUserId(user.userId, realmId);
        return NextResponse.json(apiKeys);
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return NextResponse.json(
            { error: 'Failed to fetch API keys' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { name, key } = body;

        if (!name || !key) {
            return NextResponse.json(
                { error: 'Name and key are required' },
                { status: 400 },
            );
        }

        const apiKey = await ApiKeyService.createApiKey({ 
            name, 
            key, 
            userId: user.userId // Use authenticated user's ID
        });
        
        return NextResponse.json(apiKey, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to create API key:', error);
        return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
    }
}
