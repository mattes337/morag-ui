/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../../../../../../app/api/documents/[id]/ingest/route';
import { requireAuth } from '../../../../../../lib/auth';
import { DocumentService } from '../../../../../../lib/services/documentService';
import { RealmService } from '../../../../../../lib/services/realmService';
import { MoragService } from '../../../../../../lib/services/moragService';
import { JobService } from '../../../../../../lib/services/jobService';

// Mock dependencies
jest.mock('../../../../../../lib/auth');
jest.mock('../../../../../../lib/services/documentService');
jest.mock('../../../../../../lib/services/realmService');
jest.mock('../../../../../../lib/services/moragService');
jest.mock('../../../../../../lib/services/jobService');

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockDocumentService = DocumentService as jest.Mocked<typeof DocumentService>;
const mockRealmService = RealmService as jest.Mocked<typeof RealmService>;
const mockMoragService = MoragService as jest.Mocked<typeof MoragService>;
const mockJobService = JobService as jest.Mocked<typeof JobService>;

describe('/api/documents/[id]/ingest', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock successful auth
        mockRequireAuth.mockResolvedValue({
            userId: 'user1',
            email: 'test@example.com',
            authMethod: 'jwt' as const,
            id: 'user1'
        });

        // Mock document
        mockDocumentService.getDocumentById.mockResolvedValue({
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
            filePath: '/uploads/test.pdf',
            fileSize: 1024,
            mimeType: 'application/pdf',
            user: {} as any,
            realm: {} as any,
            jobs: []
        });

        // Mock realm with servers
        mockRealmService.getRealmById.mockResolvedValue({
            id: 'realm1',
            name: 'Test Realm',
            description: 'Test Description',
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            ingestionPrompt: 'Test ingestion prompt',
            systemPrompt: 'Test system prompt',
            servers: [
                {
                    id: 'server1',
                    name: 'Qdrant Server',
                    type: 'QDRANT',
                    host: 'localhost',
                    port: 6333,
                    collection: 'documents',
                    apiKey: 'test-key',
                    username: null,
                    password: null,
                    database: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: 'user1',
                    user: {} as any,
                    realmServers: []
                },
                {
                    id: 'server2',
                    name: 'Neo4j Server',
                    type: 'NEO4J',
                    host: 'localhost',
                    port: 7687,
                    database: 'neo4j',
                    username: 'neo4j',
                    password: 'password',
                    collection: null,
                    apiKey: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: 'user1',
                    user: {} as any,
                    realmServers: []
                }
            ]
        } as any);

        // Mock MoRAG response
        mockMoragService.ingestDocument.mockResolvedValue({
            success: true,
            job_id: 'morag-job-123',
            message: 'Document ingestion started',
            document_id: 'doc1',
            chunks_created: 10,
            processing_time: 1.5
        });

        // Mock job creation
        mockJobService.createJob.mockResolvedValue({
            id: 'job1',
            documentName: 'test.pdf',
            documentType: 'PDF',
            startDate: new Date(),
            endDate: null,
            status: 'PENDING',
            percentage: 0,
            summary: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            jobType: 'INGESTION',
            externalJobId: 'morag-job-123',
            metadata: {},
            documentId: 'doc1',
            userId: 'user1',
            realmId: 'realm1',
            document: {} as any,
            user: {} as any,
            realm: {} as any
        });

        // Mock document update
        mockDocumentService.updateDocument.mockResolvedValue({} as any);
    });

    describe('POST', () => {
        it('should start document ingestion successfully', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1/ingest', {
                method: 'POST',
                body: JSON.stringify({
                    ingestionPrompt: 'Custom prompt',
                    chunkSize: 2000,
                    chunkingMethod: 'Fixed Size'
                }),
            });

            const response = await POST(mockRequest, { params: { id: 'doc1' } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toBe('Document ingestion started');
            expect(data.moragJobId).toBe('morag-job-123');

            expect(mockMoragService.ingestDocument).toHaveBeenCalledWith({
                document_id: 'doc1',
                document_name: 'test.pdf',
                document_type: 'PDF',
                file_path: '/uploads/test.pdf',
                realm_id: 'realm1',
                user_id: 'user1',
                ingestion_prompt: 'Custom prompt',
                chunk_size: 2000,
                chunking_method: 'Fixed Size',
                servers: {
                    qdrant: {
                        host: 'localhost',
                        port: 6333,
                        collection: 'documents',
                        api_key: 'test-key',
                    },
                    neo4j: {
                        host: 'localhost',
                        port: 7687,
                        database: 'neo4j',
                        username: 'neo4j',
                        password: 'password',
                    }
                }
            });

            expect(mockJobService.createJob).toHaveBeenCalledWith({
                documentId: 'doc1',
                documentName: 'test.pdf',
                documentType: 'PDF',
                userId: 'user1',
                realmId: 'realm1',
                jobType: 'INGESTION',
                status: 'PENDING',
                externalJobId: 'morag-job-123',
                metadata: {
                    chunkSize: 2000,
                    chunkingMethod: 'Fixed Size',
                    ingestionPrompt: 'Custom prompt',
                    moragJobId: 'morag-job-123'
                }
            });

            expect(mockDocumentService.updateDocument).toHaveBeenCalledWith('doc1', {
                state: 'PROCESSING'
            });
        });

        it('should return 404 if document not found', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1/ingest', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(mockRequest, { params: { id: 'doc1' } });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Document not found');
        });

        it('should return 403 if user does not own document', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue({
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
                userId: 'other-user', // Different user
                realmId: 'realm1',
                filePath: '/uploads/test.pdf',
                fileSize: 1024,
                mimeType: 'application/pdf',
                user: {} as any,
                realm: {} as any,
                jobs: []
            });

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1/ingest', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(mockRequest, { params: { id: 'doc1' } });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.error).toBe('Access denied');
        });

        it('should return 400 if document has no file path', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue({
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
                filePath: null, // No file path
                fileSize: 1024,
                mimeType: 'application/pdf',
                user: {} as any,
                realm: {} as any,
                jobs: []
            });

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1/ingest', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(mockRequest, { params: { id: 'doc1' } });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Document has no associated file. Only uploaded documents can be ingested.');
        });

        it('should return 400 if realm missing required servers', async () => {
            mockRealmService.getRealmById.mockResolvedValue({
                id: 'realm1',
                name: 'Test Realm',
                description: 'Test Description',
                isDefault: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                ingestionPrompt: 'Test ingestion prompt',
                systemPrompt: 'Test system prompt',
                servers: [] // No servers
            } as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1/ingest', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(mockRequest, { params: { id: 'doc1' } });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Realm must have both Qdrant and Neo4j servers configured for ingestion');
        });

        it('should return 401 when not authenticated', async () => {
            mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1/ingest', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(mockRequest, { params: { id: 'doc1' } });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Authentication required');
        });

        it('should handle MoRAG service errors', async () => {
            mockMoragService.ingestDocument.mockRejectedValue(new Error('MoRAG service unavailable'));

            const mockRequest = new NextRequest('http://localhost:3000/api/documents/doc1/ingest', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const response = await POST(mockRequest, { params: { id: 'doc1' } });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to start document ingestion');
            expect(data.details).toBe('MoRAG service unavailable');
        });
    });
});
