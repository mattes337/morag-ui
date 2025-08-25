import { NextRequest, NextResponse } from 'next/server';
import { stageExecutionService } from '../../../../lib/services/stageExecutionService';
import { backgroundJobService } from '../../../../lib/services/backgroundJobService';
import { unifiedFileService } from '../../../../lib/services/unifiedFileService';
import { prisma } from '../../../../lib/database';

// Stage-based webhook payload as defined in WEBHOOK_GUIDE.md
export interface StageCompletedWebhookPayload {
  event: "stage_completed";
  timestamp: string;
  stage: {
    type: number;
    status: string;
    execution_time: number;
    start_time: string;
    end_time: string;
    error_message?: string;
  };
  files: {
    input_files: string[];
    output_files: string[];
  };
  context: {
    source_path: string;
    output_dir: string;
    total_stages_completed: number;
    total_stages_failed: number;
  };
  metadata: {
    config_used: Record<string, any>;
    metrics: Record<string, any>;
    warnings: string[];
  };
}

export interface PipelineCompletedWebhookPayload {
  event: "pipeline_completed";
  timestamp: string;
  pipeline: {
    success: boolean;
    error_message?: string;
    total_execution_time: number;
    stages_completed: number;
    stages_failed: number;
    stages_skipped: number;
  };
  context: {
    source_path: string;
    output_dir: string;
    intermediate_files: string[];
  };
  stages: Array<{
    type: number;
    status: string;
    execution_time: number;
    output_files: string[];
    error_message?: string;
  }>;
}

export type StageWebhookPayload = StageCompletedWebhookPayload | PipelineCompletedWebhookPayload;

export async function POST(request: NextRequest) {
  try {
    const payload: StageWebhookPayload = await request.json();

    // Validate webhook payload based on event type
    if (!payload.event || !payload.timestamp) {
      return NextResponse.json(
        { error: 'Invalid webhook payload: missing required fields (event, timestamp)' },
        { status: 400 }
      );
    }

    // Validate event type
    if (!['stage_completed', 'pipeline_completed'].includes(payload.event)) {
      return NextResponse.json(
        { error: 'Invalid event type: must be stage_completed or pipeline_completed' },
        { status: 400 }
      );
    }

    console.log(`✅ [Stage Webhook] Received ${payload.event} event at ${payload.timestamp}`);

    // Handle different webhook events
    switch (payload.event) {
      case 'stage_completed':
        await handleStageCompleted(payload as StageCompletedWebhookPayload);
        break;
      case 'pipeline_completed':
        await handlePipelineCompleted(payload as PipelineCompletedWebhookPayload);
        break;
      default:
        console.warn(`Unknown webhook event: ${(payload as any).event}`);
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

async function handleStageCompleted(payload: StageCompletedWebhookPayload): Promise<void> {
  try {
    const stageType = payload.stage.type;
    const stageStatus = payload.stage.status;
    const executionTime = payload.stage.execution_time;

    console.log(`Stage ${stageType} ${stageStatus} in ${executionTime}s`);

    // Process output files if available
    if (payload.files.output_files && payload.files.output_files.length > 0) {
      console.log(`Stage ${stageType} produced ${payload.files.output_files.length} output files:`);
      for (const filePath of payload.files.output_files) {
        console.log(`  - ${filePath}`);
        // TODO: Download and store files if needed
      }
    }

    // Log metrics if available
    if (payload.metadata.metrics) {
      console.log(`Stage ${stageType} metrics:`, payload.metadata.metrics);
    }

    // Log warnings if any
    if (payload.metadata.warnings && payload.metadata.warnings.length > 0) {
      console.warn(`Stage ${stageType} warnings:`, payload.metadata.warnings);
    }

    // Handle stage failure
    if (stageStatus === 'failed' && payload.stage.error_message) {
      console.error(`Stage ${stageType} failed: ${payload.stage.error_message}`);
      // TODO: Update document/job status to failed
      return;
    }

    // TODO: Update document processing status based on stage completion
    // This would involve finding the document by source_path or other identifier
    // and updating its processing stage status

  } catch (error) {
    console.error(`Error handling stage completion:`, error);
    throw error;
  }
}

async function handlePipelineCompleted(payload: PipelineCompletedWebhookPayload): Promise<void> {
  try {
    const success = payload.pipeline.success;
    const totalTime = payload.pipeline.total_execution_time;
    const stagesCompleted = payload.pipeline.stages_completed;
    const stagesFailed = payload.pipeline.stages_failed;

    console.log(`Pipeline completed: ${success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Total execution time: ${totalTime}s`);
    console.log(`Stages completed: ${stagesCompleted}, failed: ${stagesFailed}`);

    if (success) {
      // Process all stage results
      console.log('Processing stage results:');
      for (const stage of payload.stages) {
        console.log(`  Stage ${stage.type}: ${stage.status} (${stage.execution_time}s)`);
        if (stage.output_files && stage.output_files.length > 0) {
          console.log(`    Output files: ${stage.output_files.join(', ')}`);
        }
        if (stage.error_message) {
          console.log(`    Error: ${stage.error_message}`);
        }
      }

      // TODO: Update document status to completed/ingested
      // This would involve finding the document by source_path and updating its state

    } else {
      const errorMessage = payload.pipeline.error_message || 'Pipeline processing failed';
      console.error(`Pipeline failed: ${errorMessage}`);

      // TODO: Update document status to failed
      // This would involve finding the document by source_path and updating its state
    }

    // Log intermediate files
    if (payload.context.intermediate_files && payload.context.intermediate_files.length > 0) {
      console.log('Intermediate files:', payload.context.intermediate_files);
    }

  } catch (error) {
    console.error(`Error handling pipeline completion:`, error);
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