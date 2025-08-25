import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/middleware/apiKeyAuth';
import { DocumentService } from '@/lib/services/documentService';
import { unifiedFileService } from '@/lib/services/unifiedFileService';

/**
 * GET /api/v1/documents/[id]
 * Get a specific document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireApiKey(request);
    const documentId = params.id;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const document = await DocumentService.getDocumentById(documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Check if document belongs to the authenticated realm
    if (document.realmId !== auth.realm!.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Get document files
    const files = await unifiedFileService.getFilesByDocument(documentId);
    
    return NextResponse.json({
      document,
      files,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch document' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

/**
 * PUT /api/v1/documents/[id]
 * Update a document
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireApiKey(request);
    const documentId = params.id;
    const body = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Check if document exists and belongs to realm
    const existingDocument = await DocumentService.getDocumentById(documentId);
    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    if (existingDocument.realmId !== auth.realm!.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const updatedDocument = await DocumentService.updateDocument(documentId, body);
    
    return NextResponse.json({
      document: updatedDocument,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update document' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/v1/documents/[id]
 * Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireApiKey(request);
    const documentId = params.id;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Check if document exists and belongs to realm
    const existingDocument = await DocumentService.getDocumentById(documentId);
    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    if (existingDocument.realmId !== auth.realm!.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Delete document files
    await unifiedFileService.deleteDocumentFiles(documentId);
    
    // Delete document
    await DocumentService.deleteDocument(documentId);
    
    return NextResponse.json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}
