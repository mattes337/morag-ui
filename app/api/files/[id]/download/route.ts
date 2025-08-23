import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { unifiedFileService } from '@/lib/services/unifiedFileService';

/**
 * GET /api/files/[id]/download
 * Download a file
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
    
    const file = await unifiedFileService.getFile(fileId);
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Get file stream
    const stream = await unifiedFileService.getFileStream(fileId);
    
    if (!stream) {
      return NextResponse.json(
        { error: 'File content not available' },
        { status: 404 }
      );
    }
    
    // Create response with appropriate headers
    const response = new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': file.contentType,
        'Content-Length': file.filesize.toString(),
        'Content-Disposition': `attachment; filename="${file.originalName || file.filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
