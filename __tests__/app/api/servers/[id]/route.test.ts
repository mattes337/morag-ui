import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../../../../../app/api/servers/[id]/route';
import { DatabaseServerService } from '../../../../../lib/services/databaseServerService';
import { requireAuth } from '../../../../../lib/auth';

// Mock the DatabaseServerService and auth
jest.mock('../../../../../lib/services/databaseServerService');
jest.mock('../../../../../lib/auth');

const mockDatabaseServerService = DatabaseServerService as jest.Mocked<typeof DatabaseServerService>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('/api/servers/[id]', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com' };
    const mockParams = { id: 'server1' };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockReturnValue(mockUser);
    });

    describe('GET', () => {
        it('should return the server if it belongs to the authenticated user', async () => {
            const mockServer = {
                id: 'server1',
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
            };

            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(mockServer as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockServer);
            expect(mockDatabaseServerService.getDatabaseServerById).toHaveBeenCalledWith('server1');
        });

        it('should return 404 if the server does not exist', async () => {
            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/nonexistent');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Server not found' });
        });

        it('should return 403 if the server belongs to a different user', async () => {
            const mockServer = {
                id: 'server1',
                name: 'Test Server',
                type: 'MONGODB',
                host: 'localhost',
                port: 27017,
                username: 'user',
                password: 'pass',
                apiKey: null,
                database: 'testdb',
                collection: 'testcol',
                userId: 'different-user',
            };

            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(mockServer as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data).toEqual({ error: 'Unauthorized access' });
        });

        it('should handle authentication errors', async () => {
            mockRequireAuth.mockImplementation(() => {
                throw new Error('Authentication required');
            });

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Authentication required' });
        });

        it('should handle service errors', async () => {
            mockDatabaseServerService.getDatabaseServerById.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to fetch server' });
        });
    });

    describe('PUT', () => {
        it('should update the server if it belongs to the authenticated user', async () => {
            const existingServer = {
                id: 'server1',
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
            };

            const updatedServer = {
                ...existingServer,
                name: 'Updated Server',
                port: 27018,
            };

            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(existingServer as any);
            mockDatabaseServerService.updateDatabaseServer.mockResolvedValue(updatedServer as any);

            const updateData = {
                name: 'Updated Server',
                port: 27018,
            };

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1', {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(updatedServer);
            expect(mockDatabaseServerService.updateDatabaseServer).toHaveBeenCalledWith('server1', updateData);
        });

        it('should return 404 if the server does not exist', async () => {
            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/nonexistent', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Updated Server' }),
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Server not found' });
            expect(mockDatabaseServerService.updateDatabaseServer).not.toHaveBeenCalled();
        });

        it('should return 403 if the server belongs to a different user', async () => {
            const existingServer = {
                id: 'server1',
                name: 'Test Server',
                type: 'MONGODB',
                host: 'localhost',
                port: 27017,
                userId: 'different-user',
            };

            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(existingServer as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Updated Server' }),
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data).toEqual({ error: 'Unauthorized access' });
            expect(mockDatabaseServerService.updateDatabaseServer).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            const existingServer = {
                id: 'server1',
                name: 'Test Server',
                type: 'MONGODB',
                host: 'localhost',
                port: 27017,
                userId: 'user1',
            };

            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(existingServer as any);
            mockDatabaseServerService.updateDatabaseServer.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Updated Server' }),
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to update server' });
        });
    });

    describe('DELETE', () => {
        it('should delete the server if it belongs to the authenticated user', async () => {
            const existingServer = {
                id: 'server1',
                name: 'Test Server',
                type: 'MONGODB',
                host: 'localhost',
                port: 27017,
                userId: 'user1',
            };

            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(existingServer as any);
            mockDatabaseServerService.deleteDatabaseServer.mockResolvedValue(undefined);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1', {
                method: 'DELETE',
            });

            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
            expect(mockDatabaseServerService.deleteDatabaseServer).toHaveBeenCalledWith('server1');
        });

        it('should return 404 if the server does not exist', async () => {
            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/nonexistent', {
                method: 'DELETE',
            });

            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Server not found' });
            expect(mockDatabaseServerService.deleteDatabaseServer).not.toHaveBeenCalled();
        });

        it('should return 403 if the server belongs to a different user', async () => {
            const existingServer = {
                id: 'server1',
                name: 'Test Server',
                type: 'MONGODB',
                host: 'localhost',
                port: 27017,
                userId: 'different-user',
            };

            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(existingServer as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1', {
                method: 'DELETE',
            });

            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data).toEqual({ error: 'Unauthorized access' });
            expect(mockDatabaseServerService.deleteDatabaseServer).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            const existingServer = {
                id: 'server1',
                name: 'Test Server',
                type: 'MONGODB',
                host: 'localhost',
                port: 27017,
                userId: 'user1',
            };

            mockDatabaseServerService.getDatabaseServerById.mockResolvedValue(existingServer as any);
            mockDatabaseServerService.deleteDatabaseServer.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1', {
                method: 'DELETE',
            });

            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to delete server' });
        });
    });
});