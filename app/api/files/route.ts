import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { unifiedFileService } from '@/lib/services/unifiedFileService';
import { FileType, ProcessingStage } from '@prisma/client';

/**
 * GET /api/files
 * Get files by document ID, with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const documentId = searchParams.get('documentId');
    const fileType = searchParams.get('fileType') as FileType | null;
    const stage = searchParams.get('stage') as ProcessingStage | null;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }
    
    const files = await unifiedFileService.getFilesByDocument(
      documentId,
      fileType || undefined,
      stage || undefined
    );
    
    // Filter files based on access permissions
    const accessibleFiles = [];
    for (const file of files) {
      const hasAccess = await unifiedFileService.checkFileAccess(
        file.id,
        user.userId,
        // TODO: Get user's current realm
      );
      if (hasAccess) {
        accessibleFiles.push(file);
      }
    }
    
    return NextResponse.json({ files: accessibleFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/files
 * Upload a new file
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    // Handle multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentId = formData.get('documentId') as string;
    const fileType = formData.get('fileType') as FileType;
    const stage = formData.get('stage') as ProcessingStage | null;
    const isPublic = formData.get('isPublic') === 'true';
    const accessLevel = formData.get('accessLevel') as any || 'REALM_MEMBERS';
    
    if (!file || !documentId || !fileType) {
      return NextResponse.json(
        { error: 'file, documentId, and fileType are required' },
        { status: 400 }
      );
    }
    
    // Read file content
    const buffer = await file.arrayBuffer();
    const content = Buffer.from(buffer);
    
    // Store the file
    const storedFile = await unifiedFileService.storeFile({
      documentId,
      fileType,
      stage: stage || undefined,
      filename: file.name,
      originalName: file.name,
      content,
      contentType: file.type,
      isPublic,
      accessLevel,
      metadata: {
        uploadedBy: user.userId,
        uploadedAt: new Date().toISOString(),
        originalSize: file.size,
      },
    });
    
    return NextResponse.json({ file: storedFile }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
