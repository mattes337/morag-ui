import { prisma } from '../../../lib/database';
import { RealmService } from '../../../lib/services/realmService';

// Mock the database
jest.mock('../../../lib/database', () => ({
    prisma: {
        realm: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        userRealm: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

const mockDatabase = prisma as jest.Mocked<typeof prisma>;

describe('RealmService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createRealm', () => {
        it('should create a realm successfully', async () => {
            const mockRealm = {
                id: 'realm1',
                name: 'Test Realm',
                description: 'Test Description',
                isDefault: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockUserRealm = {
                id: 'userRealm1',
                userId: 'user1',
                realmId: 'realm1',
                role: 'OWNER',
                joinedAt: new Date(),
            };

            mockDatabase.realm.create.mockResolvedValue(mockRealm as any);

            const result = await RealmService.createRealm({
                name: 'Test Realm',
                description: 'Test Description',
                ownerId: 'user1'
            });

            expect(result).toEqual(mockRealm);
            expect(mockDatabase.realm.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test Realm',
                    description: 'Test Description',
                    ownerId: 'user1',
                    isDefault: false,
                    userRealms: {
                        create: {
                            userId: 'user1',
                            role: 'OWNER'
                        }
                    }
                }
            });
        });
    });

    describe('createDefaultRealm', () => {
        it('should create a default realm successfully', async () => {
            const mockRealm = {
                id: 'realm1',
                name: 'user1\'s Realm',
                description: 'Default realm for user1',
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockUserRealm = {
                id: 'userRealm1',
                userId: 'user1',
                realmId: 'realm1',
                role: 'OWNER',
                joinedAt: new Date(),
            };

            mockDatabase.realm.create.mockResolvedValue(mockRealm as any);

            const result = await RealmService.createDefaultRealm('user1');

            expect(result).toEqual(mockRealm);
            expect(mockDatabase.realm.create).toHaveBeenCalledWith({
                data: {
                    name: 'Default',
                    description: 'Default realm for user',
                    ownerId: 'user1',
                    isDefault: true,
                    userRealms: {
                        create: {
                            userId: 'user1',
                            role: 'OWNER'
                        }
                    }
                }
            });
        });
    });

    describe('getUserRealms', () => {
        it('should return user realms with realm details', async () => {
            const mockUserRealms = [
                {
                    id: 'userRealm1',
                    userId: 'user1',
                    realmId: 'realm1',
                    role: 'OWNER',
                    joinedAt: new Date(),
                    realm: {
                        id: 'realm1',
                        name: 'Test Realm 1',
                        description: 'Description 1',
                        isDefault: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        _count: { userRealms: 5 }
                    },
                },
                {
                    id: 'userRealm2',
                    userId: 'user1',
                    realmId: 'realm2',
                    role: 'ADMIN',
                    joinedAt: new Date(),
                    realm: {
                        id: 'realm2',
                        name: 'Test Realm 2',
                        description: 'Description 2',
                        isDefault: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        _count: { userRealms: 5 }
                    },
                },
            ];

            mockDatabase.userRealm.findMany.mockResolvedValue(mockUserRealms as any);
            mockDatabase.userRealm.count.mockResolvedValue(5);

            const result = await RealmService.getUserRealms('user1');

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 'realm1',
                name: 'Test Realm 1',
                description: 'Description 1',
                isDefault: true,
                createdAt: mockUserRealms[0].realm.createdAt,
                updatedAt: mockUserRealms[0].realm.updatedAt,
                userRole: 'OWNER',
                userCount: 5,
                _count: { userRealms: 5 }
            });
            expect(result[1]).toEqual({
                id: 'realm2',
                name: 'Test Realm 2',
                description: 'Description 2',
                isDefault: false,
                createdAt: mockUserRealms[1].realm.createdAt,
                updatedAt: mockUserRealms[1].realm.updatedAt,
                userRole: 'ADMIN',
                userCount: 5,
                _count: { userRealms: 5 }
            });
        });
    });

    describe('getRealmById', () => {
        it('should return realm with user role when found', async () => {
            const mockUserRealm = {
                realmId: 'realm1',
                userId: 'user1',
                role: 'OWNER',
                realm: {
                    id: 'realm1',
                    name: 'Test Realm',
                    description: 'Test Description',
                    isDefault: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: {
                        userRealms: 5
                    }
                }
            };

            const expectedResult = {
                id: 'realm1',
                name: 'Test Realm',
                description: 'Test Description',
                isDefault: false,
                createdAt: mockUserRealm.realm.createdAt,
                updatedAt: mockUserRealm.realm.updatedAt,
                _count: { userRealms: 5 },
                userRole: 'OWNER',
                userCount: 5
            };

            mockDatabase.userRealm.findFirst.mockResolvedValue(mockUserRealm as any);

            const result = await RealmService.getRealmById('realm1', 'user1');

            expect(result).toEqual(expectedResult);
        });

        it('should return null when user realm not found', async () => {
            mockDatabase.userRealm.findFirst.mockResolvedValue(null);

            const result = await RealmService.getRealmById('nonexistent', 'user1');

            expect(result).toBeNull();
        });
    });

    describe('updateRealm', () => {
        it('should update realm successfully', async () => {
            const mockUserRealm = {
                realmId: 'realm1',
                userId: 'user1',
                role: 'OWNER'
            };

            const mockUpdatedRealm = {
                id: 'realm1',
                name: 'Updated Realm',
                description: 'Updated Description',
                isDefault: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDatabase.userRealm.findFirst.mockResolvedValue(mockUserRealm as any);
            mockDatabase.realm.update.mockResolvedValue(mockUpdatedRealm as any);

            const result = await RealmService.updateRealm('realm1', 'user1', {
                name: 'Updated Realm',
                description: 'Updated Description',
            });

            expect(result).toEqual(mockUpdatedRealm);
        });

        it('should throw error when user has insufficient permissions', async () => {
            mockDatabase.userRealm.findFirst.mockResolvedValue(null);

            await expect(RealmService.updateRealm('realm1', 'user1', {
                name: 'Updated Realm'
            })).rejects.toThrow('Insufficient permissions to update realm');
        });
    });

    describe('deleteRealm', () => {
        it('should delete realm successfully', async () => {
            const mockUserRealm = {
                id: 'userRealm1',
                userId: 'user1',
                realmId: 'realm1',
                role: 'OWNER',
                realm: {
                    id: 'realm1',
                    name: 'Test Realm',
                    description: 'Test Description',
                    isDefault: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            };

            mockDatabase.userRealm.findFirst.mockResolvedValue(mockUserRealm as any);
            mockDatabase.realm.delete.mockResolvedValue(undefined);

            await RealmService.deleteRealm('realm1', 'user1');

            expect(mockDatabase.userRealm.findFirst).toHaveBeenCalledWith({
                where: {
                    realmId: 'realm1',
                    userId: 'user1',
                    role: 'OWNER'
                },
                include: {
                    realm: true
                }
            });
            expect(mockDatabase.realm.delete).toHaveBeenCalledWith({
                where: { id: 'realm1' },
            });
        });

        it('should throw error when user is not owner', async () => {
            mockDatabase.userRealm.findFirst.mockResolvedValue(null);

            await expect(RealmService.deleteRealm('realm1', 'user1')).rejects.toThrow('Only realm owners can delete realms');
        });

        it('should throw error when trying to delete default realm', async () => {
            const mockUserRealm = {
                id: 'userRealm1',
                userId: 'user1',
                realmId: 'realm1',
                role: 'OWNER',
                realm: {
                    id: 'realm1',
                    name: 'Default Realm',
                    isDefault: true,
                }
            };

            mockDatabase.userRealm.findFirst.mockResolvedValue(mockUserRealm as any);

            await expect(RealmService.deleteRealm('realm1', 'user1')).rejects.toThrow('Cannot delete default realm');
        });
    });
});