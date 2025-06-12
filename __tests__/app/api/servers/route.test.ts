import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/servers/route';
import { DatabaseServerService } from '../../../../lib/services/databaseServerService';
import { requireAuth } from '../../../../lib/auth';

// Mock the DatabaseServerService and auth
jest.mock('../../../../lib/services/databaseServerService');
jest.mock('../../../../lib/auth');

const mockDatabaseServerService = DatabaseServerService as jest.Mocked<typeof DatabaseServerService>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('/api/servers', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com' };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockReturnValue(mockUser);
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

            mockDatabaseServerService.getDatabaseServersByUser.mockResolvedValue(mockServers as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockServers);
            expect(mockDatabaseServerService.getDatabaseServersByUser).toHaveBeenCalledWith('user1');
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
            expect(mockDatabaseServerService.getDatabaseServersByUser).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            mockDatabaseServerService.getDatabaseServersByUser.mockRejectedValue(new Error('Database error'));

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

            mockDatabaseServerService.createDatabaseServer.mockResolvedValue(mockServer as any);

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
            expect(mockDatabaseServerService.createDatabaseServer).toHaveBeenCalledWith({
                ...requestBody,
                userId: 'user1',
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
            expect(mockDatabaseServerService.createDatabaseServer).not.toHaveBeenCalled();
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
            expect(mockDatabaseServerService.createDatabaseServer).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            mockDatabaseServerService.createDatabaseServer.mockRejectedValue(new Error('Database error'));

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