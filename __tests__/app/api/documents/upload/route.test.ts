/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../../../../../app/api/documents/upload/route';
import { requireAuth } from '../../../../../lib/auth';
import { DocumentService } from '../../../../../lib/services/documentService';
import { writeFile, mkdir } from 'fs/promises';

// Mock dependencies
jest.mock('../../../../../lib/auth');
jest.mock('../../../../../lib/services/documentService');
jest.mock('fs/promises', () => ({
    writeFile: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
}));

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockDocumentService = DocumentService as jest.Mocked<typeof DocumentService>;

describe('/api/documents/upload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock successful auth
        mockRequireAuth.mockResolvedValue({
            userId: 'user1',
            email: 'test@example.com',
            authMethod: 'jwt' as const,
            id: 'user1'
        });

        // Mock successful document creation
        mockDocumentService.createDocument.mockResolvedValue({
            id: 'doc1',
            name: 'test.pdf',
            type: 'PDF',
            state: 'UPLOADED',
            version: 1,
            chunks: 0,
            quality: 0,
            uploadDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'user1',
            realmId: 'realm1',
            filePath: '/uploads/123-test.pdf',
            fileSize: 1024,
            mimeType: 'application/pdf',
            user: {} as any,
            realm: {} as any,
            jobs: []
        });

        // File system operations are already mocked in the jest.mock call
    });

    describe('POST', () => {
        it('should upload a file successfully', async () => {
            // Create a mock file
            const fileContent = 'test file content';
            const mockFile = new File([fileContent], 'test.pdf', { type: 'application/pdf' });
            
            // Create FormData
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('realmId', 'realm1');
            formData.append('name', 'Test Document');

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.document).toMatchObject({
                id: 'doc1',
                name: 'test.pdf',
                type: 'PDF',
                state: 'UPLOADED',
                fileSize: fileContent.length,
                mimeType: 'application/pdf'
            });

            expect(mockDocumentService.createDocument).toHaveBeenCalledWith({
                name: 'Test Document',
                type: 'PDF',
                realmId: 'realm1',
                userId: 'user1',
                state: 'UPLOADED',
                filePath: expect.stringContaining('test.pdf'),
                fileSize: fileContent.length,
                mimeType: 'application/pdf'
            });
        });

        it('should return 400 if no file is provided', async () => {
            const formData = new FormData();
            formData.append('realmId', 'realm1');

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('No file provided');
        });

        it('should return 400 if realmId is missing', async () => {
            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const formData = new FormData();
            formData.append('file', mockFile);

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Realm ID is required');
        });

        it('should return 400 for unsupported file types', async () => {
            const mockFile = new File(['content'], 'test.exe', { type: 'application/x-executable' });
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('realmId', 'realm1');

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('File type not supported');
        });

        it('should return 401 when not authenticated', async () => {
            mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('realmId', 'realm1');

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Authentication required');
        });

        it('should handle service errors', async () => {
            mockDocumentService.createDocument.mockRejectedValue(new Error('Database error'));

            const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const formData = new FormData();
            formData.append('file', mockFile);
            formData.append('realmId', 'realm1');

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to upload file');
        });
    });
});
