import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { backgroundJobService } from '@/lib/services/backgroundJobService';
import { ProcessingStage } from '@prisma/client';

/**
 * POST /api/stages/markdown-conversion/execute
 * Execute markdown conversion stage
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, options } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 [API] Creating background job for markdown conversion, document: ${documentId}`);

    // Create a background job for markdown conversion
    const job = await backgroundJobService.createJob({
      documentId,
      stage: ProcessingStage.MARKDOWN_CONVERSION,
      priority: options?.priority || 5,
      metadata: {
        options,
        userId: user.userId,
        triggeredBy: 'manual_ui'
      }
    });

    console.log(`✅ [API] Background job created: ${job.id}`);

    return NextResponse.json({
      success: true,
      message: 'Markdown conversion job created successfully',
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
    console.error('❌ [API] Error creating markdown conversion job:', error);
    return NextResponse.json(
      { error: 'Failed to create markdown conversion job' },
      { status: 500 }
    );
  }
}