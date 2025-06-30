/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock the database service functions
jest.mock('../../../../../lib/services/databaseService', () => ({
    getDatabaseById: jest.fn(),
    updateDatabase: jest.fn(),
    deleteDatabase: jest.fn(),
}));

// Import AFTER mocking
import { GET, PUT, DELETE } from '../../../../../app/api/databases/[id]/route';
import { getDatabaseById, updateDatabase, deleteDatabase } from '../../../../../lib/services/databaseService';

const mockGetDatabaseById = getDatabaseById as jest.MockedFunction<typeof getDatabaseById>;
const mockUpdateDatabase = updateDatabase as jest.MockedFunction<typeof updateDatabase>;
const mockDeleteDatabase = deleteDatabase as jest.MockedFunction<typeof deleteDatabase>;

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

            mockGetDatabaseById.mockResolvedValue(mockDatabase as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/db1');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDatabase);
            expect(mockGetDatabaseById).toHaveBeenCalledWith('db1');
        });

        it('should return 404 if the database does not exist', async () => {
            mockGetDatabaseById.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/nonexistent');
            const response = await GET(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Database not found' });
        });

        it('should handle service errors', async () => {
            mockGetDatabaseById.mockRejectedValue(new Error('Database error'));

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

            mockUpdateDatabase.mockResolvedValue(mockDatabase as any);

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
            expect(mockUpdateDatabase).toHaveBeenCalledWith('db1', {
                name: 'Updated Database',
                description: 'Updated description'
            });
        });

        it('should handle service errors', async () => {
            mockUpdateDatabase.mockRejectedValue(new Error('Database error'));

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
            const mockDatabase = {
                id: 'db1',
                name: 'Test Database',
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: 'user1',
                description: 'Test description',
                documentCount: 0,
                lastUpdated: new Date(),
                serverId: 'server1'
            };
            mockDeleteDatabase.mockResolvedValue(mockDatabase);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/db1');
            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
            expect(mockDeleteDatabase).toHaveBeenCalledWith('db1');
        });

        it('should handle service errors', async () => {
            mockDeleteDatabase.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/databases/db1');
            const response = await DELETE(mockRequest, { params: mockParams });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to delete database' });
        });
    });
});