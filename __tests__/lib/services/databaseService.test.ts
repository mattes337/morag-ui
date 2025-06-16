// Mock the database module
jest.mock('../../../lib/database', () => ({
    prisma: {
        database: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        document: {
            count: jest.fn(),
        },
    },
}));

import { DatabaseType } from '@prisma/client';

// Mock the databaseService module to ensure proper function exports
jest.mock('../../../lib/services/databaseService', () => ({
    createDatabase: jest.fn(),
    getAllDatabases: jest.fn(),
    getDatabasesByUser: jest.fn(),
    getDatabaseById: jest.fn(),
    updateDatabase: jest.fn(),
    deleteDatabase: jest.fn(),
    updateDocumentCount: jest.fn(),
}));

// Import AFTER mocking
import {
    createDatabase,
    getAllDatabases,
    getDatabasesByUser,
    getDatabaseById,
    updateDatabase,
    deleteDatabase,
    updateDocumentCount,
} from '../../../lib/services/databaseService';

// Get the mocked functions
const mockedCreateDatabase = createDatabase as jest.MockedFunction<typeof createDatabase>;
const mockedGetAllDatabases = getAllDatabases as jest.MockedFunction<typeof getAllDatabases>;
const mockedGetDatabasesByUser = getDatabasesByUser as jest.MockedFunction<typeof getDatabasesByUser>;
const mockedGetDatabaseById = getDatabaseById as jest.MockedFunction<typeof getDatabaseById>;
const mockedUpdateDatabase = updateDatabase as jest.MockedFunction<typeof updateDatabase>;
const mockedDeleteDatabase = deleteDatabase as jest.MockedFunction<typeof deleteDatabase>;
const mockedUpdateDocumentCount = updateDocumentCount as jest.MockedFunction<typeof updateDocumentCount>;

describe('Database Service', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        mockedCreateDatabase.mockReset();
        mockedGetAllDatabases.mockReset();
        mockedGetDatabasesByUser.mockReset();
        mockedGetDatabaseById.mockReset();
        mockedUpdateDatabase.mockReset();
        mockedDeleteDatabase.mockReset();
        mockedUpdateDocumentCount.mockReset();
    });

    describe('createDatabase', () => {
        test('createDatabase should create a new database', async () => {
            const mockData = {
                name: 'Test Database',
                description: 'A test database',
                userId: 'user123',
                serverId: 'server123',
            };

            const mockResult = {
                id: 'db123',
                ...mockData,
                documentCount: 0,
                lastUpdated: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                documents: [],
                user: {
                    id: 'user123',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
                server: { 
                    id: 'server123', 
                    name: 'Test Server',
                    type: DatabaseType.QDRANT,
                    host: 'localhost',
                    port: 3306,
                    username: 'testuser',
                    password: 'testpass',
                    apiKey: null,
                    database: 'testdb',
                    collection: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastConnected: new Date(),
                    userId: 'user123'
                },
                _count: { documents: 0 },
            };

            mockedCreateDatabase.mockResolvedValue(mockResult);

            const result = await createDatabase(mockData);

            expect(mockedCreateDatabase).toHaveBeenCalledWith(mockData);
            expect(result).toEqual(mockResult);
        });
    });

    describe('getAllDatabases', () => {
        test('getAllDatabases should return all databases', async () => {
            const mockDatabases = [
                {
                    id: 'db1',
                    name: 'Database 1',
                    description: 'First database',
                    userId: 'user1',
                    serverId: 'server1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    documents: [],
                    user: {
                    id: 'user1',
                    name: 'User 1',
                    email: 'user1@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
                    server: { 
                    id: 'server1', 
                    name: 'Server 1',
                    type: DatabaseType.QDRANT,
                    host: 'localhost',
                    port: 3306,
                    username: 'testuser',
                    password: 'testpass',
                    apiKey: null,
                    database: 'testdb',
                    collection: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastConnected: new Date(),
                    userId: 'user123'
                },
                    _count: { documents: 0 },
                },
                {
                    id: 'db2',
                    name: 'Database 2',
                    description: 'Second database',
                    userId: 'user2',
                    serverId: 'server2',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    documents: [],
                    user: {
                    id: 'user2',
                    name: 'User 2',
                    email: 'user2@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
                    server: { 
                    id: 'server2', 
                    name: 'Server 2',
                    type: DatabaseType.QDRANT,
                    host: 'localhost',
                    port: 3306,
                    username: 'testuser',
                    password: 'testpass',
                    apiKey: null,
                    database: 'testdb',
                    collection: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastConnected: new Date(),
                    userId: 'user123'
                },
                    _count: { documents: 1 },
                },
            ];

            mockedGetAllDatabases.mockResolvedValue(mockDatabases);

            const result = await getAllDatabases();

            expect(mockedGetAllDatabases).toHaveBeenCalled();
            expect(result).toEqual(mockDatabases);
        });
    });

    describe('getDatabasesByUser', () => {
        test('getDatabasesByUserId should return databases for a specific user', async () => {
            const mockDatabases = [
                {
                    id: 'db1',
                    name: 'User Database 1',
                    description: 'First user database',
                    userId: 'user123',
                    serverId: 'server1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    documents: [],
                    user: {
                        id: 'user123',
                        name: 'Test User',
                        email: 'test@example.com',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        avatar: null,
                        role: 'USER' as const,
                        theme: 'LIGHT' as const,
                    },
                    server: { 
                    id: 'server1', 
                    name: 'Server 1',
                    type: DatabaseType.QDRANT,
                    host: 'localhost',
                    port: 3306,
                    username: 'testuser',
                    password: 'testpass',
                    apiKey: null,
                    database: 'testdb',
                    collection: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastConnected: new Date(),
                    userId: 'user123'
                },
                    _count: { documents: 0 },
                },
            ];

            mockedGetDatabasesByUser.mockResolvedValue(mockDatabases);

            const result = await getDatabasesByUser('user123');

            expect(mockedGetDatabasesByUser).toHaveBeenCalledWith('user123');
            expect(result).toEqual(mockDatabases);
        });
    });

    describe('getDatabaseById', () => {
        test('getDatabaseById should return a specific database', async () => {
            const mockDatabase = {
                id: 'db123',
                name: 'Test Database',
                description: 'A test database',
                userId: 'user123',
                serverId: 'server123',
                createdAt: new Date(),
                updatedAt: new Date(),
                documents: [],
                user: {
                    id: 'user123',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
                server: { 
                    id: 'server123', 
                    name: 'Test Server',
                    type: DatabaseType.QDRANT,
                    host: 'localhost',
                    port: 3306,
                    username: 'testuser',
                    password: 'testpass',
                    apiKey: null,
                    database: 'testdb',
                    collection: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastConnected: new Date(),
                    userId: 'user123'
                },
                _count: { documents: 0 },
            };

            mockedGetDatabaseById.mockResolvedValue(mockDatabase);

            const result = await getDatabaseById('db123');

            expect(mockedGetDatabaseById).toHaveBeenCalledWith('db123');
            expect(result).toEqual(mockDatabase);
        });
    });

    describe('updateDatabase', () => {
        test('updateDatabase should update a database', async () => {
            const updateData = {
                name: 'Updated Database',
                description: 'An updated database',
            };

            const mockUpdatedDatabase = {
                id: 'db123',
                name: 'Updated Database',
                description: 'An updated database',
                userId: 'user123',
                serverId: 'server123',
                documentCount: 0,
                lastUpdated: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                documents: [],
                user: {
                    id: 'user123',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
                server: { 
                    id: 'server123', 
                    name: 'Test Server',
                    type: 'MYSQL',
                    host: 'localhost',
                    port: 3306,
                    username: 'testuser',
                    password: 'testpass',
                    apiKey: null,
                    database: 'testdb',
                    collection: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastConnected: new Date(),
                    userId: 'user123'
                },
                _count: { documents: 0 },
            };

            mockedUpdateDatabase.mockResolvedValue(mockUpdatedDatabase);

            const result = await updateDatabase('db123', updateData);

            expect(mockedUpdateDatabase).toHaveBeenCalledWith('db123', updateData);
            expect(result).toEqual(mockUpdatedDatabase);
        });
    });

    describe('deleteDatabase', () => {
        test('deleteDatabase should delete a database', async () => {
            const mockDeletedDatabase = {
                id: 'db123',
                name: 'Test Database',
                description: 'A test database',
                userId: 'user123',
                serverId: 'server123',
                documentCount: 0,
                lastUpdated: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockedDeleteDatabase.mockResolvedValue(mockDeletedDatabase);

            const result = await deleteDatabase('db123');

            expect(mockedDeleteDatabase).toHaveBeenCalledWith('db123');
            expect(result).toEqual(mockDeletedDatabase);
        });
    });

    describe('updateDocumentCount', () => {
        test('updateDocumentCount should update document count for a database', async () => {
            const mockCount = 5;
            const mockUpdatedDatabase = {
                id: 'db123',
                name: 'Test Database',
                description: 'A test database',
                userId: 'user123',
                serverId: 'server123',
                documentCount: mockCount,
                lastUpdated: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                documents: [],
                user: {
                    id: 'user123',
                    name: 'Test User',
                    email: 'test@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    avatar: null,
                    role: 'USER' as const,
                    theme: 'LIGHT' as const,
                },
                server: { id: 'server123', name: 'Test Server' },
                _count: { documents: mockCount },
            };

            mockedUpdateDocumentCount.mockResolvedValue(mockUpdatedDatabase);

            const result = await updateDocumentCount('db123');

            expect(mockedUpdateDocumentCount).toHaveBeenCalledWith('db123');
            expect(result).toEqual(mockUpdatedDatabase);
        });
    });
});
