import { NextRequest, NextResponse } from 'next/server';
// Removed backgroundJobService - using direct Prisma calls
import { getAuthUser } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/processing-jobs/[id]
 * Get a specific processing job by ID
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

    const jobId = params.id;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Get job with document information
    const job = await prisma.processingJob.findUnique({
      where: { id: jobId },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            type: true,
            state: true,
            processingMode: true
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error getting processing job:', error);
    return NextResponse.json(
      { error: 'Failed to get processing job' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/processing-jobs/[id]
 * Update a processing job (retry, cancel, etc.)
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

    const jobId = params.id;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { action, priority, scheduledAt } = body;

    // Verify job exists
    const job = await prisma.processingJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    let result: any = { jobId };

    switch (action) {
      case 'cancel':
        await backgroundJobService.cancelJob(jobId);
        result.message = 'Job cancelled successfully';
        result.status = 'CANCELLED';
        break;

      case 'retry':
        // Create a new job with the same parameters
        const newJob = await backgroundJobService.createJob({
          documentId: job.documentId,
          stage: job.stage,
          priority: priority || job.priority,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date()
        });
        result.message = 'Job retry scheduled successfully';
        result.newJobId = newJob.id;
        break;

      case 'reschedule':
        if (!scheduledAt) {
          return NextResponse.json(
            { error: 'scheduledAt is required for reschedule action' },
            { status: 400 }
          );
        }
        
        await prisma.processingJob.update({
          where: { id: jobId },
          data: {
            scheduledAt: new Date(scheduledAt),
            priority: priority || job.priority
          }
        });
        result.message = 'Job rescheduled successfully';
        result.scheduledAt = scheduledAt;
        break;

      case 'update_priority':
        if (priority === undefined) {
          return NextResponse.json(
            { error: 'priority is required for update_priority action' },
            { status: 400 }
          );
        }
        
        await prisma.processingJob.update({
          where: { id: jobId },
          data: { priority }
        });
        result.message = 'Job priority updated successfully';
        result.priority = priority;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be one of: cancel, retry, reschedule, update_priority' },
          { status: 400 }
        );
    }

    // Get updated job
    const updatedJob = await prisma.processingJob.findUnique({
      where: { id: jobId },
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

    return NextResponse.json({
      success: true,
      ...result,
      job: updatedJob
    });
  } catch (error) {
    console.error('Error updating processing job:', error);
    return NextResponse.json(
      { error: 'Failed to update processing job' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/processing-jobs/[id]
 * Cancel a specific processing job
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const jobId = params.id;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Verify job exists
    const job = await prisma.processingJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Cancel the job
    await backgroundJobService.cancelJob(jobId);

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
      jobId
    });
  } catch (error) {
    console.error('Error cancelling processing job:', error);
    return NextResponse.json(
      { error: 'Failed to cancel processing job' },
      { status: 500 }
    );
  }
}