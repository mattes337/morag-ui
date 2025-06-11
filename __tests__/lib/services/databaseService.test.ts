import { DatabaseService } from '../../../lib/services/databaseService';
import { prisma } from '../../../lib/database';

// Mock Prisma
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

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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

            mockPrisma.database.create.mockResolvedValue(mockDatabase as any);

            const result = await DatabaseService.createDatabase({
                name: 'Test Database',
                description: 'Test description',
                userId: 'user1',
                serverId: 'server1',
            });

            expect(mockPrisma.database.create).toHaveBeenCalledWith({
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

            mockPrisma.database.findMany.mockResolvedValue(mockDatabases as any);

            const result = await DatabaseService.getAllDatabases();

            expect(mockPrisma.database.findMany).toHaveBeenCalledWith({
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

            mockPrisma.database.findMany.mockResolvedValue(mockDatabases as any);

            const result = await DatabaseService.getDatabasesByUser('user1');

            expect(mockPrisma.database.findMany).toHaveBeenCalledWith({
                where: { userId: 'user1' },
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

            mockPrisma.database.findUnique.mockResolvedValue(mockDatabase as any);

            const result = await DatabaseService.getDatabaseById('1');

            expect(mockPrisma.database.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
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

            mockPrisma.database.update.mockResolvedValue(mockUpdatedDatabase as any);

            const result = await DatabaseService.updateDatabase('1', {
                name: 'Updated Database',
            });

            expect(mockPrisma.database.update).toHaveBeenCalledWith({
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

            mockPrisma.database.delete.mockResolvedValue(mockDeletedDatabase as any);

            const result = await DatabaseService.deleteDatabase('1');

            expect(mockPrisma.database.delete).toHaveBeenCalledWith({
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

            mockPrisma.document.count.mockResolvedValue(5);
            mockPrisma.database.update.mockResolvedValue(mockUpdatedDatabase as any);

            const result = await DatabaseService.updateDocumentCount('1');

            expect(mockPrisma.document.count).toHaveBeenCalledWith({
                where: { databaseId: '1' },
            });

            expect(mockPrisma.database.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { documentCount: 5 },
            });

            expect(result).toEqual(mockUpdatedDatabase);
        });
    });
});
