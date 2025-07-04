import { NextRequest } from 'next/server';

// Mock the ApiKeyService
jest.mock('../../../../../lib/services/apiKeyService', () => ({
    ApiKeyService: {
        deleteApiKey: jest.fn(),
        getApiKeyById: jest.fn(),
    },
}));

// Import AFTER mocking
import { DELETE } from '../../../../../app/api/api-keys/[id]/route';
import { ApiKeyService } from '../../../../../lib/services/apiKeyService';

const mockApiKeyService = jest.mocked(ApiKeyService);

describe('/api/api-keys/[id]', () => {
    const mockParams = { id: 'apikey1' };
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('DELETE', () => {
        it('should delete the API key', async () => {
            const mockApiKey = {
                id: 'apikey1',
                name: 'Test API Key',
                key: 'test-key-123',
                created: new Date(),
                lastUsed: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: 'user1'
            };
            mockApiKeyService.deleteApiKey.mockResolvedValue(mockApiKey);

            const mockRequest = new NextRequest('http://localhost:3000/api/api-keys/apikey1');
            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
            expect(mockApiKeyService.deleteApiKey).toHaveBeenCalledWith('apikey1');
        });

        it('should handle service errors', async () => {
            mockApiKeyService.deleteApiKey.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/api-keys/apikey1');
            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to delete API key' });
        });
    });
});