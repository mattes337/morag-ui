import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/documents/route';
import { DocumentService } from '../../../../lib/services/documentService';

// Mock the DocumentService
jest.mock('../../../../lib/services/documentService');
const mockDocumentService = DocumentService as jest.Mocked<typeof DocumentService>;

describe('/api/documents', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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

            mockDocumentService.getAllDocuments.mockResolvedValue(mockDocuments as any);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDocuments);
            expect(mockDocumentService.getAllDocuments).toHaveBeenCalledTimes(1);
        });

        it('should handle service errors', async () => {
            mockDocumentService.getAllDocuments.mockRejectedValue(new Error('Database error'));

            const response = await GET();
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
                databaseId: 'db1',
            });
        });

        it('should validate required fields', async () => {
            const request = new NextRequest('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Document.pdf',
                    // Missing type and userId
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Name, type, and userId are required' });
            expect(mockDocumentService.createDocument).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            mockDocumentService.createDocument.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Document.pdf',
                    type: 'PDF',
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
