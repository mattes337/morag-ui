import { GET, POST } from '../../../../app/api/realms/route';
import { getAuthUser } from '../../../../lib/auth';
import { RealmService } from '../../../../lib/services/realmService';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('../../../../lib/auth');
jest.mock('../../../../lib/services/realmService');

const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>;
const mockRealmService = RealmService as jest.Mocked<typeof RealmService>;

describe('/api/realms', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return user realms when authenticated', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
            };

            const mockRealms = [
                {
                    id: 'realm1',
                    name: 'Test Realm 1',
                    description: 'Description 1',
                    isDefault: true,
                    userRole: 'OWNER',
                    userCount: 5,
                },
                {
                    id: 'realm2',
                    name: 'Test Realm 2',
                    description: 'Description 2',
                    isDefault: false,
                    userRole: 'ADMIN',
                    userCount: 3,
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
        });

        it('should return 401 when not authenticated', async () => {
            mockGetAuthUser.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Not authenticated' });
        });

        it('should handle service errors', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
            };

            mockGetAuthUser.mockResolvedValue(mockAuthUser);
            mockRealmService.getUserRealms.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/realms');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal server error' });
        });
    });

    describe('POST', () => {
        it('should create a realm successfully', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
            };

            const mockCreatedRealm = {
                id: 'realm1',
                name: 'New Realm',
                description: 'New Description',
                isDefault: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockGetAuthUser.mockResolvedValue(mockAuthUser);
            mockRealmService.createRealm.mockResolvedValue(mockCreatedRealm as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Realm',
                    description: 'New Description',
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual({ realm: mockCreatedRealm });
            expect(mockRealmService.createRealm).toHaveBeenCalledWith({
                name: 'New Realm',
                description: 'New Description',
                userId: 'user1',
            });
        });

        it('should return 401 when not authenticated', async () => {
            mockGetAuthUser.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Realm',
                    description: 'New Description',
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Not authenticated' });
        });

        it('should return 400 for invalid request body', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
            };

            mockGetAuthUser.mockResolvedValue(mockAuthUser);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: JSON.stringify({
                    // Missing required name field
                    description: 'New Description',
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toHaveProperty('error');
        });

        it('should handle service errors during creation', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
            };

            mockGetAuthUser.mockResolvedValue(mockAuthUser);
            mockRealmService.createRealm.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Realm',
                    description: 'New Description',
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal server error' });
        });

        it('should handle malformed JSON', async () => {
            const mockAuthUser = {
                userId: 'user1',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                authMethod: 'jwt' as const,
            };

            mockGetAuthUser.mockResolvedValue(mockAuthUser);

            const mockRequest = new NextRequest('http://localhost:3000/api/realms', {
                method: 'POST',
                body: 'invalid json',
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal server error' });
        });
    });
});