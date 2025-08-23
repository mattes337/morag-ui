import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { unifiedFileService } from '@/lib/services/unifiedFileService';

/**
 * GET /api/files/[id]/view
 * View a file (for preview purposes)
 * This endpoint allows viewing files with session authentication or token-based auth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For development purposes, allow file viewing without strict authentication
    // In production, this should be properly secured
    let user = await getAuthUser(request);

    // If no session user, allow access for preview purposes in development
    if (!user && process.env.NODE_ENV === 'development') {
      user = { userId: 'preview-user', email: 'preview@example.com', role: 'USER', name: 'Preview User', authMethod: 'jwt' };
    }

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const fileId = params.id;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    
    // Get file metadata first
    const file = await unifiedFileService.getFile(fileId);
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check access permissions - for now, allow access if user is authenticated
    // TODO: Implement proper realm-based access control
    
    // Get file stream
    const stream = await unifiedFileService.getFileStream(fileId);
    
    if (!stream) {
      return NextResponse.json(
        { error: 'File content not available' },
        { status: 404 }
      );
    }
    
    // Create response with appropriate headers for viewing
    const response = new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': file.contentType,
        'Content-Length': file.filesize.toString(),
        'Content-Disposition': `inline; filename="${file.originalName || file.filename}"`,
        'Cache-Control': 'private, max-age=3600',
        // Add CORS headers to allow iframe access
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error viewing file:', error);
    return NextResponse.json(
      { error: 'Failed to view file' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/files/[id]/view
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
