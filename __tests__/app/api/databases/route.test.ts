import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/databases/route';
import { DatabaseService } from '../../../../lib/services/databaseService';

// Mock the DatabaseService
jest.mock('../../../../lib/services/databaseService');
const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;

describe('/api/databases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return all databases', async () => {
            const mockDatabases = [
                {
                    id: '1',
                    name: 'Test Database',
                    description: 'Test description',
                    documentCount: 5,
                    lastUpdated: new Date(),
                    _count: { documents: 5 },
                },
            ];

            mockDatabaseService.getAllDatabases.mockResolvedValue(mockDatabases as any);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDatabases);
            expect(mockDatabaseService.getAllDatabases).toHaveBeenCalledTimes(1);
        });

        it('should handle service errors', async () => {
            mockDatabaseService.getAllDatabases.mockRejectedValue(new Error('Database error'));

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to fetch databases' });
        });
    });

    describe('POST', () => {
        it('should create a new database', async () => {
            const mockDatabase = {
                id: '1',
                name: 'New Database',
                description: 'New description',
                userId: 'user1',
                serverId: 'server1',
                _count: { documents: 0 },
            };

            mockDatabaseService.createDatabase.mockResolvedValue(mockDatabase as any);

            const request = new NextRequest('http://localhost:3000/api/databases', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Database',
                    description: 'New description',
                    userId: 'user1',
                    serverId: 'server1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockDatabase);
            expect(mockDatabaseService.createDatabase).toHaveBeenCalledWith({
                name: 'New Database',
                description: 'New description',
                userId: 'user1',
                serverId: 'server1',
            });
        });

        it('should validate required fields', async () => {
            const request = new NextRequest('http://localhost:3000/api/databases', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Database',
                    // Missing description, userId, and serverId
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Name, description, userId, and serverId are required' });
            expect(mockDatabaseService.createDatabase).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            mockDatabaseService.createDatabase.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost:3000/api/databases', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Database',
                    description: 'New description',
                    userId: 'user1',
                    serverId: 'server1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to create database' });
        });
    });
});
