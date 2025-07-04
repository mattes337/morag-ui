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
        const databaseId = searchParams.get('databaseId');

        let documents;
        if (databaseId) {
            // databaseId is now realmId in the new schema
            documents = await DocumentService.getDocumentsByRealm(databaseId);
        } else {
            const authUser = await user;
            documents = await DocumentService.getDocumentsByUserId(authUser.userId, realmId);
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
        const user = requireAuth(request);
        const body = await request.json();
        const { name, type, databaseId } = body;
        
        if (!name || !type || !databaseId) {
            return NextResponse.json(
                { error: 'Name, type, and realmId are required' },
                { status: 400 },
            );
        }

        const authUser = await user;
        const document = await DocumentService.createDocument({
            name,
            type,
            realmId: databaseId, // databaseId is now realmId in the new schema
            userId: authUser.userId // Use authenticated user's ID
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
