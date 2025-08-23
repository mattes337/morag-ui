import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { DocumentService } from '@/lib/services/documentService';
import { unifiedFileService } from '@/lib/services/unifiedFileService';
import { detectDocumentType } from '@/lib/utils/documentTypeDetection';

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
    const processingMode = formData.get('processingMode') as string || 'AUTOMATIC';
    const type = formData.get('type') as string;
    const subType = formData.get('subType') as string;
    
    if (!file || !realmId) {
      return NextResponse.json(
        { error: 'file and realmId are required' },
        { status: 400 }
      );
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
    
    // Create document record
    const document = await DocumentService.createDocument({
      name: name || file.name,
      type: finalType,
      subType: finalSubType,
      realmId,
      userId: user.userId,
      processingMode: processingMode as any,
    });
    
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
    
    // TODO: Trigger processing pipeline if in automatic mode
    if (processingMode === 'AUTOMATIC') {
      // This would trigger the first stage of processing
      console.log(`Document ${document.id} uploaded, triggering automatic processing`);
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
