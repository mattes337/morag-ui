import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../lib/services/documentService';
import { requireAuth } from '../../../lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const documents = await DocumentService.getDocumentsByUser(user.userId);
        return NextResponse.json(documents);
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Failed to fetch documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const body = await request.json();
        const { name, type, databaseId } = body;
        
        if (!name || !type) {
            return NextResponse.json(
                { error: 'Name and type are required' },
                { status: 400 },
            );
        }
        
        const document = await DocumentService.createDocument({ 
            name, 
            type, 
            databaseId, 
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
