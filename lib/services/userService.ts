import { User, UserSettings } from '../../types';
import { prisma } from '../database';
import { RealmService } from './realmService';

export class UserService {
    private static db = prisma;
    static async createUser(data: {
        name: string;
        email: string;
        avatar?: string;
        role?: 'ADMIN' | 'USER' | 'VIEWER';
        password?: string;
    }) {
        // Create user first
        const user = await this.db.user.create({
            data: {
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                password: data.password,
                role: data.role || 'USER',
            },
            include: {
                userSettings: true,
                apiKeys: true,
            },
        });

        // Create default realm for the new user
        try {
            await RealmService.createDefaultRealm(user.id);
        } catch (error) {
            console.error('Failed to create default realm for user:', error);
            // Don't fail user creation if realm creation fails
        }

        return user;
    }

    static async getUserById(id: string) {
        return await this.db.user.findUnique({
            where: { id },
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
    }

    static async getUserWithRealms(id: string) {
        return await this.db.user.findUnique({
            where: { id },
            include: {
                userSettings: true,
                apiKeys: {
                    include: {
                        realm: true,
                    },
                },
                userRealms: {
                    include: {
                        realm: true,
                    },
                },
                realms: true, // Owned realms
                jobs: {
                    include: {
                        document: true,
                        realm: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10, // Latest 10 jobs
                },
            },
        });
    }

    static async getUserByEmail(email: string) {
        return await this.db.user.findUnique({
            where: { email },
            include: {
                userSettings: true,
                apiKeys: true,
            },
        });
    }

    static async updateUser(id: string, data: Partial<User>) {
        return await this.db.user.update({
            where: { id },
            data,
            include: {
                userSettings: true,
                apiKeys: true,
            },
        });
    }

    static async deleteUser(id: string) {
        return await this.db.user.delete({
            where: { id },
        });
    }

    static async getAllUsers(options?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: 'ADMIN' | 'USER' | 'VIEWER';
    }) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (options?.search) {
            where.OR = [
                { name: { contains: options.search, mode: 'insensitive' } },
                { email: { contains: options.search, mode: 'insensitive' } },
            ];
        }

        if (options?.role) {
            where.role = options.role;
        }

        const [users, total] = await Promise.all([
            this.db.user.findMany({
                where,
                include: {
                    userSettings: true,
                    apiKeys: {
                        select: {
                            id: true,
                            name: true,
                            created: true,
                            lastUsed: true,
                        },
                    },
                    userRealms: {
                        include: {
                            realm: {
                                select: {
                                    id: true,
                                    name: true,
                                    isDefault: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            documents: true,
                            jobs: true,
                            realms: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.db.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    static async createUserWithDefaults(data: {
        name: string;
        email: string;
        avatar?: string;
        role?: 'ADMIN' | 'USER' | 'VIEWER';
        password?: string;
        createApiKey?: boolean;
    }) {
        // Create user with default realm
        const user = await this.createUser(data);

        // Create API key if requested
        if (data.createApiKey) {
            const defaultRealm = await RealmService.getUserDefaultRealm(user.id);
            if (defaultRealm) {
                const { ApiKeyService } = await import('./apiKeyService');
                const apiKey = await ApiKeyService.createApiKey({
                    name: 'Default API Key',
                    key: `mk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                    userId: user.id,
                    realmId: defaultRealm.id,
                });

                return {
                    ...user,
                    defaultApiKey: apiKey,
                };
            }
        }

        return user;
    }

    static async createOrUpdateUserSettings(userId: string, settings: Partial<UserSettings>) {
        return await this.db.userSettings.upsert({
            where: { userId },
            update: settings,
            create: {
                userId,
                ...settings,
            },
        });
    }

    static async getUserSettings(userId: string) {
        return await this.db.userSettings.findUnique({
            where: { userId },
        });
    }

    static async updateUserSettings(userId: string, settings: Partial<UserSettings>) {
        return await this.db.userSettings.upsert({
            where: { userId },
            update: settings,
            create: {
                userId,
                ...settings,
            },
        });
    }
}
