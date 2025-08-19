import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { stageExecutionService } from '@/lib/services/stageExecutionService';
import { ProcessingStage } from '@prisma/client';

/**
 * GET /api/stages
 * Get all running stage executions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const runningExecutions = await stageExecutionService.getRunningExecutions();

    return NextResponse.json({
      executions: runningExecutions,
      count: runningExecutions.length,
    });
  } catch (error) {
    console.error('Error fetching running executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch running executions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stages
 * Start a new stage execution
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, stage, inputFiles, metadata } = body;

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

    const execution = await stageExecutionService.startExecution({
      documentId,
      stage,
      inputFiles,
      metadata,
    });

    return NextResponse.json(execution, { status: 201 });
  } catch (error) {
    console.error('Error starting stage execution:', error);
    return NextResponse.json(
      { error: 'Failed to start stage execution' },
      { status: 500 }
    );
  }
}