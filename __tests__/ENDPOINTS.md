# API Endpoints Documentation

This document lists all API endpoints used in the application. The error `Foreign key constraint violated: serverId` occurs because there is no API endpoint to manage database servers, while the database creation requires a valid `serverId`.

## Authentication Endpoints

### GET /api/auth/me
- Description: Get current authenticated user information
- Response: User object or error
- Error cases:
  - 401: Not authenticated
  - 404: User not found

### POST /api/auth/login
- **Description**: Authenticate user and create session
- **Body**: `{ email: string, password: string }`
- **Response**: `{ user: User, token: string }`

### POST /api/auth/logout
- **Description**: Logout user and destroy session
- **Response**: `{ success: boolean }`

### POST /api/auth/register
- **Description**: Register new user account
- **Body**: `{ email: string, password: string, name: string }`
- **Response**: `{ user: User, token: string }`

## Job Management Endpoints

### GET /api/jobs/[id]
- **Description**: Get job by ID with freshness check (updates status from backend if older than 1 hour)
- **Parameters**: `id` (string) - Job ID
- **Response**: `Job` object with potentially updated status
- **Authentication**: Required

### PUT /api/jobs/[id]
- **Description**: Update job progress and status
- **Parameters**: `id` (string) - Job ID
- **Body**: `{ progress?: { percentage: number, summary: string }, status?: JobStatus, processingDetails?: ProcessingDetails }`
- **Response**: `{ success: boolean, job: Job }`

## Realm Endpoints

### GET /api/realms
- Description: Get all realms for authenticated user
- Response: `{ realms: Array<Realm> }`
- Error cases:
  - 401: Authentication required
  - 500: Failed to fetch realms

### POST /api/realms
- Description: Create new realm
- Request body: `{ name: string, description?: string }`
- Response: `{ realm: Realm }`
- Error cases:
  - 400: Validation error (name required, max 100 chars)
  - 401: Authentication required
  - 500: Failed to create realm

### PUT /api/realms/[id]
- Description: Update existing realm
- Request body: `{ name?: string, description?: string }`
- Response: `{ realm: Realm }`
- Error cases:
  - 400: Validation error
  - 401: Authentication required
  - 403: Not authorized to update this realm
  - 404: Realm not found
  - 500: Failed to update realm

### DELETE /api/realms/[id]
- Description: Delete realm
- Response: Success message
- Error cases:
  - 400: Cannot delete default realm
  - 401: Authentication required
  - 403: Not authorized to delete this realm
  - 404: Realm not found
  - 500: Failed to delete realm

## Database Endpoints

### GET /api/databases
- Description: Get all databases for authenticated user
- Response: Array of database objects
- Error cases:
  - 401: Authentication required
  - 500: Failed to fetch databases

### POST /api/databases
- Description: Create new database
- Request body: `{ name: string, description: string, serverId: string, realmId: string }`
- Response: Created database object
- Error cases:
  - 400: Missing required fields
  - 401: Authentication required
  - 500: Foreign key constraint error (when serverId doesn't exist)

### GET /api/databases/[id]
- Description: Get specific database by ID
- Response: Database object
- Error cases:
  - 404: Database not found
  - 500: Failed to fetch database

### PUT /api/databases/[id]
- Description: Update database
- Request body: Database update fields
- Response: Updated database object
- Error cases:
  - 500: Failed to update database

### DELETE /api/databases/[id]
- Description: Delete database
- Response: Success message
- Error cases:
  - 500: Failed to delete database

## Document Endpoints

### GET /api/documents
- Description: Get all documents for authenticated user
- Response: Array of document objects
- Error cases:
  - 401: Authentication required
  - 500: Failed to fetch documents

### POST /api/documents
- Description: Create new document
- Request body: `{ name: string, type: string, databaseId: string }`
- Response: Created document object
- Error cases:
  - 400: Missing required fields
  - 401: Authentication required
  - 500: Failed to create document

### GET /api/documents/[id]
- Description: Get specific document
- Response: Document object
- Error cases:
  - 404: Document not found
  - 500: Failed to fetch document

### POST /api/documents/process
- Description: Process document using MoRAG backend (convert, process, or ingest)
- Request body: FormData with `file`, `realmId`, and optional `mode` ('convert' | 'process' | 'ingest')
- Response: 
  - Convert mode (synchronous): `{ documentId: string, markdown: string, status: 'completed' }`
  - Convert mode (asynchronous): `{ documentId: string, jobId: string, taskId: string, status: 'processing', message: string }`
  - Process/Ingest mode (synchronous): `{ documentId: string, jobId: string, status: 'completed', message: string }`
  - Process/Ingest mode (asynchronous): `{ documentId: string, jobId: string, taskId: string, status: 'processing', message: string }`
- Error cases:
  - 400: File and realmId required, or no database servers configured
  - 401: Authentication required
  - 500: Processing failed
- Notes: Always sends webhook URL for progress updates; stores markdown content in database

### POST /api/documents/batch-process
- Description: Process multiple documents in batch using MoRAG backend
- Request body: FormData with `files[]` and `realmId`
- Response: 
  - Synchronous: `{ batchJobId: string, documentIds: string[], status: 'completed', message: string }`
  - Asynchronous: `{ batchJobId: string, documentIds: string[], taskId: string, status: 'processing', message: string }`
- Error cases:
  - 400: Files and realmId required, or no database servers configured
  - 401: Authentication required
  - 500: Batch processing failed
- Notes: Always sends webhook URL for progress updates; uses unified /api/v1/process endpoint

### POST /api/documents/process-url
- Description: Process URL content using MoRAG backend
- Request body: `{ url: string, realmId: string, mode?: 'convert' | 'process' | 'ingest' }`
- Response: 
  - Convert mode (synchronous): `{ documentId: string, markdown: string, status: 'completed' }`
  - Convert mode (asynchronous): `{ documentId: string, jobId: string, taskId: string, status: 'processing', message: string }`
  - Process/Ingest mode (synchronous): `{ documentId: string, jobId: string, status: 'completed', message: string }`
  - Process/Ingest mode (asynchronous): `{ documentId: string, jobId: string, taskId: string, status: 'processing', message: string }`
- Error cases:
  - 400: URL and realmId required, or no database servers configured
  - 401: Authentication required
  - 500: URL processing failed
- Notes: Always sends webhook URL for progress updates; stores markdown content in database

## Search Endpoints

### POST /api/search/morag
- Description: Search across realms using MoRAG backend
- Request body: `{ query: string, realmIds: string[], limit?: number, threshold?: number, includeMetadata?: boolean }`
- Response: `{ query: string, results: Array, totalResults: number, searchTime: number, realms: string[] }`
- Error cases:
  - 400: Query and realmIds required, or no database servers configured
  - 401: Authentication required
  - 500: Search failed

### GET /api/search/morag
- Description: Search across realms using MoRAG backend (GET version)
- Query params: `query`, `realmIds` (comma-separated), `limit`, `threshold`, `includeMetadata`
- Response: Same as POST version
- Error cases: Same as POST version

## Task Management Endpoints

### GET /api/tasks/[taskId]
- Description: Get status of a MoRAG backend task
- Response: `{ taskId: string, jobId: string, documentId: string, status: string, progress: number, message: string, result?: any }`
- Error cases:
  - 400: Task ID required
  - 401: Authentication required
  - 403: Access denied
  - 404: Task not found
  - 500: Internal server error

### DELETE /api/tasks/[taskId]
- Description: Cancel a MoRAG backend task
- Response: `{ taskId: string, jobId: string, status: string, message: string }`
- Error cases:
  - 400: Task ID required
  - 401: Authentication required
  - 403: Access denied
  - 404: Task not found
  - 500: Failed to cancel task

## Webhook Endpoints

### POST /api/webhooks/morag
- Description: Receive progress updates from MoRAG backend
- Request body: `{ task_id: string, document_id?: string, batch_job_id?: string, timestamp: string, status: 'started' | 'in_progress' | 'completed' | 'failed', progress: { percentage: number, current_step: string }, result?: { content?: string, markdown?: string, chunks?: number }, error?: { message: string, step: string, details?: any } }`
- Response: `{ status: 'success' | 'job_not_found' }`
- Error cases:
  - 400: Invalid payload (missing task_id)
  - 500: Failed to process webhook
- Notes: Updates job progress and document state; stores markdown content when processing completes

## API Key Endpoints

### GET /api/api-keys
- Description: Get all API keys for authenticated user
- Response: Array of API key objects
- Error cases:
  - 401: Authentication required
  - 500: Failed to fetch API keys

### POST /api/api-keys
- Description: Create new API key
- Request body: `{ name: string, key: string }`
- Response: Created API key object
- Error cases:
  - 400: Missing required fields
  - 401: Authentication required
  - 500: Failed to create API key

### DELETE /api/api-keys/[id]
- Description: Delete API key
- Response: Success message
- Error cases:
  - 500: Failed to delete API key

## User Endpoints

### GET /api/users/[email]
- Description: Get user by email
- Response: User object
- Error cases:
  - 404: User not found

## Missing Endpoints

### Database Server Endpoints (Not Implemented)

The following endpoints need to be implemented to fix the foreign key constraint error:

#### GET /api/servers
- Description: Get all database servers for authenticated user
- Response: Array of server objects

#### POST /api/servers
- Description: Create new database server
- Request body: `{ name: string, type: string, host: string, port: number, username?: string, password?: string, apiKey?: string, database?: string, collection?: string }`
- Response: Created server object

#### GET /api/servers/[id]
- Description: Get specific server
- Response: Server object

#### PUT /api/servers/[id]
- Description: Update server
- Request body: Server update fields
- Response: Updated server object

#### DELETE /api/servers/[id]
- Description: Delete server
- Response: Success message