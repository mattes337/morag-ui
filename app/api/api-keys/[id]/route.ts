import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyService } from '../../../../lib/services/apiKeyService';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await ApiKeyService.deleteApiKey(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete API key:', error);
        return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
    }
}
