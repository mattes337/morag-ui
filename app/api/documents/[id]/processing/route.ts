import { NextRequest, NextResponse } from 'next/server';
import { jobScheduler } from '../../../../../lib/services/jobs';
import { getAuthUser } from '../../../../../lib/auth';
import { PrismaClient, ProcessingMode } from '@prisma/client';
import { DocumentProcessingService } from '../../../../../lib/services/documentProcessingService';

const prisma = new PrismaClient();

/**
 * GET /api/documents/[id]/processing
 * Get document processing status and jobs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const documentId = params.id;
    if (!documentId || documentId === 'undefined' || documentId === 'null') {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    // Get comprehensive processing status including executions
    const processingStatus = await DocumentProcessingService.getProcessingStatus(documentId);

    // Get jobs for this document
    const jobs = await prisma.processingJob.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      processing: processingStatus,
      jobs
    });
  } catch (error) {
    console.error('Error getting document processing status:', error);
    return NextResponse.json(
      { error: 'Failed to get processing status' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/documents/[id]/processing
 * Update document processing mode or control processing
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const documentId = params.id;
    if (!documentId || documentId === 'undefined' || documentId === 'null') {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    const body = await request.json();
    const { processingMode, action, stage, priority } = body;

    // Verify document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    let result: any = {};

    // Handle processing mode change
    if (processingMode && ['MANUAL', 'AUTOMATIC'].includes(processingMode)) {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingMode: processingMode as ProcessingMode
        }
      });

      if (processingMode === 'AUTOMATIC') {
        // For automatic mode, schedule a job if needed
        await jobScheduler.scheduleJobForDocument(documentId, 'MARKDOWN_CONVERSION' as any);
        result.message = 'Document processing mode set to AUTOMATIC and processing scheduled';
      } else {
        // For manual mode, we don't need to pause anything - just update the mode
        result.message = 'Document processing mode set to MANUAL';
      }

      result.processingMode = processingMode;
    }

    // Handle processing actions
    if (action) {
      switch (action) {
        case 'pause':
          // Cancel pending jobs for this document
          const pausedCount = await prisma.processingJob.updateMany({
            where: {
              documentId,
              status: 'PENDING'
            },
            data: { status: 'CANCELLED' }
          });
          result.message = `Document processing paused - cancelled ${pausedCount.count} pending jobs`;
          break;
        case 'resume':
          // Schedule a new job if document is in automatic mode
          await jobScheduler.scheduleJobForDocument(documentId, 'MARKDOWN_CONVERSION' as any);
          result.message = 'Document processing resumed';
          break;
        case 'cancel':
          const cancelledCount = await prisma.processingJob.updateMany({
            where: {
              documentId,
              status: { in: ['PENDING', 'PROCESSING'] }
            },
            data: { status: 'CANCELLED' }
          });
          result.message = `Cancelled ${cancelledCount.count} jobs`;
          result.cancelledJobs = cancelledCount.count;
          break;
        case 'schedule':
          if (!stage) {
            return NextResponse.json(
              { error: 'Stage is required for schedule action' },
              { status: 400 }
            );
          }
          const jobId = await jobScheduler.scheduleJobForDocument(
            documentId,
            stage as any,
            { priority: priority || 0 }
          );
          result.message = `Scheduled job for stage ${stage}`;
          result.jobId = jobId;
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid action. Must be one of: pause, resume, cancel, schedule' },
            { status: 400 }
          );
      }
    }

    // Get updated document status
    const updatedDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        processingJobs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    return NextResponse.json({
      success: true,
      ...result,
      document: {
        id: updatedDocument?.id,
        processingMode: updatedDocument?.processingMode,
        currentStage: updatedDocument?.currentStage,
        stageStatus: updatedDocument?.stageStatus,
        isProcessingPaused: updatedDocument?.isProcessingPaused
      },
      recentJobs: updatedDocument?.processingJobs
    });
  } catch (error) {
    console.error('Error updating document processing:', error);
    return NextResponse.json(
      { error: 'Failed to update document processing' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/[id]/processing
 * Execute a specific stage for the document
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const documentId = params.id;
    if (!documentId || documentId === 'undefined' || documentId === 'null') {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    const body = await request.json();
    const { stage, priority = 0, scheduledAt } = body;

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage is required' },
        { status: 400 }
      );
    }

    // Verify document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Schedule the job
    const jobId = await jobScheduler.scheduleJobForDocument(
      documentId,
      stage as any,
      {
        priority,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
      }
    );

    return NextResponse.json({
      success: true,
      message: `Scheduled ${stage} stage for document`,
      jobId,
      documentId,
      stage,
      priority,
      scheduledAt: scheduledAt || new Date().toISOString()
    });
  } catch (error) {
    console.error('Error scheduling document processing:', error);
    return NextResponse.json(
      { error: 'Failed to schedule document processing' },
      { status: 500 }
    );
  }
}