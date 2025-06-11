import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../lib/services/documentService';

export async function GET() {
    try {
        const documents = await DocumentService.getAllDocuments();
        return NextResponse.json(documents);
    } catch (error) {
        console.error('Failed to fetch documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, type, databaseId } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
        }

        const document = await DocumentService.createDocument({ name, type, databaseId });
        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        console.error('Failed to create document:', error);
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }
}
