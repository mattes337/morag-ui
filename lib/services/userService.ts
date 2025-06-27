import { prisma } from '../database';
import { User, UserSettings } from '../../types';

export class UserService {
    private static db = prisma;
    static async createUser(data: {
        name: string;
        email: string;
        avatar?: string;
        role?: 'ADMIN' | 'USER' | 'VIEWER';
    }) {
        return await this.db.user.create({
            data,
            include: {
                userSettings: true,
                apiKeys: true,
            },
        });
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
