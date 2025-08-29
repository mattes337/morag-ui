import { NextRequest, NextResponse } from 'next/server';
import { requireUnifiedAuth } from '../../../../../lib/middleware/unifiedAuth';
import { DocumentService } from '../../../../../lib/services/documentService';
import { stageExecutionService } from '../../../../../lib/services/stageExecutionService';
import { unifiedFileService } from '../../../../../lib/services/unifiedFileService';
// Removed backgroundJobService import - using dynamic import where needed

/**
 * GET /api/documents/[id]/complete
 * 
 * Returns complete document data including:
 * - Document details with current processing state
 * - Files list
 * - Stage pipeline status
 * - Processing status
 * 
 * This eliminates the need for multiple API calls and prevents flickering.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireUnifiedAuth(request);

    const { id: documentId } = params;

    // Get document with access check
    const document = await DocumentService.getDocumentByIdWithAccess(
      documentId,
      auth.isGenericApiKey ? undefined : auth.realm?.id
    );

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get all related data in parallel
    const [files, pipelineStatus, executionStats] = await Promise.allSettled([
      unifiedFileService.getFilesByDocument(documentId),
      stageExecutionService.getDocumentPipelineStatus(documentId),
      stageExecutionService.getDocumentExecutionStats(documentId)
    ]);

    // Process results
    const filesData = files.status === 'fulfilled' ? files.value : [];
    const pipelineData = pipelineStatus.status === 'fulfilled' ? pipelineStatus.value : null;
    const statsData = executionStats.status === 'fulfilled' ? executionStats.value : null;

    // Check if there are any active processing jobs
    const { prisma } = await import('../../../../../lib/database');
    const activeJobs = await prisma.processingJob.findMany({
      where: {
        documentId,
        status: {
          in: ['PENDING', 'PROCESSING', 'WAITING_FOR_REMOTE_WORKER']
        }
      }
    });

    const response = {
      document: {
        ...document,
        // Ensure processing state fields are included
        currentStage: document.currentStage,
        stageStatus: document.stageStatus,
        lastStageError: document.lastStageError,
        processingMode: document.processingMode,
        isProcessingPaused: document.isProcessingPaused,
        nextScheduledStage: document.nextScheduledStage,
        scheduledAt: document.scheduledAt
      },
      files: filesData,
      pipelineStatus: pipelineData,
      executionStats: statsData,
      isProcessing: activeJobs.length > 0,
      activeJobs: activeJobs.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching complete document data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
