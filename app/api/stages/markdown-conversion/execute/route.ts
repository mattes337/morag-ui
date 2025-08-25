import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stageExecutionService } from '@/lib/services/stageExecutionService';
import { unifiedFileService } from '@/lib/services/unifiedFileService';

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

    // Integrate with actual markdown conversion service
    try {
      const { MarkdownConversionService } = await import('@/lib/services/markdownConversionService');

      let markdownContent: string;
      let conversionMetadata: any = {};

      if (inputFile) {
        // Convert the input file to markdown
        const conversionResult = await MarkdownConversionService.convertToMarkdown(inputFile, {
          preserveFormatting: options?.preserveFormatting ?? true,
          extractImages: options?.extractImages ?? false,
          includeMetadata: options?.includeMetadata ?? true,
          optimizeForReadability: options?.optimizeForReadability ?? true,
        });

        markdownContent = conversionResult.markdown;
        conversionMetadata = conversionResult.metadata;
      } else {
        // No input file - create a basic markdown document
        markdownContent = `# Document: ${documentId}\n\nThis document was created without an input file.\n\n## Information\n- Created at: ${new Date().toISOString()}\n- Document ID: ${documentId}\n`;
        conversionMetadata = {
          originalFilename: 'none',
          fileType: 'generated',
          conversionDate: new Date().toISOString(),
          wordCount: markdownContent.split(/\s+/).length,
          characterCount: markdownContent.length,
        };
      }

      // Create output file
      const outputFilename = `${documentId}.md`;

      // Store the output file
      const stageFile = await unifiedFileService.storeFile({
        documentId,
        fileType: 'STAGE_OUTPUT',
        stage: 'MARKDOWN_CONVERSION',
        filename: outputFilename,
        originalName: outputFilename,
        content: Buffer.from(markdownContent),
        contentType: 'text/markdown',
        isPublic: false,
        accessLevel: 'REALM_MEMBERS',
        metadata: {
          originalFilename: conversionMetadata.originalFilename,
          conversionOptions: options,
          conversionMetadata,
        },
      });

      // Complete execution
      const completedExecution = await stageExecutionService.completeExecution(
        execution.id,
        [stageFile.id],
        {
          outputFile: outputFilename,
          fileSize: stageFile.filesize,
          conversionMetadata,
          wordCount: conversionMetadata.wordCount,
          characterCount: conversionMetadata.characterCount,
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