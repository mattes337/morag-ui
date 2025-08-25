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

## Realm User Management Endpoints

### GET /api/realms/[id]/users
- Description: Get all users in a specific realm
- Parameters: `id` (string) - Realm ID
- Response: `{ users: Array<{ id: string, name: string, email: string, avatar?: string, role: RealmRole, createdAt: string, updatedAt: string }> }`
- Error cases:
  - 401: Authentication required
  - 403: Access denied to this realm
  - 500: Failed to fetch realm users

### POST /api/realms/[id]/users
- Description: Add user to realm
- Parameters: `id` (string) - Realm ID
- Request body: `{ email: string, role: RealmRole }`
- Response: `{ user: RealmUser }`
- Error cases:
  - 400: Email and role are required / User already in realm
  - 401: Authentication required
  - 403: Insufficient permissions to add users / Only owners can assign OWNER/ADMIN roles
  - 404: User not found
  - 500: Failed to add user to realm

### PUT /api/realms/[id]/users/[userId]
- Description: Update user role in realm
- Parameters: `id` (string) - Realm ID, `userId` (string) - User ID
- Request body: `{ role: RealmRole }`
- Response: `{ user: RealmUser }`
- Error cases:
  - 400: Role is required / Cannot modify your own role
  - 401: Authentication required
  - 403: Insufficient permissions / Only owners can modify OWNER roles
  - 404: User not found in this realm
  - 500: Failed to update user role

### DELETE /api/realms/[id]/users/[userId]
- Description: Remove user from realm
- Parameters: `id` (string) - Realm ID, `userId` (string) - User ID
- Response: `{ success: boolean }`
- Error cases:
  - 400: Cannot remove yourself / Cannot remove the last owner
  - 401: Authentication required
  - 403: Insufficient permissions / Only owners can remove other owners
  - 404: User not found in this realm
  - 500: Failed to remove user from realm

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
- Description: Create a new document
- Request body: `{ name: string, type?: string, subType?: string, realmId: string, filename?: string, url?: string }`
  - `name`: Document name (required)
  - `type`: Document type (optional, auto-detected if not provided)
  - `subType`: Document subtype (optional, auto-detected if not provided)
  - `realmId`: Realm ID (required)
  - `filename`: Original filename for type detection (optional)
  - `url`: Source URL for type detection (optional)
- Response: Created document object with auto-detected type/subType
- Error cases:
  - 400: Missing required fields (name, realmId)
  - 401: Authentication required
  - 500: Failed to create document

### GET /api/documents/[id]
- Description: Get specific document
- Response: Document object
- Error cases:
  - 404: Document not found
  - 500: Failed to fetch document



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
- Description: Receive step-based progress updates from MoRAG backend (as defined in WEBHOOK_GUIDE.md)
- Request body: `{ task_id: string, document_id?: string, step: string, status: 'started' | 'completed' | 'failed', progress_percent: number, timestamp: string, data?: object, error_message?: string }`
- Response: `{ status: 'success' | 'job_not_found' }`
- Error cases:
  - 400: Invalid payload (missing required fields: task_id, step, status, progress_percent)
  - 400: Invalid progress_percent (must be 0-100)
  - 500: Failed to process webhook
- Notes: Updates job progress and document state based on step completion; handles step-specific data

### POST /api/webhooks/stages
- Description: Receive stage-based and pipeline completion updates from MoRAG backend (as defined in WEBHOOK_GUIDE.md)
- Request body: Stage completed: `{ event: 'stage_completed', timestamp: string, stage: { type: number, status: string, execution_time: number, start_time: string, end_time: string, error_message?: string }, files: { input_files: string[], output_files: string[] }, context: object, metadata: object }` or Pipeline completed: `{ event: 'pipeline_completed', timestamp: string, pipeline: { success: boolean, total_execution_time: number, stages_completed: number, stages_failed: number, stages_skipped: number, error_message?: string }, context: object, stages: array }`
- Response: `{ status: 'success' }`
- Error cases:
  - 400: Invalid payload (missing required fields: event, timestamp)
  - 400: Invalid event type (must be 'stage_completed' or 'pipeline_completed')
  - 500: Failed to process webhook
- Notes: Handles both individual stage completion and full pipeline completion events

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

## Job Scheduler Endpoints

### GET /api/scheduler
- **Description**: Get job scheduler status and statistics
- **Response**: `{ stats: SchedulerStats, config: SchedulerConfig, timestamp: string }`
- **Authentication**: Required
- **Error cases**:
  - 401: Authentication required
  - 500: Failed to get scheduler status

### POST /api/scheduler
- **Description**: Control job scheduler (start/stop/restart/trigger)
- **Body**: `{ action: 'start' | 'stop' | 'restart' | 'trigger' }`
- **Response**: `{ success: boolean, message: string, stats: SchedulerStats }`
- **Authentication**: Required
- **Error cases**:
  - 400: Invalid action
  - 401: Authentication required
  - 500: Failed to control scheduler

### PUT /api/scheduler
- **Description**: Update job scheduler configuration
- **Body**: `{ config: Partial<SchedulerConfig> }`
- **Response**: `{ success: boolean, message: string, config: SchedulerConfig }`
- **Authentication**: Required
- **Error cases**:
  - 400: Invalid configuration
  - 401: Authentication required
  - 500: Failed to update configuration

## Document Processing Endpoints

### GET /api/documents/[id]/processing
- **Description**: Get document processing status and jobs
- **Parameters**: `id` (string) - Document ID
- **Response**: `{ documentId: string, processingMode: string, currentStage: string, stageStatus: string, isProcessingPaused: boolean, jobs: Job[], recentJobs: Job[] }`
- **Authentication**: Required
- **Error cases**:
  - 400: Document ID required
  - 401: Authentication required
  - 404: Document not found
  - 500: Failed to get processing status

### PUT /api/documents/[id]/processing
- **Description**: Update document processing mode or control processing
- **Parameters**: `id` (string) - Document ID
- **Body**: `{ processingMode?: 'MANUAL' | 'AUTOMATIC', action?: 'pause' | 'resume' | 'cancel' | 'schedule', stage?: string, priority?: number }`
- **Response**: `{ success: boolean, message: string, document: Document, recentJobs: Job[] }`
- **Authentication**: Required
- **Error cases**:
  - 400: Invalid parameters
  - 401: Authentication required
  - 404: Document not found
  - 500: Failed to update processing

### POST /api/documents/[id]/processing
- **Description**: Execute a specific stage for the document
- **Parameters**: `id` (string) - Document ID
- **Body**: `{ stage: string, priority?: number, scheduledAt?: string }`
- **Response**: `{ success: boolean, message: string, jobId: string, documentId: string, stage: string, priority: number, scheduledAt: string }`
- **Authentication**: Required
- **Error cases**:
  - 400: Stage required
  - 401: Authentication required
  - 404: Document not found
  - 500: Failed to schedule processing

## Processing Jobs Endpoints

### GET /api/processing-jobs
- **Description**: Get processing jobs with optional filtering
- **Query Parameters**: 
  - `documentId` (optional): Filter by document ID
  - `status` (optional): Filter by job status
  - `stage` (optional): Filter by processing stage
  - `limit` (optional): Number of jobs to return (max 100, default 50)
  - `offset` (optional): Pagination offset (default 0)
- **Response**: `{ jobs: Job[], stats: JobStats, pagination: PaginationInfo }`
- **Authentication**: Required
- **Error cases**:
  - 401: Authentication required
  - 500: Failed to get jobs

### POST /api/processing-jobs
- **Description**: Create a new processing job
- **Body**: `{ documentId: string, stage: string, priority?: number, scheduledAt?: string }`
- **Response**: `{ success: boolean, message: string, job: Job }`
- **Authentication**: Required
- **Error cases**:
  - 400: Invalid parameters or stage
  - 401: Authentication required
  - 404: Document not found
  - 500: Failed to create job

### DELETE /api/processing-jobs
- **Description**: Cancel multiple processing jobs
- **Body**: `{ jobIds?: string[], documentId?: string }`
- **Response**: `{ success: boolean, message: string, cancelledCount: number }`
- **Authentication**: Required
- **Error cases**:
  - 400: Either jobIds or documentId required
  - 401: Authentication required
  - 500: Failed to cancel jobs

### GET /api/processing-jobs/[id]
- **Description**: Get a specific processing job by ID
- **Parameters**: `id` (string) - Job ID
- **Response**: `{ job: Job }`
- **Authentication**: Required
- **Error cases**:
  - 400: Job ID required
  - 401: Authentication required
  - 404: Job not found
  - 500: Failed to get job

### PUT /api/processing-jobs/[id]
- **Description**: Update a processing job (retry, cancel, reschedule, update priority)
- **Parameters**: `id` (string) - Job ID
- **Body**: `{ action: 'cancel' | 'retry' | 'reschedule' | 'update_priority', priority?: number, scheduledAt?: string }`
- **Response**: `{ success: boolean, message: string, job: Job, [additional fields based on action] }`
- **Authentication**: Required
- **Error cases**:
  - 400: Invalid action or missing required fields
  - 401: Authentication required
  - 404: Job not found
  - 500: Failed to update job

### DELETE /api/processing-jobs/[id]
- **Description**: Cancel a specific processing job
- **Parameters**: `id` (string) - Job ID
- **Response**: `{ success: boolean, message: string, jobId: string }`
- **Authentication**: Required
- **Error cases**:
  - 400: Job ID required
  - 401: Authentication required
  - 404: Job not found
  - 500: Failed to cancel job

## User Endpoints

### GET /api/users/[email]
- Description: Get user by email
- Response: User object
- Error cases:
  - 404: User not found

## Document Migration Endpoints

### POST /api/migrations
- **Description**: Create new document migration between realms
- **Request body**: `{ documentIds: string[], sourceRealmId: string, targetRealmId: string, migrationOptions: MigrationOptions }`
- **Response**: `{ success: boolean, migration: Migration }`
- **Authentication**: Required
- **Error cases**:
  - 400: Validation failed / Source and target realms must be different
  - 401: Authentication required
  - 500: Failed to create migration

### GET /api/migrations
- **Description**: Get user's migrations with optional filtering
- **Query parameters**: 
  - `realmId` (optional): Filter by realm ID
  - `status` (optional): Filter by migration status (PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
  - `limit` (optional): Maximum number of results (1-100, default varies)
  - `offset` (optional): Number of results to skip (default 0)
- **Response**: `{ success: boolean, migrations: Migration[] }`
- **Authentication**: Required
- **Error cases**:
  - 400: Invalid query parameters
  - 401: Authentication required
  - 500: Failed to fetch migrations

### GET /api/migrations/[id]
- **Description**: Get specific migration details
- **Parameters**: `id` (string) - Migration ID (UUID format)
- **Response**: `{ success: boolean, migration: Migration }`
- **Authentication**: Required
- **Error cases**:
  - 400: Invalid migration ID format
  - 401: Authentication required
  - 404: Migration not found
  - 500: Failed to fetch migration

### DELETE /api/migrations/[id]
- **Description**: Cancel ongoing migration
- **Parameters**: `id` (string) - Migration ID (UUID format)
- **Response**: `{ success: boolean, message: string }`
- **Authentication**: Required
- **Error cases**:
  - 400: Invalid migration ID format
  - 401: Authentication required
  - 404: Migration not found or cannot be cancelled
  - 500: Failed to cancel migration

### GET /api/migrations/[id]/progress
- **Description**: Get real-time migration progress
- **Parameters**: `id` (string) - Migration ID (UUID format)
- **Response**: `{ success: boolean, progress: MigrationProgress }`
- **Authentication**: Required
- **Error cases**:
  - 400: Invalid migration ID format
  - 401: Authentication required
  - 404: Migration not found
  - 500: Failed to fetch migration progress

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