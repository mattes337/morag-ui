import { NextRequest, NextResponse } from 'next/server';
import { requireUnifiedAuth } from '../../../../../lib/middleware/unifiedAuth';
import { unifiedFileService } from '../../../../../lib/services/unifiedFileService';
import { DocumentService } from '../../../../../lib/services/documentService';
import { z } from 'zod';

/**
 * GET /api/documents/[id]/files
 * List all files for a document
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await requireUnifiedAuth(request);
        
        // Verify document exists and user has access
        const document = await DocumentService.getDocumentByIdWithAccess(
            params.id, 
            auth.isGenericApiKey ? undefined : auth.realm?.id
        );
        
        if (!document) {
            return NextResponse.json({ 
                error: 'Document not found or access denied' 
            }, { status: 404 });
        }
        
        // Get all files for the document
        const files = await unifiedFileService.getFilesByDocument(params.id);
        
        return NextResponse.json({
            files,
            document: {
                id: document.id,
                name: document.name,
                type: document.type,
            },
            authMethod: auth.authMethod,
            realm: auth.realm
        });
    } catch (error) {
        console.error('Failed to fetch document files:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch document files' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

/**
 * POST /api/documents/[id]/files
 * Upload additional files to a document
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await requireUnifiedAuth(request);
        
        // Verify document exists and user has access
        const document = await DocumentService.getDocumentByIdWithAccess(
            params.id, 
            auth.isGenericApiKey ? undefined : auth.realm?.id
        );
        
        if (!document) {
            return NextResponse.json({ 
                error: 'Document not found or access denied' 
            }, { status: 404 });
        }
        
        // Check permissions - only admins, document owners, or generic API keys can upload
        const canUpload = auth.user!.role === 'ADMIN' || 
                         document.userId === auth.user!.userId ||
                         auth.isGenericApiKey;
        
        if (!canUpload) {
            return NextResponse.json({ 
                error: 'Insufficient permissions to upload files' 
            }, { status: 403 });
        }
        
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const fileType = formData.get('fileType') as string || 'ARTIFACT';
        const isPublic = formData.get('isPublic') === 'true';
        
        if (!file) {
            return NextResponse.json({ 
                error: 'No file provided' 
            }, { status: 400 });
        }
        
        // Validate file type
        const validFileTypes = ['ORIGINAL_DOCUMENT', 'STAGE_OUTPUT', 'ARTIFACT', 'THUMBNAIL', 'PREVIEW'];
        if (!validFileTypes.includes(fileType)) {
            return NextResponse.json({ 
                error: `Invalid file type. Must be one of: ${validFileTypes.join(', ')}` 
            }, { status: 400 });
        }
        
        // Store the file
        const buffer = await file.arrayBuffer();
        const content = Buffer.from(buffer);
        
        const storedFile = await unifiedFileService.storeFile({
            documentId: params.id,
            fileType: fileType as any,
            filename: file.name,
            originalName: file.name,
            content,
            contentType: file.type,
            isPublic,
            accessLevel: 'REALM_MEMBERS',
            metadata: {
                uploadedBy: auth.user!.userId,
                uploadedAt: new Date().toISOString(),
                originalSize: file.size,
            }
        });
        
        return NextResponse.json({
            file: storedFile,
            message: 'File uploaded successfully',
            authMethod: auth.authMethod,
            realm: auth.realm
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to upload file:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to upload file' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

/**
 * DELETE /api/documents/[id]/files
 * Delete all files for a document
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await requireUnifiedAuth(request);
        
        // Verify document exists and user has access
        const document = await DocumentService.getDocumentByIdWithAccess(
            params.id, 
            auth.isGenericApiKey ? undefined : auth.realm?.id
        );
        
        if (!document) {
            return NextResponse.json({ 
                error: 'Document not found or access denied' 
            }, { status: 404 });
        }
        
        // Check permissions - only admins, document owners, or generic API keys can delete
        const canDelete = auth.user!.role === 'ADMIN' || 
                         document.userId === auth.user!.userId ||
                         auth.isGenericApiKey;
        
        if (!canDelete) {
            return NextResponse.json({ 
                error: 'Insufficient permissions to delete files' 
            }, { status: 403 });
        }
        
        // Get all files before deletion for response
        const files = await unifiedFileService.getFilesByDocument(params.id);
        
        // Delete all files for the document
        const deletedCount = await unifiedFileService.deleteDocumentFiles(params.id);
        
        return NextResponse.json({
            message: `${deletedCount} files deleted successfully`,
            deletedFiles: files.map(f => ({
                id: f.id,
                filename: f.filename,
                fileType: f.fileType,
            })),
            authMethod: auth.authMethod,
            realm: auth.realm
        });
    } catch (error) {
        console.error('Failed to delete document files:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete document files' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}
