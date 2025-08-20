import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stageExecutionService } from '@/lib/services/stageExecutionService';
import { stageFileService } from '@/lib/services/stageFileService';

/**
 * POST /api/stages/markdown-conversion/execute
 * Execute markdown conversion stage
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, inputFile, options } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Start execution
    const execution = await stageExecutionService.startExecution({
      documentId,
      stage: 'MARKDOWN_CONVERSION',
      inputFiles: inputFile ? [inputFile] : undefined,
      metadata: { options, userId: user.userId },
    });

    // TODO: Integrate with actual markdown conversion service
    // For now, we'll simulate the process
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock output file
      const outputFilename = `${documentId}.md`;
      const mockMarkdownContent = `# Document: ${documentId}\n\nThis is a mock markdown conversion result.\n\n## Metadata\n- Converted at: ${new Date().toISOString()}\n- Input file: ${inputFile || 'N/A'}\n`;

      // Store the output file
      const stageFile = await stageFileService.storeStageFile({
        documentId,
        stage: 'MARKDOWN_CONVERSION',
        filename: outputFilename,
        content: mockMarkdownContent,
        contentType: 'text/markdown',
        metadata: {
          originalFilename: inputFile,
          conversionOptions: options,
        },
      });

      // Complete execution
      const completedExecution = await stageExecutionService.completeExecution(
        execution.id,
        [stageFile.id],
        {
          outputFile: outputFilename,
          fileSize: stageFile.filesize,
        }
      );

      return NextResponse.json({
        execution: completedExecution,
        outputFile: stageFile,
      });
    } catch (processingError) {
      // Fail execution
      await stageExecutionService.failExecution(
        execution.id,
        `Markdown conversion failed: ${processingError}`
      );

      throw processingError;
    }
  } catch (error) {
    console.error('Error executing markdown conversion:', error);
    return NextResponse.json(
      { error: 'Failed to execute markdown conversion' },
      { status: 500 }
    );
  }
}