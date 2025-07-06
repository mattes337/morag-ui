/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock the services and auth
jest.mock('../../../../../../lib/auth', () => ({
    requireAuth: jest.fn(),
}));

jest.mock('../../../../../../lib/services/documentService', () => ({
    DocumentService: {
        getDocumentById: jest.fn(),
        updateDocumentSummary: jest.fn(),
    },
}));

// Import AFTER mocking
import { PUT, GET } from '../../../../../../app/api/documents/[id]/summary/route';
import { requireAuth } from '../../../../../../lib/auth';
import { DocumentService } from '../../../../../../lib/services/documentService';

const mockRequireAuth = jest.mocked(requireAuth);
const mockDocumentService = jest.mocked(DocumentService);

describe('/api/documents/[id]/summary', () => {
    const mockParams = { id: 'doc1' };
    const mockUser = { userId: 'user1' };
    const mockDocument = {
        id: 'doc1',
        name: 'Test Document',
        userId: 'user1',
        summary: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockResolvedValue(mockUser as any);
        mockDocumentService.getDocumentById.mockResolvedValue(mockDocument as any);
    });

    describe('PUT', () => {
        it('should update document summary successfully', async () => {
            const testSummary = 'This is a test document summary about important topics.';
            const updatedDocument = {
                ...mockDocument,
                summary: testSummary,
            };
            
            mockDocumentService.updateDocumentSummary.mockResolvedValue(updatedDocument as any);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary', {
                method: 'PUT',
                body: JSON.stringify({
                    summary: testSummary,
                }),
            });

            const response = await PUT(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.summary).toBe(testSummary);
            expect(mockDocumentService.updateDocumentSummary).toHaveBeenCalledWith(
                'doc1',
                testSummary
            );
        });

        it('should return 400 if summary is missing', async () => {
            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary', {
                method: 'PUT',
                body: JSON.stringify({}),
            });

            const response = await PUT(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Summary is required and must be a string');
        });

        it('should return 400 if summary is not a string', async () => {
            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary', {
                method: 'PUT',
                body: JSON.stringify({
                    summary: 123,
                }),
            });

            const response = await PUT(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Summary is required and must be a string');
        });

        it('should return 404 if document not found', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary', {
                method: 'PUT',
                body: JSON.stringify({
                    summary: 'Test summary',
                }),
            });

            const response = await PUT(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Document not found');
        });

        it('should return 403 if user does not own document', async () => {
            const otherUserDocument = {
                ...mockDocument,
                userId: 'other-user',
            };
            mockDocumentService.getDocumentById.mockResolvedValue(otherUserDocument as any);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary', {
                method: 'PUT',
                body: JSON.stringify({
                    summary: 'Test summary',
                }),
            });

            const response = await PUT(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.error).toBe('Access denied');
        });
    });

    describe('GET', () => {
        it('should return document summary successfully', async () => {
            const documentWithSummary = {
                ...mockDocument,
                summary: 'This is a test summary',
            };
            mockDocumentService.getDocumentById.mockResolvedValue(documentWithSummary as any);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary');

            const response = await GET(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.summary).toBe('This is a test summary');
        });

        it('should return null if no summary exists', async () => {
            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary');

            const response = await GET(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.summary).toBeNull();
        });

        it('should return 404 if document not found', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary');

            const response = await GET(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Document not found');
        });

        it('should return 403 if user does not own document', async () => {
            const otherUserDocument = {
                ...mockDocument,
                userId: 'other-user',
            };
            mockDocumentService.getDocumentById.mockResolvedValue(otherUserDocument as any);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary');

            const response = await GET(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.error).toBe('Access denied');
        });

        it('should handle authentication errors', async () => {
            mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/summary');

            const response = await GET(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch document summary');
        });
    });
});
