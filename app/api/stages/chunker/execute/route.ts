import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { backgroundJobService } from '@/lib/services/backgroundJobService';
import { ProcessingStage } from '@prisma/client';

/**
 * POST /api/stages/chunker/execute
 * Execute chunker stage
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, priority = 5, options = {} } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 [API] Creating background job for chunker, document: ${documentId}`);

    // Create a background job for chunker stage
    const job = await backgroundJobService.createJob({
      documentId,
      stage: ProcessingStage.CHUNKER,
      priority,
      metadata: {
        options,
        userId: user.userId,
        triggeredBy: 'chunker_api'
      }
    });

    console.log(`✅ [API] Background job created: ${job.id}`);

    return NextResponse.json({
      success: true,
      message: 'Chunker job created successfully',
      job: {
        id: job.id,
        documentId: job.documentId,
        stage: job.stage,
        status: job.status,
        priority: job.priority,
        scheduledAt: job.scheduledAt,
        createdAt: job.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [API] Error creating chunker job:', error);
    return NextResponse.json(
      { error: 'Failed to create chunker job' },
      { status: 500 }
    );
  }
}