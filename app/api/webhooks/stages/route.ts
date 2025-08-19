import { NextRequest, NextResponse } from 'next/server';
import { stageExecutionService } from '../../../../lib/services/stageExecutionService';
import { backgroundJobService } from '../../../../lib/services/backgroundJobService';
import { stageFileService } from '../../../../lib/services/stageFileService';
import { StageStatus, ProcessingStage } from '@prisma/client';

export interface StageWebhookPayload {
  task_id: string;
  document_id: string;
  execution_id?: string;
  job_id?: string;
  stage: ProcessingStage;
  timestamp: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  progress: {
    percentage: number;
    current_step: string;
    total_steps: number;
    step_details?: Record<string, any>;
  };
  result?: {
    files?: Array<{
      filename: string;
      content?: string;
      filepath?: string;
      contentType: string;
      filesize: number;
      metadata?: Record<string, any>;
    }>;
    metadata?: Record<string, any>;
    processing_time_ms?: number;
  };
  error?: {
    code: string;
    message: string;
    step: string;
    details?: Record<string, any>;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authentication
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedToken = process.env.WEBHOOK_AUTH_TOKEN || 'default-token';
    
    if (authToken !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload: StageWebhookPayload = await request.json();
    
    // Validate webhook payload
    if (!payload.task_id || !payload.document_id || !payload.stage) {
      return NextResponse.json(
        { error: 'Invalid webhook payload: missing required fields' },
        { status: 400 }
      );
    }

    console.log(`Received stage webhook for document ${payload.document_id}, stage ${payload.stage}, status ${payload.status}`);

    // Handle different webhook statuses
    switch (payload.status) {
      case 'started':
        await handleStageStarted(payload);
        break;
      case 'in_progress':
        await handleStageProgress(payload);
        break;
      case 'completed':
        await handleStageCompleted(payload);
        break;
      case 'failed':
        await handleStageFailed(payload);
        break;
      default:
        console.warn(`Unknown webhook status: ${payload.status}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Stage webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleStageStarted(payload: StageWebhookPayload): Promise<void> {
  // Update stage execution status to running
  if (payload.execution_id) {
    await stageExecutionService.updateExecution(payload.execution_id, {
      status: StageStatus.RUNNING,
    });
  }

  console.log(`Stage ${payload.stage} started for document ${payload.document_id}`);
}

async function handleStageProgress(payload: StageWebhookPayload): Promise<void> {
  // Update stage execution with progress information
  if (payload.execution_id) {
    await stageExecutionService.updateExecution(payload.execution_id, {
      status: StageStatus.RUNNING,
      metadata: {
        progress: payload.progress,
        lastUpdate: new Date().toISOString(),
      },
    });
  }

  console.log(`Stage ${payload.stage} progress for document ${payload.document_id}: ${payload.progress.percentage}%`);
}

async function handleStageCompleted(payload: StageWebhookPayload): Promise<void> {
  try {
    // Store result files if provided
    const outputFiles: string[] = [];
    
    if (payload.result?.files) {
      for (const file of payload.result.files) {
        const stageFile = await stageFileService.createStageFile({
          documentId: payload.document_id,
          stage: payload.stage,
          filename: file.filename,
          filepath: file.filepath || file.filename,
          filesize: file.filesize,
          contentType: file.contentType,
          content: file.content,
          metadata: file.metadata,
        });
        
        outputFiles.push(stageFile.filename);
      }
    }

    // Update stage execution as completed
    if (payload.execution_id) {
      await stageExecutionService.completeExecution(
        payload.execution_id,
        outputFiles,
        {
          ...payload.result?.metadata,
          processing_time_ms: payload.result?.processing_time_ms,
          completed_at: new Date().toISOString(),
        }
      );
    }

    // Mark the background job as completed
    if (payload.job_id) {
      await backgroundJobService.completeJob(payload.job_id, {
        files: outputFiles,
        processing_time_ms: payload.result?.processing_time_ms,
        completed_at: new Date().toISOString(),
      });
    }

    console.log(`Stage ${payload.stage} completed for document ${payload.document_id}`);
  } catch (error) {
    console.error(`Error handling stage completion:`, error);
    throw error;
  }
}

async function handleStageFailed(payload: StageWebhookPayload): Promise<void> {
  const errorMessage = payload.error?.message || 'Stage processing failed';
  
  try {
    // Update stage execution as failed
    if (payload.execution_id) {
      await stageExecutionService.failExecution(
        payload.execution_id,
        errorMessage,
        {
          error_code: payload.error?.code,
          error_step: payload.error?.step,
          error_details: payload.error?.details,
          failed_at: new Date().toISOString(),
        }
      );
    }

    // Mark the background job as failed (will handle retries)
    if (payload.job_id) {
      await backgroundJobService.failJob(payload.job_id, errorMessage);
    }

    console.error(`Stage ${payload.stage} failed for document ${payload.document_id}: ${errorMessage}`);
  } catch (error) {
    console.error(`Error handling stage failure:`, error);
    throw error;
  }
}

// GET endpoint for webhook verification/health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    endpoint: 'stages-webhook',
    timestamp: new Date().toISOString()
  });
}