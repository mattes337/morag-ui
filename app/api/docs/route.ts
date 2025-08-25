import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/docs
 * API Documentation
 * No authentication required - public documentation
 */
export async function GET(request: NextRequest) {
  const baseUrl = new URL(request.url).origin;
  
  const documentation = {
    title: 'Morag API',
    version: '1.0.0',
    description: 'REST API for Morag document processing and knowledge management system',
    baseUrl: `${baseUrl}/api`,
    authentication: {
      methods: [
        {
          type: 'API Key',
          header: 'Authorization',
          format: 'Bearer <api-key>',
          description: 'Include your API key in the Authorization header for automation',
          usage: 'Recommended for automation, scripts, and external integrations'
        },
        {
          type: 'Session',
          method: 'Cookie-based',
          description: 'Session authentication via login for web UI',
          usage: 'Used by the web interface'
        }
      ],
      note: 'All endpoints support both authentication methods. API key authentication provides realm context automatically.'
    },
    endpoints: {
      documents: {
        'GET /documents': {
          description: 'List documents in your realm',
          authentication: 'Both API key and session supported',
          parameters: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 20, max: 100)',
            state: 'Filter by document state (UPLOADED, PROCESSING, INGESTED, FAILED, ARCHIVED)',
            type: 'Filter by document type',
            search: 'Search query',
            realmId: 'Specific realm ID (optional for API key auth, required for session auth without current realm)'
          },
          response: {
            documents: 'Array of document objects',
            pagination: 'Pagination information',
            realm: 'Current realm information',
            authMethod: 'Authentication method used'
          },
          example: `${baseUrl}/api/documents?page=1&limit=10&state=INGESTED`
        },
        'POST /documents': {
          description: 'Create a new document (JSON) or upload a file (multipart)',
          authentication: 'Both API key and session supported',
          contentTypes: ['application/json', 'multipart/form-data'],
          body: {
            json: {
              name: 'Document name (required)',
              type: 'Document type (auto-detected if not provided)',
              subType: 'Document subtype (auto-detected if not provided)',
              processingMode: 'AUTOMATIC or MANUAL (default: AUTOMATIC)',
              realmId: 'Target realm ID (optional for API key auth)',
              url: 'URL for web documents'
            },
            multipart: {
              file: 'File to upload (required)',
              name: 'Document name (defaults to filename)',
              type: 'Document type (auto-detected if not provided)',
              subType: 'Document subtype (auto-detected if not provided)',
              processingMode: 'AUTOMATIC or MANUAL (default: AUTOMATIC)',
              realmId: 'Target realm ID (optional for API key auth)'
            }
          }
        },
        'GET /documents/{id}': {
          description: 'Get specific document details',
          authentication: 'Both API key and session supported'
        },
        'PUT /documents/{id}': {
          description: 'Update document metadata',
          authentication: 'Both API key and session supported'
        },
        'DELETE /documents/{id}': {
          description: 'Delete a document and all its files',
          authentication: 'Both API key and session supported'
        }
      },
      realms: {
        'GET /realms': {
          description: 'Get realm information and statistics',
          authentication: 'API key: returns associated realm, Session: returns user realms'
        },
        'POST /realms': {
          description: 'Create a new realm',
          authentication: 'Session authentication required'
        }
      },
      search: {
        'POST /search': {
          description: 'Execute a search query on your realm',
          authentication: 'Both API key and session supported',
          body: {
            query: 'Search query (required)',
            type: 'Search type: semantic, keyword, hybrid (default: semantic)',
            limit: 'Number of results (default: 10, max: 100)',
            filters: 'Search filters object',
            includeContent: 'Include full content in results (default: false)',
            includeMetadata: 'Include metadata in results (default: true)'
          }
        }
      }
    },
    examples: {
      'Upload a document with API key': {
        method: 'POST',
        url: '/documents',
        headers: {
          'Authorization': 'Bearer your-api-key',
          'Content-Type': 'multipart/form-data'
        },
        body: 'FormData with file and metadata'
      },
      'Search documents with session': {
        method: 'POST',
        url: '/search',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'auth-token=...'
        },
        body: {
          query: 'machine learning algorithms',
          type: 'semantic',
          limit: 10
        }
      },
      'List documents with API key': {
        method: 'GET',
        url: '/documents?page=1&limit=20&state=INGESTED',
        headers: {
          'Authorization': 'Bearer your-api-key'
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
    },
    migration: {
      description: 'Migration from v1 endpoints',
      note: 'All v1 endpoints have been consolidated into the main API. Update your integrations to use /api/ instead of /api/v1/',
      changes: [
        'All endpoints now support both API key and session authentication',
        'Improved pagination and filtering for document endpoints',
        'Enhanced error handling and response formats',
        'Unified authentication across all endpoints'
      ]
    }
  };

  return NextResponse.json(documentation);
}
