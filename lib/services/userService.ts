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
