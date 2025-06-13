// Mock Prisma before any imports
jest.mock('../../../lib/database', () => {
    const mockPrismaDatabase = {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockPrismaDocument = {
        count: jest.fn(),
    };

    return {
        prisma: {
            database: mockPrismaDatabase,
            document: mockPrismaDocument,
        },
    };
});

import { DatabaseService } from '../../../lib/services/databaseService';
import { prisma } from '../../../lib/database';

// Get references to the mocked functions using jest.mocked()
const mockPrisma = jest.mocked(prisma);
const mockPrismaDatabase = mockPrisma.database;
const mockPrismaDocument = mockPrisma.document;

describe('DatabaseService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createDatabase', () => {
        it('should create a database successfully', async () => {
            const mockDatabase = {
                id: '1',
                name: 'Test Database',
                description: 'Test description',
                userId: 'user1',
                serverId: 'server1',
                documents: [],
                user: { id: 'user1', name: 'Test User' },
                server: { id: 'server1', name: 'Test Server' },
                _count: { documents: 0 },
            };

            mockPrismaDatabase.create.mockResolvedValue(mockDatabase as any);

            const result = await DatabaseService.createDatabase({
                name: 'Test Database',
                description: 'Test description',
                userId: 'user1',
                serverId: 'server1',
            });

            expect(mockPrismaDatabase.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test Database',
                    description: 'Test description',
                    userId: 'user1',
                    serverId: 'server1',
                },
                include: {
                    documents: true,
                    user: true,
                    server: true,
                    _count: {
                        select: {
                            documents: true,
                        },
                    },
                },
            });

            expect(result).toEqual(mockDatabase);
        });
    });

    describe('getAllDatabases', () => {
        it('should return all databases', async () => {
            const mockDatabases = [
                {
                    id: '1',
                    name: 'Database 1',
                    documents: [],
                    user: { id: 'user1', name: 'User 1' },
                    server: { id: 'server1', name: 'Server 1' },
                    _count: { documents: 0 },
                },
            ];

            mockPrismaDatabase.findMany.mockResolvedValue(mockDatabases as any);

            const result = await DatabaseService.getAllDatabases();

            expect(result).toEqual(mockDatabases);
            expect(mockPrismaDatabase.findMany).toHaveBeenCalledWith({         include: {
                    documents: true,
                    user: true,
                    server: true,
                    _count: {
                        select: {
                            documents: true,
                        },
                    },
                },
            });

            expect(result).toEqual(mockDatabases);
        });
    });

    describe('getDatabasesByUser', () => {
        it('should return databases for a specific user', async () => {
            const mockDatabases = [
                {
                    id: '1',
                    name: 'User Database',
                    userId: 'user1',
                    documents: [],
                    user: { id: 'user1', name: 'User 1' },
                    server: { id: 'server1', name: 'Server 1' },
                    _count: { documents: 0 },
                },
            ];

            mockPrismaDatabase.findMany.mockResolvedValue(mockDatabases as any);

            const result = await DatabaseService.getDatabasesByUser('user1');

            expect(result).toEqual(mockDatabases);
            expect(mockPrismaDatabase.findMany).toHaveBeenCalledWith({         where: { userId: 'user1' },
                include: {
                    documents: true,
                    user: true,
                    server: true,
                    _count: {
                        select: {
                            documents: true,
                        },
                    },
                },
            });

            expect(result).toEqual(mockDatabases);
        });
    });

    describe('getDatabaseById', () => {
        it('should return a database by id', async () => {
            const mockDatabase = {
                id: '1',
                name: 'Test Database',
                documents: [],
                user: { id: 'user1', name: 'User 1' },
                server: { id: 'server1', name: 'Server 1' },
                _count: { documents: 0 },
            };

            mockPrismaDatabase.findUnique.mockResolvedValue(mockDatabase as any);

            const result = await DatabaseService.getDatabaseById('1');

            expect(result).toEqual(mockDatabase);
            expect(mockPrismaDatabase.findUnique).toHaveBeenCalledWith({         where: { id: '1' },
                include: {
                    documents: {
                        orderBy: {
                            uploadDate: 'desc',
                        },
                    },
                    user: true,
                    server: true,
                    _count: {
                        select: {
                            documents: true,
                        },
                    },
                },
            });

            expect(result).toEqual(mockDatabase);
        });
    });

    describe('updateDatabase', () => {
        it('should update a database', async () => {
            const mockUpdatedDatabase = {
                id: '1',
                name: 'Updated Database',
                documents: [],
                user: { id: 'user1', name: 'User 1' },
                server: { id: 'server1', name: 'Server 1' },
                _count: { documents: 0 },
            };

            mockPrismaDatabase.update.mockResolvedValue(mockUpdatedDatabase as any);

            const result = await DatabaseService.updateDatabase('1', {
                name: 'Updated Database',
            });

            expect(mockPrismaDatabase.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { name: 'Updated Database' },
                include: {
                    documents: true,
                    user: true,
                    server: true,
                    _count: {
                        select: {
                            documents: true,
                        },
                    },
                },
            });

            expect(result).toEqual(mockUpdatedDatabase);
        });
    });

    describe('deleteDatabase', () => {
        it('should delete a database', async () => {
            const mockDeletedDatabase = { id: '1', name: 'Deleted Database' };

            mockPrismaDatabase.delete.mockResolvedValue(mockDeletedDatabase as any);

            const result = await DatabaseService.deleteDatabase('1');

            expect(mockPrismaDatabase.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });

            expect(result).toEqual(mockDeletedDatabase);
        });
    });

    describe('updateDocumentCount', () => {
        it('should update document count for a database', async () => {
            const mockUpdatedDatabase = {
                id: '1',
                name: 'Test Database',
                documentCount: 5,
            };

            mockPrismaDocument.count.mockResolvedValue(5);
            mockPrismaDatabase.update.mockResolvedValue(mockUpdatedDatabase as any);

            const result = await DatabaseService.updateDocumentCount('1');

            expect(mockPrismaDocument.count).toHaveBeenCalledWith({
                where: { databaseId: '1' },
            });
            expect(mockPrismaDatabase.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { documentCount: 5 },
            });

            expect(result).toEqual(mockUpdatedDatabase);
        });
    });
});
