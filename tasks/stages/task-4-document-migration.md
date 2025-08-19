# Task 4: Document Migration Between Realms

## Overview

Implement functionality to migrate documents between realms and databases, leveraging the staged processing architecture. This includes migrating existing processed documents and re-ingesting them into new database configurations.

## Migration Scenarios

### 1. Document to New Realm Migration

**Use Case**: User creates a new realm and wants to migrate existing documents to it.

**Process**:
1. User selects documents from source realm
2. User selects target realm
3. System copies document metadata and stage files
4. System re-runs ingestion stage for target realm's databases
5. System updates document realm association

### 2. Realm Database Addition Migration

**Use Case**: User adds a new database to an existing realm and wants to ingest existing documents.

**Process**:
1. User adds new database to realm configuration
2. System identifies documents in the realm
3. System re-runs ingestion stage for the new database
4. System maintains existing database ingestions

### 3. Cross-Database Migration

**Use Case**: User wants to move documents from one database type to another (e.g., Qdrant to Neo4j).

**Process**:
1. User selects source and target databases
2. System extracts data from source database
3. System transforms data for target database format
4. System ingests data into target database
5. System optionally removes data from source database

## Technical Architecture

### 1. Migration Service

```typescript
// lib/services/migrationService.ts

export interface MigrationRequest {
  documentIds: string[];
  sourceRealmId: string;
  targetRealmId: string;
  migrationOptions: MigrationOptions;
}

export interface MigrationOptions {
  copyStageFiles: boolean;
  reprocessStages: string[];
  preserveOriginal: boolean;
  targetDatabases?: string[];
  migrationMode: 'copy' | 'move';
}

export interface MigrationResult {
  migrationId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: string[];
  errors: MigrationError[];
  startedAt: Date;
  completedAt?: Date;
}

export interface MigrationError {
  documentId: string;
  stage?: string;
  error: string;
  timestamp: Date;
}

export class MigrationService {
  async createMigration(
    request: MigrationRequest
  ): Promise<MigrationResult> {
    // Create migration record and start processing
  }
  
  async getMigrationStatus(
    migrationId: string
  ): Promise<MigrationResult> {
    // Get current migration status
  }
  
  async cancelMigration(
    migrationId: string
  ): Promise<void> {
    // Cancel ongoing migration
  }
  
  async retryFailedDocuments(
    migrationId: string,
    documentIds?: string[]
  ): Promise<void> {
    // Retry failed document migrations
  }
}
```

### 2. Document Migration Process

```typescript
// lib/services/documentMigrationService.ts

export interface DocumentMigrationContext {
  sourceDocument: DocumentWithStages;
  targetRealmId: string;
  migrationOptions: MigrationOptions;
  migrationId: string;
}

export class DocumentMigrationService {
  async migrateDocument(
    context: DocumentMigrationContext
  ): Promise<DocumentMigrationResult> {
    const steps = [
      this.validateMigration,
      this.copyDocumentMetadata,
      this.copyStageFiles,
      this.reprocessRequiredStages,
      this.updateDocumentRealm,
      this.cleanupIfNeeded
    ];
    
    for (const step of steps) {
      await step(context);
    }
    
    return {
      success: true,
      newDocumentId: context.targetDocument.id,
      migratedStages: context.migratedStages
    };
  }
  
  private async validateMigration(
    context: DocumentMigrationContext
  ): Promise<void> {
    // Validate migration prerequisites
    const targetRealm = await realmService.getRealm(context.targetRealmId);
    if (!targetRealm) {
      throw new Error(`Target realm ${context.targetRealmId} not found`);
    }
    
    // Check for conflicts
    const existingDoc = await documentService.findByTitle(
      context.sourceDocument.title,
      context.targetRealmId
    );
    
    if (existingDoc && context.migrationOptions.migrationMode === 'copy') {
      throw new Error('Document with same title already exists in target realm');
    }
  }
  
  private async copyDocumentMetadata(
    context: DocumentMigrationContext
  ): Promise<void> {
    // Create new document record in target realm
    const newDocument = {
      ...context.sourceDocument,
      id: generateId(),
      realmId: context.targetRealmId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    context.targetDocument = await documentService.create(newDocument);
  }
  
  private async copyStageFiles(
    context: DocumentMigrationContext
  ): Promise<void> {
    if (!context.migrationOptions.copyStageFiles) return;
    
    const sourceFiles = context.sourceDocument.outputFiles || [];
    
    for (const file of sourceFiles) {
      const fileContent = await fileService.getStageFile(
        context.sourceDocument.id,
        file.stageName,
        file.fileName
      );
      
      if (fileContent) {
        await fileService.storeStageFile(
          context.targetDocument.id,
          file.stageName,
          file.fileName,
          fileContent
        );
        
        // Create file record
        await stageService.storeStageOutputFile(
          context.targetDocument.id,
          file.stageName,
          {
            ...file,
            id: generateId(),
            documentId: context.targetDocument.id
          }
        );
      }
    }
  }
  
  private async reprocessRequiredStages(
    context: DocumentMigrationContext
  ): Promise<void> {
    const { reprocessStages } = context.migrationOptions;
    if (!reprocessStages || reprocessStages.length === 0) return;
    
    for (const stageName of reprocessStages) {
      await stageService.executeStage(
        context.targetDocument.id,
        stageName
      );
    }
  }
}
```

### 3. Database Schema Extensions

```sql
-- Add migration tracking tables

CREATE TABLE document_migrations (
  id VARCHAR(255) PRIMARY KEY,
  source_realm_id VARCHAR(255) NOT NULL,
  target_realm_id VARCHAR(255) NOT NULL,
  migration_type ENUM('document_to_realm', 'realm_database_addition', 'cross_database') NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  total_documents INT NOT NULL DEFAULT 0,
  processed_documents INT NOT NULL DEFAULT 0,
  failed_documents INT NOT NULL DEFAULT 0,
  migration_options JSON,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (source_realm_id) REFERENCES realms(id),
  FOREIGN KEY (target_realm_id) REFERENCES realms(id),
  INDEX idx_migration_status (status),
  INDEX idx_migration_realms (source_realm_id, target_realm_id)
);

CREATE TABLE document_migration_items (
  id VARCHAR(255) PRIMARY KEY,
  migration_id VARCHAR(255) NOT NULL,
  source_document_id VARCHAR(255) NOT NULL,
  target_document_id VARCHAR(255) NULL,
  status ENUM('pending', 'in_progress', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  error_message TEXT NULL,
  migrated_stages JSON,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (migration_id) REFERENCES document_migrations(id) ON DELETE CASCADE,
  FOREIGN KEY (source_document_id) REFERENCES documents(id),
  FOREIGN KEY (target_document_id) REFERENCES documents(id),
  INDEX idx_migration_items (migration_id),
  INDEX idx_source_document (source_document_id)
);
```

## UI Components

### 1. Document Migration Dialog

```typescript
// components/dialogs/DocumentMigrationDialog.tsx

interface DocumentMigrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocuments: Document[];
  sourceRealmId: string;
}

export function DocumentMigrationDialog({
  isOpen,
  onClose,
  selectedDocuments,
  sourceRealmId
}: DocumentMigrationDialogProps) {
  const [targetRealmId, setTargetRealmId] = useState('');
  const [migrationOptions, setMigrationOptions] = useState<MigrationOptions>({
    copyStageFiles: true,
    reprocessStages: ['ingestor'],
    preserveOriginal: true,
    migrationMode: 'copy'
  });
  
  const handleMigrate = async () => {
    const request: MigrationRequest = {
      documentIds: selectedDocuments.map(d => d.id),
      sourceRealmId,
      targetRealmId,
      migrationOptions
    };
    
    await migrationService.createMigration(request);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Migrate Documents</DialogTitle>
          <DialogDescription>
            Migrate {selectedDocuments.length} document(s) to another realm
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Target Realm Selection */}
          <div>
            <Label htmlFor="target-realm">Target Realm</Label>
            <RealmSelector
              value={targetRealmId}
              onChange={setTargetRealmId}
              excludeRealmId={sourceRealmId}
            />
          </div>
          
          {/* Migration Options */}
          <div className="space-y-4">
            <Label>Migration Options</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-stage-files"
                checked={migrationOptions.copyStageFiles}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({ 
                    ...prev, 
                    copyStageFiles: checked as boolean 
                  }))
                }
              />
              <Label htmlFor="copy-stage-files">
                Copy existing stage output files
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserve-original"
                checked={migrationOptions.preserveOriginal}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({ 
                    ...prev, 
                    preserveOriginal: checked as boolean 
                  }))
                }
              />
              <Label htmlFor="preserve-original">
                Keep original documents in source realm
              </Label>
            </div>
            
            {/* Reprocess Stages Selection */}
            <div>
              <Label>Reprocess Stages</Label>
              <StageSelector
                selectedStages={migrationOptions.reprocessStages}
                onChange={(stages) => 
                  setMigrationOptions(prev => ({ 
                    ...prev, 
                    reprocessStages: stages 
                  }))
                }
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleMigrate}
            disabled={!targetRealmId}
          >
            Start Migration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Migration Progress Monitor

```typescript
// components/migration/MigrationProgressMonitor.tsx

interface MigrationProgressMonitorProps {
  migrationId: string;
  onComplete?: () => void;
}

export function MigrationProgressMonitor({
  migrationId,
  onComplete
}: MigrationProgressMonitorProps) {
  const [migration, setMigration] = useState<MigrationResult | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const fetchMigrationStatus = async () => {
      const result = await migrationService.getMigrationStatus(migrationId);
      setMigration(result);
      
      if (result.status === 'completed' || result.status === 'failed') {
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
        onComplete?.();
      }
    };
    
    fetchMigrationStatus();
    
    const interval = setInterval(fetchMigrationStatus, 2000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [migrationId, onComplete]);
  
  if (!migration) {
    return <LoadingSpinner />;
  }
  
  const progressPercentage = migration.totalDocuments > 0 
    ? (migration.processedDocuments / migration.totalDocuments) * 100 
    : 0;
  
  return (
    <div className="migration-progress">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Migration Progress</h3>
        <MigrationStatusBadge status={migration.status} />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{migration.processedDocuments}/{migration.totalDocuments}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {migration.failedDocuments.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="text-red-800 font-medium mb-2">
              Failed Documents ({migration.failedDocuments.length})
            </h4>
            <div className="space-y-1">
              {migration.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700">
                  {error.documentId}: {error.error}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => migrationService.retryFailedDocuments(migrationId)}
            >
              Retry Failed
            </Button>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <div>Started: {formatDateTime(migration.startedAt)}</div>
          {migration.completedAt && (
            <div>Completed: {formatDateTime(migration.completedAt)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 3. Realm Database Addition Dialog

```typescript
// components/dialogs/RealmDatabaseAdditionDialog.tsx

interface RealmDatabaseAdditionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  realmId: string;
  newDatabaseId: string;
}

export function RealmDatabaseAdditionDialog({
  isOpen,
  onClose,
  realmId,
  newDatabaseId
}: RealmDatabaseAdditionDialogProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      loadRealmDocuments();
    }
  }, [isOpen, realmId]);
  
  const loadRealmDocuments = async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocumentsByRealm(realmId);
      setDocuments(docs);
      setSelectedDocuments(docs.map(d => d.id)); // Select all by default
    } catch (error) {
      console.error('Failed to load realm documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleIngestDocuments = async () => {
    const request: MigrationRequest = {
      documentIds: selectedDocuments,
      sourceRealmId: realmId,
      targetRealmId: realmId, // Same realm, different database
      migrationOptions: {
        copyStageFiles: false,
        reprocessStages: ['ingestor'],
        preserveOriginal: true,
        targetDatabases: [newDatabaseId],
        migrationMode: 'copy'
      }
    };
    
    await migrationService.createMigration(request);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Ingest Documents into New Database</DialogTitle>
          <DialogDescription>
            Select documents to ingest into the newly added database
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <DocumentSelectionTable
              documents={documents}
              selectedDocuments={selectedDocuments}
              onSelectionChange={setSelectedDocuments}
            />
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleIngestDocuments}
            disabled={selectedDocuments.length === 0}
          >
            Ingest Selected Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## API Endpoints

### 1. Migration Management

```typescript
// app/api/migrations/route.ts

export async function POST(request: Request) {
  try {
    const migrationRequest: MigrationRequest = await request.json();
    
    // Validate request
    const validation = validateMigrationRequest(migrationRequest);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Create migration
    const migration = await migrationService.createMigration(migrationRequest);
    
    return NextResponse.json(migration);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create migration' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const realmId = searchParams.get('realmId');
  const status = searchParams.get('status');
  
  try {
    const migrations = await migrationService.getMigrations({
      realmId,
      status
    });
    
    return NextResponse.json(migrations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch migrations' },
      { status: 500 }
    );
  }
}
```

### 2. Migration Status

```typescript
// app/api/migrations/[id]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const migration = await migrationService.getMigrationStatus(params.id);
    
    if (!migration) {
      return NextResponse.json(
        { error: 'Migration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(migration);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch migration status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await migrationService.cancelMigration(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cancel migration' },
      { status: 500 }
    );
  }
}
```

## Implementation Tasks

### Phase 1: Core Migration Service
- [ ] Implement MigrationService class
- [ ] Create DocumentMigrationService
- [ ] Add database schema for migration tracking
- [ ] Implement file copying utilities

### Phase 2: UI Components
- [ ] Create DocumentMigrationDialog
- [ ] Implement MigrationProgressMonitor
- [ ] Add RealmDatabaseAdditionDialog
- [ ] Create migration status components

### Phase 3: API Integration
- [ ] Implement migration API endpoints
- [ ] Add migration status endpoints
- [ ] Create webhook handlers for migration events
- [ ] Add error handling and validation

### Phase 4: Advanced Features
- [ ] Implement batch migration support
- [ ] Add migration rollback functionality
- [ ] Create migration scheduling
- [ ] Add migration analytics and reporting

### Phase 5: Testing and Optimization
- [ ] Unit tests for migration services
- [ ] Integration tests for migration flows
- [ ] Performance testing with large datasets
- [ ] Error recovery testing

## Success Criteria

1. **Seamless Migration**: Documents can be migrated between realms without data loss
2. **Progress Tracking**: Users can monitor migration progress in real-time
3. **Error Handling**: Failed migrations can be retried and debugged
4. **Performance**: Large-scale migrations complete in reasonable time
5. **Data Integrity**: All stage files and metadata are preserved during migration

## Risks and Mitigation

### Risk: Data Loss During Migration
- **Mitigation**: Comprehensive backup before migration
- **Mitigation**: Atomic operations with rollback capability
- **Mitigation**: Extensive testing with production-like data

### Risk: Performance Impact
- **Mitigation**: Background processing for large migrations
- **Mitigation**: Rate limiting and resource management
- **Mitigation**: Progress monitoring and cancellation options

### Risk: Database Consistency
- **Mitigation**: Transaction-based operations
- **Mitigation**: Validation checks before and after migration
- **Mitigation**: Automated consistency verification

## Next Steps

1. **Architecture Review**: Validate migration architecture and approach
2. **Database Design**: Finalize migration tracking schema
3. **Service Implementation**: Begin with core migration services
4. **UI Development**: Create migration dialog and progress components
5. **Testing Strategy**: Develop comprehensive testing plan

---

**Status**: Planning  
**Priority**: Medium  
**Estimated Effort**: 2-3 weeks  
**Dependencies**: Database schema, stage processing, realm management