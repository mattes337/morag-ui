import { NextRequest } from 'next/server';

// Mock the DocumentService and unified auth
jest.mock("../../../../lib/services/documentService", () => ({
    DocumentService: {
        getDocumentsByUser: jest.fn(),
        getDocumentsByUserId: jest.fn(),
        getDocumentsWithFilters: jest.fn(),
        createDocument: jest.fn(),
    },
}));
jest.mock("../../../../lib/services/unifiedFileService", () => ({
    unifiedFileService: {
        storeFile: jest.fn(),
    },
}));
jest.mock('../../../../lib/middleware/unifiedAuth', () => ({
    requireUnifiedAuth: jest.fn(),
    getUnifiedAuth: jest.fn(),
}));

// Import AFTER mocking
import { GET, POST } from "../../../../app/api/documents/route";
import { DocumentService } from "../../../../lib/services/documentService";
import { requireUnifiedAuth } from "../../../../lib/middleware/unifiedAuth";

const mockDocumentService = jest.mocked(DocumentService);
const mockRequireUnifiedAuth = jest.mocked(requireUnifiedAuth);

describe('/api/documents', () => {
    const mockUser = {
        userId: 'user1',
        email: 'test@example.com',
        role: 'ADMIN',
        name: 'Test User',
        authMethod: 'jwt' as const
    };

    const mockUnifiedAuth = {
        success: true,
        user: mockUser,
        realm: {
            id: 'realm1',
            name: 'Test Realm'
        },
        authMethod: 'session' as const
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireUnifiedAuth.mockResolvedValue(mockUnifiedAuth);
    });

    describe('GET', () => {
        it('should return documents with pagination', async () => {
            const mockDocuments = [
                {
                    id: '1',
                    name: 'Test Document.pdf',
                    type: 'PDF',
                    state: 'INGESTED',
                    version: 1,
                    chunks: 10,
                    quality: 0.95,
                    uploadDate: new Date(),
                },
            ];

            mockDocumentService.getDocumentsWithFilters.mockResolvedValue({
                documents: mockDocuments,
                total: mockDocuments.length
            } as any);

            const request = new NextRequest('http://localhost/api/documents');
            const response = await GET(request as any);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.documents).toEqual(mockDocuments);
            expect(data.pagination).toEqual({
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1
            });
            expect(data.realm).toEqual({
                id: 'realm1',
                name: 'Test Realm'
            });
            expect(data.authMethod).toBe('session');
            expect(mockDocumentService.getDocumentsWithFilters).toHaveBeenCalledWith({
                realmId: 'realm1',
                state: undefined,
                type: undefined,
                search: undefined,
                page: 1,
                limit: 20,
            });
        });

        it('should handle service errors', async () => {
            mockDocumentService.getDocumentsWithFilters.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost/api/documents');
            const response = await GET(request as any);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Database error' });
        });
    });

    describe('POST', () => {
        it('should create a new document', async () => {
            const mockDocument = {
                id: '1',
                name: 'New Document.pdf',
                type: 'PDF',
                userId: 'user1',
                databaseId: 'db1',
                state: 'PENDING',
                version: 1,
                chunks: 0,
                quality: 0,
                uploadDate: new Date(),
            };

            mockDocumentService.createDocument.mockResolvedValue(mockDocument as any);

            const request = new NextRequest('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Document.pdf',
                    type: 'document',
                    subType: 'pdf',
                    realmId: 'realm1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.document).toEqual(mockDocument);
            expect(data.message).toBe('Document created successfully');
            expect(mockDocumentService.createDocument).toHaveBeenCalledWith({
                name: 'New Document.pdf',
                type: 'document',
                subType: 'pdf',
                userId: 'user1',
                realmId: 'realm1',
                processingMode: 'AUTOMATIC',
            });
        });

        it('should validate required fields', async () => {
            const request = new NextRequest('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    // Missing name - the only required field
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'name is required' });
            expect(mockDocumentService.createDocument).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            mockDocumentService.createDocument.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Document.pdf',
                    type: 'document',
                    subType: 'pdf',
                    realmId: 'realm1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Database error' });
        });
    });
});
