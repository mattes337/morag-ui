import { NextRequest, NextResponse } from 'next/server';
import { stageExecutionService } from '../../../../lib/services/stageExecutionService';
// Removed backgroundJobService import - using dynamic import where needed
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

        // Download and store all output files for this stage
        await downloadAndStoreStageOutputFiles(documentId, stage, payload.files.output_files);
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

      // Update document status to completed
      await prisma.document.update({
        where: { id: documentId },
        data: {
          stageStatus: 'COMPLETED',
          lastStageError: null,
        },
      });

      console.log(`✅ [Stage Webhook] Stage ${stage} completed successfully for document ${documentId}`);

      // Check if this was a dependency resolution job and retry the original stage
      await checkAndRetryDependentStages(documentId, stage);
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
 * Download and store all output files for a completed stage
 */
async function downloadAndStoreStageOutputFiles(documentId: string, stage: string, outputFilePaths: string[]): Promise<void> {
  try {
    console.log(`📥 [Stage Webhook] Downloading and storing ${outputFilePaths.length} output files for stage ${stage}`);

    for (const filePath of outputFilePaths) {
      try {
        console.log(`🔽 [Stage Webhook] Downloading file: ${filePath}`);

        // Download file content from MoRAG backend
        const fileContent = await downloadFileFromMorag(filePath);

        if (fileContent) {
          // Extract filename from path
          const filename = filePath.split('/').pop() || filePath.split('\\').pop() || 'output_file';

          // Determine file type and processing stage
          const fileType = getFileTypeForStage();
          const processingStage = getProcessingStage(stage);

          // Store file in database and on disk
          const storedFile = await unifiedFileService.storeFile({
            documentId,
            fileType,
            stage: processingStage,
            filename,
            originalName: filename,
            content: Buffer.from(fileContent, 'utf-8'),
            contentType: getContentTypeFromFilename(filename),
            isPublic: false,
            accessLevel: 'REALM_MEMBERS',
            metadata: {
              sourceStage: stage,
              originalPath: filePath,
              downloadedAt: new Date().toISOString(),
              stageWebhookDownload: true,
            },
          });

          console.log(`✅ [Stage Webhook] Stored file ${filename} for stage ${stage} (ID: ${storedFile.id})`);

          // For markdown conversion stage, also update document markdown field
          if (stage === 'MARKDOWN_CONVERSION' && filename.endsWith('.md')) {
            await prisma.document.update({
              where: { id: documentId },
              data: {
                markdown: fileContent,
              },
            });
            console.log(`✅ [Stage Webhook] Updated document ${documentId} with markdown content (${fileContent.length} chars)`);
          }
        } else {
          console.warn(`⚠️ [Stage Webhook] Could not download file: ${filePath}`);
        }
      } catch (fileError) {
        console.error(`❌ [Stage Webhook] Error processing file ${filePath}:`, fileError);
      }
    }
  } catch (error) {
    console.error(`❌ [Stage Webhook] Error downloading and storing stage output files:`, error);
    throw error;
  }
}

/**
 * Determine the appropriate file type for stage outputs
 */
function getFileTypeForStage(): 'STAGE_OUTPUT' {
  // All stage outputs use STAGE_OUTPUT type
  return 'STAGE_OUTPUT';
}

/**
 * Convert stage string to ProcessingStage enum
 */
function getProcessingStage(stage: string): 'MARKDOWN_CONVERSION' | 'MARKDOWN_OPTIMIZER' | 'CHUNKER' | 'FACT_GENERATOR' | 'INGESTOR' | undefined {
  switch (stage) {
    case 'MARKDOWN_CONVERSION':
      return 'MARKDOWN_CONVERSION';
    case 'MARKDOWN_OPTIMIZER':
      return 'MARKDOWN_OPTIMIZER';
    case 'CHUNKER':
      return 'CHUNKER';
    case 'FACT_GENERATOR':
      return 'FACT_GENERATOR';
    case 'INGESTOR':
      return 'INGESTOR';
    default:
      return undefined;
  }
}

/**
 * Determine content type from filename
 */
function getContentTypeFromFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  switch (extension) {
    case 'md':
    case 'markdown':
      return 'text/markdown';
    case 'json':
      return 'application/json';
    case 'txt':
      return 'text/plain';
    case 'csv':
      return 'text/csv';
    case 'xml':
      return 'application/xml';
    case 'html':
      return 'text/html';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Download a file from MoRAG backend
 */
async function downloadFileFromMorag(filePath: string): Promise<string | null> {
  try {
    const moragBaseUrl = process.env.MORAG_API_URL || 'http://localhost:8000';
    const moragApiKey = process.env.MORAG_API_KEY;

    // Use the correct URL format: /api/v1/files/download/{encoded_path}?inline=true
    const encodedPath = encodeURIComponent(filePath);
    const downloadUrl = `${moragBaseUrl}/api/v1/files/download/${encodedPath}?inline=true`;

    console.log(`🔽 [Stage Webhook] Downloading from: ${downloadUrl}`);

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
      console.log(`✅ [Stage Webhook] Downloaded file content (${content.length} chars)`);
      return content;
    } else {
      console.error(`❌ [Stage Webhook] Download failed: ${response.status} ${response.statusText}`);

      // Try to get error details
      try {
        const errorText = await response.text();
        console.error(`❌ [Stage Webhook] Error response: ${errorText}`);
      } catch (e) {
        // Ignore error reading response
      }

      return null;
    }

  } catch (error) {
    console.error(`❌ [Stage Webhook] Error downloading file from MoRAG:`, error);
    return null;
  }
}

/**
 * Check if any stages are waiting for this completed stage as a dependency and retry them
 */
async function checkAndRetryDependentStages(documentId: string, completedStage: string): Promise<void> {
  try {
    console.log(`🔍 [Stage Webhook] Checking for stages waiting for ${completedStage} dependency on document ${documentId}`);

    // Find failed jobs that were waiting for this dependency
    const failedJobs = await prisma.processingJob.findMany({
      where: {
        documentId,
        status: 'FAILED',
        errorMessage: {
          contains: 'DEPENDENCY_RESOLUTION_TRIGGERED'
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📋 [Stage Webhook] Found ${failedJobs.length} failed jobs that might be waiting for dependencies`);

    for (const job of failedJobs) {
      // Parse the error message to check if this job was waiting for the completed stage
      if (job.errorMessage?.includes(`Missing dependency ${completedStage}`)) {
        console.log(`🚀 [Stage Webhook] Retrying ${job.stage} stage after ${completedStage} completion`);

        // Create a new job to retry the original stage
        const { jobManager } = await import('../../../../lib/services/jobs');
        await jobManager.createJob({
          documentId,
          stage: job.stage,
          priority: 1, // High priority for dependency-resolved retries
          metadata: {
            triggeredBy: 'dependency_resolution_retry',
            originalJobId: job.id,
            resolvedDependency: completedStage
          }
        });

        console.log(`✅ [Stage Webhook] Scheduled retry for ${job.stage} after ${completedStage} dependency resolution`);
      }
    }

    // Also check for any pending jobs that might have been created for stages that depend on this one
    const stageDependents: Record<string, string[]> = {
      'MARKDOWN_CONVERSION': ['CHUNKER', 'MARKDOWN_OPTIMIZER'],
      'MARKDOWN_OPTIMIZER': ['CHUNKER'],
      'CHUNKER': ['FACT_GENERATOR'],
      'FACT_GENERATOR': ['INGESTOR'],
    };

    const dependentStages = stageDependents[completedStage];
    if (dependentStages && dependentStages.length > 0) {
      console.log(`🔍 [Stage Webhook] Checking for pending ${dependentStages.join(', ')} jobs that can now proceed`);

      for (const dependentStage of dependentStages) {
        const pendingJobs = await prisma.processingJob.findMany({
          where: {
            documentId,
            stage: dependentStage as any,
            status: 'PENDING',
            errorMessage: {
              contains: 'DEPENDENCY_RESOLUTION_TRIGGERED'
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1 // Only get the most recent one
        });

        if (pendingJobs.length > 0) {
          console.log(`🚀 [Stage Webhook] Found pending ${dependentStage} job that can now proceed after ${completedStage} completion`);
          // The job scheduler will pick up these pending jobs automatically
        }
      }
    }

  } catch (error) {
    console.error(`❌ [Stage Webhook] Error checking for dependent stages:`, error);
    // Don't throw - this is a best-effort operation
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