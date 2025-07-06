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
        updateIngestionMetadata: jest.fn(),
    },
}));

// Import AFTER mocking
import { PUT, GET } from '../../../../../../app/api/documents/[id]/ingestion-metadata/route';
import { requireAuth } from '../../../../../../lib/auth';
import { DocumentService } from '../../../../../../lib/services/documentService';

const mockRequireAuth = jest.mocked(requireAuth);
const mockDocumentService = jest.mocked(DocumentService);

describe('/api/documents/[id]/ingestion-metadata', () => {
    const mockParams = { id: 'doc1' };
    const mockUser = { userId: 'user1' };
    const mockDocument = {
        id: 'doc1',
        name: 'Test Document',
        userId: 'user1',
        ingestionMetadata: null,
    };

    const mockIngestionMetadata = {
        ingestion_id: 'test-id-123',
        timestamp: '2025-07-06T17:50:38.645173+00:00',
        source_info: {
            source_path: '/test/document.pdf',
            content_type: 'pdf',
            document_id: 'doc_test_123'
        },
        processing_result: {
            success: true,
            processing_time: 450.0955994129181,
            content_length: 12345,
            metadata: {}
        },
        databases_configured: [],
        embeddings_data: {
            chunk_count: 5,
            chunk_size: 1000,
            chunk_overlap: 200,
            embedding_dimension: 768,
            chunks: []
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockResolvedValue(mockUser as any);
        mockDocumentService.getDocumentById.mockResolvedValue(mockDocument as any);
    });

    describe('PUT', () => {
        it('should update ingestion metadata successfully', async () => {
            const updatedDocument = {
                ...mockDocument,
                ingestionMetadata: mockIngestionMetadata,
            };
            
            mockDocumentService.updateIngestionMetadata.mockResolvedValue(updatedDocument as any);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata', {
                method: 'PUT',
                body: JSON.stringify({
                    ingestionMetadata: mockIngestionMetadata,
                }),
            });

            const response = await PUT(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.ingestionMetadata).toEqual(mockIngestionMetadata);
            expect(mockDocumentService.updateIngestionMetadata).toHaveBeenCalledWith(
                'doc1',
                mockIngestionMetadata
            );
        });

        it('should return 400 if ingestion metadata is missing', async () => {
            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata', {
                method: 'PUT',
                body: JSON.stringify({}),
            });

            const response = await PUT(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Ingestion metadata is required');
        });

        it('should return 404 if document not found', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata', {
                method: 'PUT',
                body: JSON.stringify({
                    ingestionMetadata: mockIngestionMetadata,
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

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata', {
                method: 'PUT',
                body: JSON.stringify({
                    ingestionMetadata: mockIngestionMetadata,
                }),
            });

            const response = await PUT(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.error).toBe('Access denied');
        });

        it('should handle authentication errors', async () => {
            mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata', {
                method: 'PUT',
                body: JSON.stringify({
                    ingestionMetadata: mockIngestionMetadata,
                }),
            });

            const response = await PUT(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to update ingestion metadata');
        });
    });

    describe('GET', () => {
        it('should return ingestion metadata successfully', async () => {
            const documentWithMetadata = {
                ...mockDocument,
                ingestionMetadata: mockIngestionMetadata,
            };
            mockDocumentService.getDocumentById.mockResolvedValue(documentWithMetadata as any);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata');

            const response = await GET(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.ingestionMetadata).toEqual(mockIngestionMetadata);
        });

        it('should return null if no ingestion metadata exists', async () => {
            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata');

            const response = await GET(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.ingestionMetadata).toBeNull();
        });

        it('should return 404 if document not found', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata');

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

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata');

            const response = await GET(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.error).toBe('Access denied');
        });

        it('should handle authentication errors', async () => {
            mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

            const request = new NextRequest('http://localhost:3000/api/documents/doc1/ingestion-metadata');

            const response = await GET(request, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch ingestion metadata');
        });
    });
});
