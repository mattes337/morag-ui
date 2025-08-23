import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stageExecutionService } from '@/lib/services/stageExecutionService';
import { unifiedFileService } from '@/lib/services/unifiedFileService';
import { ProcessingStage } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/documents/[id]/stages
 * Get document's processing pipeline status and stage files
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: documentId } = params;
    const { searchParams } = new URL(request.url);
    const includeFiles = searchParams.get('includeFiles') === 'true';
    const includeExecutions = searchParams.get('includeExecutions') === 'true';

    // Get pipeline status
    const pipelineStatus = await stageExecutionService.getDocumentPipelineStatus(documentId);
    
    // Get execution statistics
    const executionStats = await stageExecutionService.getDocumentExecutionStats(documentId);

    const response: any = {
      documentId,
      pipelineStatus,
      executionStats,
    };

    // Include stage files if requested
    if (includeFiles) {
      response.stageFiles = await unifiedFileService.getFilesByDocument(documentId, 'STAGE_OUTPUT');
    }

    // Include execution history if requested
    if (includeExecutions) {
      response.executions = await stageExecutionService.getDocumentExecutions(documentId);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching document stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document stages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/[id]/stages
 * Advance document to next stage or reset to specific stage
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: documentId } = params;
    const body = await request.json();
    const { action, stage } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required (advance, reset)' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'advance':
        result = await stageExecutionService.advanceToNextStage(documentId);
        if (!result) {
          return NextResponse.json(
            { error: 'No next stage available or document not ready to advance' },
            { status: 400 }
          );
        }
        break;

      case 'reset':
        if (!stage) {
          return NextResponse.json(
            { error: 'stage is required for reset action' },
            { status: 400 }
          );
        }

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

        await stageExecutionService.resetToStage(documentId, stage);
        result = stage;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "advance" or "reset"' },
          { status: 400 }
        );
    }

    // Get updated pipeline status
    const pipelineStatus = await stageExecutionService.getDocumentPipelineStatus(documentId);

    return NextResponse.json({
      message: `Document ${action} successful`,
      documentId,
      newStage: result,
      pipelineStatus,
    });
  } catch (error) {
    console.error('Error managing document stages:', error);
    return NextResponse.json(
      { error: 'Failed to manage document stages' },
      { status: 500 }
    );
  }
}