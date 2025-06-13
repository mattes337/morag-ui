import { NextRequest } from 'next/server';
import { GET, POST } from '../../../../app/api/databases/route';
import { DatabaseService } from '../../../../lib/services/databaseService';
import { requireAuth } from '../../../../lib/auth';

// Mock the DatabaseService and auth
jest.mock('../../../../lib/services/databaseService');
jest.mock('../../../../lib/auth');
const mockDatabaseService = jest.mocked(DatabaseService);
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('/api/databases', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockReturnValue(mockUser);
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

            mockDatabaseService.getDatabasesByUser.mockResolvedValue(mockDatabases as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDatabases);
            expect(mockDatabaseService.getDatabasesByUser).toHaveBeenCalledWith('user1');
        });

        it('should handle service errors', async () => {
            mockDatabaseService.getDatabasesByUser.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/databases');
            const response = await GET(mockRequest);
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
                userId: 'user1', // This comes from requireAuth, not request body
                serverId: 'server1',
            });
        });

        it('should validate required fields', async () => {
            const request = new NextRequest('http://localhost:3000/api/databases', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Database',
                    // Missing description and serverId
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'Name, description, and serverId are required' });
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
