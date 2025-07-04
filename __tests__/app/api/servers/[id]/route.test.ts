/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../../../../../app/api/servers/[id]/route';
import { DatabaseServerService } from '../../../../../lib/services/databaseServerService';
import { requireAuth } from '../../../../../lib/auth';

// Mock the DatabaseServerService and auth
jest.mock('../../../../../lib/services/databaseServerService');
jest.mock('../../../../../lib/auth');

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

// Mock static methods
const mockGetDatabaseServerById = jest.fn();
const mockUpdateDatabaseServer = jest.fn();
const mockDeleteDatabaseServer = jest.fn();

(DatabaseServerService.getDatabaseServerById as jest.Mock) = mockGetDatabaseServerById;
(DatabaseServerService.updateDatabaseServer as jest.Mock) = mockUpdateDatabaseServer;
(DatabaseServerService.deleteDatabaseServer as jest.Mock) = mockDeleteDatabaseServer;

describe('/api/servers/[id]', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com', role: 'USER' };
    const mockParams = { id: 'server1' };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockReturnValue(Promise.resolve(mockUser));
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

            mockGetDatabaseServerById.mockResolvedValue(mockServer as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockServer);
            expect(mockGetDatabaseServerById).toHaveBeenCalledWith('server1');
        });

        it('should return 404 if the server does not exist', async () => {
            mockGetDatabaseServerById.mockResolvedValue(null);

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

            mockGetDatabaseServerById.mockResolvedValue(mockServer as any);

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
            mockGetDatabaseServerById.mockRejectedValue(new Error('Database error'));

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

            mockGetDatabaseServerById.mockResolvedValue(existingServer as any);
            mockUpdateDatabaseServer.mockResolvedValue(updatedServer as any);

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
            expect(mockUpdateDatabaseServer).toHaveBeenCalledWith('server1', updateData);
        });

        it('should return 404 if the server does not exist', async () => {
            mockGetDatabaseServerById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/nonexistent', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Updated Server' }),
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Server not found' });
            expect(mockUpdateDatabaseServer).not.toHaveBeenCalled();
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

            mockGetDatabaseServerById.mockResolvedValue(existingServer as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Updated Server' }),
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data).toEqual({ error: 'Unauthorized access' });
            expect(mockUpdateDatabaseServer).not.toHaveBeenCalled();
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

            mockGetDatabaseServerById.mockResolvedValue(existingServer as any);
            mockUpdateDatabaseServer.mockRejectedValue(new Error('Database error'));

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

            mockGetDatabaseServerById.mockResolvedValue(existingServer as any);
            mockDeleteDatabaseServer.mockResolvedValue(undefined);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1', {
                method: 'DELETE',
            });

            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
            expect(mockDeleteDatabaseServer).toHaveBeenCalledWith('server1');
        });

        it('should return 404 if the server does not exist', async () => {
            mockGetDatabaseServerById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/nonexistent', {
                method: 'DELETE',
            });

            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Server not found' });
            expect(mockDeleteDatabaseServer).not.toHaveBeenCalled();
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

            mockGetDatabaseServerById.mockResolvedValue(existingServer as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/servers/server1', {
                method: 'DELETE',
            });

            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data).toEqual({ error: 'Unauthorized access' });
            expect(mockDeleteDatabaseServer).not.toHaveBeenCalled();
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

            mockGetDatabaseServerById.mockResolvedValue(existingServer as any);
            mockDeleteDatabaseServer.mockRejectedValue(new Error('Database error'));

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