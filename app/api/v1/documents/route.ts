import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/middleware/apiKeyAuth';
import { DocumentService } from '@/lib/services/documentService';
import { unifiedFileService } from '@/lib/services/unifiedFileService';
import { detectDocumentType } from '@/lib/utils/documentTypeDetection';

/**
 * GET /api/v1/documents
 * List documents for the authenticated realm
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiKey(request);
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const state = searchParams.get('state');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    
    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // Implement proper document filtering with database queries
    const filters: any = {
      realmId: auth.realm!.id,
    };

    // Add state filter
    if (state) {
      const validStates = ['UPLOADED', 'PROCESSING', 'INGESTED', 'FAILED', 'ARCHIVED'];
      if (validStates.includes(state.toUpperCase())) {
        filters.state = state.toUpperCase();
      }
    }

    // Add type filter
    if (type) {
      filters.type = type;
    }

    // Get filtered documents with efficient database query
    const { documents: filteredDocuments, total } = await DocumentService.getDocumentsWithFilters({
      ...filters,
      search,
      page,
      limit,
    });

    // Documents are already paginated from the service
    
    return NextResponse.json({
      documents: filteredDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      realm: {
        id: auth.realm!.id,
        name: auth.realm!.name,
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

/**
 * POST /api/v1/documents
 * Create a new document (with optional file upload)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiKey(request);
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const name = formData.get('name') as string;
      const type = formData.get('type') as string;
      const subType = formData.get('subType') as string;
      const processingMode = formData.get('processingMode') as string || 'AUTOMATIC';
      const url = formData.get('url') as string;
      
      if (!name) {
        return NextResponse.json(
          { error: 'name is required' },
          { status: 400 }
        );
      }
      
      let finalType = type;
      let finalSubType = subType;
      
      // Auto-detect type if file is provided
      if (file && (!finalType || !finalSubType)) {
        const detected = detectDocumentType(file.name);
        finalType = finalType || detected.type;
        finalSubType = finalSubType || detected.subType || 'unknown';
      }

      // Ensure we have valid types
      finalType = finalType || 'document';
      finalSubType = finalSubType || 'unknown';
      
      // Create document record
      const document = await DocumentService.createDocument({
        name,
        type: finalType,
        subType: finalSubType,
        realmId: auth.realm!.id,
        userId: auth.user!.id,
        processingMode: processingMode as any,
      });
      
      // Store file if provided
      let storedFile = null;
      if (file) {
        const buffer = await file.arrayBuffer();
        const content = Buffer.from(buffer);
        
        storedFile = await unifiedFileService.storeFile({
          documentId: document.id,
          fileType: 'ORIGINAL_DOCUMENT',
          filename: file.name,
          originalName: file.name,
          content,
          contentType: file.type,
          isPublic: false,
          accessLevel: 'REALM_MEMBERS',
          metadata: {
            uploadedBy: auth.user!.id,
            uploadedViaApi: true,
            apiKey: request.headers.get('Authorization')?.substring(0, 20) + '...',
          },
        });
      }
      
      return NextResponse.json({
        document,
        file: storedFile,
        message: 'Document created successfully'
      }, { status: 201 });
    } else {
      // Handle JSON payload
      const body = await request.json();
      const { name, type, subType, processingMode, url } = body;
      
      if (!name) {
        return NextResponse.json(
          { error: 'name is required' },
          { status: 400 }
        );
      }
      
      const document = await DocumentService.createDocument({
        name,
        type: type || 'document',
        subType: subType || 'unknown',
        realmId: auth.realm!.id,
        userId: auth.user!.id,
        processingMode: processingMode || 'AUTOMATIC',
      });
      
      return NextResponse.json({
        document,
        message: 'Document created successfully'
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create document' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}
