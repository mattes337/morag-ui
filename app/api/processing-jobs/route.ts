import { NextRequest, NextResponse } from 'next/server';
import { backgroundJobService } from '../../../lib/services/backgroundJobService';
import { requireUnifiedAuth } from '../../../lib/middleware/unifiedAuth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createJobSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  stage: z.enum(['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR']),
  priority: z.number().int().min(0).max(10).default(0),
  scheduledAt: z.string().datetime().optional(),
});

/**
 * GET /api/processing-jobs
 * Get processing jobs with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUnifiedAuth(request);

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause with realm filtering
    const where: any = {};
    if (documentId) where.documentId = documentId;
    if (status) where.status = status;
    if (stage) where.stage = stage;

    // Filter by realm if not using generic API key
    if (!auth.isGenericApiKey && auth.realm) {
      where.document = {
        realmId: auth.realm.id
      };
    }

    // Get jobs with filtering
    const jobs = await prisma.processingJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100), // Cap at 100
      skip: offset,
      include: {
        document: {
          select: {
            id: true,
            name: true,
            type: true,
            state: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.processingJob.count({ where });

    // Get summary statistics
    const stats = {
      pending: await prisma.processingJob.count({ where: { status: 'PENDING' } }),
      processing: await prisma.processingJob.count({ where: { status: 'PROCESSING' } }),
      completed: await prisma.processingJob.count({ where: { status: 'FINISHED' } }),
      failed: await prisma.processingJob.count({ where: { status: 'FAILED' } })
    };

    return NextResponse.json({
      jobs,
      stats,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      authMethod: auth.authMethod,
      realm: auth.realm
    });
  } catch (error) {
    console.error('Error getting processing jobs:', error);
    return NextResponse.json(
      { error: 'Failed to get processing jobs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/processing-jobs
 * Create a new processing job
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUnifiedAuth(request);
    const body = await request.json();

    // Validate request body
    const validatedData = createJobSchema.parse(body);

    // Verify document exists and check access
    const whereClause: any = { id: validatedData.documentId };

    // If not using generic API key, filter by realm
    if (!auth.isGenericApiKey && auth.realm) {
      whereClause.realmId = auth.realm.id;
    }

    const document = await prisma.document.findUnique({
      where: whereClause,
      include: {
        realm: true
      }
    });

    if (!document) {
      return NextResponse.json({
        error: 'Document not found or access denied'
      }, { status: 404 });
    }

    // Create the job
    const job = await backgroundJobService.createJob({
      documentId: validatedData.documentId,
      stage: validatedData.stage,
      priority: validatedData.priority,
      scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Processing job created successfully',
      job,
      authMethod: auth.authMethod,
      realm: auth.realm
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating processing job:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create processing job' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/processing-jobs
 * Cancel multiple processing jobs
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireUnifiedAuth(request);

    const body = await request.json();
    const { jobIds, documentId } = body;

    let cancelledCount = 0;

    if (jobIds && Array.isArray(jobIds)) {
      // Cancel specific jobs
      for (const jobId of jobIds) {
        try {
          await backgroundJobService.cancelJob(jobId);
          cancelledCount++;
        } catch (error) {
          console.error(`Failed to cancel job ${jobId}:`, error);
        }
      }
    } else if (documentId) {
      // Cancel all pending jobs for a document
      const jobs = await prisma.processingJob.findMany({
        where: {
          documentId,
          status: 'PENDING'
        }
      });

      for (const job of jobs) {
        try {
          await backgroundJobService.cancelJob(job.id);
          cancelledCount++;
        } catch (error) {
          console.error(`Failed to cancel job ${job.id}:`, error);
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Either jobIds array or documentId must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cancelled ${cancelledCount} processing jobs`,
      cancelledCount
    });
  } catch (error) {
    console.error('Error cancelling processing jobs:', error);
    return NextResponse.json(
      { error: 'Failed to cancel processing jobs' },
      { status: 500 }
    );
  }
}