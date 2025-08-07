import { prisma } from '../database';
import { 
    DeletionPlan, 
    DeletionOptions, 
    DeletionResult, 
    DeletionProgressResult,
    DeletionImpact,
    BatchDeletionOptions,
    BatchDeletionResult
} from '../../types';

export class DeletionProgress {
    private plan: DeletionPlan;
    private status: string = '';
    private completed: {
        facts: number;
        chunks: number;
        relationships: number;
        orphanedEntities: number;
    } = {
        facts: 0,
        chunks: 0,
        relationships: 0,
        orphanedEntities: 0
    };

    constructor(plan: DeletionPlan) {
        this.plan = plan;
    }

    updateStatus(status: string) {
        this.status = status;
    }

    addCompleted(type: keyof typeof this.completed, count: number) {
        this.completed[type] = count;
    }

    getResult(): DeletionProgressResult {
        return {
            status: this.status,
            completed: this.completed
        };
    }
}

export class EnhancedDocumentDeletionService {
    async deleteDocument(documentId: string, options: DeletionOptions = {}): Promise<DeletionResult> {
        const deletionPlan = await this.createDeletionPlan(documentId);
        
        if (options.dryRun) {
            return { plan: deletionPlan, executed: false, success: true };
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
                
                // Step 6: Create audit log if requested
                if (options.createAuditLog && options.userId) {
                    await this.createDeletionAuditLog(tx, plan, options.userId);
                }
                
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

    private async getDocumentWithRelations(documentId: string) {
        return await prisma.document.findUnique({
            where: { id: documentId },
            include: {
                documentChunks: true,
                facts: true,
                entities: true
            }
        });
    }

    private async getDocumentChunks(documentId: string) {
        return await prisma.documentChunk.findMany({
            where: { documentId }
        });
    }

    private async getDocumentFacts(documentId: string) {
        return await prisma.fact.findMany({
            where: { documentId }
        });
    }

    private async getAffectedEntities(documentId: string) {
        return await prisma.documentEntity.findMany({
            where: { documentId },
            include: { entity: true }
        });
    }

    private async getDocumentEntityRelationships(documentId: string) {
        return await prisma.documentEntity.findMany({
            where: { documentId }
        });
    }

    private async identifyOrphanedEntities(affectedEntities: any[]) {
        const orphaned = [];
        
        for (const { entity, documentId } of affectedEntities) {
            const otherConnections = await prisma.documentEntity.count({
                where: { 
                    entityId: entity.id,
                    documentId: { not: documentId }
                }
            });
            
            if (otherConnections === 0) {
                orphaned.push(entity);
            }
        }
        
        return orphaned;
    }

    private estimateDeletionTime(chunks: number, facts: number): number {
        // Simple estimation: 0.1s per chunk + 0.05s per fact + 2s base time
        return Math.ceil(chunks * 0.1 + facts * 0.05 + 2);
    }

    private generateWarnings(orphanedEntities: any[]): string[] {
        return orphanedEntities.map(entity => 
            `Entity "${entity.name}" (${entity.type}) will become orphaned`
        );
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

    private async deleteDocumentRecord(tx: any, documentId: string, progress: DeletionProgress): Promise<void> {
        progress.updateStatus('Deleting document record...');
        
        await tx.document.delete({
            where: { id: documentId }
        });
    }

    private async createDeletionAuditLog(tx: any, plan: DeletionPlan, userId: string): Promise<void> {
        // This would create an audit log entry - implementation depends on audit system
        console.log(`Audit: User ${userId} deleted document ${plan.documentName} (${plan.documentId})`);
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

    private async analyzeDocumentImpact(documentId: string) {
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

    private async countDocumentChunks(documentId: string): Promise<number> {
        return await prisma.documentChunk.count({
            where: { documentId }
        });
    }

    private async countDocumentFacts(documentId: string): Promise<number> {
        return await prisma.fact.count({
            where: { documentId }
        });
    }

    private async analyzeEntityImpact(documentId: string) {
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
                warnings.push(`Entity "${entity.name}" (${entity.type}) will become orphaned`);
            }
        }

        return { affected, orphaned, warnings };
    }

    private calculateEstimatedTime(impact: DeletionImpact): number {
        // Estimation: 0.1s per chunk + 0.05s per fact + 1s per document + 2s base
        return Math.ceil(
            impact.chunks * 0.1 +
            impact.facts * 0.05 +
            impact.documents * 1 +
            2
        );
    }
}
