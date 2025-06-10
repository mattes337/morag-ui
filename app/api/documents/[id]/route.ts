import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../../lib/services/documentService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const document = await DocumentService.getDocumentById(params.id);
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        return NextResponse.json(document);
    } catch (error) {
        console.error('Failed to fetch document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const document = await DocumentService.updateDocument(params.id, body);
        return NextResponse.json(document);
    } catch (error) {
        console.error('Failed to update document:', error);
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await DocumentService.deleteDocument(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
