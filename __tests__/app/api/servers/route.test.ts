/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/servers/route';
import { ServerService } from '../../../../lib/services/serverService';
import { requireAuth } from '../../../../lib/auth';
import { UserService } from '../../../../lib/services/userService';
import { RealmService } from '../../../../lib/services/realmService';

// Mock the services and auth
jest.mock('../../../../lib/services/serverService');
jest.mock('../../../../lib/services/userService');
jest.mock('../../../../lib/services/realmService');
jest.mock('../../../../lib/auth');

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

// Mock static methods
const mockCreateServer = jest.fn();
const mockGetServersByUser = jest.fn();
const mockGetUserSettings = jest.fn();
const mockUpdateUserSettings = jest.fn();
const mockGetRealmById = jest.fn();
const mockEnsureUserHasDefaultRealm = jest.fn();

(ServerService.createServer as jest.Mock) = mockCreateServer;
(ServerService.getServersByUser as jest.Mock) = mockGetServersByUser;
(UserService.getUserSettings as jest.Mock) = mockGetUserSettings;
(UserService.updateUserSettings as jest.Mock) = mockUpdateUserSettings;
(RealmService.getRealmById as jest.Mock) = mockGetRealmById;
(RealmService.ensureUserHasDefaultRealm as jest.Mock) = mockEnsureUserHasDefaultRealm;

describe('/api/servers', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com', role: 'USER' };
    const mockRealm = {
        id: 'realm1',
        name: 'Default Realm',
        description: 'Default realm for user',
        isDefault: true,
        ownerId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockUserSettings = {
        id: 'settings1',
        userId: 'user1',
        currentRealmId: 'realm1',
        theme: 'LIGHT',
        language: 'en',
        notifications: true,
        autoSave: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockReturnValue(mockUser);
        mockGetUserSettings.mockResolvedValue(mockUserSettings);
        mockGetRealmById.mockResolvedValue(mockRealm);
        mockEnsureUserHasDefaultRealm.mockResolvedValue(mockRealm);
        mockUpdateUserSettings.mockResolvedValue(mockUserSettings);
    });

    describe('GET', () => {
        it('should return all servers for the authenticated user', async () => {
            const mockServers = [
                {
                    id: '1',
                    name: 'Test Server',
                    type: 'MONGODB',
                    host: 'localhost',
                    port: 27017,
                    username: 'user',
                    password: 'pass',
                    apiKey: null,
                    database: 'testdb',
                    collection: 'testcol',
                    userId: 'user1',
                },
            ];

            mockGetServersByUser.mockResolvedValue(mockServers as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockServers);
            expect(mockGetServersByUser).toHaveBeenCalledWith('user1', 'realm1');
            expect(mockRequireAuth).toHaveBeenCalledWith(mockRequest);
        });

        it('should handle authentication errors', async () => {
            mockRequireAuth.mockImplementation(() => {
                throw new Error('Authentication required');
            });

            const mockRequest = new NextRequest('http://localhost:3000/api/servers');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Authentication required' });
            expect(mockGetServersByUser).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            mockGetServersByUser.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/servers');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to fetch servers' });
        });
    });

    describe('POST', () => {
        it('should create a new server', async () => {
            const mockServer = {
                id: '1',
                name: 'New Server',
                type: 'MONGODB',
                host: 'localhost',
                port: 27017,
                username: 'user',
                password: 'pass',
                apiKey: null,
                database: 'testdb',
                collection: 'testcol',
                userId: 'user1',
            };

            mockCreateServer.mockResolvedValue(mockServer as any);

            const requestBody = {
                name: 'New Server',
                type: 'MONGODB',
                host: 'localhost',
                port: 27017,
                username: 'user',
                password: 'pass',
                database: 'testdb',
                collection: 'testcol',
            };

            const mockRequest = new NextRequest('http://localhost:3000/api/servers', {
                method: 'POST',
                body: JSON.stringify(requestBody),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockServer);
            expect(mockCreateServer).toHaveBeenCalledWith({
                ...requestBody,
                userId: 'user1',
                realmId: 'realm1',
                isActive: true,
            });
        });

        it('should validate required fields', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/servers', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Server',
                    // Missing type, host, and port
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Name, type, host, and port are required' });
            expect(mockCreateServer).not.toHaveBeenCalled();
        });

        it('should handle authentication errors', async () => {
            mockRequireAuth.mockImplementation(() => {
                throw new Error('Authentication required');
            });

            const mockRequest = new NextRequest('http://localhost:3000/api/servers', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Server',
                    type: 'MONGODB',
                    host: 'localhost',
                    port: 27017,
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Authentication required' });
            expect(mockCreateServer).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            mockCreateServer.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/servers', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Server',
                    type: 'MONGODB',
                    host: 'localhost',
                    port: 27017,
                }),
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to create server' });
        });
    });
});