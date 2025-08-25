# Phase 2: Realm Data Model Implementation

## Overview

Implement the database schema changes to support user realms. This includes creating the Realm model and updating all existing models to include realm-based relationships for complete data isolation.

## Current Data Model Analysis

### Existing Models
- **User**: Core user entity with roles
- **Database**: User-owned database configurations
- **Document**: User-owned documents
- **Job**: Processing jobs for documents
- **ApiKey**: User API keys
- **Server**: User database server configurations
- **UserSettings**: User preferences

### Current Relationships
All entities are directly related to users without any grouping or isolation mechanism.

## Realm Concept Design

### Realm Definition
A realm is a completely isolated environment where:
- Users can create multiple realms
- Each realm contains its own set of databases, documents, jobs, API keys, and servers
- No data sharing between realms
- Users can switch between their realms
- Default realm created for all users

### Realm Properties
- **Name**: Human-readable realm identifier
- **Description**: Optional realm description
- **Owner**: User who created the realm
- **Created/Updated timestamps**
- **Active status**

## Implementation Steps

### Step 1: Create Realm Model

#### 1.1 Add Realm Model to Prisma Schema
Update `prisma/schema.prisma`:

```prisma
model Realm {
  id          String   @id @default(uuid())
  name        String
  description String?
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Foreign keys
  userId      String
  
  // Relations
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  databases       Database[]
  documents       Document[]
  apiKeys         ApiKey[]
  jobs            Job[]
  servers Server[]
  
  // Constraints
  @@unique([name, userId]) // Unique realm name per user
  @@map("realms")
}
```

#### 1.2 Update User Model
Add realm relationship to User model:

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  avatar    String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  realms          Realm[]          // Add this line
  databases       Database[]
  documents       Document[]
  apiKeys         ApiKey[]
  jobs            Job[]
  servers Server[]
  userSettings    UserSettings?

  @@map("users")
}
```

### Step 2: Update Existing Models

#### 2.1 Update Database Model
```prisma
model Database {
  id            String   @id @default(uuid())
  name          String
  description   String
  documentCount Int      @default(0)
  lastUpdated   DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Foreign keys
  userId        String
  realmId       String   // Add this line
  serverId      String

  // Relations
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm     Realm          @relation(fields: [realmId], references: [id], onDelete: Cascade) // Add this line
  server    Server @relation(fields: [serverId], references: [id], onDelete: Cascade)
  documents Document[]

  @@unique([name, realmId]) // Change from [name, userId] to [name, realmId]
  @@map("databases")
}
```

#### 2.2 Update Document Model
```prisma
model Document {
  id         String        @id @default(uuid())
  name       String
  type       String
  state      DocumentState @default(PENDING)
  version    Int           @default(1)
  chunks     Int           @default(0)
  quality    Float         @default(0.0)
  uploadDate DateTime      @default(now())
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  
  // Foreign keys
  userId     String
  realmId    String        // Add this line
  databaseId String?

  // Relations
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm    Realm     @relation(fields: [realmId], references: [id], onDelete: Cascade) // Add this line
  database Database? @relation(fields: [databaseId], references: [id], onDelete: SetNull)
  jobs     Job[]

  @@map("documents")
}
```

#### 2.3 Update ApiKey Model
```prisma
model ApiKey {
  id        String   @id @default(uuid())
  name      String
  key       String   @unique
  created   DateTime @default(now())
  lastUsed  DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Foreign keys
  userId    String
  realmId   String   // Add this line

  // Relations
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm Realm @relation(fields: [realmId], references: [id], onDelete: Cascade) // Add this line

  @@map("api_keys")
}
```

#### 2.4 Update Server Model
```prisma
model Server {
  id            String           @id @default(uuid())
  name          String
  type          DatabaseType
  host          String
  port          Int
  username      String?
  password      String?
  apiKey        String?
  database      String?
  collection    String?
  isActive      Boolean          @default(false)
  createdAt     DateTime         @default(now())
  lastConnected DateTime?
  updatedAt     DateTime         @updatedAt
  
  // Foreign keys
  userId        String
  realmId       String           // Add this line

  // Relations
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm     Realm      @relation(fields: [realmId], references: [id], onDelete: Cascade) // Add this line
  databases Database[]

  @@map("database_servers")
}
```

#### 2.5 Update Job Model
```prisma
model Job {
  id           String    @id @default(uuid())
  documentName String
  documentType String
  startDate    DateTime  @default(now())
  endDate      DateTime?
  status       JobStatus @default(PENDING)
  percentage   Int       @default(0)
  summary      String    @default("")
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  // Foreign keys
  documentId   String
  userId       String
  realmId      String    // Add this line

  // Relations
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  realm    Realm    @relation(fields: [realmId], references: [id], onDelete: Cascade) // Add this line

  @@map("jobs")
}
```

### Step 3: Create Migration Strategy

#### 3.1 Create Migration Script
Create `lib/migrations/add-realms.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function migrateToRealms() {
  console.log('Starting realm migration...');
  
  try {
    // Step 1: Get all existing users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      console.log(`Migrating user: ${user.email}`);
      
      // Step 2: Create default realm for each user
      const defaultRealm = await prisma.realm.create({
        data: {
          name: 'Default',
          description: 'Default realm created during migration',
          isDefault: true,
          userId: user.id,
        },
      });
      
      console.log(`Created default realm for ${user.email}: ${defaultRealm.id}`);
      
      // Step 3: Update all user's existing data to use the default realm
      await migrateUserData(user.id, defaultRealm.id);
    }
    
    console.log('Realm migration completed successfully');
  } catch (error) {
    console.error('Realm migration failed:', error);
    throw error;
  }
}

async function migrateUserData(userId: string, realmId: string) {
  // Update databases
  const databases = await prisma.database.updateMany({
    where: { userId },
    data: { realmId },
  });
  console.log(`  Updated ${databases.count} databases`);
  
  // Update documents
  const documents = await prisma.document.updateMany({
    where: { userId },
    data: { realmId },
  });
  console.log(`  Updated ${documents.count} documents`);
  
  // Update API keys
  const apiKeys = await prisma.apiKey.updateMany({
    where: { userId },
    data: { realmId },
  });
  console.log(`  Updated ${apiKeys.count} API keys`);
  
  // Update database servers
  const servers = await prisma.server.updateMany({
    where: { userId },
    data: { realmId },
  });
  console.log(`  Updated ${servers.count} database servers`);
  
  // Update jobs
  const jobs = await prisma.job.updateMany({
    where: { userId },
    data: { realmId },
  });
  console.log(`  Updated ${jobs.count} jobs`);
}

// Rollback function
export async function rollbackRealms() {
  console.log('Rolling back realm migration...');
  
  try {
    // Delete all realms (this will cascade delete realm relationships)
    await prisma.realm.deleteMany({});
    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

if (require.main === module) {
  migrateToRealms()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}
```

#### 3.2 Create Migration Command
Create `scripts/migrate-realms.js`:

```javascript
const { execSync } = require('child_process');
const path = require('path');

function runMigration() {
  console.log('Running Prisma migration for realms...');
  
  try {
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Create and apply migration
    console.log('Creating migration...');
    execSync('npx prisma migrate dev --name add-realms', { stdio: 'inherit' });
    
    // Run data migration
    console.log('Running data migration...');
    execSync('npx ts-node lib/migrations/add-realms.ts', { stdio: 'inherit' });
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
```

### Step 4: Update Type Definitions

#### 4.1 Update `types/index.ts`
```typescript
// Add Realm interface
export interface Realm {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Update existing interfaces to include realmId
export interface Database {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  lastUpdated: Date;
  userId: string;
  realmId: string; // Add this
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  state: DocumentState;
  version: number;
  chunks: number;
  quality: number;
  uploadDate: Date;
  userId: string;
  realmId: string; // Add this
  databaseId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: Date;
  lastUsed?: Date;
  userId: string;
  realmId: string; // Add this
  createdAt: Date;
  updatedAt: Date;
}

export interface Server {
  id: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  username?: string;
  password?: string;
  apiKey?: string;
  database?: string;
  collection?: string;
  isActive: boolean;
  userId: string;
  realmId: string; // Add this
  createdAt: Date;
  lastConnected?: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  documentName: string;
  documentType: string;
  startDate: Date;
  endDate?: Date;
  status: JobStatus;
  percentage: number;
  summary: string;
  documentId: string;
  userId: string;
  realmId: string; // Add this
  createdAt: Date;
  updatedAt: Date;
}

// Add realm-related types
export interface CreateRealmData {
  name: string;
  description?: string;
}

export interface UpdateRealmData {
  name?: string;
  description?: string;
  isActive?: boolean;
}
```

### Step 5: Create Realm Service

#### 5.1 Create `lib/services/realmService.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { Realm, CreateRealmData, UpdateRealmData } from '../../types';

const prisma = new PrismaClient();

export class RealmService {
  // Get all realms for a user
  static async getUserRealms(userId: string): Promise<Realm[]> {
    return await prisma.realm.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' }, // Default realm first
        { createdAt: 'asc' },
      ],
    });
  }

  // Get realm by ID (with user validation)
  static async getRealmById(realmId: string, userId: string): Promise<Realm | null> {
    return await prisma.realm.findFirst({
      where: {
        id: realmId,
        userId,
        isActive: true,
      },
    });
  }

  // Get user's default realm
  static async getDefaultRealm(userId: string): Promise<Realm | null> {
    return await prisma.realm.findFirst({
      where: {
        userId,
        isDefault: true,
        isActive: true,
      },
    });
  }

  // Create new realm
  static async createRealm(userId: string, data: CreateRealmData): Promise<Realm> {
    // Check if realm name already exists for user
    const existingRealm = await prisma.realm.findFirst({
      where: {
        userId,
        name: data.name,
        isActive: true,
      },
    });

    if (existingRealm) {
      throw new Error('Realm name already exists');
    }

    return await prisma.realm.create({
      data: {
        ...data,
        userId,
        isDefault: false, // Only migration creates default realms
      },
    });
  }

  // Update realm
  static async updateRealm(
    realmId: string,
    userId: string,
    data: UpdateRealmData
  ): Promise<Realm> {
    // Verify realm belongs to user
    const realm = await this.getRealmById(realmId, userId);
    if (!realm) {
      throw new Error('Realm not found');
    }

    // Check name uniqueness if name is being updated
    if (data.name && data.name !== realm.name) {
      const existingRealm = await prisma.realm.findFirst({
        where: {
          userId,
          name: data.name,
          isActive: true,
          id: { not: realmId },
        },
      });

      if (existingRealm) {
        throw new Error('Realm name already exists');
      }
    }

    return await prisma.realm.update({
      where: { id: realmId },
      data,
    });
  }

  // Soft delete realm (mark as inactive)
  static async deleteRealm(realmId: string, userId: string): Promise<void> {
    // Verify realm belongs to user
    const realm = await this.getRealmById(realmId, userId);
    if (!realm) {
      throw new Error('Realm not found');
    }

    // Prevent deletion of default realm
    if (realm.isDefault) {
      throw new Error('Cannot delete default realm');
    }

    // Check if realm has any data
    const hasData = await this.realmHasData(realmId);
    if (hasData) {
      throw new Error('Cannot delete realm with existing data');
    }

    // Soft delete by marking as inactive
    await prisma.realm.update({
      where: { id: realmId },
      data: { isActive: false },
    });
  }

  // Check if realm has any associated data
  static async realmHasData(realmId: string): Promise<boolean> {
    const [databases, documents, apiKeys, servers, jobs] = await Promise.all([
      prisma.database.count({ where: { realmId } }),
      prisma.document.count({ where: { realmId } }),
      prisma.apiKey.count({ where: { realmId } }),
      prisma.server.count({ where: { realmId } }),
      prisma.job.count({ where: { realmId } }),
    ]);

    return databases > 0 || documents > 0 || apiKeys > 0 || servers > 0 || jobs > 0;
  }

  // Get realm statistics
  static async getRealmStats(realmId: string, userId: string) {
    // Verify realm belongs to user
    const realm = await this.getRealmById(realmId, userId);
    if (!realm) {
      throw new Error('Realm not found');
    }

    const [databases, documents, apiKeys, servers, jobs] = await Promise.all([
      prisma.database.count({ where: { realmId } }),
      prisma.document.count({ where: { realmId } }),
      prisma.apiKey.count({ where: { realmId } }),
      prisma.server.count({ where: { realmId } }),
      prisma.job.count({ where: { realmId } }),
    ]);

    return {
      databases,
      documents,
      apiKeys,
      servers,
      jobs,
    };
  }

  // Create default realm for new user
  static async createDefaultRealm(userId: string): Promise<Realm> {
    return await prisma.realm.create({
      data: {
        name: 'Default',
        description: 'Your default workspace',
        userId,
        isDefault: true,
      },
    });
  }
}
```

## Testing Requirements

### Unit Tests
1. **Realm Service Tests**
   - Test realm CRUD operations
   - Test user isolation
   - Test default realm creation
   - Test realm validation

2. **Migration Tests**
   - Test data migration accuracy
   - Test rollback functionality
   - Test edge cases

### Integration Tests
1. **Database Schema Tests**
   - Test foreign key constraints
   - Test cascade deletions
   - Test unique constraints

2. **Data Integrity Tests**
   - Test realm isolation
   - Test user-realm relationships
   - Test default realm behavior

## Migration Execution Plan

### Pre-Migration Checklist
- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Verify all tests pass
- [ ] Prepare rollback plan
- [ ] Schedule maintenance window

### Migration Steps
1. **Stop application services**
2. **Backup database**
3. **Run Prisma migration**
4. **Execute data migration script**
5. **Verify data integrity**
6. **Update application code**
7. **Restart services**
8. **Verify functionality**

### Post-Migration Verification
- [ ] All users have default realms
- [ ] All existing data migrated correctly
- [ ] No data loss occurred
- [ ] Foreign key constraints working
- [ ] Application functionality intact

## Rollback Plan

### Immediate Rollback (if migration fails)
1. **Stop migration script**
2. **Restore database backup**
3. **Revert application code**
4. **Restart services**

### Delayed Rollback (if issues found later)
1. **Run rollback migration script**
2. **Remove realm columns**
3. **Update application code**
4. **Test functionality**

## Performance Considerations

### Database Indexing
```sql
-- Add indexes for realm-based queries
CREATE INDEX idx_databases_realm_id ON databases(realm_id);
CREATE INDEX idx_documents_realm_id ON documents(realm_id);
CREATE INDEX idx_api_keys_realm_id ON api_keys(realm_id);
CREATE INDEX idx_database_servers_realm_id ON database_servers(realm_id);
CREATE INDEX idx_jobs_realm_id ON jobs(realm_id);
CREATE INDEX idx_realms_user_id ON realms(user_id);
```

### Query Optimization
- All data queries must include realm filtering
- Use compound indexes for user_id + realm_id queries
- Consider query result caching for realm data

## Security Considerations

1. **Data Isolation**
   - Ensure complete realm separation
   - Prevent cross-realm data access
   - Validate realm ownership in all operations

2. **Migration Security**
   - Validate data integrity during migration
   - Log all migration operations
   - Secure migration scripts

## Next Phase

Once Phase 2 is complete and all data is successfully migrated to the realm structure, proceed to **Phase 3: Realm APIs** to implement the backend API endpoints for realm management.