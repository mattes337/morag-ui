import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/openapi
 * OpenAPI 3.0 specification for the Morag API
 * No authentication required - public documentation
 */
export async function GET(request: NextRequest) {
  const baseUrl = new URL(request.url).origin;
  
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Morag API',
      version: '1.0.0',
      description: 'REST API for Morag document processing and knowledge management system',
      contact: {
        name: 'Morag API Support',
        url: `${baseUrl}/api/docs`,
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `${baseUrl}/api`,
        description: 'Production server',
      },
    ],
    security: [
      {
        ApiKeyAuth: [],
      },
      {
        SessionAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
          description: 'API key authentication for automation and external integrations',
        },
        SessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth-token',
          description: 'Session-based authentication for web UI',
        },
      },
      schemas: {
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string' },
            subType: { type: 'string' },
            state: { 
              type: 'string', 
              enum: ['UPLOADED', 'PROCESSING', 'INGESTED', 'FAILED', 'ARCHIVED'] 
            },
            processingMode: { 
              type: 'string', 
              enum: ['AUTOMATIC', 'MANUAL'] 
            },
            uploadDate: { type: 'string', format: 'date-time' },
            chunks: { type: 'integer' },
            quality: { type: 'number' },
            realmId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
          },
          required: ['id', 'name', 'type', 'state', 'realmId', 'userId'],
        },
        Realm: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            userRole: { 
              type: 'string', 
              enum: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] 
            },
          },
          required: ['id', 'name'],
        },
        SearchRequest: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            type: { 
              type: 'string', 
              enum: ['semantic', 'keyword', 'hybrid'],
              default: 'semantic' 
            },
            limit: { 
              type: 'integer', 
              minimum: 1, 
              maximum: 100, 
              default: 10 
            },
            filters: { type: 'object' },
            includeContent: { type: 'boolean', default: false },
            includeMetadata: { type: 'boolean', default: true },
            realmId: { 
              type: 'string', 
              format: 'uuid',
              description: 'Required for session auth, optional for API key auth' 
            },
          },
          required: ['query'],
        },
        SearchResult: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            score: { type: 'number' },
            type: { type: 'string' },
            snippet: { type: 'string' },
            metadata: { type: 'object' },
            content: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' },
          },
          required: ['error'],
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Authentication required' },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Insufficient permissions' },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Resource not found' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { 
                error: 'Validation error', 
                details: { field: 'Field is required' } 
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Internal server error' },
            },
          },
        },
      },
    },
    paths: {
      '/docs': {
        get: {
          summary: 'Get API documentation',
          description: 'Returns human-readable API documentation',
          tags: ['Documentation'],
          security: [],
          responses: {
            '200': {
              description: 'API documentation',
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
          },
        },
      },
      '/openapi': {
        get: {
          summary: 'Get OpenAPI specification',
          description: 'Returns the OpenAPI 3.0 specification for this API',
          tags: ['Documentation'],
          security: [],
          responses: {
            '200': {
              description: 'OpenAPI specification',
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
          },
        },
      },
      '/documents': {
        get: {
          summary: 'List documents',
          description: 'Get a paginated list of documents. API key auth returns documents from associated realm, session auth can specify realmId or get user documents.',
          tags: ['Documents'],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', minimum: 1, default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
              description: 'Items per page',
            },
            {
              name: 'state',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['UPLOADED', 'PROCESSING', 'INGESTED', 'FAILED', 'ARCHIVED']
              },
              description: 'Filter by document state',
            },
            {
              name: 'type',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by document type',
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search query',
            },
            {
              name: 'realmId',
              in: 'query',
              schema: { type: 'string', format: 'uuid' },
              description: 'Realm ID (optional for API key auth, required for session auth without current realm)',
            },
          ],
          responses: {
            '200': {
              description: 'List of documents',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      documents: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Document' },
                      },
                      pagination: { $ref: '#/components/schemas/PaginationInfo' },
                      realm: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                        },
                      },
                      authMethod: { type: 'string', enum: ['session', 'apikey'] },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
        post: {
          summary: 'Create document',
          description: 'Create a new document with JSON metadata or upload a file',
          tags: ['Documents'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Document name' },
                    type: { type: 'string', description: 'Document type (auto-detected if not provided)' },
                    subType: { type: 'string', description: 'Document subtype (auto-detected if not provided)' },
                    processingMode: {
                      type: 'string',
                      enum: ['AUTOMATIC', 'MANUAL'],
                      default: 'AUTOMATIC'
                    },
                    realmId: {
                      type: 'string',
                      format: 'uuid',
                      description: 'Target realm ID (optional for API key auth)'
                    },
                    url: { type: 'string', description: 'URL for web documents' },
                  },
                  required: ['name'],
                },
              },
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary', description: 'File to upload' },
                    name: { type: 'string', description: 'Document name (defaults to filename)' },
                    type: { type: 'string', description: 'Document type (auto-detected if not provided)' },
                    subType: { type: 'string', description: 'Document subtype (auto-detected if not provided)' },
                    processingMode: {
                      type: 'string',
                      enum: ['AUTOMATIC', 'MANUAL'],
                      default: 'AUTOMATIC'
                    },
                    realmId: {
                      type: 'string',
                      format: 'uuid',
                      description: 'Target realm ID (optional for API key auth)'
                    },
                  },
                  required: ['file'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Document created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      document: { $ref: '#/components/schemas/Document' },
                      file: { type: 'object', description: 'File information (for uploads)' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/search': {
        post: {
          summary: 'Search documents',
          description: 'Execute a search query on documents in the realm',
          tags: ['Search'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SearchRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Search results',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      query: { type: 'string' },
                      type: { type: 'string' },
                      results: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/SearchResult' },
                      },
                      total: { type: 'integer' },
                      executionTime: { type: 'number' },
                      realm: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                        },
                      },
                      authMethod: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
        get: {
          summary: 'Get search suggestions',
          description: 'Get search suggestions based on query',
          tags: ['Search'],
          parameters: [
            {
              name: 'query',
              in: 'query',
              schema: { type: 'string' },
              description: 'Partial query for suggestions',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
              description: 'Number of suggestions',
            },
            {
              name: 'realmId',
              in: 'query',
              schema: { type: 'string', format: 'uuid' },
              description: 'Realm ID (optional for API key auth)',
            },
          ],
          responses: {
            '200': {
              description: 'Search suggestions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      query: { type: 'string' },
                      suggestions: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      realmId: { type: 'string' },
                      authMethod: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/realms': {
        get: {
          summary: 'Get realms',
          description: 'API key auth: returns associated realm with statistics. Session auth: returns user realms.',
          tags: ['Realms'],
          responses: {
            '200': {
              description: 'Realm information',
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      {
                        type: 'object',
                        description: 'API key response',
                        properties: {
                          realm: { $ref: '#/components/schemas/Realm' },
                          statistics: { type: 'object' },
                          user: { type: 'object' },
                          authMethod: { type: 'string', enum: ['apikey'] },
                        },
                      },
                      {
                        type: 'object',
                        description: 'Session response',
                        properties: {
                          realms: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Realm' },
                          },
                          authMethod: { type: 'string', enum: ['session'] },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
        post: {
          summary: 'Create realm',
          description: 'Create a new realm (session authentication only)',
          tags: ['Realms'],
          security: [{ SessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    description: { type: 'string' },
                    domain: { type: 'string' },
                  },
                  required: ['name'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Realm created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      realm: { $ref: '#/components/schemas/Realm' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Documentation',
        description: 'API documentation endpoints',
      },
      {
        name: 'Documents',
        description: 'Document management operations',
      },
      {
        name: 'Realms',
        description: 'Realm management operations',
      },
      {
        name: 'Search',
        description: 'Search and discovery operations',
      },
      {
        name: 'Files',
        description: 'File management operations',
      },
      {
        name: 'Processing',
        description: 'Document processing operations',
      },
      {
        name: 'Authentication',
        description: 'Authentication and authorization',
      },
    ],
  };

  return NextResponse.json(openApiSpec);
}
