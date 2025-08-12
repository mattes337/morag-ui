# Phase 3: Realm APIs Implementation

## Overview

Implement comprehensive REST API endpoints for realm management, including CRUD operations, realm switching, and integration with the existing authentication system. All APIs must respect realm boundaries and ensure complete data isolation.

## API Design Principles

### Security
- All endpoints require authentication
- Users can only access their own realms
- Realm ownership validation on every operation
- Complete data isolation between realms

### Consistency
- RESTful API design patterns
- Consistent error handling
- Standardized response formats
- Proper HTTP status codes

### Performance
- Efficient database queries with realm filtering
- Proper indexing for realm-based operations
- Caching where appropriate
- Pagination for large datasets

## API Endpoints Overview

### Realm Management
- `GET /api/realms` - List user's realms
- `POST /api/realms` - Create new realm
- `GET /api/realms/[id]` - Get specific realm
- `PUT /api/realms/[id]` - Update realm
- `DELETE /api/realms/[id]` - Delete realm
- `GET /api/realms/[id]/stats` - Get realm statistics

### Realm Context
- `POST /api/realms/switch` - Switch current realm
- `GET /api/realms/current` - Get current realm

## Implementation Steps

### Step 1: Create Realm API Endpoints

#### 1.1 Create Realm List Endpoint
Create `app/api/realms/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth';
import { RealmService } from '../../../lib/services/realmService';
import { CreateRealmData } from '../../../types';

// GET /api/realms - List user's realms
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        
        const realms = await RealmService.getUserRealms(user.userId);
        
        return NextResponse.json({
            realms,
            total: realms.length
        });
    } catch (error) {
        console.error('Get realms error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/realms - Create new realm
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        
        // Validate request body
        const { name, description } = body as CreateRealmData;
        
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Realm name is required' },
                { status: 400 }
            );
        }
        
        if (name.trim().length > 100) {
            return NextResponse.json(
                { error: 'Realm name must be 100 characters or less' },
                { status: 400 }
            );
        }
        
        if (description && description.length > 500) {
            return NextResponse.json(
                { error: 'Description must be 500 characters or less' },
                { status: 400 }
            );
        }
        
        const realm = await RealmService.createRealm(user.userId, {
            name: name.trim(),
            description: description?.trim() || undefined
        });
        
        return NextResponse.json(
            { realm },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create realm error:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Authentication required') {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }
            
            if (error.message === 'Realm name already exists') {
                return NextResponse.json(
                    { error: 'Realm name already exists' },
                    { status: 409 }
                );
            }
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 1.2 Create Individual Realm Endpoint
Create `app/api/realms/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { RealmService } from '../../../../lib/services/realmService';
import { UpdateRealmData } from '../../../../types';

// GET /api/realms/[id] - Get specific realm
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth(request);
        const realmId = params.id;
        
        if (!realmId) {
            return NextResponse.json(
                { error: 'Realm ID is required' },
                { status: 400 }
            );
        }
        
        const realm = await RealmService.getRealmById(realmId, user.userId);
        
        if (!realm) {
            return NextResponse.json(
                { error: 'Realm not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({ realm });
    } catch (error) {
        console.error('Get realm error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/realms/[id] - Update realm
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth(request);
        const realmId = params.id;
        const body = await request.json();
        
        if (!realmId) {
            return NextResponse.json(
                { error: 'Realm ID is required' },
                { status: 400 }
            );
        }
        
        // Validate request body
        const { name, description, isActive } = body as UpdateRealmData;
        
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return NextResponse.json(
                    { error: 'Realm name must be a non-empty string' },
                    { status: 400 }
                );
            }
            
            if (name.trim().length > 100) {
                return NextResponse.json(
                    { error: 'Realm name must be 100 characters or less' },
                    { status: 400 }
                );
            }
        }
        
        if (description !== undefined && description.length > 500) {
            return NextResponse.json(
                { error: 'Description must be 500 characters or less' },
                { status: 400 }
            );
        }
        
        const updateData: UpdateRealmData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim() || undefined;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const realm = await RealmService.updateRealm(realmId, user.userId, updateData);
        
        return NextResponse.json({ realm });
    } catch (error) {
        console.error('Update realm error:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Authentication required') {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }
            
            if (error.message === 'Realm not found') {
                return NextResponse.json(
                    { error: 'Realm not found' },
                    { status: 404 }
                );
            }
            
            if (error.message === 'Realm name already exists') {
                return NextResponse.json(
                    { error: 'Realm name already exists' },
                    { status: 409 }
                );
            }
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/realms/[id] - Delete realm
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth(request);
        const realmId = params.id;
        
        if (!realmId) {
            return NextResponse.json(
                { error: 'Realm ID is required' },
                { status: 400 }
            );
        }
        
        await RealmService.deleteRealm(realmId, user.userId);
        
        return NextResponse.json(
            { message: 'Realm deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete realm error:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Authentication required') {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }
            
            if (error.message === 'Realm not found') {
                return NextResponse.json(
                    { error: 'Realm not found' },
                    { status: 404 }
                );
            }
            
            if (error.message === 'Cannot delete default realm') {
                return NextResponse.json(
                    { error: 'Cannot delete default realm' },
                    { status: 400 }
                );
            }
            
            if (error.message === 'Cannot delete realm with existing data') {
                return NextResponse.json(
                    { error: 'Cannot delete realm with existing data' },
                    { status: 400 }
                );
            }
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 1.3 Create Realm Statistics Endpoint
Create `app/api/realms/[id]/stats/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { RealmService } from '../../../../../lib/services/realmService';

// GET /api/realms/[id]/stats - Get realm statistics
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth(request);
        const realmId = params.id;
        
        if (!realmId) {
            return NextResponse.json(
                { error: 'Realm ID is required' },
                { status: 400 }
            );
        }
        
        const stats = await RealmService.getRealmStats(realmId, user.userId);
        
        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Get realm stats error:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Authentication required') {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }
            
            if (error.message === 'Realm not found') {
                return NextResponse.json(
                    { error: 'Realm not found' },
                    { status: 404 }
                );
            }
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

### Step 2: Create Realm Context Endpoints

#### 2.1 Create Realm Switch Endpoint
Create `app/api/realms/switch/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { RealmService } from '../../../../lib/services/realmService';

// POST /api/realms/switch - Switch current realm
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        
        const { realmId } = body;
        
        if (!realmId || typeof realmId !== 'string') {
            return NextResponse.json(
                { error: 'Realm ID is required' },
                { status: 400 }
            );
        }
        
        // Verify realm belongs to user
        const realm = await RealmService.getRealmById(realmId, user.userId);
        
        if (!realm) {
            return NextResponse.json(
                { error: 'Realm not found' },
                { status: 404 }
            );
        }
        
        // Set current realm in session/cookie
        const response = NextResponse.json({
            message: 'Realm switched successfully',
            currentRealm: realm
        });
        
        // Store current realm in cookie
        response.cookies.set('current-realm', realmId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400 * 30 // 30 days
        });
        
        return response;
    } catch (error) {
        console.error('Switch realm error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 2.2 Create Current Realm Endpoint
Create `app/api/realms/current/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { RealmService } from '../../../../lib/services/realmService';

// GET /api/realms/current - Get current realm
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        
        // Get current realm from cookie
        const currentRealmId = request.cookies.get('current-realm')?.value;
        
        let currentRealm = null;
        
        if (currentRealmId) {
            // Verify realm still exists and belongs to user
            currentRealm = await RealmService.getRealmById(currentRealmId, user.userId);
        }
        
        // If no current realm or invalid realm, get default realm
        if (!currentRealm) {
            currentRealm = await RealmService.getDefaultRealm(user.userId);
            
            // If no default realm exists, create one
            if (!currentRealm) {
                currentRealm = await RealmService.createDefaultRealm(user.userId);
            }
        }
        
        const response = NextResponse.json({ currentRealm });
        
        // Update cookie with current realm
        if (currentRealm) {
            response.cookies.set('current-realm', currentRealm.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 86400 * 30 // 30 days
            });
        }
        
        return response;
    } catch (error) {
        console.error('Get current realm error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

### Step 3: Create Realm Context Helper

#### 3.1 Create Realm Context Utility
Create `lib/realm-context.ts`:

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from './auth';
import { RealmService } from './services/realmService';
import { Realm } from '../types';

export interface RealmContext {
    user: {
        userId: string;
        email: string;
        role: string;
        name: string;
        authMethod: 'jwt' | 'header';
    };
    realm: Realm;
}

// Get current realm context for authenticated user
export async function getRealmContext(request: NextRequest): Promise<RealmContext> {
    const user = await requireAuth(request);
    
    // Get current realm from cookie
    const currentRealmId = request.cookies.get('current-realm')?.value;
    
    let currentRealm = null;
    
    if (currentRealmId) {
        // Verify realm still exists and belongs to user
        currentRealm = await RealmService.getRealmById(currentRealmId, user.userId);
    }
    
    // If no current realm or invalid realm, get default realm
    if (!currentRealm) {
        currentRealm = await RealmService.getDefaultRealm(user.userId);
        
        // If no default realm exists, create one
        if (!currentRealm) {
            currentRealm = await RealmService.createDefaultRealm(user.userId);
        }
    }
    
    return {
        user,
        realm: currentRealm
    };
}

// Validate that a resource belongs to the current realm
export function validateRealmAccess(resourceRealmId: string, currentRealmId: string): void {
    if (resourceRealmId !== currentRealmId) {
        throw new Error('Access denied: Resource belongs to different realm');
    }
}
```

### Step 4: Update Existing APIs for Realm Support

#### 4.1 Update Database API
Modify `app/api/databases/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getRealmContext } from '../../../lib/realm-context';
import { DatabaseService } from '../../../lib/services/databaseService';

// GET /api/databases - List databases in current realm
export async function GET(request: NextRequest) {
    try {
        const { user, realm } = await getRealmContext(request);
        
        const databases = await DatabaseService.getDatabasesByRealm(realm.id);
        
        return NextResponse.json({
            databases,
            total: databases.length,
            realm: {
                id: realm.id,
                name: realm.name
            }
        });
    } catch (error) {
        console.error('Get databases error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/databases - Create database in current realm
export async function POST(request: NextRequest) {
    try {
        const { user, realm } = await getRealmContext(request);
        const body = await request.json();
        
        const { name, description, serverId } = body;
        
        // Validate server belongs to current realm
        const server = await ServerService.getServerById(serverId);
        if (!server || server.realmId !== realm.id) {
            return NextResponse.json(
                { error: 'Server not found in current realm' },
                { status: 400 }
            );
        }
        
        const database = await DatabaseService.createDatabase({
            name,
            description,
            serverId,
            userId: user.userId,
            realmId: realm.id
        });
        
        return NextResponse.json(
            { database },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create database error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 4.2 Update Database Service
Modify `lib/services/databaseService.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { Database } from '../../types';

const prisma = new PrismaClient();

export class DatabaseService {
    // Get databases by realm
    static async getDatabasesByRealm(realmId: string): Promise<Database[]> {
        return await prisma.database.findMany({
            where: {
                realmId,
            },
            include: {
                server: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    
    // Get database by ID with realm validation
    static async getDatabaseById(databaseId: string, realmId: string): Promise<Database | null> {
        return await prisma.database.findFirst({
            where: {
                id: databaseId,
                realmId,
            },
            include: {
                server: true,
            },
        });
    }
    
    // Create database with realm
    static async createDatabase(data: {
        name: string;
        description: string;
        serverId: string;
        userId: string;
        realmId: string;
    }): Promise<Database> {
        return await prisma.database.create({
            data,
            include: {
                server: true,
            },
        });
    }
    
    // Update database with realm validation
    static async updateDatabase(
        databaseId: string,
        realmId: string,
        data: Partial<Database>
    ): Promise<Database> {
        // Verify database belongs to realm
        const existing = await this.getDatabaseById(databaseId, realmId);
        if (!existing) {
            throw new Error('Database not found in current realm');
        }
        
        return await prisma.database.update({
            where: { id: databaseId },
            data,
            include: {
                server: true,
            },
        });
    }
    
    // Delete database with realm validation
    static async deleteDatabase(databaseId: string, realmId: string): Promise<void> {
        // Verify database belongs to realm
        const existing = await this.getDatabaseById(databaseId, realmId);
        if (!existing) {
            throw new Error('Database not found in current realm');
        }
        
        await prisma.database.delete({
            where: { id: databaseId },
        });
    }
}
```

## Testing Requirements

### Unit Tests
1. **Realm API Tests**
   - Test all CRUD operations
   - Test realm switching
   - Test current realm detection
   - Test error scenarios

2. **Realm Context Tests**
   - Test realm context extraction
   - Test realm validation
   - Test default realm creation

3. **Service Integration Tests**
   - Test realm filtering in all services
   - Test cross-realm access prevention
   - Test data isolation

### Integration Tests
1. **End-to-End API Tests**
   - Complete realm management workflows
   - Realm switching scenarios
   - Data access validation

2. **Security Tests**
   - Cross-realm access attempts
   - Unauthorized realm operations
   - Data leakage prevention

### API Testing Scenarios

#### Realm Management
```bash
# List realms
curl -X GET http://localhost:3000/api/realms \
  -H "Cookie: auth-token=..."

# Create realm
curl -X POST http://localhost:3000/api/realms \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=..." \
  -d '{"name":"Development","description":"Dev environment"}'

# Switch realm
curl -X POST http://localhost:3000/api/realms/switch \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=..." \
  -d '{"realmId":"realm-id-here"}'

# Get current realm
curl -X GET http://localhost:3000/api/realms/current \
  -H "Cookie: auth-token=..."
```

## Error Handling Standards

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate names)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Scenarios
1. **Authentication Errors**
   - Missing or invalid auth token
   - Expired session

2. **Authorization Errors**
   - Access to other user's realms
   - Cross-realm data access

3. **Validation Errors**
   - Invalid realm names
   - Missing required fields
   - Data type mismatches

4. **Business Logic Errors**
   - Duplicate realm names
   - Deleting default realm
   - Deleting realm with data

## Performance Optimization

### Database Queries
- Use proper indexes for realm-based filtering
- Implement query result caching
- Optimize N+1 query problems
- Use database connection pooling

### API Response Optimization
- Implement response compression
- Use appropriate cache headers
- Minimize response payload size
- Implement pagination for large datasets

### Caching Strategy
```typescript
// Example caching for realm data
const CACHE_TTL = 300; // 5 minutes

class CachedRealmService {
    private static cache = new Map();
    
    static async getUserRealms(userId: string) {
        const cacheKey = `user-realms:${userId}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_TTL * 1000) {
            return cached.data;
        }
        
        const realms = await RealmService.getUserRealms(userId);
        this.cache.set(cacheKey, {
            data: realms,
            timestamp: Date.now()
        });
        
        return realms;
    }
    
    static invalidateUserCache(userId: string) {
        this.cache.delete(`user-realms:${userId}`);
    }
}
```

## Security Considerations

### Data Isolation
- All queries must include realm filtering
- Validate realm ownership on every operation
- Prevent cross-realm data leakage
- Audit realm access patterns

### API Security
- Rate limiting on realm operations
- Input validation and sanitization
- SQL injection prevention
- Proper error message handling

### Session Management
- Secure realm context storage
- Session invalidation on realm changes
- Proper cookie security settings

## Documentation Updates

### API Documentation
Update `__tests__/ENDPOINTS.md`:

```markdown
## Realm Management

### GET /api/realms
List all realms for authenticated user

**Response:**
```json
{
  "realms": [
    {
      "id": "realm-id",
      "name": "Default",
      "description": "Default workspace",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### POST /api/realms
Create new realm

**Request:**
```json
{
  "name": "Development",
  "description": "Development environment"
}
```

### POST /api/realms/switch
Switch current realm context

**Request:**
```json
{
  "realmId": "realm-id-here"
}
```
```

## Deployment Checklist

- [ ] All API endpoints implemented
- [ ] Realm context helper created
- [ ] Existing APIs updated for realm support
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Security measures in place
- [ ] Performance optimizations applied
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] API endpoints documented

## Next Phase

Once Phase 3 is complete and all realm APIs are functional, proceed to **Phase 4: Frontend Integration** to implement the user interface components for realm management and switching.