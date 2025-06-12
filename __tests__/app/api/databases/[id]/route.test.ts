import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../../../../../app/api/databases/[id]/route';
import { DatabaseService } from '../../../../../lib/services/databaseService';

// Mock the DatabaseService
jest.mock('../../../../../lib/services/databaseService');

const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;

describe('/api/databases/[id]', () => {
    const mockParams = { id: 'db1' };
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return the database if it exists', async () => {
            const mockDatabase = {
                id: 'db1',
                name: 'Test Database',
                description: 'Test description',
                userId: 'user1',
                serverId: 'server1',
                _count: { documents: 5 },
            };

            mockDatabaseService.getDatabaseById.mockResolvedValue(mockDatabase as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/db1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDatabase);
            expect(mockDatabaseService.getDatabaseById).toHaveBeenCalledWith('db1');
        });

        it('should return 404 if the database does not exist', async () => {
            mockDatabaseService.getDatabaseById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/nonexistent');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Database not found' });
        });

        it('should handle service errors', async () => {
            mockDatabaseService.getDatabaseById.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/db1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to fetch database' });
        });
    });

    describe('PUT', () => {
        it('should update the database', async () => {
            const mockDatabase = {
                id: 'db1',
                name: 'Updated Database',
                description: 'Updated description',
                userId: 'user1',
                serverId: 'server1',
                _count: { documents: 5 },
            };

            mockDatabaseService.updateDatabase.mockResolvedValue(mockDatabase as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/db1', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Database',
                    description: 'Updated description'
                })
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDatabase);
            expect(mockDatabaseService.updateDatabase).toHaveBeenCalledWith('db1', {
                name: 'Updated Database',
                description: 'Updated description'
            });
        });

        it('should handle service errors', async () => {
            mockDatabaseService.updateDatabase.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/db1', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'Updated Database',
                    description: 'Updated description'
                })
            });

            const response = await PUT(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to update database' });
        });
    });

    describe('DELETE', () => {
        it('should delete the database', async () => {
            mockDatabaseService.deleteDatabase.mockResolvedValue(undefined);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/db1');
            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
            expect(mockDatabaseService.deleteDatabase).toHaveBeenCalledWith('db1');
        });

        it('should handle service errors', async () => {
            mockDatabaseService.deleteDatabase.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/db1');
            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to delete database' });
        });
    });
});