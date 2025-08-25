import { NextRequest, NextResponse } from 'next/server';
import { requireUnifiedAuth } from '../../../../lib/middleware/unifiedAuth';
import { unifiedFileService } from '../../../../lib/services/unifiedFileService';
import { DocumentService } from '../../../../lib/services/documentService';

/**
 * GET /api/files/[id]
 * Get a specific file by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUnifiedAuth(request);
    const fileId = params.id;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get file metadata
    const file = await unifiedFileService.getFile(fileId, false);

    if (!file) {
      return NextResponse.json({
        error: 'File not found'
      }, { status: 404 });
    }

    // Check access to the document
    const document = await DocumentService.getDocumentByIdWithAccess(
      file.documentId,
      auth.isGenericApiKey ? undefined : (auth.realm?.id || undefined)
    );

    if (!document) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get('includeContent') === 'true';

    // Get file with content if requested
    const fileWithContent = includeContent ?
      await unifiedFileService.getFile(fileId, true) : file;

    return NextResponse.json({
      file: fileWithContent,
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
      },
      authMethod: auth.authMethod,
      realm: auth.realm
    });
  } catch (error) {
    console.error('Failed to fetch file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch file' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/files/[id]
 * Delete a file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUnifiedAuth(request);
    const fileId = params.id;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get file metadata
    const file = await unifiedFileService.getFile(fileId, false);

    if (!file) {
      return NextResponse.json({
        error: 'File not found'
      }, { status: 404 });
    }

    // Check access to the document
    const document = await DocumentService.getDocumentByIdWithAccess(
      file.documentId,
      auth.isGenericApiKey ? undefined : (auth.realm?.id || undefined)
    );

    if (!document) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 });
    }

    // Check permissions - only admins, document owners, or generic API keys can delete
    const canDelete = auth.user!.role === 'ADMIN' ||
                     document.userId === auth.user!.userId ||
                     auth.isGenericApiKey;

    if (!canDelete) {
      return NextResponse.json({
        error: 'Insufficient permissions to delete file'
      }, { status: 403 });
    }

    // Delete the file
    const deleted = await unifiedFileService.deleteFile(fileId);

    if (!deleted) {
      return NextResponse.json({
        error: 'Failed to delete file'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'File deleted successfully',
      deletedFile: {
        id: file.id,
        filename: file.filename,
        fileType: file.fileType,
      },
      authMethod: auth.authMethod,
      realm: auth.realm
    });
  } catch (error) {
    console.error('Failed to delete file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}
