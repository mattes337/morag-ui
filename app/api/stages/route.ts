import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { backgroundJobService } from '@/lib/services/backgroundJobService';
import { ProcessingStage, JobStatus } from '@prisma/client';

/**
 * GET /api/stages
 * Get all running background jobs
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const runningJobs = await backgroundJobService.getJobsByStatus(JobStatus.PROCESSING);

    return NextResponse.json({
      jobs: runningJobs,
      count: runningJobs.length,
    });
  } catch (error) {
    console.error('Error fetching running jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch running jobs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stages
 * Create a new background job for stage execution
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, stage, priority = 5, metadata = {} } = body;

    if (!documentId || !stage) {
      return NextResponse.json(
        { error: 'documentId and stage are required' },
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

    console.log(`🚀 [API] Creating background job for stage: ${stage}, document: ${documentId}`);

    // Create a background job for the stage
    const job = await backgroundJobService.createJob({
      documentId,
      stage,
      priority,
      metadata: {
        ...metadata,
        userId: user.userId,
        triggeredBy: 'api'
      }
    });

    console.log(`✅ [API] Background job created: ${job.id}`);

    return NextResponse.json({
      success: true,
      message: `${stage} job created successfully`,
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
    console.error('❌ [API] Error creating background job:', error);
    return NextResponse.json(
      { error: 'Failed to create background job' },
      { status: 500 }
    );
  }
}