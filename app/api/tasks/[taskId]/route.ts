import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';
import { JobService } from '../../../../lib/services/jobService';
import { moragService } from '../../../../lib/services/moragService';

interface RouteParams {
  params: {
    taskId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = params;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Find the job associated with this task ID
    const job = await JobService.getJobByTaskId(taskId);
    if (!job) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this job
    if (job.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    try {
      // Get task status from MoRAG backend
      const taskStatus = await moragService.getTaskStatus(taskId);

      return NextResponse.json({
        taskId,
        jobId: job.id,
        documentId: job.documentId,
        status: taskStatus.status,
        progress: taskStatus.progress || job.percentage,
        message: taskStatus.message || job.summary,
        result: taskStatus.result,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      });

    } catch (error) {
      console.error('Failed to get task status:', error);
      
      // Return local job status if MoRAG backend is unavailable
      return NextResponse.json({
        taskId,
        jobId: job.id,
        documentId: job.documentId,
        status: job.status.toLowerCase(),
        progress: job.percentage,
        message: job.summary,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        note: 'Status retrieved from local database (MoRAG backend unavailable)',
      });
    }

  } catch (error) {
    console.error('Task status endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = params;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Find the job associated with this task ID
    const job = await JobService.getJobByTaskId(taskId);
    if (!job) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this job
    if (job.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    try {
      // Cancel task in MoRAG backend
      const result = await moragService.cancelTask(taskId);

      // Update local job status
      await JobService.updateJob(job.id, {
        status: 'CANCELLED' as any,
        summary: 'Task cancelled by user',
        endDate: new Date(),
      });

      return NextResponse.json({
        taskId,
        jobId: job.id,
        status: 'cancelled',
        message: result.message || 'Task cancelled successfully',
      });

    } catch (error) {
      console.error('Failed to cancel task:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to cancel task',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Task cancellation endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}