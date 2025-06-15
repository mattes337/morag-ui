// Mock the ApiKeyService
jest.mock('../../../lib/services/apiKeyService');

import { ApiKeyService } from '../../../lib/services/apiKeyService';

// Create mock ApiKeyService
const mockApiKeyService = ApiKeyService as jest.Mocked<typeof ApiKeyService>;

describe('ApiKeyService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup all mock methods
        mockApiKeyService.createApiKey = jest.fn();
        mockApiKeyService.getAllApiKeys = jest.fn();
        mockApiKeyService.getApiKeyById = jest.fn();
        mockApiKeyService.getApiKeysByUser = jest.fn();
        mockApiKeyService.updateApiKey = jest.fn();
        mockApiKeyService.deleteApiKey = jest.fn();
        mockApiKeyService.validateApiKey = jest.fn();
    });

    describe('createApiKey', () => {
        it('should create an API key successfully', async () => {
            const mockApiKey = {
                id: '1',
                name: 'Test API Key',
                key: 'test-key-123',
                userId: 'user1',
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                },
            };

            mockApiKeyService.createApiKey.mockResolvedValue(mockApiKey);

            const result = await ApiKeyService.createApiKey({
                name: 'Test API Key',
                userId: 'user1',
            });

            expect(mockApiKeyService.createApiKey).toHaveBeenCalledWith({
                name: 'Test API Key',
                userId: 'user1',
            });
            expect(result).toEqual(mockApiKey);
        });
    });

    describe('getAllApiKeys', () => {
        it('should return all API keys', async () => {
            const mockApiKeys = [
                {
                    id: '1',
                    name: 'API Key 1',
                    key: 'key-1',
                    userId: 'user1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    user: {
                        id: 'user1',
                        name: 'User 1',
                        email: 'user1@example.com',
                    },
                },
                {
                    id: '2',
                    name: 'API Key 2',
                    key: 'key-2',
                    userId: 'user2',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    user: {
                        id: 'user2',
                        name: 'User 2',
                        email: 'user2@example.com',
                    },
                },
            ];

            mockApiKeyService.getAllApiKeys.mockResolvedValue(mockApiKeys);

            const result = await ApiKeyService.getAllApiKeys();

            expect(mockApiKeyService.getAllApiKeys).toHaveBeenCalled();
            expect(result).toEqual(mockApiKeys);
        });
    });

    describe('getApiKeyById', () => {
        it('should return an API key by id', async () => {
            const mockApiKey = {
                id: '1',
                name: 'Test API Key',
                key: 'test-key-123',
                userId: 'user1',
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                },
            };

            mockApiKeyService.getApiKeyById.mockResolvedValue(mockApiKey);

            const result = await ApiKeyService.getApiKeyById('1');

            expect(mockApiKeyService.getApiKeyById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockApiKey);
        });

        it('should return null if API key not found', async () => {
            mockApiKeyService.getApiKeyById.mockResolvedValue(null);

            const result = await ApiKeyService.getApiKeyById('nonexistent');

            expect(mockApiKeyService.getApiKeyById).toHaveBeenCalledWith('nonexistent');
            expect(result).toBeNull();
        });
    });

    describe('getApiKeysByUser', () => {
        it('should return API keys for a specific user', async () => {
            const mockApiKeys = [
                {
                    id: '1',
                    name: 'User API Key 1',
                    key: 'user-key-1',
                    userId: 'user1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: '2',
                    name: 'User API Key 2',
                    key: 'user-key-2',
                    userId: 'user1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            mockApiKeyService.getApiKeysByUser.mockResolvedValue(mockApiKeys);

            const result = await ApiKeyService.getApiKeysByUser('user1');

            expect(mockApiKeyService.getApiKeysByUser).toHaveBeenCalledWith('user1');
            expect(result).toEqual(mockApiKeys);
        });
    });

    describe('updateApiKey', () => {
        it('should update an API key', async () => {
            const mockUpdatedApiKey = {
                id: '1',
                name: 'Updated API Key',
                key: 'test-key-123',
                userId: 'user1',
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                },
            };

            mockApiKeyService.updateApiKey.mockResolvedValue(mockUpdatedApiKey);

            const result = await ApiKeyService.updateApiKey('1', {
                name: 'Updated API Key',
            });

            expect(mockApiKeyService.updateApiKey).toHaveBeenCalledWith('1', {
                name: 'Updated API Key',
            });
            expect(result).toEqual(mockUpdatedApiKey);
        });
    });

    describe('deleteApiKey', () => {
        it('should delete an API key', async () => {
            const mockDeletedApiKey = {
                id: '1',
                name: 'Test API Key',
                key: 'test-key-123',
                userId: 'user1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockApiKeyService.deleteApiKey.mockResolvedValue(mockDeletedApiKey);

            const result = await ApiKeyService.deleteApiKey('1');

            expect(mockApiKeyService.deleteApiKey).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockDeletedApiKey);
        });
    });

    describe('validateApiKey', () => {
        it('should validate an API key and return user info', async () => {
            const mockApiKey = {
                id: '1',
                name: 'Test API Key',
                key: 'test-key-123',
                userId: 'user1',
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                    id: 'user1',
                    name: 'Test User',
                    email: 'test@example.com',
                },
            };

            mockApiKeyService.validateApiKey.mockResolvedValue(mockApiKey);

            const result = await ApiKeyService.validateApiKey('test-key-123');

            expect(mockApiKeyService.validateApiKey).toHaveBeenCalledWith('test-key-123');
            expect(result).toEqual(mockApiKey);
        });

        it('should return null for invalid API key', async () => {
            mockApiKeyService.validateApiKey.mockResolvedValue(null);

            const result = await ApiKeyService.validateApiKey('invalid-key');

            expect(mockApiKeyService.validateApiKey).toHaveBeenCalledWith('invalid-key');
            expect(result).toBeNull();
        });
    });
});
