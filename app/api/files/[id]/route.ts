import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { unifiedFileService } from '@/lib/services/unifiedFileService';

/**
 * GET /api/files/[id]
 * Get a specific file by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const fileId = params.id;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    
    // Check access permissions
    const hasAccess = await unifiedFileService.checkFileAccess(
      fileId,
      user.userId,
      // TODO: Get user's current realm
    );
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get('includeContent') === 'true';
    
    const file = await unifiedFileService.getFile(fileId, includeContent);
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ file });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files/[id]
 * Delete a file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const fileId = params.id;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    
    // Check access permissions
    const hasAccess = await unifiedFileService.checkFileAccess(
      fileId,
      user.userId,
      // TODO: Get user's current realm
    );
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const deleted = await unifiedFileService.deleteFile(fileId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
