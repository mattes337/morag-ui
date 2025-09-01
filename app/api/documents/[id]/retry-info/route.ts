import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { DocumentProcessingService } from '@/lib/services/documentProcessingService';
import { ProcessingStage } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/documents/[id]/retry-info
 * Get retry information for a specific stage of a document
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: documentId } = params;
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') as ProcessingStage;

    if (!stage) {
      return NextResponse.json(
        { error: 'stage parameter is required' },
        { status: 400 }
      );
    }

    // Validate stage
    const validStages: ProcessingStage[] = [
      'MARKDOWN_CONVERSION',
      'MARKDOWN_OPTIMIZER', 
      'CHUNKER',
      'FACT_GENERATOR',
      'INGESTOR',
    ];

    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: 'Invalid stage' },
        { status: 400 }
      );
    }

    // Get retry count and check if stage can be retried
    const retryCount = await DocumentProcessingService.getStageRetryCount(documentId, stage);
    const canRetry = await DocumentProcessingService.canRetryStage(documentId, stage);

    return NextResponse.json({
      documentId,
      stage,
      retryCount,
      canRetry,
      maxRetries: 3
    });
  } catch (error) {
    console.error('Error fetching retry info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retry information' },
      { status: 500 }
    );
  }
}
