import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { stageExecutionService } from '@/lib/services/stageExecutionService';
import { ProcessingStage } from '@prisma/client';

/**
 * POST /api/stages/chain
 * Execute a chain of processing stages
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, stages, options } = body;

    if (!documentId || !stages || !Array.isArray(stages)) {
      return NextResponse.json(
        { error: 'documentId and stages array are required' },
        { status: 400 }
      );
    }

    const validStages: ProcessingStage[] = [
      'MARKDOWN_CONVERSION',
      'MARKDOWN_OPTIMIZER',
      'CHUNKER',
      'FACT_GENERATOR',
      'INGESTOR',
    ];

    // Validate all stages
    for (const stage of stages) {
      if (!validStages.includes(stage)) {
        return NextResponse.json(
          { error: `Invalid stage: ${stage}` },
          { status: 400 }
        );
      }
    }

    const executionResults = [];
    let currentDocumentId = documentId;

    // Execute stages in sequence
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageOptions = options?.[stage] || {};

      try {
        // Start execution for this stage
        const execution = await stageExecutionService.startExecution({
          documentId: currentDocumentId,
          stage,
          metadata: {
            chainExecution: true,
            chainPosition: i + 1,
            totalStages: stages.length,
            stageOptions,
            userId: session.user.id,
          },
        });

        // Simulate stage execution
        // In a real implementation, this would call the actual stage processing services
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // For demo purposes, we'll simulate success for most stages
        const shouldFail = Math.random() < 0.1; // 10% chance of failure

        if (shouldFail) {
          const errorMessage = `Stage ${stage} failed during chain execution`;
          await stageExecutionService.failExecution(execution.id, errorMessage);
          
          return NextResponse.json(
            {
              error: `Chain execution failed at stage ${stage}`,
              executedStages: executionResults,
              failedStage: stage,
              failedExecution: execution,
            },
            { status: 500 }
          );
        } else {
          // Complete execution successfully
          const completedExecution = await stageExecutionService.completeExecution(
            execution.id,
            [`mock-output-${stage.toLowerCase()}-${Date.now()}`],
            {
              chainPosition: i + 1,
              processingTime: `${(1 + Math.random() * 2).toFixed(1)}s`,
            }
          );

          executionResults.push(completedExecution);
        }
      } catch (stageError) {
        console.error(`Error executing stage ${stage}:`, stageError);
        return NextResponse.json(
          {
            error: `Chain execution failed at stage ${stage}`,
            executedStages: executionResults,
            failedStage: stage,
            stageError: stageError.message,
          },
          { status: 500 }
        );
      }
    }

    // Get final pipeline status
    const pipelineStatus = await stageExecutionService.getDocumentPipelineStatus(documentId);

    return NextResponse.json({
      message: 'Chain execution completed successfully',
      documentId,
      executedStages: stages,
      executions: executionResults,
      pipelineStatus,
      totalExecutionTime: executionResults.reduce((total, exec) => {
        if (exec.startedAt && exec.completedAt) {
          return total + (new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime());
        }
        return total;
      }, 0),
    });
  } catch (error) {
    console.error('Error executing stage chain:', error);
    return NextResponse.json(
      { error: 'Failed to execute stage chain' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stages/chain
 * Get available stage chains and their configurations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const predefinedChains = {
      full_pipeline: {
        name: 'Full Processing Pipeline',
        description: 'Complete document processing from conversion to ingestion',
        stages: ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'],
        estimatedTime: '5-10 minutes',
      },
      basic_processing: {
        name: 'Basic Processing',
        description: 'Convert and chunk document without optimization',
        stages: ['MARKDOWN_CONVERSION', 'CHUNKER', 'INGESTOR'],
        estimatedTime: '2-5 minutes',
      },
      content_analysis: {
        name: 'Content Analysis',
        description: 'Process document for content analysis and fact extraction',
        stages: ['MARKDOWN_CONVERSION', 'CHUNKER', 'FACT_GENERATOR'],
        estimatedTime: '3-7 minutes',
      },
      optimization_only: {
        name: 'Optimization Pipeline',
        description: 'Optimize existing markdown and re-chunk',
        stages: ['MARKDOWN_OPTIMIZER', 'CHUNKER'],
        estimatedTime: '1-3 minutes',
      },
    };

    const availableStages = [
      {
        stage: 'MARKDOWN_CONVERSION',
        name: 'Markdown Conversion',
        description: 'Convert input files to unified markdown format',
        inputTypes: ['video', 'audio', 'document', 'url', 'text'],
        outputType: 'markdown',
      },
      {
        stage: 'MARKDOWN_OPTIMIZER',
        name: 'Markdown Optimizer',
        description: 'LLM-based text improvement and transcription error correction',
        inputTypes: ['markdown'],
        outputType: 'optimized_markdown',
        optional: true,
      },
      {
        stage: 'CHUNKER',
        name: 'Chunker',
        description: 'Create summary, chunks, and contextual embeddings',
        inputTypes: ['markdown', 'optimized_markdown'],
        outputType: 'chunks_json',
      },
      {
        stage: 'FACT_GENERATOR',
        name: 'Fact Generator',
        description: 'Extract facts, entities, relations, and keywords',
        inputTypes: ['chunks_json'],
        outputType: 'facts_json',
      },
      {
        stage: 'INGESTOR',
        name: 'Ingestor',
        description: 'Database ingestion and storage',
        inputTypes: ['chunks_json', 'facts_json'],
        outputType: 'ingestion_json',
      },
    ];

    return NextResponse.json({
      predefinedChains,
      availableStages,
      customChainSupported: true,
    });
  } catch (error) {
    console.error('Error fetching chain configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chain configurations' },
      { status: 500 }
    );
  }
}