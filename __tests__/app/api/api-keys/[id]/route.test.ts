import { NextRequest } from 'next/server';
import { DELETE } from '../../../../../app/api/api-keys/[id]/route';
import { ApiKeyService } from '../../../../../lib/services/apiKeyService';

// Mock the ApiKeyService
jest.mock('../../../../../lib/services/apiKeyService');

const mockApiKeyService = ApiKeyService as jest.Mocked<typeof ApiKeyService>;

describe('/api/api-keys/[id]', () => {
    const mockParams = { id: 'apikey1' };
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('DELETE', () => {
        it('should delete the API key', async () => {
            mockApiKeyService.deleteApiKey.mockResolvedValue(undefined);

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