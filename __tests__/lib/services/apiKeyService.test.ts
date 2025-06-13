// Mock Prisma
jest.mock('../../../lib/database', () => ({
    prisma: {
        apiKey: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

import { ApiKeyService } from '../../../lib/services/apiKeyService';
import { prisma } from '../../../lib/database';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ApiKeyService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createApiKey', () => {
        it('should create an API key successfully', async () => {
            const mockApiKey = {
                id: '1',
                name: 'Test API Key',
                key: 'test_key_123',
                userId: 'user1',
                created: new Date(),
                lastUsed: null,
                user: { id: 'user1', name: 'Test User' },
            };

            mockPrisma.apiKey.create.mockResolvedValue(mockApiKey as any);

            const result = await ApiKeyService.createApiKey({
                name: 'Test API Key',
                key: 'test_key_123',
                userId: 'user1',
            });

            expect(mockPrisma.apiKey.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test API Key',
                    key: 'test_key_123',
                    userId: 'user1',
                },
                include: {
                    user: true,
                },
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
                    key: 'key1',
                    user: { id: 'user1', name: 'User 1' },
                },
                {
                    id: '2',
                    name: 'API Key 2',
                    key: 'key2',
                    user: { id: 'user2', name: 'User 2' },
                },
            ];

            mockPrisma.apiKey.findMany.mockResolvedValue(mockApiKeys as any);

            const result = await ApiKeyService.getAllApiKeys();

            expect(mockPrisma.apiKey.findMany).toHaveBeenCalledWith({
                include: {
                    user: true,
                },
                orderBy: {
                    created: 'desc',
                },
            });

            expect(result).toEqual(mockApiKeys);
        });
    });

    describe('getApiKeysByUser', () => {
        it('should return API keys for a specific user', async () => {
            const mockApiKeys = [
                {
                    id: '1',
                    name: 'User API Key',
                    key: 'user_key',
                    userId: 'user1',
                    user: { id: 'user1', name: 'User 1' },
                },
            ];

            mockPrisma.apiKey.findMany.mockResolvedValue(mockApiKeys as any);

            const result = await ApiKeyService.getApiKeysByUser('user1');

            expect(mockPrisma.apiKey.findMany).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                include: {
                    user: true,
                },
                orderBy: {
                    created: 'desc',
                },
            });

            expect(result).toEqual(mockApiKeys);
        });
    });

    describe('getApiKeyById', () => {
        it('should return an API key by id', async () => {
            const mockApiKey = {
                id: '1',
                name: 'Test API Key',
                key: 'test_key',
                user: { id: 'user1', name: 'User 1' },
            };

            mockPrisma.apiKey.findUnique.mockResolvedValue(mockApiKey as any);

            const result = await ApiKeyService.getApiKeyById('1');

            expect(mockPrisma.apiKey.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: {
                    user: true,
                },
            });

            expect(result).toEqual(mockApiKey);
        });
    });

    describe('getApiKeyByKey', () => {
        it('should return an API key by key value', async () => {
            const mockApiKey = {
                id: '1',
                name: 'Test API Key',
                key: 'test_key_123',
                user: { id: 'user1', name: 'User 1' },
            };

            mockPrisma.apiKey.findUnique.mockResolvedValue(mockApiKey as any);

            const result = await ApiKeyService.getApiKeyByKey('test_key_123');

            expect(mockPrisma.apiKey.findUnique).toHaveBeenCalledWith({
                where: { key: 'test_key_123' },
                include: {
                    user: true,
                },
            });

            expect(result).toEqual(mockApiKey);
        });
    });

    describe('updateApiKey', () => {
        it('should update an API key', async () => {
            const mockUpdatedApiKey = {
                id: '1',
                name: 'Updated API Key',
                key: 'test_key',
                user: { id: 'user1', name: 'User 1' },
            };

            mockPrisma.apiKey.update.mockResolvedValue(mockUpdatedApiKey as any);

            const result = await ApiKeyService.updateApiKey('1', {
                name: 'Updated API Key',
            });

            expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { name: 'Updated API Key' },
                include: {
                    user: true,
                },
            });

            expect(result).toEqual(mockUpdatedApiKey);
        });
    });

    describe('updateLastUsed', () => {
        it('should update the last used timestamp', async () => {
            const mockUpdatedApiKey = {
                id: '1',
                name: 'Test API Key',
                key: 'test_key',
                lastUsed: new Date(),
                user: { id: 'user1', name: 'User 1' },
            };

            mockPrisma.apiKey.update.mockResolvedValue(mockUpdatedApiKey as any);

            const result = await ApiKeyService.updateLastUsed('1');

            expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { lastUsed: expect.any(Date) },
                include: {
                    user: true,
                },
            });

            expect(result).toEqual(mockUpdatedApiKey);
        });
    });

    describe('deleteApiKey', () => {
        it('should delete an API key', async () => {
            const mockDeletedApiKey = { id: '1', name: 'Deleted API Key' };

            mockPrisma.apiKey.delete.mockResolvedValue(mockDeletedApiKey as any);

            const result = await ApiKeyService.deleteApiKey('1');

            expect(mockPrisma.apiKey.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });

            expect(result).toEqual(mockDeletedApiKey);
        });
    });
});
