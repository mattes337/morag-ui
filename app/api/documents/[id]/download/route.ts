import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getAuthUser } from '@/lib/auth';
import { DocumentService } from '@/lib/services/documentService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get document from database
        const document = await DocumentService.getDocumentById(params.id);
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Check if user has access to this document (owns it or has access to the realm)
        if (document.userId !== user.userId) {
            // TODO: Add realm-based access control here
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Check if document has a file path
        if (!document.filePath) {
            return NextResponse.json({ error: 'No file associated with this document' }, { status: 404 });
        }

        try {
            // Read file from disk
            const fileBuffer = await readFile(document.filePath);
            
            // Set appropriate headers
            const headers = new Headers();
            headers.set('Content-Type', document.mimeType || 'application/octet-stream');
            headers.set('Content-Disposition', `attachment; filename="${document.name}"`);
            headers.set('Content-Length', fileBuffer.length.toString());

            return new NextResponse(fileBuffer, {
                status: 200,
                headers,
            });
        } catch (fileError) {
            console.error('Error reading file:', fileError);
            return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
        }

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: 'Failed to download file' },
            { status: 500 }
        );
    }
}
