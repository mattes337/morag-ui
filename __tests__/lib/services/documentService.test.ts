// Mock the database module
jest.mock('../../../lib/database', () => ({
    prisma: {
        document: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        database: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        user: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        server: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        apiKey: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        job: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

// Import modules after mocking
import { DocumentService } from '../../../lib/services/documentService';
import { prisma } from '../../../lib/database';
import { DocumentState } from '@prisma/client';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('DocumentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createDocument', () => {
        it('should create a document successfully', async () => {
            const mockDocument = {
                id: '1',
                name: 'Test Document.pdf',
                type: 'PDF',
                userId: 'user1',
                databaseId: 'db1',
                state: 'PENDING' as DocumentState,
                version: 1,
                chunks: 0,
                quality: 0,
                uploadDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                database: { id: 'db1', name: 'Test DB' },
                user: { id: 'user1', name: 'Test User' },
                jobs: [],
            };

            mockPrisma.document.create.mockResolvedValue(mockDocument);
            mockPrisma.database.update.mockResolvedValue({} as any);

            const result = await DocumentService.createDocument({
                name: 'Test Document.pdf',
                type: 'PDF',
                userId: 'user1',
                databaseId: 'db1',
            });

            expect(mockPrisma.document.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test Document.pdf',
                    type: 'PDF',
                    userId: 'user1',
                    databaseId: 'db1',
                },
                include: {
                    database: true,
                    user: true,
                    jobs: true,
                },
            });

            expect(mockPrisma.database.update).toHaveBeenCalledWith({
                where: { id: 'db1' },
                data: {
                    documentCount: { increment: 1 },
                    lastUpdated: expect.any(Date),
                },
            });

            expect(result).toEqual(mockDocument);
        });

        it('should create a document without updating database count when no databaseId', async () => {
            const mockDocument = {
                id: '1',
                name: 'Test Document.pdf',
                type: 'PDF',
                userId: 'user1',
                state: 'PENDING' as DocumentState,
                version: 1,
                chunks: 0,
                quality: 0,
                uploadDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                database: null,
                user: { id: 'user1', name: 'Test User' },
                jobs: [],
            };

            mockPrisma.document.create.mockResolvedValue(mockDocument);

            await DocumentService.createDocument({
                name: 'Test Document.pdf',
                type: 'PDF',
                userId: 'user1',
            });

            expect(mockPrisma.database.update).not.toHaveBeenCalled();
        });
    });

    describe('getAllDocuments', () => {
        it('should return all documents with related data', async () => {
            const mockDocuments = [
                {
                    id: '1',
                    name: 'Document 1',
                    database: { id: 'db1', name: 'DB 1' },
                    user: { id: 'user1', name: 'User 1' },
                    jobs: [{ id: 'job1', status: 'COMPLETED' }],
                },
            ];

            mockPrisma.document.findMany.mockResolvedValue(mockDocuments as any);

            const result = await DocumentService.getAllDocuments();

            expect(mockPrisma.document.findMany).toHaveBeenCalledWith({
                include: {
                    database: true,
                    user: true,
                    jobs: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { uploadDate: 'desc' },
            });

            expect(result).toEqual(mockDocuments);
        });
    });

    describe('getDocumentById', () => {
        it('should return a document by id', async () => {
            const mockDocument = {
                id: '1',
                name: 'Test Document',
                database: { id: 'db1', name: 'DB 1' },
                user: { id: 'user1', name: 'User 1' },
                jobs: [],
            };

            mockPrisma.document.findUnique.mockResolvedValue(mockDocument as any);

            const result = await DocumentService.getDocumentById('1');

            expect(mockPrisma.document.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: {
                    database: true,
                    user: true,
                    jobs: { orderBy: { createdAt: 'desc' } },
                },
            });

            expect(result).toEqual(mockDocument);
        });
    });

    describe('updateDocument', () => {
        it('should update a document', async () => {
            const mockUpdatedDocument = {
                id: '1',
                name: 'Updated Document',
                database: { id: 'db1', name: 'DB 1' },
                jobs: [],
            };

            // Set up the mock manually
            mockPrisma.document.update = jest.fn().mockResolvedValue(mockUpdatedDocument as any);

            const result = await DocumentService.updateDocument('1', {
                name: 'Updated Document',
            });

            expect(mockPrisma.document.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { name: 'Updated Document' },
                include: {
                    database: true,
                    jobs: true,
                },
            });

            expect(result).toEqual(mockUpdatedDocument);
        });
    });

    describe('deleteDocument', () => {
        it('should delete a document and update database count', async () => {
            const mockDocument = { databaseId: 'db1' };
            const mockDeletedDocument = { id: '1', name: 'Deleted Document' };

            mockPrisma.document.findUnique.mockResolvedValue(mockDocument as any);
            mockPrisma.document.delete.mockResolvedValue(mockDeletedDocument as any);
            mockPrisma.database.update.mockResolvedValue({} as any);

            const result = await DocumentService.deleteDocument('1');

            expect(mockPrisma.document.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                select: { databaseId: true },
            });

            expect(mockPrisma.document.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });

            expect(mockPrisma.database.update).toHaveBeenCalledWith({
                where: { id: 'db1' },
                data: {
                    documentCount: { decrement: 1 },
                    lastUpdated: expect.any(Date),
                },
            });

            expect(result).toEqual(mockDeletedDocument);
        });

        it('should delete a document without updating database count when no databaseId', async () => {
            const mockDocument = { databaseId: null };
            const mockDeletedDocument = { id: '1', name: 'Deleted Document' };

            mockPrisma.document.findUnique.mockResolvedValue(mockDocument as any);
            mockPrisma.document.delete.mockResolvedValue(mockDeletedDocument as any);

            await DocumentService.deleteDocument('1');

            expect(mockPrisma.database.update).not.toHaveBeenCalled();
        });
    });

    describe('updateDocumentState', () => {
        it('should update document state', async () => {
            const mockUpdatedDocument = {
                id: '1',
                state: 'INGESTED' as DocumentState,
                database: { id: 'db1', name: 'DB 1' },
                jobs: [],
            };

            mockPrisma.document.update.mockResolvedValue(mockUpdatedDocument as any);

            const result = await DocumentService.updateDocumentState('1', 'INGESTED');

            expect(mockPrisma.document.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { state: 'INGESTED' },
                include: {
                    database: true,
                    jobs: true,
                },
            });

            expect(result).toEqual(mockUpdatedDocument);
        });
    });

    describe('updateDocumentQuality', () => {
        it('should update document quality and chunks', async () => {
            const mockUpdatedDocument = {
                id: '1',
                name: 'Test Document',
                type: 'pdf',
                userId: 'user1',
                databaseId: 'db1',
                state: DocumentState.PROCESSED,
                version: 1,
                quality: 0.95,
                chunks: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
                database: {
                    id: 'db1',
                    name: 'Test Database',
                },
                jobs: [],
            };

            // Set up the mock for the prisma.document.update method
            mockPrisma.document.update.mockResolvedValue(mockUpdatedDocument);
            
            const result = await DocumentService.updateDocumentQuality('1', 0.95, 10);

            expect(mockPrisma.document.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { quality: 0.95, chunks: 10 },
                include: {
                    database: true,
                    jobs: true,
                },
            });
            expect(result).toEqual(mockUpdatedDocument);
        });
    });
});
