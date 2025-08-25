import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/middleware/apiKeyAuth';
import { DocumentService } from '@/lib/services/documentService';
import { DocumentProcessingService } from '@/lib/services/documentProcessingService';

/**
 * POST /api/v1/documents/[id]/process
 * Trigger document processing
 */
export async function POST(
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
    const document = await DocumentService.getDocumentById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    if (document.realmId !== auth.realm!.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const { stage, stages, mode, priority, force, action } = body;
    
    // Use the new DocumentProcessingService
    const result = await DocumentProcessingService.startProcessing({
      documentId,
      stage: stage as any,
      stages: stages as any,
      mode: mode as any,
      priority: priority || 0,
      force: force || false,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: result.message,
      documentId,
      jobIds: result.jobIds,
      status: 'started'
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process document' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

/**
 * GET /api/v1/documents/[id]/process
 * Get processing status
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
    
    // Check if document exists and belongs to realm
    const document = await DocumentService.getDocumentById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    if (document.realmId !== auth.realm!.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Get processing status using the new service
    const processingStatus = await DocumentProcessingService.getProcessingStatus(documentId);

    return NextResponse.json({
      processing: processingStatus
    });
  } catch (error) {
    console.error('Error fetching processing status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch processing status' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}
