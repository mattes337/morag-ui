/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock the DocumentService
jest.mock('../../../../../lib/services/documentService', () => ({
    DocumentService: {
        getDocumentById: jest.fn(),
        updateDocument: jest.fn(),
        deleteDocument: jest.fn(),
    },
}));

// Import AFTER mocking
import { GET, PUT, DELETE } from '../../../../../app/api/documents/[id]/route';
import { DocumentService } from '../../../../../lib/services/documentService';

const mockDocumentService = jest.mocked(DocumentService);

describe('/api/documents/[id]', () => {
    const mockParams = { id: 'doc1' };
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return the document if it exists', async () => {
            const mockDocument = {
                id: 'doc1',
                name: 'Test Document',
                content: 'Test content',
                userId: 'user1',
                databaseId: 'db1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDocumentService.getDocumentById.mockResolvedValue(mockDocument as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDocument);
            expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith('doc1');
        });

        it('should return 404 if the document does not exist', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/nonexistent');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Document not found' });
        });

        it('should handle service errors', async () => {
            mockDocumentService.getDocumentById.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to fetch document' });
        });
    });

    describe('PUT', () => {
        it('should update the document', async () => {
            const mockDocument = {
                id: 'doc1',
                name: 'Updated Document',
                content: 'Updated content',
                userId: 'user1',
                databaseId: 'db1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDocumentService.updateDocument.mockResolvedValue(mockDocument as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Document',
                    content: 'Updated content'
                })
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDocument);
            expect(mockDocumentService.updateDocument).toHaveBeenCalledWith('doc1', {
                name: 'Updated Document',
                content: 'Updated content'
            });
        });

        it('should handle service errors', async () => {
            mockDocumentService.updateDocument.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Document',
                    content: 'Updated content'
                })
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to update document' });
        });
    });

    describe('DELETE', () => {
        it('should delete the document', async () => {
            const mockDocument = {
                id: 'doc1',
                name: 'Test Document',
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: 'user1',
                type: 'PDF',
                state: 'ingested' as any,
                version: 1,
                chunks: 10,
                quality: 0.9,
                uploadDate: new Date(),
                databaseId: 'db1'
            };
            mockDocumentService.deleteDocument.mockResolvedValue(mockDocument);

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1');
            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
            expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith('doc1');
        });

        it('should handle service errors', async () => {
            mockDocumentService.deleteDocument.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1');
            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to delete document' });
        });
    });
});