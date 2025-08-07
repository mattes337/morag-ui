import { EnhancedDocumentDeletionService, DeletionImpactAnalyzer } from '../../../lib/services/enhancedDocumentDeletionService';
import { prisma } from '../../../lib/database';

// Mock Prisma
jest.mock('../../../lib/database', () => ({
    prisma: {
        document: {
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
        documentChunk: {
            findMany: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
        fact: {
            findMany: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
        documentEntity: {
            findMany: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
        entity: {
            updateMany: jest.fn(),
        },
        realm: {
            update: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('EnhancedDocumentDeletionService', () => {
    let service: EnhancedDocumentDeletionService;

    beforeEach(() => {
        service = new EnhancedDocumentDeletionService();
        jest.clearAllMocks();
    });

    describe('createDeletionPlan', () => {
        it('should create a deletion plan for a document', async () => {
            const documentId = 'doc-123';
            const mockDocument = {
                id: documentId,
                name: 'Test Document',
                documentChunks: [],
                facts: [],
                entities: []
            };

            mockPrisma.document.findUnique.mockResolvedValue(mockDocument as any);
            mockPrisma.documentChunk.findMany.mockResolvedValue([
                { id: 'chunk-1', documentId, content: 'chunk 1', chunkIndex: 0 },
                { id: 'chunk-2', documentId, content: 'chunk 2', chunkIndex: 1 }
            ] as any);
            mockPrisma.fact.findMany.mockResolvedValue([
                { id: 'fact-1', documentId, subject: 'test', predicate: 'is', object: 'fact' }
            ] as any);
            mockPrisma.documentEntity.findMany
                .mockResolvedValueOnce([
                    { id: 'de-1', documentId, entityId: 'entity-1', entity: { id: 'entity-1', name: 'Test Entity' } }
                ] as any)
                .mockResolvedValueOnce([
                    { id: 'de-1', documentId, entityId: 'entity-1' }
                ] as any);
            mockPrisma.documentEntity.count.mockResolvedValue(0); // Entity will be orphaned

            const plan = await service.createDeletionPlan(documentId);

            expect(plan).toEqual({
                documentId,
                documentName: 'Test Document',
                chunksToDelete: 2,
                factsToDelete: 1,
                relationshipsToDelete: 1,
                entitiesToPreserve: 1,
                orphanedEntities: 1,
                estimatedTime: expect.any(Number),
                warnings: ['Entity "Test Entity" (undefined) will become orphaned'],
            });
        });

        it('should throw error if document not found', async () => {
            mockPrisma.document.findUnique.mockResolvedValue(null);

            await expect(service.createDeletionPlan('non-existent')).rejects.toThrow('Document not found');
        });
    });

    describe('deleteDocument with dryRun', () => {
        it('should return plan without executing deletion when dryRun is true', async () => {
            const documentId = 'doc-123';
            const mockDocument = {
                id: documentId,
                name: 'Test Document',
                documentChunks: [],
                facts: [],
                entities: []
            };

            mockPrisma.document.findUnique.mockResolvedValue(mockDocument as any);
            mockPrisma.documentChunk.findMany.mockResolvedValue([]);
            mockPrisma.fact.findMany.mockResolvedValue([]);
            mockPrisma.documentEntity.findMany.mockResolvedValue([]);

            const result = await service.deleteDocument(documentId, { dryRun: true });

            expect(result.executed).toBe(false);
            expect(result.success).toBe(true);
            expect(result.plan).toBeDefined();
            expect(mockPrisma.$transaction).not.toHaveBeenCalled();
        });
    });
});

describe('DeletionImpactAnalyzer', () => {
    let analyzer: DeletionImpactAnalyzer;

    beforeEach(() => {
        analyzer = new DeletionImpactAnalyzer();
        jest.clearAllMocks();
    });

    describe('analyzeImpact', () => {
        it('should analyze impact for multiple documents', async () => {
            const documentIds = ['doc-1', 'doc-2'];

            mockPrisma.documentChunk.count
                .mockResolvedValueOnce(5)
                .mockResolvedValueOnce(3);
            mockPrisma.fact.count
                .mockResolvedValueOnce(10)
                .mockResolvedValueOnce(7);
            mockPrisma.documentEntity.findMany
                .mockResolvedValueOnce([
                    { entity: { id: 'entity-1', name: 'Entity 1', type: 'person' } }
                ] as any)
                .mockResolvedValueOnce([
                    { entity: { id: 'entity-2', name: 'Entity 2', type: 'organization' } }
                ] as any);
            mockPrisma.documentEntity.count
                .mockResolvedValueOnce(0) // entity-1 will be orphaned
                .mockResolvedValueOnce(1); // entity-2 has other connections

            const impact = await analyzer.analyzeImpact(documentIds);

            expect(impact).toEqual({
                documents: 2,
                chunks: 8,
                facts: 17,
                affectedEntities: 2,
                orphanedEntities: 1,
                warnings: ['Entity "Entity 1" (person) will become orphaned'],
                estimatedTime: expect.any(Number),
            });
        });

        it('should handle empty document list', async () => {
            const impact = await analyzer.analyzeImpact([]);

            expect(impact).toEqual({
                documents: 0,
                chunks: 0,
                facts: 0,
                affectedEntities: 0,
                orphanedEntities: 0,
                warnings: [],
                estimatedTime: 2, // Base time
            });
        });
    });
});
