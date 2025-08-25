import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stageExecutionService } from '@/lib/services/stageExecutionService';
import { unifiedFileService } from '@/lib/services/unifiedFileService';

/**
 * POST /api/stages/chunker/execute
 * Execute chunker stage
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, inputFileId, options } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Get input file (markdown or optimized markdown)
    let inputFile = null;
    if (inputFileId) {
      inputFile = await unifiedFileService.getFile(inputFileId, true);
      if (!inputFile) {
        return NextResponse.json(
          { error: 'Input file not found' },
          { status: 404 }
        );
      }
    } else {
      // Try to get the latest markdown file from stage outputs
      const optimizerFiles = await unifiedFileService.getStageFiles(documentId, 'MARKDOWN_OPTIMIZER');
      const conversionFiles = await unifiedFileService.getStageFiles(documentId, 'MARKDOWN_CONVERSION');

      inputFile = optimizerFiles[0] || conversionFiles[0];

      if (!inputFile) {
        return NextResponse.json(
          { error: 'No markdown input file found. Run markdown-conversion first.' },
          { status: 400 }
        );
      }

      // Get file content
      inputFile = await unifiedFileService.getFile(inputFile.id, true);

      if (!inputFile) {
        return NextResponse.json(
          { error: 'Failed to load input file content' },
          { status: 500 }
        );
      }
    }

    // Start execution
    const execution = await stageExecutionService.startExecution({
      documentId,
      stage: 'CHUNKER',
      inputFiles: [inputFile.id],
      metadata: { options, userId: user.userId, inputFilename: inputFile.filename },
    });

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock chunking process
      const chunks = [
        {
          index: 0,
          content: inputFile.content?.substring(0, 500) || 'Mock chunk 1 content',
          embedding: Array.from({ length: 384 }, () => Math.random()),
          metadata: { tokens: 125, section: 'introduction' },
        },
        {
          index: 1,
          content: inputFile.content?.substring(500, 1000) || 'Mock chunk 2 content',
          embedding: Array.from({ length: 384 }, () => Math.random()),
          metadata: { tokens: 118, section: 'body' },
        },
      ];

      const chunksData = {
        documentId,
        sourceFile: inputFile.filename,
        chunkingOptions: options,
        summary: `Document processed into ${chunks.length} chunks`,
        chunks,
        metadata: {
          totalChunks: chunks.length,
          totalTokens: chunks.reduce((sum, chunk) => sum + chunk.metadata.tokens, 0),
          processingTime: '2.1s',
          chunkingStrategy: options?.strategy || 'semantic',
        },
      };

      // Store the chunks file
      const outputFilename = `${documentId}.chunks.json`;
      const stageFile = await unifiedFileService.storeFile({
        documentId,
        fileType: 'STAGE_OUTPUT',
        stage: 'CHUNKER',
        filename: outputFilename,
        originalName: outputFilename,
        content: Buffer.from(JSON.stringify(chunksData, null, 2)),
        contentType: 'application/json',
        isPublic: false,
        accessLevel: 'REALM_MEMBERS',
        metadata: {
          inputFile: inputFile.filename,
          chunkCount: chunks.length,
          chunkingOptions: options,
        },
      });

      // Complete execution
      const completedExecution = await stageExecutionService.completeExecution(
        execution.id,
        [stageFile.id],
        {
          outputFile: outputFilename,
          chunkCount: chunks.length,
          fileSize: stageFile.filesize,
        }
      );

      return NextResponse.json({
        execution: completedExecution,
        outputFile: stageFile,
        chunks: chunksData,
      });
    } catch (processingError) {
      // Fail execution
      await stageExecutionService.failExecution(
        execution.id,
        `Chunking failed: ${processingError}`
      );

      throw processingError;
    }
  } catch (error) {
    console.error('Error executing chunker:', error);
    return NextResponse.json(
      { error: 'Failed to execute chunker' },
      { status: 500 }
    );
  }
}