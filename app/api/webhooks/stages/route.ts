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
    const payload: any = await request.json();

    // Extract query parameters for document and execution identification
    const url = new URL(request.url);
    const documentId = url.searchParams.get('documentId');
    const executionId = url.searchParams.get('executionId');
    const stage = url.searchParams.get('stage');

    console.log(`📥 [Stage Webhook] Received webhook for document ${documentId}, execution ${executionId}, stage ${stage}`);
    console.log('🔍 [Stage Webhook] Received payload:', JSON.stringify(payload, null, 2));

    // Validate webhook payload based on event type
    if (!payload.event || !payload.timestamp) {
      console.error('❌ [Stage Webhook] Invalid payload structure:', {
        hasEvent: !!payload.event,
        hasTimestamp: !!payload.timestamp,
        payload: payload
      });
      return NextResponse.json(
        { error: 'Invalid webhook payload: missing required fields (event, timestamp)' },
        { status: 400 }
      );
    }

    // Validate event type
    if (!['stage_completed', 'pipeline_completed'].includes(payload.event)) {
      console.error('❌ [Stage Webhook] Invalid event type:', payload.event);
      return NextResponse.json(
        { error: 'Invalid event type: must be stage_completed or pipeline_completed' },
        { status: 400 }
      );
    }

    console.log(`✅ [Stage Webhook] Received ${payload.event} event at ${payload.timestamp}`);

    // Handle different webhook events
    switch (payload.event) {
      case 'stage_completed':
        await handleStageCompleted(payload, documentId, executionId, stage);
        break;
      case 'pipeline_completed':
        await handlePipelineCompleted(payload);
        break;
      default:
        console.warn(`Unknown webhook event: ${payload.event}`);
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

async function handleStageCompleted(payload: any, documentId: string | null, executionId: string | null, stage: string | null): Promise<void> {
  try {
    const stageType = payload.stage?.type || 'unknown';
    const stageStatus = payload.stage?.status || 'unknown';
    const executionTime = payload.stage?.execution_time || 0;

    console.log(`✅ [Stage Webhook] Stage ${stageType} ${stageStatus} in ${executionTime}s`);

    // Use the provided parameters if available, otherwise fall back to parsing
    if (!documentId || !executionId || !stage) {
      console.warn(`⚠️ [Stage Webhook] Missing query parameters, attempting to parse from payload`);

      // Map stage type number to ProcessingStage enum
      const stageMapping: Record<number, string> = {
        1: 'MARKDOWN_CONVERSION',
        2: 'MARKDOWN_OPTIMIZER',
        3: 'CHUNKER',
        4: 'FACT_GENERATOR',
        5: 'INGESTOR'
      };

      const processingStage = stageMapping[stageType];
      if (!processingStage) {
        console.error(`❌ [Stage Webhook] Unknown stage type: ${stageType}`);
        return;
      }

      // Find document by source_path from context
      const sourcePath = payload.context?.source_path;
      if (!sourcePath) {
        console.error(`❌ [Stage Webhook] No source_path in context and no documentId provided`);
        return;
      }

      // Extract document ID from source path (assuming it contains the document ID)
      // The source path might be like "/tmp/morag/documents/{documentId}/input.pdf"
      const documentIdMatch = sourcePath.match(/\/([a-f0-9-]{36})\//);
      documentId = documentIdMatch?.[1] || null;

      // If we can't extract from path, try to find by filename
      if (!documentId) {
        // Try to find document by looking for a document with matching name
        const filename = sourcePath.split('/').pop();
        if (filename) {
          const document = await prisma.document.findFirst({
            where: {
              name: {
                contains: filename.replace(/\.[^/.]+$/, '') // Remove extension
              }
            },
            orderBy: { createdAt: 'desc' } // Get most recent
          });
          documentId = document?.id || null;
        }
      }

      if (!documentId) {
        console.error(`❌ [Stage Webhook] Could not determine document ID from source_path: ${sourcePath}`);
        return;
      }

      stage = processingStage;
    }

    console.log(`📄 [Stage Webhook] Processing stage ${stage} for document ${documentId}`);

    // Handle stage failure
    if (stageStatus === 'failed') {
      const errorMessage = payload.stage?.error_message || 'Stage processing failed';
      console.error(`❌ [Stage Webhook] Stage ${stage} failed: ${errorMessage}`);

      // Update stage execution status using provided executionId or find latest
      let execution;
      if (executionId) {
        execution = await stageExecutionService.getExecution(executionId);
      } else {
        execution = await stageExecutionService.getLatestExecution(documentId, stage as any);
      }

      if (execution) {
        await stageExecutionService.failExecution(execution.id, errorMessage);
      }

      // Update document status
      await prisma.document.update({
        where: { id: documentId },
        data: {
          stageStatus: 'FAILED',
          lastStageError: errorMessage,
        },
      });
      return;
    }

    // Handle successful completion
    if (stageStatus === 'completed') {
      // Get the execution using provided executionId or find latest
      let execution;
      if (executionId) {
        execution = await stageExecutionService.getExecution(executionId);
      } else {
        execution = await stageExecutionService.getLatestExecution(documentId, stage as any);
      }

      if (!execution) {
        console.error(`❌ [Stage Webhook] No execution found for document ${documentId}, stage ${stage}, executionId ${executionId}`);
        return;
      }

      // Process output files if available
      const outputFiles: string[] = [];
      if (payload.files?.output_files && payload.files.output_files.length > 0) {
        console.log(`📁 [Stage Webhook] Stage ${stage} produced ${payload.files.output_files.length} output files:`);
        for (const filePath of payload.files.output_files) {
          console.log(`  - ${filePath}`);
          outputFiles.push(filePath);
        }
      }

      // Complete the stage execution
      await stageExecutionService.completeExecution(
        execution.id,
        outputFiles,
        {
          executionTime,
          metrics: payload.metadata?.metrics,
          warnings: payload.metadata?.warnings,
          stageWebhookCompletion: true
        }
      );

      // For markdown conversion stage, try to download and store the markdown content
      if (stage === 'MARKDOWN_CONVERSION' && outputFiles.length > 0) {
        try {
          // Find the markdown output file
          const markdownFile = outputFiles.find(file => file.endsWith('.md'));
          if (markdownFile) {
            console.log(`📝 [Stage Webhook] Attempting to download markdown file: ${markdownFile}`);

            // Try to download the file content from MoRAG backend
            const markdownContent = await downloadFileFromMorag(markdownFile);
            if (markdownContent) {
              // Update document with markdown content
              await prisma.document.update({
                where: { id: documentId },
                data: {
                  markdown: markdownContent,
                  stageStatus: 'COMPLETED',
                  lastStageError: null,
                },
              });
              console.log(`✅ [Stage Webhook] Updated document ${documentId} with markdown content (${markdownContent.length} chars)`);
            } else {
              console.warn(`⚠️ [Stage Webhook] Could not download markdown file, updating status only`);
              // Still mark as completed even if file download failed
              await prisma.document.update({
                where: { id: documentId },
                data: {
                  stageStatus: 'COMPLETED',
                  lastStageError: null,
                },
              });
            }
          } else {
            console.warn(`⚠️ [Stage Webhook] No markdown file found in output files for conversion stage`);
            // Still mark as completed
            await prisma.document.update({
              where: { id: documentId },
              data: {
                stageStatus: 'COMPLETED',
                lastStageError: null,
              },
            });
          }
        } catch (error) {
          console.error(`❌ [Stage Webhook] Failed to download markdown file:`, error);
          // Still mark as completed, don't fail the whole process
          await prisma.document.update({
            where: { id: documentId },
            data: {
              stageStatus: 'COMPLETED',
              lastStageError: null,
            },
          });
        }
      } else {
        // For other stages, just update the status
        await prisma.document.update({
          where: { id: documentId },
          data: {
            stageStatus: 'COMPLETED',
            lastStageError: null,
          },
        });
      }

      console.log(`✅ [Stage Webhook] Stage ${stage} completed successfully for document ${documentId}`);
    }

    // Log metrics if available
    if (payload.metadata?.metrics) {
      console.log(`📊 [Stage Webhook] Stage ${stage} metrics:`, payload.metadata.metrics);
    }

    // Log warnings if any
    if (payload.metadata?.warnings && payload.metadata.warnings.length > 0) {
      console.warn(`⚠️ [Stage Webhook] Stage ${stage} warnings:`, payload.metadata.warnings);
    }

  } catch (error) {
    console.error(`❌ [Stage Webhook] Error handling stage completion:`, error);
    throw error;
  }
}

async function handlePipelineCompleted(payload: any): Promise<void> {
  try {
    const success = payload.pipeline?.success || false;
    const totalTime = payload.pipeline?.total_execution_time || 0;
    const stagesCompleted = payload.pipeline?.stages_completed || 0;
    const stagesFailed = payload.pipeline?.stages_failed || 0;

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
      const errorMessage = payload.pipeline?.error_message || 'Pipeline processing failed';
      console.error(`Pipeline failed: ${errorMessage}`);

      // TODO: Update document status to failed
      // This would involve finding the document by source_path and updating its state
    }

    // Log intermediate files
    if (payload.context?.intermediate_files && payload.context.intermediate_files.length > 0) {
      console.log('Intermediate files:', payload.context.intermediate_files);
    }

  } catch (error) {
    console.error(`Error handling pipeline completion:`, error);
    throw error;
  }
}

/**
 * Download a file from MoRAG backend
 * Note: This assumes MoRAG provides a file download endpoint. If not available,
 * the conversion stage should include the content in the webhook payload.
 */
async function downloadFileFromMorag(filePath: string): Promise<string | null> {
  try {
    const moragBaseUrl = process.env.MORAG_API_URL || 'http://localhost:8000';
    const moragApiKey = process.env.MORAG_API_KEY;

    // Try multiple possible download endpoints
    const possibleEndpoints = [
      `${moragBaseUrl}/api/v1/files/download?path=${encodeURIComponent(filePath)}`,
      `${moragBaseUrl}/api/v1/download?file=${encodeURIComponent(filePath)}`,
      `${moragBaseUrl}/download?path=${encodeURIComponent(filePath)}`,
    ];

    for (const downloadUrl of possibleEndpoints) {
      try {
        console.log(`🔽 [Stage Webhook] Trying download from: ${downloadUrl}`);

        const headers: Record<string, string> = {
          'Accept': 'text/plain, text/markdown, application/octet-stream',
        };

        if (moragApiKey) {
          headers['Authorization'] = `Bearer ${moragApiKey}`;
        }

        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const content = await response.text();
          console.log(`✅ [Stage Webhook] Downloaded file content (${content.length} chars) from ${downloadUrl}`);
          return content;
        } else {
          console.warn(`⚠️ [Stage Webhook] Download failed from ${downloadUrl}: ${response.status} ${response.statusText}`);
        }
      } catch (endpointError) {
        console.warn(`⚠️ [Stage Webhook] Error trying endpoint ${downloadUrl}:`, endpointError);
      }
    }

    console.error(`❌ [Stage Webhook] All download endpoints failed for file: ${filePath}`);
    return null;

  } catch (error) {
    console.error(`❌ [Stage Webhook] Error downloading file from MoRAG:`, error);
    return null;
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