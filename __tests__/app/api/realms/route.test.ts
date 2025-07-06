/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('../../../../lib/auth', () => ({
    getAuthUser: jest.fn(),
}));
jest.mock('../../../../lib/services/realmService');
jest.mock('../../../../lib/database', () => ({
    prisma: {
        realm: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        userRealm: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

// Import after mocking
import { getAuthUser } from '../../../../lib/auth';
import { RealmService } from '../../../../lib/services/realmService';
import { GET, POST } from '../../../../app/api/realms/route';

const mockGetAuthUser = jest.mocked(getAuthUser);
const mockRealmService = RealmService as jest.Mocked<typeof RealmService>;

describe('/api/realms', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRealmService.getUserRealms.mockClear();
        mockRealmService.createRealm.mockClear();
    });

    describe('GET', () => {
        it('should return user realms when authenticated', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
                id: 'user1',
            };

            const mockRealms = [
                {
                    id: 'realm1',
                    name: 'Test Realm',
                    description: 'A test realm',
                    ownerId: 'user1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    joinedAt: new Date(),
                },
            ];

            mockGetAuthUser.mockResolvedValue(mockAuthUser);
            mockRealmService.getUserRealms.mockResolvedValue(mockRealms as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ realms: mockRealms });
            expect(mockRealmService.getUserRealms).toHaveBeenCalledWith('user1');
            expect(mockRealmService.getUserRealms).toHaveBeenCalledTimes(1);
        });

        it('should return 401 when not authenticated', async () => {
            mockGetAuthUser.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
            expect(mockRealmService.getUserRealms).not.toHaveBeenCalled();
        });
    });

    describe('POST', () => {
        it('should create a realm when authenticated with valid data', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
                id: 'user1',
            };

            const mockCreatedRealm = {
                id: 'realm1',
                name: 'New Realm',
                description: 'A new realm',
                ownerId: 'user1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockGetAuthUser.mockResolvedValue(mockAuthUser);
            mockRealmService.createRealm.mockResolvedValue(mockCreatedRealm as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Realm',
                    description: 'A new realm',
                    serverIds: ['server1'],
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual({ realm: mockCreatedRealm });
            expect(mockRealmService.createRealm).toHaveBeenCalledWith({
                name: 'New Realm',
                description: 'A new realm',
                serverIds: ['server1'],
                ownerId: 'user1',
            });
        });

        it('should return 401 when not authenticated', async () => {
            mockGetAuthUser.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Realm',
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
        });

        it('should return 400 for invalid data', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
                id: 'user1',
            };

            mockGetAuthUser.mockResolvedValue(mockAuthUser);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: JSON.stringify({
                    name: '', // Invalid: empty name
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Validation error');
        });

        it('should handle service errors', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
                id: 'user1',
            };

            mockGetAuthUser.mockResolvedValue(mockAuthUser);
            mockRealmService.createRealm.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Realm',
                    serverIds: ['server1'],
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to create realm' });
        });

        it('should handle malformed JSON', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
                id: 'user1',
            };

            mockGetAuthUser.mockResolvedValue(mockAuthUser);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: JSON.stringify({ invalidField: 'test' }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Validation error');
            expect(data.details).toBeDefined();
        });
    });
});