import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/middleware/apiKeyAuth';
import { DocumentService } from '@/lib/services/documentService';
import { DocumentProcessingService } from '@/lib/services/documentProcessingService';

/**
 * POST /api/v1/documents/[id]/process/actions
 * Perform processing actions (pause, resume, retry, cancel)
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
    
    const { action, stage } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
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
    
    let result;
    
    switch (action) {
      case 'pause':
        result = await DocumentProcessingService.pauseProcessing(documentId);
        break;
        
      case 'resume':
        result = await DocumentProcessingService.resumeProcessing(documentId);
        break;
        
      case 'retry':
        result = await DocumentProcessingService.retryProcessing(documentId, stage);
        break;
        
      case 'pipeline':
        // Start full processing pipeline
        result = await DocumentProcessingService.processDocumentPipeline(
          documentId,
          body.mode || 'AUTOMATIC'
        );
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: result.message,
      documentId,
      action,
      jobIds: result.jobIds,
      success: true
    });
  } catch (error) {
    console.error('Error performing processing action:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform processing action' },
      { status: 500 }
    );
  }
}
