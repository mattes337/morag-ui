import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyService } from '../../../lib/services/apiKeyService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (userId) {
            const apiKeys = await ApiKeyService.getApiKeysByUser(userId);
            return NextResponse.json(apiKeys);
        } else {
            const apiKeys = await ApiKeyService.getAllApiKeys();
            return NextResponse.json(apiKeys);
        }
    } catch (error) {
        console.error('Failed to fetch API keys:', error);
        return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, key, userId } = body;

        if (!name || !key || !userId) {
            return NextResponse.json(
                { error: 'Name, key, and userId are required' },
                { status: 400 },
            );
        }

        const apiKey = await ApiKeyService.createApiKey({ name, key, userId });
        return NextResponse.json(apiKey, { status: 201 });
    } catch (error) {
        console.error('Failed to create API key:', error);
        return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
    }
}
