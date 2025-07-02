/**
 * @jest-environment node
 */
import { DocumentService } from '../../../lib/services/documentService';
import { DocumentState } from '@prisma/client';

// Mock the DocumentService class
jest.mock('../../../lib/services/documentService', () => ({
    DocumentService: {
        createDocument: jest.fn(),
        getAllDocuments: jest.fn(),
        getDocumentById: jest.fn(),
        updateDocument: jest.fn(),
        deleteDocument: jest.fn(),
        getDocumentsByUser: jest.fn(),
        getDocumentsByRealm: jest.fn(),
        updateDocumentQuality: jest.fn(),
    },
}));

const mockDocumentService = DocumentService as jest.Mocked<typeof DocumentService>;

describe('DocumentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createDocument', () => {
        it('should create a document successfully', async () => {
            const mockDocument = {
                id: '1',
                name: 'Test Document',
                type: 'pdf',
                userId: 'user1',
                realmId: 'realm1',
                state: DocumentState.PENDING,
                version: 1,
                chunks: 0,
                quality: 0.0,
                uploadDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                realm: { 
                    id: 'realm1', 
                    name: 'Test Realm',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ownerId: 'user1',
                    description: 'Test Realm',
                    documentCount: 1,
                    lastUpdated: new Date(),
                    isDefault: false
                },
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
                jobs: [],
            };

            mockDocumentService.createDocument.mockResolvedValue(mockDocument);

            const result = await DocumentService.createDocument({
                name: 'Test Document',
                type: 'pdf',
                userId: 'user1',
                realmId: 'realm1',
                state: DocumentState.PENDING,
                version: 1,
            });

            expect(mockDocumentService.createDocument).toHaveBeenCalledWith({
                name: 'Test Document',
                type: 'pdf',
                userId: 'user1',
                realmId: 'realm1',
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
                    realmId: 'realm1',
                    state: DocumentState.INGESTED,
                    version: 1,
                    chunks: 0,
                    quality: 0.0,
                    uploadDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    realm: { 
                    id: 'realm1', 
                    name: 'Test Realm',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ownerId: 'user1',
                    description: 'Test Realm',
                    documentCount: 1,
                    lastUpdated: new Date(),
                    isDefault: false
                },
                    user: {
                        id: 'user1',
                        name: 'Test User',
                        email: 'test@example.com',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        avatar: null,
                        role: 'USER' as const,
                        theme: 'LIGHT' as const,
                    },
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
                realmId: 'realm1',
                state: DocumentState.INGESTED,
                version: 1,
                chunks: 0,
                quality: 0.0,
                uploadDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                realm: { 
                    id: 'realm1', 
                    name: 'Test Realm',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ownerId: 'user1',
                    description: 'Test Realm',
                    documentCount: 1,
                    lastUpdated: new Date(),
                    isDefault: false
                },
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
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
                realmId: 'realm1',
                state: DocumentState.INGESTED,
                version: 2,
                chunks: 0,
                quality: 0.0,
                uploadDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                realm: { 
                    id: 'realm1', 
                    name: 'Test Realm',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ownerId: 'user1',
                    description: 'Test Realm',
                    documentCount: 1,
                    lastUpdated: new Date(),
                    isDefault: false
                },
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
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
                realmId: 'realm1',
                state: DocumentState.INGESTED,
                version: 1,
                chunks: 0,
                quality: 0.0,
                uploadDate: new Date(),
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
                    realmId: 'realm1',
                    state: DocumentState.INGESTED,
                    version: 1,
                    chunks: 0,
                    quality: 0.0,
                    uploadDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    realm: { 
                    id: 'realm1', 
                    name: 'Test Realm',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ownerId: 'user1',
                    description: 'Test Realm',
                    documentCount: 1,
                    lastUpdated: new Date(),
                    isDefault: false
                },
                    user: {
                        id: 'user1',
                        name: 'Test User',
                        email: 'test@example.com',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        avatar: null,
                        role: 'USER' as const,
                        theme: 'LIGHT' as const,
                    },
                    jobs: [],
                },
            ];

            mockDocumentService.getDocumentsByUser.mockResolvedValue(mockDocuments);

            const result = await DocumentService.getDocumentsByUser('user1');

            expect(mockDocumentService.getDocumentsByUser).toHaveBeenCalledWith('user1');
            expect(result).toEqual(mockDocuments);
        });
    });

    describe('getDocumentsByRealm', () => {
        it('should return documents by realm id', async () => {
            const mockDocuments = [
                {
                    id: '1',
                    name: 'Realm Document',
                    type: 'pdf',
                    userId: 'user1',
                    realmId: 'realm1',
                    state: DocumentState.INGESTED,
                    version: 1,
                    chunks: 0,
                    quality: 0.0,
                    uploadDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    realm: { 
                    id: 'realm1', 
                    name: 'Test Realm',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ownerId: 'user1',
                    description: 'Test Realm',
                    documentCount: 1,
                    lastUpdated: new Date(),
                    isDefault: false
                },
                    user: {
                        id: 'user1',
                        name: 'Test User',
                        email: 'test@example.com',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        avatar: null,
                        role: 'USER' as const,
                        theme: 'LIGHT' as const,
                    },
                    jobs: [],
                },
            ];

            mockDocumentService.getDocumentsByRealm.mockResolvedValue(mockDocuments);

            const result = await DocumentService.getDocumentsByRealm('realm1');

            expect(mockDocumentService.getDocumentsByRealm).toHaveBeenCalledWith('realm1');
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
                realmId: 'realm1',
                state: DocumentState.INGESTED,
                version: 1,
                quality: 0.95,
                chunks: 10,
                uploadDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                realm: { 
                    id: 'realm1', 
                    name: 'Test Realm',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ownerId: 'user1',
                    description: 'Test Realm',
                    documentCount: 1,
                    lastUpdated: new Date(),
                    isDefault: false
                },
                jobs: [],
            };

            mockDocumentService.updateDocumentQuality.mockResolvedValue(mockUpdatedDocument);

            const result = await DocumentService.updateDocumentQuality('1', 0.95, 10);

            expect(mockDocumentService.updateDocumentQuality).toHaveBeenCalledWith('1', 0.95, 10);
            expect(result).toEqual(mockUpdatedDocument);
        });
    });
});
