import { prisma } from '../database';
import { User, UserSettings } from '@prisma/client';

export class UserService {
    static async createUser(data: {
        name: string;
        email: string;
        avatar?: string;
        role?: 'ADMIN' | 'USER' | 'VIEWER';
    }) {
        return await prisma.user.create({
            data,
            include: {
                userSettings: true,
                apiKeys: true,
            },
        });
    }

    static async getUserById(id: string) {
        return await prisma.user.findUnique({
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
        return await prisma.user.findUnique({
            where: { email },
            include: {
                userSettings: true,
                apiKeys: true,
            },
        });
    }

    static async updateUser(id: string, data: Partial<User>) {
        return await prisma.user.update({
            where: { id },
            data,
            include: {
                userSettings: true,
                apiKeys: true,
            },
        });
    }

    static async deleteUser(id: string) {
        return await prisma.user.delete({
            where: { id },
        });
    }

    static async createOrUpdateUserSettings(userId: string, settings: Partial<UserSettings>) {
        return await prisma.userSettings.upsert({
            where: { userId },
            update: settings,
            create: {
                userId,
                ...settings,
            },
        });
    }

    static async getUserSettings(userId: string) {
        return await prisma.userSettings.findUnique({
            where: { userId },
        });
    }
}
