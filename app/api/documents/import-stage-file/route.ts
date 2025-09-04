import { NextRequest, NextResponse } from 'next/server';
import { requireUnifiedAuth } from '../../../../lib/middleware/unifiedAuth';
import { unifiedFileService } from '../../../../lib/services/unifiedFileService';
import { prisma } from '../../../../lib/database';

/**
 * POST /api/documents/import-stage-file
 * Import a stage file for a document
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireUnifiedAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentId = formData.get('documentId') as string;
    const stage = formData.get('stage') as string;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    if (!stage) {
      return NextResponse.json({ error: 'Stage is required' }, { status: 400 });
    }

    // Validate stage
    const validStages = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
    if (!validStages.includes(stage)) {
      return NextResponse.json({ error: `Invalid stage: ${stage}` }, { status: 400 });
    }

    // Verify document exists and user has access
    if (!authResult.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        realm: {
          userRealms: {
            some: {
              userId: authResult.user.userId
            }
          }
        }
      },
      include: {
        realm: true
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Validate file content based on stage
    const buffer = await file.arrayBuffer();
    const content = Buffer.from(buffer);
    const contentString = content.toString('utf-8');

    // Validate JSON files
    if (file.name.endsWith('.json')) {
      try {
        const jsonData = JSON.parse(contentString);
        
        // Validate chunk files
        if (stage === 'CHUNKER' && file.name.includes('.chunks.json')) {
          if (!Array.isArray(jsonData)) {
            return NextResponse.json({ 
              error: 'Chunk file must contain an array of chunks' 
            }, { status: 400 });
          }
          
          // Basic validation of chunk structure
          for (const chunk of jsonData) {
            if (!chunk.content || typeof chunk.content !== 'string') {
              return NextResponse.json({ 
                error: 'Each chunk must have a content field with string value' 
              }, { status: 400 });
            }
          }
        }
        
        // Validate fact files
        if (stage === 'FACT_GENERATOR' && file.name.includes('.facts.json')) {
          if (!Array.isArray(jsonData)) {
            return NextResponse.json({ 
              error: 'Facts file must contain an array of facts' 
            }, { status: 400 });
          }
          
          // Basic validation of fact structure
          for (const fact of jsonData) {
            if (!fact.text || typeof fact.text !== 'string') {
              return NextResponse.json({ 
                error: 'Each fact must have a text field with string value' 
              }, { status: 400 });
            }
          }
        }
      } catch (error) {
        return NextResponse.json({ 
          error: 'Invalid JSON format in file' 
        }, { status: 400 });
      }
    }

    // Generate appropriate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = file.name.split('.').pop();
    let filename: string;

    switch (stage) {
      case 'MARKDOWN_CONVERSION':
        filename = `${document.name}.md`;
        break;
      case 'MARKDOWN_OPTIMIZER':
        filename = `${document.name}.opt.md`;
        break;
      case 'CHUNKER':
        filename = `${document.name}.chunks.json`;
        break;
      case 'FACT_GENERATOR':
        filename = `${document.name}.facts.json`;
        break;
      case 'INGESTOR':
        filename = `${document.name}.ingested`;
        break;
      default:
        filename = `${document.name}.${stage.toLowerCase()}.${extension}`;
    }

    // Store the file
    const storedFile = await unifiedFileService.storeFile({
      documentId: document.id,
      fileType: fileType as any || 'STAGE_OUTPUT',
      filename,
      originalName: file.name,
      content,
      contentType: file.type || 'application/octet-stream',
      isPublic: false,
      accessLevel: 'REALM_MEMBERS',
      stage: stage as any,
      metadata: {
        importedAt: new Date().toISOString(),
        importedBy: authResult.user.userId,
        originalFilename: file.name,
        importMethod: 'manual_import',
        stage: stage,
        fileSize: content.length
      }
    });

    console.log(`✅ [ImportStageFile] Imported ${stage} file for document ${documentId}: ${filename}`);

    return NextResponse.json({
      success: true,
      message: `${stage} file imported successfully`,
      file: {
        id: storedFile.id,
        filename: storedFile.filename,
        stage: storedFile.stage,
        size: content.length
      }
    });

  } catch (error) {
    console.error('❌ [ImportStageFile] Import failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import stage file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
