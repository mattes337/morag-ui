import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/docs
 * API Documentation
 */
export async function GET(request: NextRequest) {
  const baseUrl = new URL(request.url).origin;
  
  const documentation = {
    title: 'Morag API v1',
    version: '1.0.0',
    description: 'REST API for Morag document processing and knowledge management system',
    baseUrl: `${baseUrl}/api/v1`,
    authentication: {
      type: 'API Key',
      header: 'Authorization',
      format: 'Bearer <api-key> or <api-key>',
      description: 'Include your API key in the Authorization header'
    },
    endpoints: {
      documents: {
        'GET /documents': {
          description: 'List documents in your realm',
          parameters: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 20, max: 100)',
            state: 'Filter by document state (pending, ingesting, ingested, deleted)',
            type: 'Filter by document type',
            search: 'Search query'
          },
          example: `${baseUrl}/api/v1/documents?page=1&limit=10&state=ingested`
        },
        'POST /documents': {
          description: 'Create a new document',
          contentType: 'application/json or multipart/form-data',
          body: {
            name: 'Document name (required)',
            type: 'Document type (optional, auto-detected from file)',
            subType: 'Document subtype (optional)',
            processingMode: 'AUTOMATIC or MANUAL (default: AUTOMATIC)',
            url: 'URL for web documents (optional)',
            file: 'File upload (for multipart requests)'
          },
          example: {
            name: 'My Document',
            type: 'document',
            subType: 'pdf',
            processingMode: 'AUTOMATIC'
          }
        },
        'GET /documents/{id}': {
          description: 'Get a specific document',
          parameters: {
            id: 'Document ID'
          }
        },
        'PUT /documents/{id}': {
          description: 'Update a document',
          body: {
            name: 'New document name',
            processingMode: 'AUTOMATIC or MANUAL'
          }
        },
        'DELETE /documents/{id}': {
          description: 'Delete a document and all its files'
        },
        'POST /documents/{id}/process': {
          description: 'Trigger document processing',
          body: {
            stage: 'Process specific stage (MARKDOWN_CONVERSION, CHUNKER, INGESTOR)',
            stages: 'Array of stages to process',
            mode: 'Change processing mode and trigger processing'
          }
        },
        'GET /documents/{id}/process': {
          description: 'Get document processing status'
        }
      },
      realms: {
        'GET /realms': {
          description: 'Get your realm information and statistics'
        },
        'PUT /realms': {
          description: 'Update realm settings',
          body: {
            name: 'Realm name',
            description: 'Realm description',
            settings: 'Realm settings object'
          }
        }
      },
      search: {
        'POST /search': {
          description: 'Execute a search query on your realm',
          body: {
            query: 'Search query (required)',
            type: 'Search type: semantic, keyword, hybrid (default: semantic)',
            limit: 'Number of results (default: 10, max: 100)',
            filters: 'Search filters object',
            includeContent: 'Include full content in results (default: false)',
            includeMetadata: 'Include metadata in results (default: true)'
          },
          example: {
            query: 'artificial intelligence',
            type: 'semantic',
            limit: 5,
            includeContent: false
          }
        },
        'GET /search/suggestions': {
          description: 'Get search suggestions',
          parameters: {
            query: 'Partial query for suggestions',
            limit: 'Number of suggestions (default: 5, max: 20)'
          }
        }
      },
      files: {
        'GET /files': {
          description: 'List files for a document',
          parameters: {
            documentId: 'Document ID (required)',
            fileType: 'Filter by file type',
            stage: 'Filter by processing stage'
          }
        },
        'GET /files/{id}': {
          description: 'Get file metadata'
        },
        'GET /files/{id}/download': {
          description: 'Download a file'
        }
      }
    },
    responseFormat: {
      success: {
        description: 'Successful responses include the requested data',
        example: {
          documents: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 100,
            totalPages: 5
          }
        }
      },
      error: {
        description: 'Error responses include an error message',
        example: {
          error: 'Invalid API key'
        }
      }
    },
    statusCodes: {
      200: 'Success',
      201: 'Created',
      400: 'Bad Request - Invalid parameters',
      401: 'Unauthorized - Invalid or missing API key',
      403: 'Forbidden - Access denied',
      404: 'Not Found',
      500: 'Internal Server Error'
    },
    examples: {
      'Upload a document': {
        method: 'POST',
        url: '/documents',
        headers: {
          'Authorization': 'Bearer your-api-key',
          'Content-Type': 'multipart/form-data'
        },
        body: 'FormData with file and metadata'
      },
      'Search documents': {
        method: 'POST',
        url: '/search',
        headers: {
          'Authorization': 'Bearer your-api-key',
          'Content-Type': 'application/json'
        },
        body: {
          query: 'machine learning algorithms',
          type: 'semantic',
          limit: 10
        }
      },
      'Get processing status': {
        method: 'GET',
        url: '/documents/doc-id-123/process',
        headers: {
          'Authorization': 'Bearer your-api-key'
        }
      },
      'Start document processing': {
        method: 'POST',
        url: '/documents/doc-id-123/process',
        headers: {
          'Authorization': 'Bearer your-api-key',
          'Content-Type': 'application/json'
        },
        body: {
          stage: 'MARKDOWN_CONVERSION',
          priority: 5
        }
      },
      'Migrate documents': {
        method: 'POST',
        url: '/documents/migrate',
        headers: {
          'Authorization': 'Bearer your-api-key',
          'Content-Type': 'application/json'
        },
        body: {
          documentIds: ['doc-1', 'doc-2'],
          sourceRealmId: 'realm-1',
          targetRealmId: 'realm-2',
          migrationOptions: {
            migrationMode: 'copy',
            copyStageFiles: true
          }
        }
      }
    },
    rateLimit: {
      description: 'API requests are rate limited per API key',
      limits: {
        requests: '1000 per hour',
        uploads: '100 per hour',
        search: '500 per hour'
      }
    }
  };
  
  return NextResponse.json(documentation, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
