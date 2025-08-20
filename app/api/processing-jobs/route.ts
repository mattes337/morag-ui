import { NextRequest, NextResponse } from 'next/server';
import { backgroundJobService } from '../../../lib/services/backgroundJobService';

import { requireAuth } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/processing-jobs
 * Get processing jobs with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    if (documentId) where.documentId = documentId;
    if (status) where.status = status;
    if (stage) where.stage = stage;

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
      }
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
    const user = await requireAuth(request);

    const body = await request.json();
    const { documentId, stage, priority = 0, scheduledAt } = body;

    if (!documentId || !stage) {
      return NextResponse.json(
        { error: 'Document ID and stage are required' },
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

    // Validate stage
    const validStages = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${validStages.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the job
    const job = await backgroundJobService.createJob({
      documentId,
      stage,
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Processing job created successfully',
      job
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating processing job:', error);
    return NextResponse.json(
      { error: 'Failed to create processing job' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/processing-jobs
 * Cancel multiple processing jobs
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);

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