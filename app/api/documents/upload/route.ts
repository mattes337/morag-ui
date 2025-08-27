import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/documentService';
import { unifiedFileService } from '@/lib/services/unifiedFileService';
import { detectDocumentType } from '@/lib/utils/documentTypeDetection';
import { validateFileUploadSecurity, generateSecureFilePath } from '@/lib/middleware/fileUploadSecurity';
import { validateRequestBody, documentUploadSchema } from '@/lib/validation';

/**
 * POST /api/documents/upload
 * Upload a document with file
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    // Handle multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const realmId = formData.get('realmId') as string;
    const processingMode = (formData.get('processingMode') as string) || 'AUTOMATIC';
    const type = formData.get('type') as string;
    const subType = formData.get('subType') as string;

    // New template and expert mode support
    const templateId = formData.get('templateId') as string;
    const templateConfigStr = formData.get('templateConfig') as string;
    const expertConfigStr = formData.get('expertConfig') as string;

    console.log('Upload form data (UPDATED):', {
      processingMode,
      type,
      subType,
      fileName: file?.name,
      templateId,
      hasTemplateConfig: !!templateConfigStr,
      hasExpertConfig: !!expertConfigStr,
      formDataKeys: Array.from(formData.keys())
    });

    // Parse template and expert configurations
    let templateConfig = null;
    let expertConfig = null;

    if (templateConfigStr) {
      try {
        templateConfig = JSON.parse(templateConfigStr);
      } catch (error) {
        console.error('Failed to parse template config:', error);
        return NextResponse.json(
          { error: 'Invalid template configuration' },
          { status: 400 }
        );
      }
    }

    if (expertConfigStr) {
      try {
        expertConfig = JSON.parse(expertConfigStr);
      } catch (error) {
        console.error('Failed to parse expert config:', error);
        return NextResponse.json(
          { error: 'Invalid expert configuration' },
          { status: 400 }
        );
      }
    }

    // Validate processing mode
    if (processingMode && !['AUTOMATIC', 'MANUAL'].includes(processingMode)) {
      return NextResponse.json(
        { error: `Invalid processing mode: ${processingMode}. Must be AUTOMATIC or MANUAL.` },
        { status: 400 }
      );
    }
    
    if (!file || !realmId) {
      return NextResponse.json(
        { error: 'file and realmId are required' },
        { status: 400 }
      );
    }

    // Validate file security
    const securityValidation = await validateFileUploadSecurity(file);
    if (!securityValidation.isSecure) {
      return NextResponse.json(
        {
          error: 'File security validation failed',
          details: securityValidation.errors
        },
        { status: 400 }
      );
    }

    // Log security warnings if any
    if (securityValidation.warnings.length > 0) {
      console.warn('File upload security warnings:', securityValidation.warnings);
    }
    
    // Auto-detect type and subType if not provided
    let finalType = type;
    let finalSubType = subType;

    if (!finalType || !finalSubType) {
      const detected = detectDocumentType(file.name);
      finalType = finalType || detected.type;
      finalSubType = finalSubType || detected.subType || 'unknown';
    }

    // Ensure we have valid types
    finalType = finalType || 'document';
    finalSubType = finalSubType || 'unknown';

    // Validate the document data
    try {
      validateRequestBody(documentUploadSchema, {
        name: name || file.name,
        realmId,
        processingMode,
        type: finalType,
        subType: finalSubType,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Validation failed' },
        { status: 400 }
      );
    }
    
    // Create document record
    const documentData = {
      name: name || file.name,
      type: finalType,
      subType: finalSubType,
      realmId,
      userId: user.userId,
      processingMode: processingMode as 'AUTOMATIC' | 'MANUAL',
      // Add template and expert configuration metadata
      metadata: {
        ...(templateId && { templateId }),
        ...(templateConfig && { templateConfig }),
        ...(expertConfig && { expertConfig }),
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.userId
      }
    };

    console.log('Creating document with data:', documentData);

    const document = await DocumentService.createDocument(documentData);

    console.log(`Document created with ID ${document.id} and processing mode: ${document.processingMode}`);
    
    // Read file content
    const buffer = await file.arrayBuffer();
    const content = Buffer.from(buffer);
    
    // Store the original file
    const storedFile = await unifiedFileService.storeFile({
      documentId: document.id,
      fileType: 'ORIGINAL_DOCUMENT',
      filename: file.name,
      originalName: file.name,
      content,
      contentType: file.type,
      isPublic: false,
      accessLevel: 'REALM_MEMBERS',
      metadata: {
        uploadedBy: user.userId,
        uploadedAt: new Date().toISOString(),
        originalSize: file.size,
        processingMode,
      },
    });
    
    // Trigger processing pipeline if in automatic mode
    console.log(`Processing mode check: "${processingMode}" === "AUTOMATIC" = ${processingMode === 'AUTOMATIC'}`);
    console.log(`Processing mode type: ${typeof processingMode}, length: ${processingMode?.length}`);

    if (processingMode === 'AUTOMATIC') {
      try {
        // Import the background job service to schedule processing
        const { backgroundJobService } = await import('@/lib/services/backgroundJobService');

        if (templateConfig || expertConfig) {
          // Use new stage-based processing with template/expert configuration
          const config = expertConfig || templateConfig;
          const stages = config.stages || ['markdown-conversion', 'chunker', 'fact-generator', 'ingestor'];

          // Schedule processing with the new API
          const jobId = await backgroundJobService.createStageChainJob({
            documentId: document.id,
            stages,
            globalConfig: config.globalConfig,
            stageConfigs: config.stageConfigs,
            priority: 0,
            scheduledAt: new Date()
          });

          console.log(`Document ${document.id} uploaded, scheduled stage chain processing with job ${jobId}`);
        } else {
          // Fallback to legacy single-stage processing
          const jobId = await backgroundJobService.createJob({
            documentId: document.id,
            stage: 'MARKDOWN_CONVERSION',
            priority: 0,
            scheduledAt: new Date()
          });

          console.log(`Document ${document.id} uploaded, scheduled automatic processing with job ${jobId}`);
        }
      } catch (processingError) {
        console.error(`Failed to schedule automatic processing for document ${document.id}:`, processingError);
        // Don't fail the upload if processing scheduling fails
      }
    } else {
      console.log(`Document ${document.id} uploaded with ${processingMode} mode - no automatic processing scheduled`);
    }
    
    return NextResponse.json({
      document,
      file: storedFile,
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
