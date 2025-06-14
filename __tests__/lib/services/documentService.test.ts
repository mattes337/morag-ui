// Mock the DocumentService
jest.mock('../../../lib/services/documentService');

import { DocumentService } from '../../../lib/services/documentService';
import { DocumentState } from '@prisma/client';

// Create mock DocumentService
const mockDocumentService = DocumentService as jest.Mocked<typeof DocumentService>;

describe('DocumentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup all mock methods
        mockDocumentService.createDocument = jest.fn();
        mockDocumentService.getAllDocuments = jest.fn();
        mockDocumentService.getDocumentById = jest.fn();
        mockDocumentService.updateDocument = jest.fn();
        mockDocumentService.deleteDocument = jest.fn();
        mockDocumentService.getDocumentsByUser = jest.fn();
        mockDocumentService.getDocumentsByDatabase = jest.fn();
        mockDocumentService.updateDocumentQuality = jest.fn();
    });

    describe('createDocument', () => {
        it('should create a document successfully', async () => {
            const mockDocument = {
                id: '1',
                name: 'Test Document',
                type: 'pdf',
                userId: 'user1',
                databaseId: 'db1',
                state: DocumentState.PENDING,
                version: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                database: { id: 'db1', name: 'Test DB' },
                user: { id: 'user1', name: 'Test User' },
                jobs: [],
            };

            mockDocumentService.createDocument.mockResolvedValue(mockDocument);

            const result = await DocumentService.createDocument({
                name: 'Test Document',
                type: 'pdf',
                userId: 'user1',
                databaseId: 'db1',
                state: DocumentState.PENDING,
                version: 1,
            });

            expect(mockDocumentService.createDocument).toHaveBeenCalledWith({
                name: 'Test Document',
                type: 'pdf',
                userId: 'user1',
                databaseId: 'db1',
                state: DocumentState.PENDING,
                version: 1,
            });

            expect(result).toEqual(mockDocument);
        });
    });

    describe('getAllDocuments', () => {
        it('should return all documents', async () => {
            const mockDocuments = [
                {
                    id: '1',
                    name: 'Document 1',
                    type: 'pdf',
                    userId: 'user1',
                    databaseId: 'db1',
                    state: DocumentState.COMPLETED,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    database: { id: 'db1', name: 'Test DB' },
                    user: { id: 'user1', name: 'Test User' },
                    jobs: [],
                },
            ];

            mockDocumentService.getAllDocuments.mockResolvedValue(mockDocuments);

            const result = await DocumentService.getAllDocuments();

            expect(mockDocumentService.getAllDocuments).toHaveBeenCalled();
            expect(result).toEqual(mockDocuments);
        });
    });

    describe('getDocumentById', () => {
        it('should return a document by id', async () => {
            const mockDocument = {
                id: '1',
                name: 'Test Document',
                type: 'pdf',
                userId: 'user1',
                databaseId: 'db1',
                state: DocumentState.COMPLETED,
                version: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                database: { id: 'db1', name: 'Test DB' },
                user: { id: 'user1', name: 'Test User' },
                jobs: [],
            };

            mockDocumentService.getDocumentById.mockResolvedValue(mockDocument);

            const result = await DocumentService.getDocumentById('1');

            expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockDocument);
        });
    });

    describe('updateDocument', () => {
        it('should update a document', async () => {
            const mockUpdatedDocument = {
                id: '1',
                name: 'Updated Document',
                type: 'pdf',
                userId: 'user1',
                databaseId: 'db1',
                state: DocumentState.COMPLETED,
                version: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                database: { id: 'db1', name: 'Test DB' },
                user: { id: 'user1', name: 'Test User' },
                jobs: [],
            };

            mockDocumentService.updateDocument.mockResolvedValue(mockUpdatedDocument);

            const result = await DocumentService.updateDocument('1', {
                name: 'Updated Document',
                version: 2,
            });

            expect(mockDocumentService.updateDocument).toHaveBeenCalledWith('1', {
                name: 'Updated Document',
                version: 2,
            });
            expect(result).toEqual(mockUpdatedDocument);
        });
    });

    describe('deleteDocument', () => {
        it('should delete a document', async () => {
            const mockDeletedDocument = {
                id: '1',
                name: 'Test Document',
                type: 'pdf',
                userId: 'user1',
                databaseId: 'db1',
                state: DocumentState.COMPLETED,
                version: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDocumentService.deleteDocument.mockResolvedValue(mockDeletedDocument);

            const result = await DocumentService.deleteDocument('1');

            expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockDeletedDocument);
        });
    });

    describe('getDocumentsByUser', () => {
        it('should return documents by user id', async () => {
            const mockDocuments = [
                {
                    id: '1',
                    name: 'User Document',
                    type: 'pdf',
                    userId: 'user1',
                    databaseId: 'db1',
                    state: DocumentState.COMPLETED,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    database: { id: 'db1', name: 'Test DB' },
                    user: { id: 'user1', name: 'Test User' },
                    jobs: [],
                },
            ];

            mockDocumentService.getDocumentsByUser.mockResolvedValue(mockDocuments);

            const result = await DocumentService.getDocumentsByUser('user1');

            expect(mockDocumentService.getDocumentsByUser).toHaveBeenCalledWith('user1');
            expect(result).toEqual(mockDocuments);
        });
    });

    describe('getDocumentsByDatabase', () => {
        it('should return documents by database id', async () => {
            const mockDocuments = [
                {
                    id: '1',
                    name: 'Database Document',
                    type: 'pdf',
                    userId: 'user1',
                    databaseId: 'db1',
                    state: DocumentState.COMPLETED,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    database: { id: 'db1', name: 'Test DB' },
                    user: { id: 'user1', name: 'Test User' },
                    jobs: [],
                },
            ];

            mockDocumentService.getDocumentsByDatabase.mockResolvedValue(mockDocuments);

            const result = await DocumentService.getDocumentsByDatabase('db1');

            expect(mockDocumentService.getDocumentsByDatabase).toHaveBeenCalledWith('db1');
            expect(result).toEqual(mockDocuments);
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
                state: DocumentState.COMPLETED,
                version: 1,
                quality: 0.95,
                chunks: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
                database: { id: 'db1', name: 'Test DB' },
                jobs: [],
            };

            mockDocumentService.updateDocumentQuality.mockResolvedValue(mockUpdatedDocument);

            const result = await DocumentService.updateDocumentQuality('1', 0.95, 10);

            expect(mockDocumentService.updateDocumentQuality).toHaveBeenCalledWith('1', 0.95, 10);
            expect(result).toEqual(mockUpdatedDocument);
        });
    });
});
