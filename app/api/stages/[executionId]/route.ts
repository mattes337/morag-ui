import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { stageExecutionService } from '@/lib/services/stageExecutionService';
import { StageStatus } from '@prisma/client';

interface RouteParams {
  params: {
    executionId: string;
  };
}

/**
 * GET /api/stages/[executionId]
 * Get stage execution details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { executionId } = params;
    const execution = await stageExecutionService.getExecution(executionId);

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(execution);
  } catch (error) {
    console.error('Error fetching execution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stages/[executionId]
 * Update stage execution status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { executionId } = params;
    const body = await request.json();
    const { status, errorMessage, outputFiles, metadata } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    const validStatuses: StageStatus[] = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updatedExecution = await stageExecutionService.updateExecution(executionId, {
      status,
      errorMessage,
      outputFiles,
      metadata,
    });

    if (!updatedExecution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedExecution);
  } catch (error) {
    console.error('Error updating execution:', error);
    return NextResponse.json(
      { error: 'Failed to update execution' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stages/[executionId]
 * Cancel/abort a running stage execution
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { executionId } = params;
    
    // Get current execution
    const execution = await stageExecutionService.getExecution(executionId);
    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    // Only allow cancellation of running or pending executions
    if (execution.status !== 'RUNNING' && execution.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot cancel execution with status: ${execution.status}` },
        { status: 400 }
      );
    }

    // Update execution to failed with cancellation message
    const cancelledExecution = await stageExecutionService.failExecution(
      executionId,
      'Execution cancelled by user',
      {
        cancelledBy: session.user.id,
        cancelledAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      message: 'Execution cancelled successfully',
      execution: cancelledExecution,
    });
  } catch (error) {
    console.error('Error cancelling execution:', error);
    return NextResponse.json(
      { error: 'Failed to cancel execution' },
      { status: 500 }
    );
  }
}