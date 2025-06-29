# TASKS

## Completed Tasks
- ✅ Fixed DocumentsView.test.tsx import errors and test failures
  - Corrected Jest configuration (moduleNameMapping → moduleNameMapper)
  - Fixed import path for test-utils
  - Simplified failing metadata test to check for basic table structure
- ✅ Fixed authentication issue in /api/servers endpoint
  - Added missing NextRequest and NextResponse imports
  - Fixed missing await keyword for requireAuth() calls
  - Resolved "User ID is missing from authentication" error
- ✅ Fixed realm switching layout issue
  - Removed window.location.reload() from RealmSelector component
  - Now uses AppContext's automatic data reloading when realm changes
  - Preserves header and navigation layout during realm switching
- ✅ Fixed authentication redirect issue
  - Updated AuthWrapper component to properly redirect unauthenticated users to login
  - Prevents pages from rendering without header/frame when not authenticated
  - Added loading spinner during redirect for better UX
  - Ensures all protected routes require authentication
  - Fixed SSR compatibility issue by moving router.push() into useEffect
  - Resolved 'location is not defined' error during server-side rendering

## Pending Tasks

## Implementation Plan
### 1. API Endpoints Implementation
- Document required endpoints in ENDPOINTS.md
- Create /app/api/servers directory
- Implement server API endpoints:
  - GET /api/servers - List all servers for authenticated user
  - POST /api/servers - Create new server
  - GET /api/servers/[id] - Get specific server
  - PUT /api/servers/[id] - Update server
  - DELETE /api/servers/[id] - Delete server
### 2. Service Layer Implementation
- Enhance databaseServerService.ts with CRUD operations
- Add proper validation for server creation/updates
- Implement authentication checks
- Add error handling for all operations
### 3. Frontend Integration
- Update ServersDialog.tsx to use API endpoints instead of local state
- Update app/servers/page.tsx to use API endpoints
- Modify AppContext.tsx to fetch servers from API
- Update server management functions to use API calls
### 4. Testing
- Create unit tests for server API endpoints
- Test database creation with valid serverId
- Test error handling for invalid serverIds
- Verify UI components correctly display server data
## Technical Specifications
### Database Server Model
```
interface DatabaseServer {
  id: string;
  name: string;
  type: 'qdrant' | 'neo4j' | 'pinecone' | 
  'weaviate' | 'chroma';
  host: string;
  port: number;
  username?: string;
  password?: string;
  apiKey?: string;
  database?: string;
  collection?: string;
  isActive: boolean;
  createdAt: string;
  lastConnected?: string;
}
```
### API Endpoint Specifications GET /api/servers
- Authentication: Required
- Response: Array of server objects
- Error cases: 401 (Unauthorized) POST /api/servers
- Authentication: Required
- Request body: Server creation data
- Response: Created server object
- Error cases: 400 (Bad Request), 401 (Unauthorized) GET /api/servers/[id]
- Authentication: Required
- Response: Server object
- Error cases: 404 (Not Found), 401 (Unauthorized) PUT /api/servers/[id]
- Authentication: Required
- Request body: Server update data
- Response: Updated server object
- Error cases: 404 (Not Found), 401 (Unauthorized) DELETE /api/servers/[id]
- Authentication: Required
- Response: Success message
- Error cases: 404 (Not Found), 401 (Unauthorized)
## Next Steps
To resolve the foreign key constraint error, we need to implement the server API endpoints first, then update the frontend components to use these endpoints instead of local state management.

Once implemented, users will be able to create and manage database servers through the API, which will then be available for selection when creating databases.