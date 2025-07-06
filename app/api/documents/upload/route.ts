import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAuth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/documentService';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const formData = await request.formData();
        
        const file = formData.get('file') as File;
        const realmId = formData.get('realmId') as string;
        const documentName = formData.get('name') as string;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }
        
        if (!realmId) {
            return NextResponse.json(
                { error: 'Realm ID is required' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'video/mp4',
            'video/avi',
            'video/mov',
            'video/wmv',
            'audio/mp3',
            'audio/wav',
            'audio/m4a',
            'audio/mpeg',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'File type not supported' },
                { status: 400 }
            );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'uploads');
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
            // Directory might already exist, ignore error
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name;
        const extension = originalName.split('.').pop();
        const filename = `${timestamp}-${originalName}`;
        const filepath = join(uploadsDir, filename);

        // Save file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Determine document type based on file type
        let documentType = 'DOCUMENT';
        if (file.type.startsWith('video/')) {
            documentType = 'VIDEO';
        } else if (file.type.startsWith('audio/')) {
            documentType = 'AUDIO';
        } else if (file.type === 'application/pdf') {
            documentType = 'PDF';
        }

        // Create document record in database
        const authUser = await user;
        const document = await DocumentService.createDocument({
            name: documentName || originalName,
            type: documentType,
            realmId,
            userId: authUser.userId,
            state: 'UPLOADED',
            filePath: filepath,
            fileSize: file.size,
            mimeType: file.type
        });

        return NextResponse.json({
            success: true,
            document: {
                id: document.id,
                name: document.name,
                type: document.type,
                state: document.state,
                filePath: filename, // Return relative path for security
                fileSize: file.size,
                mimeType: file.type,
                uploadDate: document.uploadDate
            }
        }, { status: 201 });

    } catch (error) {
        console.error('File upload error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
