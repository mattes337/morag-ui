import { NextRequest } from 'next/server';

// Mock the DocumentService and auth
jest.mock("../../../../lib/services/documentService", () => ({
    DocumentService: {
        getDocumentsByUser: jest.fn(),
        getDocumentsByUserId: jest.fn(),
        createDocument: jest.fn(),
    },
}));
jest.mock('../../../../lib/auth', () => ({
    requireAuth: jest.fn(),
    getAuthUser: jest.fn(),
}));

// Import AFTER mocking
import { GET, POST } from "../../../../app/api/documents/route";
import { DocumentService } from "../../../../lib/services/documentService";
import { requireAuth, getAuthUser } from "../../../../lib/auth";

const mockDocumentService = jest.mocked(DocumentService);
const mockRequireAuth = jest.mocked(requireAuth);
const mockGetAuthUser = jest.mocked(getAuthUser);

describe('/api/documents', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN', name: 'Test User', authMethod: 'jwt' as const };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockReturnValue(Promise.resolve(mockUser));
        mockGetAuthUser.mockResolvedValue({
            ...mockUser,
            name: 'Test User',
            authMethod: 'jwt'
        });
    });

    describe('GET', () => {
        it('should return all documents', async () => {
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

            mockDocumentService.getDocumentsByUserId.mockResolvedValue(mockDocuments as any);

            const request = new NextRequest('http://localhost/api/documents');
            const response = await GET(request as any);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDocuments);
            expect(mockDocumentService.getDocumentsByUserId).toHaveBeenCalledWith('user1', null);
        });

        it('should handle service errors', async () => {
            mockDocumentService.getDocumentsByUserId.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost/api/documents');
            const response = await GET(request as any);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to fetch documents' });
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
                    type: 'PDF',
                    userId: 'user1',
                    databaseId: 'db1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockDocument);
            expect(mockDocumentService.createDocument).toHaveBeenCalledWith({
                name: 'New Document.pdf',
                type: 'PDF',
                userId: 'user1',
                realmId: 'db1',
            });
        });

        it('should validate required fields', async () => {
            const request = new NextRequest('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Document.pdf',
                    // Missing type (userId comes from auth)
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Name, type, and realmId are required' });
            expect(mockDocumentService.createDocument).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            mockDocumentService.createDocument.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Document.pdf',
                    type: 'PDF',
                    databaseId: 'db1',
                    userId: 'user1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to create document' });
        });
    });
});
