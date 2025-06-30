import { NextRequest } from 'next/server';

// Mock the services
jest.mock('../../../../../lib/services/apiKeyService', () => ({
    ApiKeyService: {
        createApiKey: jest.fn(),
        getAllApiKeys: jest.fn(),
        getApiKeysByUser: jest.fn(),
        getApiKeysByUserId: jest.fn(),
        getApiKeyById: jest.fn(),
        getApiKeyByKey: jest.fn(),
        updateApiKey: jest.fn(),
        updateLastUsed: jest.fn(),
        deleteApiKey: jest.fn(),
    },
}));

jest.mock('../../../../../lib/auth', () => ({
    requireAuth: jest.fn(),
    getAuthUser: jest.fn(),
}));

// Import AFTER mocking
import { GET, POST } from '../../../../app/api/api-keys/route';
import { ApiKeyService } from '../../../../lib/services/apiKeyService';
import { requireAuth, getAuthUser } from '../../../../lib/auth';

const mockApiKeyService = jest.mocked(ApiKeyService);
const mockRequireAuth = jest.mocked(requireAuth);
const mockGetAuthUser = jest.mocked(getAuthUser);

describe('/api/api-keys', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockReturnValue(mockUser);
        mockGetAuthUser.mockResolvedValue({ userId: 'user1', email: 'test@example.com' });
    });

    describe('GET', () => {
        it('should return all API keys for the authenticated user', async () => {
            const mockApiKeys = [
                {
                    id: '1',
                    name: 'Test API Key',
                    key: 'api-key-1',
                    userId: 'user1',
                    createdAt: new Date(),
                },
            ];

            mockApiKeyService.getApiKeysByUserId.mockResolvedValue(mockApiKeys as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/api-keys');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockApiKeys);
            expect(mockApiKeyService.getApiKeysByUserId).toHaveBeenCalledWith('user1', null);
        });

        it('should handle authentication errors', async () => {
            mockGetAuthUser.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/api-keys');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should handle service errors', async () => {
            mockApiKeyService.getApiKeysByUserId.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/api-keys');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to fetch API keys' });
        });
    });

    describe('POST', () => {
        it('should create a new API key', async () => {
            const mockApiKey = {
                id: '1',
                name: 'New API Key',
                key: 'api-key-1',
                userId: 'user1',
                createdAt: new Date(),
            };

            mockApiKeyService.createApiKey.mockResolvedValue(mockApiKey as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/api-keys', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New API Key',
                    key: 'api-key-1'
                })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockApiKey);
            expect(mockApiKeyService.createApiKey).toHaveBeenCalledWith({
                name: 'New API Key',
                key: 'api-key-1',
                userId: 'user1'
            });
        });

        it('should return 400 if name or key is missing', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/api-keys', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New API Key'
                    // key missing
                })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Name and key are required' });
            expect(mockApiKeyService.createApiKey).not.toHaveBeenCalled();
        });

        it('should handle authentication errors', async () => {
            mockRequireAuth.mockImplementation(() => {
                throw new Error('Authentication required');
            });

            const mockRequest = new NextRequest('http://localhost:3000/api/api-keys', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New API Key',
                    key: 'api-key-1'
                })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Authentication required' });
        });

        it('should handle service errors', async () => {
            mockApiKeyService.createApiKey.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/api-keys', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New API Key',
                    key: 'api-key-1'
                })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to create API key' });
        });
    });
});