import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/documentService';
import { unifiedFileService } from '@/lib/services/unifiedFileService';
import { detectDocumentType } from '@/lib/utils/documentTypeDetection';
import { validateFileUploadSecurity, generateSecureFilePath } from '@/lib/middleware/fileUploadSecurity';
import { validateRequestBody, documentUploadSchema } from '@/lib/validation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // YouTube-specific fields
    const inputFilesStr = formData.get('input_files') as string;
    const configStr = formData.get('config') as string;

    console.log('Upload form data (UPDATED):', {
      processingMode,
      type,
      subType,
      fileName: file?.name,
      templateId,
      hasTemplateConfig: !!templateConfigStr,
      hasExpertConfig: !!expertConfigStr,
      hasInputFiles: !!inputFilesStr,
      hasConfig: !!configStr,
      formDataKeys: Array.from(formData.keys())
    });

    // Parse template and expert configurations
    let templateConfig = null;
    let expertConfig = null;
    let inputFiles = null;
    let youtubeConfig = null;

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

    // Parse YouTube-specific fields
    if (inputFilesStr) {
      try {
        inputFiles = JSON.parse(inputFilesStr);
      } catch (error) {
        console.error('Failed to parse input files:', error);
        return NextResponse.json(
          { error: 'Invalid input files configuration' },
          { status: 400 }
        );
      }
    }

    if (configStr) {
      try {
        youtubeConfig = JSON.parse(configStr);
      } catch (error) {
        console.error('Failed to parse YouTube config:', error);
        return NextResponse.json(
          { error: 'Invalid YouTube configuration' },
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
    
    // Validate realm exists and user has access
    let validRealmId = realmId;
    if (realmId) {
      const realmExists = await prisma.realm.findFirst({
        where: {
          id: realmId,
          userRealms: {
            some: {
              userId: user.userId
            }
          }
        }
      });

      if (!realmExists) {
        console.warn(`Realm ${realmId} not found or user has no access, falling back to default realm`);
        validRealmId = null;
      }
    }

    // If no valid realm, get user's default realm
    if (!validRealmId) {
      const defaultRealm = await prisma.userRealm.findFirst({
        where: {
          userId: user.userId,
          realm: { isDefault: true }
        },
        include: { realm: true }
      });

      if (defaultRealm) {
        validRealmId = defaultRealm.realmId;
        console.log(`Using default realm: ${validRealmId}`);
      } else {
        return NextResponse.json(
          { error: 'No valid realm found. Please create a realm first.' },
          { status: 400 }
        );
      }
    }

    // Create document record
    const documentData = {
      name: name || file.name,
      type: finalType,
      subType: finalSubType,
      realmId: validRealmId,
      userId: user.userId,
      processingMode: processingMode as 'AUTOMATIC' | 'MANUAL'
    };

    // Prepare metadata for file storage
    const fileMetadata = {
      ...(templateId && { templateId }),
      ...(templateConfig && { templateConfig }),
      ...(expertConfig && { expertConfig }),
      ...(inputFiles && { inputFiles }),
      ...(youtubeConfig && { youtubeConfig }),
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.userId,
      originalSize: file.size,
      processingMode,
      // Add source URL for YouTube documents
      ...(finalType === 'youtube' && inputFiles && inputFiles.length > 0 && { sourceUrl: inputFiles[0] })
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
      metadata: fileMetadata,
    });
    
    // Trigger processing pipeline if in automatic mode
    console.log(`Processing mode check: "${processingMode}" === "AUTOMATIC" = ${processingMode === 'AUTOMATIC'}`);
    console.log(`Processing mode type: ${typeof processingMode}, length: ${processingMode?.length}`);

    if (processingMode === 'AUTOMATIC') {
      try {
        // Import the background job service to schedule processing
        const { jobManager } = await import('@/lib/services/jobs');

        if (templateConfig || expertConfig || youtubeConfig) {
          // Use new stage-based processing with template/expert/YouTube configuration
          const config = expertConfig || youtubeConfig || templateConfig;
          const stages = config.stages || ['markdown-conversion', 'chunker', 'fact-generator', 'ingestor'];

          // Map kebab-case stage names to SCREAMING_SNAKE_CASE enum values
          const stageMapping: Record<string, string> = {
            'markdown-conversion': 'MARKDOWN_CONVERSION',
            'markdown-optimizer': 'MARKDOWN_OPTIMIZER',
            'chunker': 'CHUNKER',
            'fact-generator': 'FACT_GENERATOR',
            'ingestor': 'INGESTOR'
          };

          // Schedule processing with the first stage
          const firstStageKebab = stages[0] || 'markdown-conversion';
          const firstStage = stageMapping[firstStageKebab] || 'MARKDOWN_CONVERSION';

          // Prepare job metadata with source URL for YouTube/website documents
          const jobMetadata = {
            ...config.globalConfig,
            ...config,
            stages: stages.map(stage => stageMapping[stage] || stage), // Convert all stages
            stageConfigs: config.stageConfigs
          };

          // Add source URL for YouTube documents
          if (finalType === 'youtube' && inputFiles && inputFiles.length > 0) {
            jobMetadata.sourceUrl = inputFiles[0]; // First input file should be the YouTube URL
          }

          const jobId = await jobManager.createJob({
            documentId: document.id,
            stage: firstStage as any,
            priority: 0,
            scheduledAt: new Date(),
            metadata: jobMetadata
          });

          console.log(`Document ${document.id} uploaded, scheduled stage chain processing with job ${jobId}`);
        } else {
          // Fallback to legacy single-stage processing
          const fallbackMetadata: any = {};

          // Add source URL for YouTube documents even in fallback mode
          if (finalType === 'youtube' && inputFiles && inputFiles.length > 0) {
            fallbackMetadata.sourceUrl = inputFiles[0]; // First input file should be the YouTube URL
          }

          const jobId = await jobManager.createJob({
            documentId: document.id,
            stage: 'MARKDOWN_CONVERSION',
            priority: 0,
            scheduledAt: new Date(),
            metadata: Object.keys(fallbackMetadata).length > 0 ? fallbackMetadata : undefined
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
