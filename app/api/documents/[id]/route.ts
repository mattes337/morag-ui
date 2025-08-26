import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '../../../../lib/services/documentService';
import { requireUnifiedAuth } from '../../../../lib/middleware/unifiedAuth';
import { unifiedFileService } from '../../../../lib/services/unifiedFileService';
import { z } from 'zod';

/**
 * GET /api/documents/[id]
 * Get document by ID with realm filtering
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await requireUnifiedAuth(request);

        // Get document with realm filtering
        const document = await DocumentService.getDocumentByIdWithAccess(
            params.id,
            auth.isGenericApiKey ? undefined : auth.realm?.id
        );

        if (!document) {
            return NextResponse.json({
                error: 'Document not found or access denied'
            }, { status: 404 });
        }

        // Include files information
        const files = await unifiedFileService.getFilesByDocument(params.id);

        return NextResponse.json({
            document: {
                ...document,
                files,
                // Ensure processing state fields are included
                currentStage: document.currentStage,
                stageStatus: document.stageStatus,
                lastStageError: document.lastStageError,
                processingMode: document.processingMode,
                isProcessingPaused: document.isProcessingPaused,
                nextScheduledStage: document.nextScheduledStage,
                scheduledAt: document.scheduledAt
            },
            authMethod: auth.authMethod,
            realm: auth.realm
        });
    } catch (error) {
        console.error('Failed to fetch document:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch document' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

/**
 * DELETE /api/documents/[id]
 * Delete document and all associated files
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await requireUnifiedAuth(request);

        // Get document with realm filtering
        const document = await DocumentService.getDocumentByIdWithAccess(
            params.id,
            auth.isGenericApiKey ? undefined : auth.realm?.id
        );

        if (!document) {
            return NextResponse.json({
                error: 'Document not found or access denied'
            }, { status: 404 });
        }

        // Check permissions - only admins or document owners can delete
        const canDelete = auth.user!.role === 'ADMIN' ||
                         document.userId === auth.user!.userId ||
                         auth.isGenericApiKey;

        if (!canDelete) {
            return NextResponse.json({
                error: 'Insufficient permissions to delete document'
            }, { status: 403 });
        }

        // Delete document (this will cascade delete files and other related data)
        const deletedDocument = await DocumentService.deleteDocument(params.id, auth.user!.userId);

        return NextResponse.json({
            message: 'Document deleted successfully',
            deletedDocument: {
                id: document.id,
                name: document.name,
                type: document.type,
            },
            authMethod: auth.authMethod,
            realm: auth.realm
        });
    } catch (error) {
        console.error('Failed to delete document:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete document' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const auth = await requireUnifiedAuth(request);
        const body = await request.json();

        // Get document with realm filtering
        const document = await DocumentService.getDocumentByIdWithAccess(
            params.id,
            auth.isGenericApiKey ? undefined : auth.realm?.id
        );

        if (!document) {
            return NextResponse.json({
                error: 'Document not found or access denied'
            }, { status: 404 });
        }

        // Check permissions - only admins, document owners, or generic API keys can update
        const canUpdate = auth.user!.role === 'ADMIN' ||
                         document.userId === auth.user!.userId ||
                         auth.isGenericApiKey;

        if (!canUpdate) {
            return NextResponse.json({
                error: 'Insufficient permissions to update document'
            }, { status: 403 });
        }

        const updatedDocument = await DocumentService.updateDocument(params.id, body);

        return NextResponse.json({
            document: updatedDocument,
            message: 'Document updated successfully',
            authMethod: auth.authMethod,
            realm: auth.realm
        });
    } catch (error) {
        console.error('Failed to update document:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update document' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}
