# Task 2.1: Enhanced Document Deletion

**Phase**: 2 - Document Management Enhancements
**Status**: ❌ Not Started
**Priority**: High
**Estimated Effort**: 2-3 days

## Overview

Implement enhanced document deletion functionality that properly handles the cleanup of document chunks and facts while preserving entities that may be referenced by other documents. This addresses the vision requirement to "delete document, chunks and facts - keep entities even if they get orphaned."

## Current State Analysis

### Existing Implementation
- Basic document deletion exists
- Simple cascade deletion through foreign key constraints
- No sophisticated cleanup of related data
- No entity preservation logic
- No orphaned entity handling

### Gap Analysis
- ❌ No chunk-specific deletion logic
- ❌ No fact cleanup while preserving entities
- ❌ No orphaned entity detection and handling
- ❌ No selective cleanup based on entity relationships
- ❌ No deletion impact analysis

## Requirements

### Functional Requirements
1. **Document Deletion**: Remove documents and associated data
2. **Chunk Cleanup**: Delete all chunks associated with the document
3. **Fact Cleanup**: Remove facts derived from the document
4. **Entity Preservation**: Keep entities even if they become orphaned
5. **Relationship Cleanup**: Clean up document-entity relationships
6. **Impact Analysis**: Show what will be deleted before confirmation
7. **Audit Trail**: Track deletion operations for compliance
8. **Batch Deletion**: Support deleting multiple documents

### Technical Requirements
1. **Transactional Operations**: Ensure data consistency during deletion
2. **Performance**: Efficient deletion of large document sets
3. **Referential Integrity**: Maintain database consistency
4. **Rollback Capability**: Ability to undo deletions if needed
5. **Progress Tracking**: Show progress for large deletion operations
6. **Error Handling**: Graceful handling of deletion failures

## Data Model Extensions

### Enhanced Models for Entity/Fact Management
```prisma
model Entity {
  id          String   @id @default(uuid())
  name        String
  type        String   // person, organization, concept, etc.
  description String?
  metadata    Json?    // Additional entity metadata
  isOrphaned  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  facts       Fact[]
  documents   DocumentEntity[]
  
  @@unique([name, type])
  @@map("entities")
}

model Fact {
  id          String   @id @default(uuid())
  subject     String   // Entity ID or name
  predicate   String   // Relationship type
  object      String   // Target entity or value
  confidence  Float    @default(1.0)
  source      String   // Source document or chunk
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Foreign keys
  entityId    String?
  documentId  String
  chunkId     String?
  
  // Relations
  entity      Entity?  @relation(fields: [entityId], references: [id])
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  
  @@map("facts")
}

model DocumentEntity {
  id         String   @id @default(uuid())
  documentId String
  entityId   String
  relevance  Float    @default(1.0)
  mentions   Int      @default(1)
  createdAt  DateTime @default(now())
  
  // Relations
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  entity     Entity   @relation(fields: [entityId], references: [id])
  
  @@unique([documentId, entityId])
  @@map("document_entities")
}

model DocumentChunk {
  id         String   @id @default(uuid())
  documentId String
  content    String   @db.LongText
  chunkIndex Int
  embedding  Json?    // Vector embedding
  metadata   Json?
  createdAt  DateTime @default(now())
  
  // Relations
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  facts      Fact[]
  
  @@unique([documentId, chunkIndex])
  @@map("document_chunks")
}

// Add to existing Document model
model Document {
  // ... existing fields
  
  // New relations
  chunks     DocumentChunk[]
  facts      Fact[]
  entities   DocumentEntity[]
}
```

## Implementation Plan

### Step 1: Enhanced Deletion Service
```typescript
export class EnhancedDocumentDeletionService {
  async deleteDocument(documentId: string, options: DeletionOptions = {}): Promise<DeletionResult> {
    const deletionPlan = await this.createDeletionPlan(documentId);
    
    if (options.dryRun) {
      return { plan: deletionPlan, executed: false };
    }

    return await this.executeDeletion(deletionPlan, options);
  }

  async createDeletionPlan(documentId: string): Promise<DeletionPlan> {
    const document = await this.getDocumentWithRelations(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    // Analyze what will be deleted
    const chunksToDelete = await this.getDocumentChunks(documentId);
    const factsToDelete = await this.getDocumentFacts(documentId);
    const entitiesToUpdate = await this.getAffectedEntities(documentId);
    const relationshipsToDelete = await this.getDocumentEntityRelationships(documentId);

    // Check for entities that will become orphaned
    const orphanedEntities = await this.identifyOrphanedEntities(entitiesToUpdate);

    return {
      documentId,
      documentName: document.name,
      chunksToDelete: chunksToDelete.length,
      factsToDelete: factsToDelete.length,
      relationshipsToDelete: relationshipsToDelete.length,
      entitiesToPreserve: entitiesToUpdate.length,
      orphanedEntities: orphanedEntities.length,
      estimatedTime: this.estimateDeletionTime(chunksToDelete.length, factsToDelete.length),
      warnings: this.generateWarnings(orphanedEntities),
    };
  }

  async executeDeletion(plan: DeletionPlan, options: DeletionOptions): Promise<DeletionResult> {
    const transaction = await prisma.$transaction(async (tx) => {
      const progress = new DeletionProgress(plan);
      
      try {
        // Step 1: Delete facts associated with the document
        await this.deleteFacts(tx, plan.documentId, progress);
        
        // Step 2: Delete document chunks
        await this.deleteChunks(tx, plan.documentId, progress);
        
        // Step 3: Delete document-entity relationships
        await this.deleteDocumentEntityRelationships(tx, plan.documentId, progress);
        
        // Step 4: Mark entities as orphaned if necessary
        await this.updateOrphanedEntities(tx, plan.documentId, progress);
        
        // Step 5: Delete the document itself
        await this.deleteDocumentRecord(tx, plan.documentId, progress);
        
        // Step 6: Create audit log
        await this.createDeletionAuditLog(tx, plan, options.userId);
        
        return {
          plan,
          executed: true,
          success: true,
          progress: progress.getResult(),
        };
      } catch (error) {
        console.error('Deletion failed:', error);
        throw error;
      }
    });

    return transaction;
  }

  private async deleteFacts(tx: any, documentId: string, progress: DeletionProgress): Promise<void> {
    progress.updateStatus('Deleting facts...');
    
    const result = await tx.fact.deleteMany({
      where: { documentId },
    });
    
    progress.addCompleted('facts', result.count);
  }

  private async deleteChunks(tx: any, documentId: string, progress: DeletionProgress): Promise<void> {
    progress.updateStatus('Deleting document chunks...');
    
    const result = await tx.documentChunk.deleteMany({
      where: { documentId },
    });
    
    progress.addCompleted('chunks', result.count);
  }

  private async deleteDocumentEntityRelationships(
    tx: any, 
    documentId: string, 
    progress: DeletionProgress
  ): Promise<void> {
    progress.updateStatus('Cleaning up entity relationships...');
    
    const result = await tx.documentEntity.deleteMany({
      where: { documentId },
    });
    
    progress.addCompleted('relationships', result.count);
  }

  private async updateOrphanedEntities(
    tx: any, 
    documentId: string, 
    progress: DeletionProgress
  ): Promise<void> {
    progress.updateStatus('Updating orphaned entities...');
    
    // Find entities that will become orphaned
    const orphanedEntityIds = await this.findOrphanedEntityIds(tx, documentId);
    
    if (orphanedEntityIds.length > 0) {
      await tx.entity.updateMany({
        where: { id: { in: orphanedEntityIds } },
        data: { isOrphaned: true, updatedAt: new Date() },
      });
    }
    
    progress.addCompleted('orphanedEntities', orphanedEntityIds.length);
  }

  private async findOrphanedEntityIds(tx: any, documentId: string): Promise<string[]> {
    // Find entities that are only connected to this document
    const entitiesInDocument = await tx.documentEntity.findMany({
      where: { documentId },
      select: { entityId: true },
    });

    const orphanedIds: string[] = [];
    
    for (const { entityId } of entitiesInDocument) {
      const otherConnections = await tx.documentEntity.count({
        where: { 
          entityId,
          documentId: { not: documentId },
        },
      });
      
      if (otherConnections === 0) {
        orphanedIds.push(entityId);
      }
    }
    
    return orphanedIds;
  }

  async batchDeleteDocuments(
    documentIds: string[], 
    options: BatchDeletionOptions = {}
  ): Promise<BatchDeletionResult> {
    const results: DeletionResult[] = [];
    const errors: { documentId: string; error: string }[] = [];
    
    for (const documentId of documentIds) {
      try {
        const result = await this.deleteDocument(documentId, options);
        results.push(result);
        
        if (options.onProgress) {
          options.onProgress(results.length, documentIds.length);
        }
      } catch (error) {
        errors.push({
          documentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return {
      totalRequested: documentIds.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }
}
```

### Step 2: Deletion Impact Analysis
```typescript
export class DeletionImpactAnalyzer {
  async analyzeImpact(documentIds: string[]): Promise<DeletionImpact> {
    const impact: DeletionImpact = {
      documents: documentIds.length,
      chunks: 0,
      facts: 0,
      affectedEntities: 0,
      orphanedEntities: 0,
      warnings: [],
      estimatedTime: 0,
    };

    for (const documentId of documentIds) {
      const docImpact = await this.analyzeDocumentImpact(documentId);
      impact.chunks += docImpact.chunks;
      impact.facts += docImpact.facts;
      impact.affectedEntities += docImpact.affectedEntities;
      impact.orphanedEntities += docImpact.orphanedEntities;
      impact.warnings.push(...docImpact.warnings);
    }

    impact.estimatedTime = this.calculateEstimatedTime(impact);
    
    return impact;
  }

  private async analyzeDocumentImpact(documentId: string): Promise<DocumentImpact> {
    const [chunks, facts, entities] = await Promise.all([
      this.countDocumentChunks(documentId),
      this.countDocumentFacts(documentId),
      this.analyzeEntityImpact(documentId),
    ]);

    return {
      chunks,
      facts,
      affectedEntities: entities.affected,
      orphanedEntities: entities.orphaned,
      warnings: entities.warnings,
    };
  }

  private async analyzeEntityImpact(documentId: string): Promise<EntityImpact> {
    const documentEntities = await prisma.documentEntity.findMany({
      where: { documentId },
      include: { entity: true },
    });

    const affected = documentEntities.length;
    let orphaned = 0;
    const warnings: string[] = [];

    for (const { entity } of documentEntities) {
      const otherConnections = await prisma.documentEntity.count({
        where: { 
          entityId: entity.id,
          documentId: { not: documentId },
        },
      });

      if (otherConnections === 0) {
        orphaned++;
        warnings.push(`Entity "${entity.name}" will become orphaned`);
      }
    }

    return { affected, orphaned, warnings };
  }
}
```

### Step 3: Frontend Components

#### DeletionConfirmationDialog
```typescript
interface DeletionConfirmationDialogProps {
  documents: Document[];
  isOpen: boolean;
  onConfirm: (options: DeletionOptions) => void;
  onCancel: () => void;
}

const DeletionConfirmationDialog: React.FC<DeletionConfirmationDialogProps> = ({
  documents,
  isOpen,
  onConfirm,
  onCancel
}) => {
  const [impact, setImpact] = useState<DeletionImpact | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen && documents.length > 0) {
      analyzeImpact();
    }
  }, [isOpen, documents]);

  const analyzeImpact = async () => {
    setIsAnalyzing(true);
    try {
      const documentIds = documents.map(d => d.id);
      const impactResult = await DeletionImpactAnalyzer.analyzeImpact(documentIds);
      setImpact(impactResult);
    } catch (error) {
      console.error('Failed to analyze deletion impact:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      preserveEntities: true,
      createAuditLog: true,
    });
  };

  const isConfirmEnabled = confirmText === 'DELETE' && impact && !isAnalyzing;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Confirm Document Deletion
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please review the impact below.
          </DialogDescription>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="w-6 h-6 mr-2" />
            Analyzing deletion impact...
          </div>
        ) : impact ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Deletion Impact</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Documents: {impact.documents}</div>
                <div>Chunks: {impact.chunks}</div>
                <div>Facts: {impact.facts}</div>
                <div>Affected Entities: {impact.affectedEntities}</div>
                <div>Orphaned Entities: {impact.orphanedEntities}</div>
                <div>Estimated Time: {impact.estimatedTime}s</div>
              </div>
            </div>

            {impact.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {impact.warnings.slice(0, 5).map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                  {impact.warnings.length > 5 && (
                    <li>• ... and {impact.warnings.length - 5} more warnings</li>
                  )}
                </ul>
              </div>
            )}

            <div>
              <Label htmlFor="confirmText">
                Type "DELETE" to confirm deletion:
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="mt-1"
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
          >
            Delete Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

## API Endpoints

### Enhanced Deletion APIs
```typescript
// Deletion impact analysis
POST /api/documents/deletion/analyze
{
  documentIds: string[];
}

// Execute deletion
POST /api/documents/deletion/execute
{
  documentIds: string[];
  options: DeletionOptions;
}

// Batch deletion
POST /api/documents/deletion/batch
{
  documentIds: string[];
  options: BatchDeletionOptions;
}

// Orphaned entity management
GET    /api/entities/orphaned
POST   /api/entities/orphaned/cleanup
PUT    /api/entities/[id]/orphaned
```

## Testing Strategy

### Unit Tests
- Deletion service logic
- Impact analysis accuracy
- Entity orphan detection
- Transaction rollback scenarios

### Integration Tests
- End-to-end deletion workflow
- Database consistency after deletion
- Audit trail creation
- Batch deletion operations

### Performance Tests
- Large document deletion
- Concurrent deletion operations
- Memory usage during deletion

## Acceptance Criteria

- [ ] Documents are deleted completely with all associated data
- [ ] Chunks and facts are properly cleaned up
- [ ] Entities are preserved even when orphaned
- [ ] Impact analysis provides accurate information
- [ ] Deletion operations are transactional and safe
- [ ] Audit trail tracks all deletion operations
- [ ] Batch deletion handles large sets efficiently
- [ ] UI provides clear confirmation and progress feedback

## Dependencies

- Enhanced entity and fact models
- Audit logging system
- Transaction management
- Progress tracking system

## Success Metrics

- Zero data inconsistencies after deletion
- Accurate impact analysis (>95% accuracy)
- Efficient deletion performance (<5s for typical documents)
- Complete audit trail for all operations
- User confidence in deletion safety
