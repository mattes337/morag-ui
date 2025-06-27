# Phase 5: Data Filtering Implementation

## Overview

Implement comprehensive realm-based data filtering across all existing APIs, services, and database operations. This phase ensures complete data isolation between realms and updates all existing functionality to respect realm boundaries.

## Data Isolation Principles

### Complete Separation
- All data queries must include realm filtering
- No cross-realm data access allowed
- Strict validation of realm ownership
- Audit trail for realm-based operations

### Performance Considerations
- Efficient database indexing for realm queries
- Optimized query patterns
- Minimal performance impact
- Proper caching strategies

### Security Requirements
- Prevent data leakage between realms
- Validate realm access on every operation
- Secure realm context handling
- Comprehensive access logging

## Implementation Strategy

### Database Layer Updates
1. Add realm filtering to all Prisma queries
2. Update database indexes for optimal performance
3. Implement realm validation middleware
4. Create realm-aware service methods

### API Layer Updates
1. Update all existing API endpoints
2. Add realm context to request handling
3. Implement consistent error responses
4. Add realm-based pagination

### Service Layer Updates
1. Modify all service classes for realm support
2. Add realm validation to business logic
3. Update data access patterns
4. Implement realm-aware caching

## Implementation Steps

### Step 1: Update Database Indexes

#### 1.1 Add Realm Indexes to Prisma Schema
Update `prisma/schema.prisma`:

```prisma
model Database {
  id          String   @id @default(cuid())
  name        String
  description String?
  serverId    String
  userId      String
  realmId     String   // Added in Phase 2
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  server DatabaseServer @relation(fields: [serverId], references: [id], onDelete: Cascade)
  user   User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm  Realm          @relation(fields: [realmId], references: [id], onDelete: Cascade)

  @@index([realmId]) // Performance index for realm filtering
  @@index([userId, realmId]) // Composite index for user + realm queries
  @@unique([name, realmId]) // Unique name within realm
  @@map("databases")
}

model Document {
  id          String        @id @default(cuid())
  title       String
  content     String?
  state       DocumentState @default(DRAFT)
  userId      String
  realmId     String        // Added in Phase 2
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm Realm @relation(fields: [realmId], references: [id], onDelete: Cascade)

  @@index([realmId])
  @@index([userId, realmId])
  @@index([realmId, state]) // For filtering by state within realm
  @@map("documents")
}

model ApiKey {
  id          String   @id @default(cuid())
  name        String
  key         String   @unique
  description String?
  isActive    Boolean  @default(true)
  userId      String
  realmId     String   // Added in Phase 2
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastUsed    DateTime?

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm Realm @relation(fields: [realmId], references: [id], onDelete: Cascade)

  @@index([realmId])
  @@index([userId, realmId])
  @@index([realmId, isActive]) // For filtering active keys within realm
  @@map("api_keys")
}

model DatabaseServer {
  id          String       @id @default(cuid())
  name        String
  host        String
  port        Int
  type        DatabaseType
  description String?
  isActive    Boolean      @default(true)
  userId      String
  realmId     String       // Added in Phase 2
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  databases Database[]
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm     Realm        @relation(fields: [realmId], references: [id], onDelete: Cascade)

  @@index([realmId])
  @@index([userId, realmId])
  @@index([realmId, isActive])
  @@unique([name, realmId]) // Unique name within realm
  @@map("database_servers")
}

model Job {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      JobStatus @default(PENDING)
  result      String?
  userId      String
  realmId     String    // Added in Phase 2
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  startedAt   DateTime?
  completedAt DateTime?

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm Realm @relation(fields: [realmId], references: [id], onDelete: Cascade)

  @@index([realmId])
  @@index([userId, realmId])
  @@index([realmId, status]) // For filtering by status within realm
  @@index([realmId, createdAt]) // For chronological ordering within realm
  @@map("jobs")
}
```

#### 1.2 Create Migration for Indexes
Create `prisma/migrations/add_realm_indexes.sql`:

```sql
-- Add performance indexes for realm-based queries
CREATE INDEX IF NOT EXISTS "databases_realmId_idx" ON "databases"("realmId");
CREATE INDEX IF NOT EXISTS "databases_userId_realmId_idx" ON "databases"("userId", "realmId");

CREATE INDEX IF NOT EXISTS "documents_realmId_idx" ON "documents"("realmId");
CREATE INDEX IF NOT EXISTS "documents_userId_realmId_idx" ON "documents"("userId", "realmId");
CREATE INDEX IF NOT EXISTS "documents_realmId_state_idx" ON "documents"("realmId", "state");

CREATE INDEX IF NOT EXISTS "api_keys_realmId_idx" ON "api_keys"("realmId");
CREATE INDEX IF NOT EXISTS "api_keys_userId_realmId_idx" ON "api_keys"("userId", "realmId");
CREATE INDEX IF NOT EXISTS "api_keys_realmId_isActive_idx" ON "api_keys"("realmId", "isActive");

CREATE INDEX IF NOT EXISTS "database_servers_realmId_idx" ON "database_servers"("realmId");
CREATE INDEX IF NOT EXISTS "database_servers_userId_realmId_idx" ON "database_servers"("userId", "realmId");
CREATE INDEX IF NOT EXISTS "database_servers_realmId_isActive_idx" ON "database_servers"("realmId", "isActive");

CREATE INDEX IF NOT EXISTS "jobs_realmId_idx" ON "jobs"("realmId");
CREATE INDEX IF NOT EXISTS "jobs_userId_realmId_idx" ON "jobs"("userId", "realmId");
CREATE INDEX IF NOT EXISTS "jobs_realmId_status_idx" ON "jobs"("realmId", "status");
CREATE INDEX IF NOT EXISTS "jobs_realmId_createdAt_idx" ON "jobs"("realmId", "createdAt");
```

### Step 2: Update Service Classes

#### 2.1 Update Database Service
Modify `lib/services/databaseService.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { Database, CreateDatabaseData, UpdateDatabaseData } from '../../types';

const prisma = new PrismaClient();

export class DatabaseService {
    // Get all databases for a specific realm
    static async getDatabasesByRealm(realmId: string): Promise<Database[]> {
        return await prisma.database.findMany({
            where: {
                realmId,
            },
            include: {
                server: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Create database with realm association
    static async createDatabase(data: CreateDatabaseData & { realmId: string }): Promise<Database> {
        // Validate server belongs to the same realm
        const server = await prisma.databaseServer.findFirst({
            where: {
                id: data.serverId,
                realmId: data.realmId,
            },
        });

        if (!server) {
            throw new Error('Server not found in the specified realm');
        }

        return await prisma.database.create({
            data: {
                name: data.name,
                description: data.description,
                serverId: data.serverId,
                userId: data.userId,
                realmId: data.realmId,
            },
            include: {
                server: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Update database with realm validation
    static async updateDatabase(
        databaseId: string,
        realmId: string,
        data: UpdateDatabaseData
    ): Promise<Database> {
        // Verify database exists in realm
        const existing = await this.getDatabaseById(databaseId, realmId);
        if (!existing) {
            throw new Error('Database not found in the specified realm');
        }

        // If serverId is being updated, validate new server belongs to realm
        if (data.serverId) {
            const server = await prisma.databaseServer.findFirst({
                where: {
                    id: data.serverId,
                    realmId,
                },
            });

            if (!server) {
                throw new Error('Server not found in the specified realm');
            }
        }

        return await prisma.database.update({
            where: { id: databaseId },
            data,
            include: {
                server: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Delete database with realm validation
    static async deleteDatabase(databaseId: string, realmId: string): Promise<void> {
        // Verify database exists in realm
        const existing = await this.getDatabaseById(databaseId, realmId);
        if (!existing) {
            throw new Error('Database not found in the specified realm');
        }

        await prisma.database.delete({
            where: { id: databaseId },
        });
    }

    // Get database statistics for a realm
    static async getDatabaseStats(realmId: string): Promise<{
        total: number;
        byServer: Array<{ serverId: string; serverName: string; count: number }>;
    }> {
        const [total, byServer] = await Promise.all([
            prisma.database.count({
                where: { realmId },
            }),
            prisma.database.groupBy({
                by: ['serverId'],
                where: { realmId },
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
            }),
        ]);

        // Get server names for the grouped results
        const serverIds = byServer.map(item => item.serverId);
        const servers = await prisma.databaseServer.findMany({
            where: {
                id: { in: serverIds },
                realmId,
            },
            select: {
                id: true,
                name: true,
            },
        });

        const serverMap = new Map(servers.map(s => [s.id, s.name]));

        return {
            total,
            byServer: byServer.map(item => ({
                serverId: item.serverId,
                serverName: serverMap.get(item.serverId) || 'Unknown',
                count: item._count.id,
            })),
        };
    }

    // Search databases within a realm
    static async searchDatabases(
        realmId: string,
        query: string,
        options: {
            limit?: number;
            offset?: number;
            serverId?: string;
        } = {}
    ): Promise<{ databases: Database[]; total: number }> {
        const { limit = 20, offset = 0, serverId } = options;

        const where = {
            realmId,
            ...(serverId && { serverId }),
            OR: [
                { name: { contains: query, mode: 'insensitive' as const } },
                { description: { contains: query, mode: 'insensitive' as const } },
            ],
        };

        const [databases, total] = await Promise.all([
            prisma.database.findMany({
                where,
                include: {
                    server: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: limit,
                skip: offset,
            }),
            prisma.database.count({ where }),
        ]);

        return { databases, total };
    }
}
```

#### 2.2 Update Document Service
Create/modify `lib/services/documentService.ts`:

```typescript
import { PrismaClient, DocumentState } from '@prisma/client';
import { Document, CreateDocumentData, UpdateDocumentData } from '../../types';

const prisma = new PrismaClient();

export class DocumentService {
    // Get all documents for a specific realm
    static async getDocumentsByRealm(
        realmId: string,
        options: {
            state?: DocumentState;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<{ documents: Document[]; total: number }> {
        const { state, limit = 20, offset = 0 } = options;

        const where = {
            realmId,
            ...(state && { state }),
        };

        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
                take: limit,
                skip: offset,
            }),
            prisma.document.count({ where }),
        ]);

        return { documents, total };
    }

    // Get document by ID with realm validation
    static async getDocumentById(documentId: string, realmId: string): Promise<Document | null> {
        return await prisma.document.findFirst({
            where: {
                id: documentId,
                realmId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Create document with realm association
    static async createDocument(data: CreateDocumentData & { realmId: string }): Promise<Document> {
        return await prisma.document.create({
            data: {
                title: data.title,
                content: data.content,
                state: data.state || DocumentState.DRAFT,
                userId: data.userId,
                realmId: data.realmId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Update document with realm validation
    static async updateDocument(
        documentId: string,
        realmId: string,
        data: UpdateDocumentData
    ): Promise<Document> {
        // Verify document exists in realm
        const existing = await this.getDocumentById(documentId, realmId);
        if (!existing) {
            throw new Error('Document not found in the specified realm');
        }

        return await prisma.document.update({
            where: { id: documentId },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Delete document with realm validation
    static async deleteDocument(documentId: string, realmId: string): Promise<void> {
        // Verify document exists in realm
        const existing = await this.getDocumentById(documentId, realmId);
        if (!existing) {
            throw new Error('Document not found in the specified realm');
        }

        await prisma.document.delete({
            where: { id: documentId },
        });
    }

    // Search documents within a realm
    static async searchDocuments(
        realmId: string,
        query: string,
        options: {
            state?: DocumentState;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<{ documents: Document[]; total: number }> {
        const { state, limit = 20, offset = 0 } = options;

        const where = {
            realmId,
            ...(state && { state }),
            OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { content: { contains: query, mode: 'insensitive' as const } },
            ],
        };

        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
                take: limit,
                skip: offset,
            }),
            prisma.document.count({ where }),
        ]);

        return { documents, total };
    }

    // Get document statistics for a realm
    static async getDocumentStats(realmId: string): Promise<{
        total: number;
        byState: Array<{ state: DocumentState; count: number }>;
    }> {
        const [total, byState] = await Promise.all([
            prisma.document.count({
                where: { realmId },
            }),
            prisma.document.groupBy({
                by: ['state'],
                where: { realmId },
                _count: {
                    id: true,
                },
                orderBy: {
                    state: 'asc',
                },
            }),
        ]);

        return {
            total,
            byState: byState.map(item => ({
                state: item.state,
                count: item._count.id,
            })),
        };
    }
}
```

### Step 3: Update API Endpoints

#### 3.1 Update Database API
Modify `app/api/databases/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getRealmContext } from '../../../lib/realm-context';
import { DatabaseService } from '../../../lib/services/databaseService';
import { CreateDatabaseData } from '../../../types';

// GET /api/databases - List databases in current realm
export async function GET(request: NextRequest) {
    try {
        const { user, realm } = await getRealmContext(request);
        
        // Get query parameters
        const url = new URL(request.url);
        const search = url.searchParams.get('search');
        const serverId = url.searchParams.get('serverId');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        let result;
        
        if (search) {
            // Search databases
            result = await DatabaseService.searchDatabases(realm.id, search, {
                serverId: serverId || undefined,
                limit,
                offset,
            });
        } else {
            // Get all databases
            const databases = await DatabaseService.getDatabasesByRealm(realm.id);
            result = {
                databases: databases.slice(offset, offset + limit),
                total: databases.length,
            };
        }
        
        return NextResponse.json({
            ...result,
            realm: {
                id: realm.id,
                name: realm.name,
            },
            pagination: {
                limit,
                offset,
                hasMore: result.total > offset + limit,
            },
        });
    } catch (error) {
        console.error('Get databases error:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Authentication required') {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }
            
            if (error.message.includes('realm')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 403 }
                );
            }
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
        
        const { name, description, serverId } = body as CreateDatabaseData;
        
        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Database name is required' },
                { status: 400 }
            );
        }
        
        if (!serverId || typeof serverId !== 'string') {
            return NextResponse.json(
                { error: 'Server ID is required' },
                { status: 400 }
            );
        }
        
        const database = await DatabaseService.createDatabase({
            name: name.trim(),
            description: description?.trim(),
            serverId,
            userId: user.userId,
            realmId: realm.id,
        });
        
        return NextResponse.json(
            { database },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create database error:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Authentication required') {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }
            
            if (error.message.includes('realm')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                );
            }
            
            if (error.message.includes('unique constraint')) {
                return NextResponse.json(
                    { error: 'Database name already exists in this realm' },
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

#### 3.2 Update Individual Database API
Modify `app/api/databases/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getRealmContext } from '../../../../lib/realm-context';
import { DatabaseService } from '../../../../lib/services/databaseService';
import { UpdateDatabaseData } from '../../../../types';

// GET /api/databases/[id] - Get specific database
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user, realm } = await getRealmContext(request);
        const databaseId = params.id;
        
        if (!databaseId) {
            return NextResponse.json(
                { error: 'Database ID is required' },
                { status: 400 }
            );
        }
        
        const database = await DatabaseService.getDatabaseById(databaseId, realm.id);
        
        if (!database) {
            return NextResponse.json(
                { error: 'Database not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({ database });
    } catch (error) {
        console.error('Get database error:', error);
        
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

// PUT /api/databases/[id] - Update database
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user, realm } = await getRealmContext(request);
        const databaseId = params.id;
        const body = await request.json();
        
        if (!databaseId) {
            return NextResponse.json(
                { error: 'Database ID is required' },
                { status: 400 }
            );
        }
        
        const updateData = body as UpdateDatabaseData;
        
        // Validate update data
        if (updateData.name !== undefined) {
            if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
                return NextResponse.json(
                    { error: 'Database name must be a non-empty string' },
                    { status: 400 }
                );
            }
            updateData.name = updateData.name.trim();
        }
        
        if (updateData.description !== undefined) {
            updateData.description = updateData.description?.trim() || undefined;
        }
        
        const database = await DatabaseService.updateDatabase(databaseId, realm.id, updateData);
        
        return NextResponse.json({ database });
    } catch (error) {
        console.error('Update database error:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Authentication required') {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }
            
            if (error.message.includes('not found')) {
                return NextResponse.json(
                    { error: 'Database not found' },
                    { status: 404 }
                );
            }
            
            if (error.message.includes('realm')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                );
            }
            
            if (error.message.includes('unique constraint')) {
                return NextResponse.json(
                    { error: 'Database name already exists in this realm' },
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

// DELETE /api/databases/[id] - Delete database
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user, realm } = await getRealmContext(request);
        const databaseId = params.id;
        
        if (!databaseId) {
            return NextResponse.json(
                { error: 'Database ID is required' },
                { status: 400 }
            );
        }
        
        await DatabaseService.deleteDatabase(databaseId, realm.id);
        
        return NextResponse.json(
            { message: 'Database deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete database error:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Authentication required') {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }
            
            if (error.message.includes('not found')) {
                return NextResponse.json(
                    { error: 'Database not found' },
                    { status: 404 }
                );
            }
            
            if (error.message.includes('realm')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 403 }
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

### Step 4: Create Realm-Aware Middleware

#### 4.1 Create API Middleware
Create `lib/middleware/realmMiddleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getRealmContext, RealmContext } from '../realm-context';

// Middleware to inject realm context into API requests
export function withRealmContext(
    handler: (request: NextRequest, context: RealmContext, ...args: any[]) => Promise<NextResponse>
) {
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
        try {
            const context = await getRealmContext(request);
            return await handler(request, context, ...args);
        } catch (error) {
            console.error('Realm context error:', error);
            
            if (error instanceof Error) {
                if (error.message === 'Authentication required') {
                    return NextResponse.json(
                        { error: 'Authentication required' },
                        { status: 401 }
                    );
                }
                
                if (error.message.includes('realm')) {
                    return NextResponse.json(
                        { error: error.message },
                        { status: 403 }
                    );
                }
            }
            
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

// Validate that a resource belongs to the current realm
export function validateRealmResource(
    resourceRealmId: string,
    currentRealmId: string,
    resourceType: string = 'resource'
): void {
    if (resourceRealmId !== currentRealmId) {
        throw new Error(`${resourceType} not found in current realm`);
    }
}

// Audit realm access
export function auditRealmAccess(
    userId: string,
    realmId: string,
    action: string,
    resourceType: string,
    resourceId?: string
): void {
    // Log realm access for security auditing
    console.log('Realm Access:', {
        userId,
        realmId,
        action,
        resourceType,
        resourceId,
        timestamp: new Date().toISOString(),
    });
    
    // In production, this should write to a proper audit log
    // Consider using a service like AWS CloudTrail, Azure Monitor, etc.
}
```

### Step 5: Update Remaining Services

#### 5.1 Update API Key Service
Create/modify `lib/services/apiKeyService.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { ApiKey, CreateApiKeyData, UpdateApiKeyData } from '../../types';
import { generateApiKey } from '../utils/crypto';

const prisma = new PrismaClient();

export class ApiKeyService {
    // Get all API keys for a specific realm
    static async getApiKeysByRealm(
        realmId: string,
        options: {
            isActive?: boolean;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<{ apiKeys: ApiKey[]; total: number }> {
        const { isActive, limit = 20, offset = 0 } = options;

        const where = {
            realmId,
            ...(isActive !== undefined && { isActive }),
        };

        const [apiKeys, total] = await Promise.all([
            prisma.apiKey.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: limit,
                skip: offset,
            }),
            prisma.apiKey.count({ where }),
        ]);

        return { apiKeys, total };
    }

    // Get API key by ID with realm validation
    static async getApiKeyById(apiKeyId: string, realmId: string): Promise<ApiKey | null> {
        return await prisma.apiKey.findFirst({
            where: {
                id: apiKeyId,
                realmId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Create API key with realm association
    static async createApiKey(data: CreateApiKeyData & { realmId: string }): Promise<ApiKey> {
        const key = generateApiKey();
        
        return await prisma.apiKey.create({
            data: {
                name: data.name,
                description: data.description,
                key,
                isActive: data.isActive ?? true,
                userId: data.userId,
                realmId: data.realmId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Update API key with realm validation
    static async updateApiKey(
        apiKeyId: string,
        realmId: string,
        data: UpdateApiKeyData
    ): Promise<ApiKey> {
        // Verify API key exists in realm
        const existing = await this.getApiKeyById(apiKeyId, realmId);
        if (!existing) {
            throw new Error('API key not found in the specified realm');
        }

        return await prisma.apiKey.update({
            where: { id: apiKeyId },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Delete API key with realm validation
    static async deleteApiKey(apiKeyId: string, realmId: string): Promise<void> {
        // Verify API key exists in realm
        const existing = await this.getApiKeyById(apiKeyId, realmId);
        if (!existing) {
            throw new Error('API key not found in the specified realm');
        }

        await prisma.apiKey.delete({
            where: { id: apiKeyId },
        });
    }

    // Validate API key and return realm context
    static async validateApiKey(key: string): Promise<{
        apiKey: ApiKey;
        user: { id: string; name: string; email: string; role: string };
        realm: { id: string; name: string };
    } | null> {
        const apiKey = await prisma.apiKey.findUnique({
            where: { key },
            include: {
                user: true,
                realm: true,
            },
        });

        if (!apiKey || !apiKey.isActive) {
            return null;
        }

        // Update last used timestamp
        await prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date() },
        });

        return {
            apiKey,
            user: {
                id: apiKey.user.id,
                name: apiKey.user.name,
                email: apiKey.user.email,
                role: apiKey.user.role,
            },
            realm: {
                id: apiKey.realm.id,
                name: apiKey.realm.name,
            },
        };
    }
}
```

### Step 6: Update Frontend Hooks

#### 6.1 Update Database Hook
Modify `hooks/useDatabases.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useRealm } from '../contexts/RealmContext';
import { Database, CreateDatabaseData, UpdateDatabaseData } from '../types';

export function useDatabases() {
    const { currentRealm } = useRealm();
    const [databases, setDatabases] = useState<Database[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        limit: 20,
        offset: 0,
        total: 0,
        hasMore: false,
    });

    // Load databases for current realm
    const loadDatabases = useCallback(async (options: {
        search?: string;
        serverId?: string;
        limit?: number;
        offset?: number;
        append?: boolean;
    } = {}) => {
        if (!currentRealm) {
            setDatabases([]);
            setIsLoading(false);
            return;
        }

        try {
            if (!options.append) {
                setIsLoading(true);
            }
            setError(null);

            const params = new URLSearchParams();
            if (options.search) params.set('search', options.search);
            if (options.serverId) params.set('serverId', options.serverId);
            if (options.limit) params.set('limit', options.limit.toString());
            if (options.offset) params.set('offset', options.offset.toString());

            const response = await fetch(`/api/databases?${params.toString()}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load databases');
            }

            const data = await response.json();
            
            if (options.append) {
                setDatabases(prev => [...prev, ...data.databases]);
            } else {
                setDatabases(data.databases);
            }
            
            setPagination({
                limit: data.pagination.limit,
                offset: data.pagination.offset,
                total: data.total,
                hasMore: data.pagination.hasMore,
            });
        } catch (err) {
            console.error('Error loading databases:', err);
            setError(err instanceof Error ? err.message : 'Failed to load databases');
        } finally {
            setIsLoading(false);
        }
    }, [currentRealm]);

    // Load more databases (pagination)
    const loadMore = useCallback(async () => {
        if (!pagination.hasMore || isLoading) return;
        
        await loadDatabases({
            offset: pagination.offset + pagination.limit,
            limit: pagination.limit,
            append: true,
        });
    }, [loadDatabases, pagination, isLoading]);

    // Create database
    const createDatabase = useCallback(async (data: CreateDatabaseData): Promise<Database> => {
        if (!currentRealm) {
            throw new Error('No realm selected');
        }

        const response = await fetch('/api/databases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create database');
        }

        const result = await response.json();
        const newDatabase = result.database;

        // Update local state
        setDatabases(prev => [newDatabase, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));

        return newDatabase;
    }, [currentRealm]);

    // Update database
    const updateDatabase = useCallback(async (
        databaseId: string,
        data: UpdateDatabaseData
    ): Promise<Database> => {
        const response = await fetch(`/api/databases/${databaseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update database');
        }

        const result = await response.json();
        const updatedDatabase = result.database;

        // Update local state
        setDatabases(prev => prev.map(db => 
            db.id === databaseId ? updatedDatabase : db
        ));

        return updatedDatabase;
    }, []);

    // Delete database
    const deleteDatabase = useCallback(async (databaseId: string): Promise<void> => {
        const response = await fetch(`/api/databases/${databaseId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete database');
        }

        // Update local state
        setDatabases(prev => prev.filter(db => db.id !== databaseId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    }, []);

    // Load databases when realm changes
    useEffect(() => {
        loadDatabases();
    }, [loadDatabases]);

    return {
        databases,
        isLoading,
        error,
        pagination,
        loadDatabases,
        loadMore,
        createDatabase,
        updateDatabase,
        deleteDatabase,
        refresh: () => loadDatabases(),
    };
}
```

### Step 7: Performance Monitoring

#### 7.1 Create Performance Monitor
Create `lib/monitoring/realmPerformance.ts`:

```typescript
interface QueryMetrics {
    realmId: string;
    operation: string;
    duration: number;
    recordCount: number;
    timestamp: Date;
}

class RealmPerformanceMonitor {
    private metrics: QueryMetrics[] = [];
    private readonly maxMetrics = 1000;

    // Record query performance
    recordQuery(
        realmId: string,
        operation: string,
        duration: number,
        recordCount: number = 0
    ): void {
        const metric: QueryMetrics = {
            realmId,
            operation,
            duration,
            recordCount,
            timestamp: new Date(),
        };

        this.metrics.push(metric);

        // Keep only recent metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }

        // Log slow queries
        if (duration > 1000) { // 1 second threshold
            console.warn('Slow realm query detected:', {
                realmId,
                operation,
                duration: `${duration}ms`,
                recordCount,
            });
        }
    }

    // Get performance statistics
    getStats(realmId?: string): {
        averageDuration: number;
        slowQueries: number;
        totalQueries: number;
        operationStats: Record<string, { count: number; avgDuration: number }>;
    } {
        const relevantMetrics = realmId
            ? this.metrics.filter(m => m.realmId === realmId)
            : this.metrics;

        if (relevantMetrics.length === 0) {
            return {
                averageDuration: 0,
                slowQueries: 0,
                totalQueries: 0,
                operationStats: {},
            };
        }

        const totalDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
        const averageDuration = totalDuration / relevantMetrics.length;
        const slowQueries = relevantMetrics.filter(m => m.duration > 1000).length;

        // Group by operation
        const operationGroups = relevantMetrics.reduce((groups, metric) => {
            if (!groups[metric.operation]) {
                groups[metric.operation] = [];
            }
            groups[metric.operation].push(metric);
            return groups;
        }, {} as Record<string, QueryMetrics[]>);

        const operationStats = Object.entries(operationGroups).reduce(
            (stats, [operation, metrics]) => {
                const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
                stats[operation] = {
                    count: metrics.length,
                    avgDuration: totalDuration / metrics.length,
                };
                return stats;
            },
            {} as Record<string, { count: number; avgDuration: number }>
        );

        return {
            averageDuration,
            slowQueries,
            totalQueries: relevantMetrics.length,
            operationStats,
        };
    }

    // Clear metrics
    clearMetrics(): void {
        this.metrics = [];
    }
}

export const realmPerformanceMonitor = new RealmPerformanceMonitor();

// Decorator for monitoring service methods
export function monitorRealmQuery(
    operation: string
) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const startTime = Date.now();
            let realmId = 'unknown';
            let recordCount = 0;

            try {
                // Try to extract realmId from first argument
                if (args.length > 0 && typeof args[0] === 'string') {
                    realmId = args[0];
                }

                const result = await method.apply(this, args);
                
                // Try to extract record count from result
                if (Array.isArray(result)) {
                    recordCount = result.length;
                } else if (result && typeof result === 'object') {
                    if ('total' in result) {
                        recordCount = result.total;
                    } else if ('length' in result) {
                        recordCount = result.length;
                    }
                }

                return result;
            } finally {
                const duration = Date.now() - startTime;
                realmPerformanceMonitor.recordQuery(
                    realmId,
                    `${target.constructor.name}.${operation}`,
                    duration,
                    recordCount
                );
            }
        };

        return descriptor;
    };
}
```

## Testing Requirements

### Unit Tests
1. **Service Layer Tests**
   - Test realm filtering in all services
   - Test cross-realm access prevention
   - Test data isolation
   - Test error handling

2. **API Layer Tests**
   - Test realm context injection
   - Test realm validation
   - Test error responses
   - Test pagination with realm filtering

3. **Database Tests**
   - Test index performance
   - Test query optimization
   - Test data integrity

### Integration Tests
1. **End-to-End Workflows**
   - Complete CRUD operations within realms
   - Cross-realm access attempts
   - Realm switching scenarios
   - Data migration validation

2. **Performance Tests**
   - Query performance with realm filtering
   - Index effectiveness
   - Large dataset handling
   - Concurrent realm operations

### Security Tests
1. **Data Isolation Tests**
   - Attempt cross-realm data access
   - Test realm boundary enforcement
   - Validate access control
   - Test data leakage prevention

2. **API Security Tests**
   - Test unauthorized realm access
   - Test malformed realm requests
   - Test injection attacks
   - Test privilege escalation

## Performance Optimization

### Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM databases WHERE "realmId" = 'realm-id';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE indexname LIKE '%realm%';

-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE query LIKE '%realmId%'
ORDER BY mean_time DESC;
```

### Caching Strategy
```typescript
// Example Redis caching for realm data
class RealmCache {
    private redis: Redis;
    private readonly TTL = 300; // 5 minutes

    async get(key: string): Promise<any> {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
    }

    async set(key: string, value: any): Promise<void> {
        await this.redis.setex(key, this.TTL, JSON.stringify(value));
    }

    async invalidateRealm(realmId: string): Promise<void> {
        const pattern = `realm:${realmId}:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
}
```

## Security Considerations

### Access Control
- Validate realm ownership on every operation
- Implement proper session management
- Use secure realm context storage
- Audit all realm access attempts

### Data Protection
- Encrypt sensitive realm data
- Implement proper backup strategies
- Use secure communication channels
- Regular security audits

### Compliance
- GDPR compliance for user data
- Data retention policies
- Access logging requirements
- Regular security assessments

## Monitoring and Alerting

### Key Metrics
1. **Performance Metrics**
   - Query response times
   - Database connection usage
   - Cache hit rates
   - API response times

2. **Security Metrics**
   - Failed authentication attempts
   - Cross-realm access attempts
   - Unusual access patterns
   - Data export activities

3. **Business Metrics**
   - Realm creation rates
   - User activity per realm
   - Data growth per realm
   - Feature usage statistics

### Alerting Rules
```typescript
// Example alerting configuration
const ALERT_THRESHOLDS = {
    SLOW_QUERY: 2000, // 2 seconds
    HIGH_ERROR_RATE: 0.05, // 5%
    UNUSUAL_ACCESS_PATTERN: 100, // requests per minute
    CROSS_REALM_ATTEMPTS: 5, // attempts per hour
};

function checkAlerts(metrics: any): void {
    if (metrics.averageQueryTime > ALERT_THRESHOLDS.SLOW_QUERY) {
        sendAlert('SLOW_QUERY', `Average query time: ${metrics.averageQueryTime}ms`);
    }
    
    if (metrics.errorRate > ALERT_THRESHOLDS.HIGH_ERROR_RATE) {
        sendAlert('HIGH_ERROR_RATE', `Error rate: ${metrics.errorRate * 100}%`);
    }
    
    // Additional alert checks...
}
```

## Deployment Checklist

- [ ] Database indexes created and optimized
- [ ] All service classes updated for realm support
- [ ] All API endpoints updated with realm filtering
- [ ] Realm context middleware implemented
- [ ] Frontend hooks updated for realm awareness
- [ ] Performance monitoring implemented
- [ ] Security measures in place
- [ ] Error handling comprehensive
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Migration scripts tested
- [ ] Rollback procedures defined
- [ ] Monitoring and alerting configured

## Success Criteria

### Functional Requirements
- [ ] All data operations respect realm boundaries
- [ ] No cross-realm data leakage possible
- [ ] Realm switching works seamlessly
- [ ] All existing functionality preserved
- [ ] Performance impact minimal (<10% degradation)

### Security Requirements
- [ ] Complete data isolation between realms
- [ ] Proper access control enforcement
- [ ] Comprehensive audit logging
- [ ] No security vulnerabilities introduced

### Performance Requirements
- [ ] Query response times within acceptable limits
- [ ] Database indexes optimized
- [ ] Caching strategy effective
- [ ] System scalability maintained

## Conclusion

Phase 5 completes the realm system implementation by ensuring all data operations respect realm boundaries. This comprehensive approach provides complete data isolation while maintaining system performance and security. The implementation includes proper indexing, monitoring, and security measures to ensure a robust and scalable multi-realm architecture.