import { NextRequest } from 'next/server';

// Mock the database service functions and auth
jest.mock('../../../../lib/services/databaseService', () => ({
    DatabaseService: {
        getDatabasesByUserId: jest.fn(),
    },
    createDatabase: jest.fn(),
}));
jest.mock('../../../../lib/auth', () => ({
    getAuthUser: jest.fn(),
}));

// Import AFTER mocking
import { GET, POST } from '../../../../app/api/databases/route';
import { DatabaseService, createDatabase } from '../../../../lib/services/databaseService';
import { getAuthUser } from '../../../../lib/auth';

const mockGetDatabasesByUserId = DatabaseService.getDatabasesByUserId as jest.MockedFunction<typeof DatabaseService.getDatabasesByUserId>;
const mockCreateDatabase = createDatabase as jest.MockedFunction<typeof createDatabase>;
const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>;

describe('/api/databases', () => {
    const mockUser = { userId: 'user1', email: 'test@example.com', role: 'ADMIN' };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAuthUser.mockResolvedValue(mockUser);
    });

    describe('GET', () => {
        it('should handle unauthorized access', async () => {
            mockGetAuthUser.mockResolvedValue(null);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
            expect(mockGetDatabasesByUserId).not.toHaveBeenCalled();
        });

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

            mockGetDatabasesByUserId.mockResolvedValue(mockDatabases as any);

            const mockRequest = new NextRequest('http://localhost:3000/api/databases');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockDatabases);
            expect(mockGetDatabasesByUserId).toHaveBeenCalledWith('user1', null);
        });

        it('should handle service errors', async () => {
            mockGetDatabasesByUserId.mockRejectedValue(new Error('Database error'));

            const mockRequest = new NextRequest('http://localhost:3000/api/databases');
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to fetch databases' });
        });
    });

    describe('POST', () => {
        it('should handle unauthorized access', async () => {
            mockGetAuthUser.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/databases', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Database',
                    description: 'New description',
                    realmId: 'realm1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
            expect(mockCreateDatabase).not.toHaveBeenCalled();
        });

        it('should create a new database', async () => {
            const mockDatabase = {
                id: '1',
                name: 'New Database',
                description: 'New description',
                userId: 'user1',
                serverId: 'server1',
                _count: { documents: 0 },
            };

            mockCreateDatabase.mockResolvedValue(mockDatabase as any);

            const request = new NextRequest('http://localhost:3000/api/databases', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Database',
                    description: 'New description',
                    realmId: 'realm1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockDatabase);
            expect(mockCreateDatabase).toHaveBeenCalledWith({
                name: 'New Database',
                description: 'New description',
                userId: 'user1', // This comes from getAuthUser
                serverId: 'default-server', // Default value
                realmId: 'realm1',
            });
        });

        it('should validate required fields', async () => {
            const request = new NextRequest('http://localhost:3000/api/databases', {
                method: 'POST',
                body: JSON.stringify({
                    // Missing name and realmId - required fields
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Invalid input');
            expect(data.details).toBeDefined();
            expect(mockCreateDatabase).not.toHaveBeenCalled();
        });

        it('should accept valid input with optional description', async () => {
            const mockDatabase = {
                id: 'db1',
                name: 'New Database',
                description: '',
                userId: 'user1',
                serverId: 'default-server',
            };
            mockCreateDatabase.mockResolvedValue(mockDatabase);

            const request = new NextRequest('http://localhost:3000/api/databases', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Database',
                    realmId: 'realm1',
                    // description is optional
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockDatabase);
            expect(mockCreateDatabase).toHaveBeenCalledWith({
                name: 'New Database',
                description: '',
                userId: 'user1',
                serverId: 'default-server',
                realmId: 'realm1',
            });
        });

        it('should handle service errors', async () => {
            mockCreateDatabase.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost:3000/api/databases', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Database',
                    description: 'New description',
                    realmId: 'realm1',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to create database' });
        });
    });
});
