import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../lib/services/documentService';
import { requireAuth, getAuthUser } from '../../../lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const realmId = searchParams.get('realmId');

        let documents;
        if (realmId) {
            documents = await DocumentService.getDocumentsByRealm(realmId);
        } else {
            documents = await DocumentService.getDocumentsByUserId(user.userId, realmId);
        }
        
        return NextResponse.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { name, type, realmId } = body;

        if (!name || !type || !realmId) {
            return NextResponse.json(
                { error: 'Name, type, and realmId are required' },
                { status: 400 },
            );
        }

        const document = await DocumentService.createDocument({
            name,
            type,
            realmId,
            userId: user.userId // Use authenticated user's ID
        });
        
        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to create document:', error);
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }
}
