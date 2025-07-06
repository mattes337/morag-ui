import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/documentService';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { ingestionMetadata } = body;

        if (!ingestionMetadata) {
            return NextResponse.json(
                { error: 'Ingestion metadata is required' },
                { status: 400 }
            );
        }

        // Get the document to verify ownership/access
        const document = await DocumentService.getDocumentById(params.id);
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Check if user has access to this document
        if (document.userId !== user.userId) {
            // TODO: Add realm-based access control here
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Update the ingestion metadata
        const updatedDocument = await DocumentService.updateIngestionMetadata(
            params.id,
            ingestionMetadata
        );

        return NextResponse.json(updatedDocument);
    } catch (error) {
        console.error('Failed to update ingestion metadata:', error);
        return NextResponse.json(
            { error: 'Failed to update ingestion metadata' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await requireAuth(request);

        // Get the document to verify ownership/access
        const document = await DocumentService.getDocumentById(params.id);
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Check if user has access to this document
        if (document.userId !== user.userId) {
            // TODO: Add realm-based access control here
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({
            ingestionMetadata: document.ingestionMetadata || null
        });
    } catch (error) {
        console.error('Failed to fetch ingestion metadata:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ingestion metadata' },
            { status: 500 }
        );
    }
}
