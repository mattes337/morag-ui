/**
 * @jest-environment node
 */
import { UserService } from '@/lib/services/userService';
import { RealmService } from '@/lib/services/realmService';
import { prisma } from '../../../lib/database';
import { User, Role, UserSettings } from '@prisma/client';

// Mock the database
jest.mock('../../../lib/database', () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        userSettings: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
        },
    },
}));

// Mock RealmService
jest.mock('@/lib/services/realmService', () => ({
    RealmService: {
        createDefaultRealm: jest.fn(),
    },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRealmService = RealmService as jest.Mocked<typeof RealmService>;

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a user successfully and create default realm', async () => {
            const mockUser = {
                id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER',
                avatar: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                userSettings: null,
                apiKeys: [],
            };

            const mockRealm = {
                id: 'realm1',
                name: 'Default',
                description: 'Default realm for user',
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.user.create.mockResolvedValue(mockUser as any);
            mockRealmService.createDefaultRealm.mockResolvedValue(mockRealm as any);

            const result = await UserService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test User',
                    email: 'test@example.com',
                    avatar: undefined,
                    password: undefined,
                    role: 'USER',
                },
                include: {
                    userSettings: true,
                    apiKeys: true,
                },
            });
            expect(mockRealmService.createDefaultRealm).toHaveBeenCalledWith('user1');
        });

        it('should create a user successfully even if default realm creation fails', async () => {
            const mockUser = {
                id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER',
                avatar: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                userSettings: null,
                apiKeys: [],
            };

            mockPrisma.user.create.mockResolvedValue(mockUser as any);
            mockRealmService.createDefaultRealm.mockRejectedValue(new Error('Realm creation failed'));

            // Mock console.error to avoid test output pollution
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await UserService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test User',
                    email: 'test@example.com',
                    avatar: undefined,
                    password: undefined,
                    role: 'USER',
                },
                include: {
                    userSettings: true,
                    apiKeys: true,
                },
            });
            expect(mockRealmService.createDefaultRealm).toHaveBeenCalledWith('user1');
            expect(consoleSpy).toHaveBeenCalledWith('Failed to create default realm for user:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });

        it('should create a user with optional fields', async () => {
            const mockUser = {
                id: 'user1',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'ADMIN',
                avatar: 'https://example.com/avatar.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
                userSettings: null,
                apiKeys: [],
            };

            mockPrisma.user.create.mockResolvedValue(mockUser as any);

            const result = await UserService.createUser({
                name: 'Admin User',
                email: 'admin@example.com',
                avatar: 'https://example.com/avatar.jpg',
                role: 'ADMIN',
            });

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'Admin User',
                    email: 'admin@example.com',
                    avatar: 'https://example.com/avatar.jpg',
                    password: undefined,
                    role: 'ADMIN',
                },
                include: {
                    userSettings: true,
                    apiKeys: true,
                },
            });
        });

        it('should handle creation errors', async () => {
            mockPrisma.user.create.mockRejectedValue(new Error('Email already exists'));

            await expect(
                UserService.createUser({
                    name: 'Test User',
                    email: 'test@example.com',
                })
            ).rejects.toThrow('Email already exists');
        });
    });

    describe('getUserById', () => {
        it('should return user by id with all relations', async () => {
            const mockUser = {
                id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER',
                avatar: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                userSettings: {
                    id: 'settings1',
                    userId: 'user1',
                    theme: 'DARK',
                    language: 'en',
                },
                apiKeys: [
                    {
                        id: 'key1',
                        name: 'Test Key',
                        key: 'test-key-123',
                        userId: 'user1',
                        createdAt: new Date(),
                    },
                ],
                jobs: [
                    {
                        id: 'job1',
                        type: 'INGEST',
                        status: 'COMPLETED',
                        userId: 'user1',
                        document: {
                            id: 'doc1',
                            name: 'Test Document',
                            type: 'pdf',
                        },
                    },
                ],
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

            const result = await UserService.getUserById('user1');

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user1' },
                include: {
                    userSettings: true,
                    apiKeys: true,
                    jobs: {
                        include: {
                            document: true,
                        },
                    },
                },
            });
        });

        it('should return null when user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await UserService.getUserById('nonexistent');

            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

            await expect(UserService.getUserById('user1')).rejects.toThrow('Database error');
        });
    });

    describe('getUserByEmail', () => {
        it('should return user by email with relations', async () => {
            const mockUser = {
                id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER',
                avatar: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                userSettings: null,
                apiKeys: [],
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

            const result = await UserService.getUserByEmail('test@example.com');

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                include: {
                    userSettings: true,
                    apiKeys: true,
                },
            });
        });

        it('should return null when user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await UserService.getUserByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const mockUpdatedUser = {
                id: 'user1',
                name: 'Updated User',
                email: 'updated@example.com',
                role: 'ADMIN',
                avatar: 'https://example.com/new-avatar.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
                userSettings: null,
                apiKeys: [],
            };

            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser as any);

            const result = await UserService.updateUser('user1', {
                name: 'Updated User',
                email: 'updated@example.com',
                role: 'ADMIN',
                avatar: 'https://example.com/new-avatar.jpg',
            });

            expect(result).toEqual(mockUpdatedUser);
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user1' },
                data: {
                    name: 'Updated User',
                    email: 'updated@example.com',
                    role: 'ADMIN',
                    avatar: 'https://example.com/new-avatar.jpg',
                },
                include: {
                    userSettings: true,
                    apiKeys: true,
                },
            });
        });

        it('should handle update errors', async () => {
            mockPrisma.user.update.mockRejectedValue(new Error('User not found'));

            await expect(
                UserService.updateUser('nonexistent', {
                    name: 'Updated User',
                })
            ).rejects.toThrow('User not found');
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const mockDeletedUser = {
                id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER',
                avatar: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.user.delete.mockResolvedValue(mockDeletedUser as any);

            const result = await UserService.deleteUser('user1');

            expect(result).toEqual(mockDeletedUser);
            expect(mockPrisma.user.delete).toHaveBeenCalledWith({
                where: { id: 'user1' },
            });
        });

        it('should handle deletion errors', async () => {
            mockPrisma.user.delete.mockRejectedValue(new Error('User not found'));

            await expect(UserService.deleteUser('nonexistent')).rejects.toThrow('User not found');
        });
    });

    describe('getUserSettings', () => {
        it('should return user settings by userId', async () => {
            const mockSettings = {
                id: 'settings1',
                userId: 'user1',
                theme: 'DARK',
                language: 'en',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.userSettings.findUnique.mockResolvedValue(mockSettings as any);

            const result = await UserService.getUserSettings('user1');

            expect(result).toEqual(mockSettings);
            expect(mockPrisma.userSettings.findUnique).toHaveBeenCalledWith({
                where: { userId: 'user1' },
            });
        });

        it('should return null when settings not found', async () => {
            mockPrisma.userSettings.findUnique.mockResolvedValue(null);

            const result = await UserService.getUserSettings('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('createOrUpdateUserSettings', () => {
        it('should create or update user settings', async () => {
            const mockSettings = {
                id: 'settings1',
                userId: 'user1',
                theme: 'DARK',
                language: 'en',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.userSettings.upsert.mockResolvedValue(mockSettings as any);

            const result = await UserService.createOrUpdateUserSettings('user1', {
                theme: 'DARK',
                language: 'en',
            });

            expect(result).toEqual(mockSettings);
            expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                update: {
                    theme: 'DARK',
                    language: 'en',
                },
                create: {
                    userId: 'user1',
                    theme: 'DARK',
                    language: 'en',
                },
            });
        });
    });

    describe('updateUserSettings', () => {
        it('should update user settings', async () => {
            const mockSettings = {
                id: 'settings1',
                userId: 'user1',
                theme: 'LIGHT',
                language: 'es',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.userSettings.upsert.mockResolvedValue(mockSettings as any);

            const result = await UserService.updateUserSettings('user1', {
                theme: 'LIGHT',
                language: 'es',
            });

            expect(result).toEqual(mockSettings);
            expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                update: {
                    theme: 'LIGHT',
                    language: 'es',
                },
                create: {
                    userId: 'user1',
                    theme: 'LIGHT',
                    language: 'es',
                },
            });
        });
    });
});