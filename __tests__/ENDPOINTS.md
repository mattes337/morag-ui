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
- Description: Authenticate user
- Request body: `{ email: string, password: string }`
- Response: Authentication token
- Error cases:
  - 400: Email and password required
  - 401: Invalid credentials

### POST /api/auth/logout
- Description: Log out user
- Response: Success message

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
- Request body: `{ name: string, description: string, serverId: string }`
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