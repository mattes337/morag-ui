import { UserService } from '../../../lib/services/userService';
import { prisma } from '../../../lib/database';

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

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a user successfully', async () => {
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

            const result = await UserService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test User',
                    email: 'test@example.com',
                },
                include: {
                    userSettings: true,
                    apiKeys: true,
                },
            });
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
                    theme: 'dark',
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
                theme: 'dark',
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
                theme: 'dark',
                language: 'en',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.userSettings.upsert.mockResolvedValue(mockSettings as any);

            const result = await UserService.createOrUpdateUserSettings('user1', {
                theme: 'dark',
                language: 'en',
            });

            expect(result).toEqual(mockSettings);
            expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                update: {
                    theme: 'dark',
                    language: 'en',
                },
                create: {
                    userId: 'user1',
                    theme: 'dark',
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
                theme: 'light',
                language: 'es',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.userSettings.upsert.mockResolvedValue(mockSettings as any);

            const result = await UserService.updateUserSettings('user1', {
                theme: 'light',
                language: 'es',
            });

            expect(result).toEqual(mockSettings);
            expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                update: {
                    theme: 'light',
                    language: 'es',
                },
                create: {
                    userId: 'user1',
                    theme: 'light',
                    language: 'es',
                },
            });
        });
    });
});