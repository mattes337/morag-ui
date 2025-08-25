import { ApiKey } from '@prisma/client';
import { prisma } from '../database';

export class ApiKeyService {
    static async createApiKey(data: {
        name: string;
        key: string;
        userId: string;
        realmId?: string | null;
        isGeneric?: boolean;
    }) {
        return await prisma.apiKey.create({
            data: {
                name: data.name,
                key: data.key,
                userId: data.userId,
                realmId: data.realmId || null,
                isGeneric: data.isGeneric || false,
            },
            include: {
                user: true,
                realm: true,
            },
        });
    }

    static async getAllApiKeys() {
        return await prisma.apiKey.findMany({
            include: {
                user: true,
                realm: true,
            },
            orderBy: {
                created: 'desc',
            },
        });
    }

    static async getApiKeysByUser(userId: string) {
        return await prisma.apiKey.findMany({
            where: { userId },
            include: {
                user: true,
                realm: true,
            },
            orderBy: {
                created: 'desc',
            },
        });
    }

    static async getApiKeysByUserId(userId: string, realmId?: string | null) {
        const whereClause: any = { userId };
        if (realmId) {
            whereClause.realmId = realmId;
        }
        
        return await prisma.apiKey.findMany({
            where: whereClause,
            include: {
                user: true,
                realm: true,
            },
            orderBy: {
                created: 'desc',
            },
        });
    }

    static async getApiKeyById(id: string) {
        return await prisma.apiKey.findUnique({
            where: { id },
            include: {
                user: true,
                realm: true,
            },
        });
    }

    static async getApiKeyByKey(key: string) {
        return await prisma.apiKey.findUnique({
            where: { key },
            include: {
                user: true,
                realm: true,
            },
        });
    }

    static async updateApiKey(id: string, data: Partial<ApiKey>) {
        return await prisma.apiKey.update({
            where: { id },
            data,
            include: {
                user: true,
            },
        });
    }

    static async updateLastUsed(id: string) {
        return await prisma.apiKey.update({
            where: { id },
            data: { lastUsed: new Date() },
            include: {
                user: true,
            },
        });
    }

    static async deleteApiKey(id: string) {
        return await prisma.apiKey.delete({
            where: { id },
        });
    }

    static async validateApiKey(key: string) {
        const apiKey = await this.getApiKeyByKey(key);
        if (!apiKey) return null;

        // Update last used timestamp
        return await this.updateLastUsed(apiKey.id);
    }

    static async createGenericApiKey(data: {
        name: string;
        userId: string;
    }) {
        const key = `gk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

        return await this.createApiKey({
            name: data.name,
            key,
            userId: data.userId,
            realmId: null,
            isGeneric: true,
        });
    }

    static async getGenericApiKeys(userId?: string) {
        const where: any = { isGeneric: true };
        if (userId) {
            where.userId = userId;
        }

        return await prisma.apiKey.findMany({
            where,
            include: {
                user: true,
                realm: true,
            },
            orderBy: {
                created: 'desc',
            },
        });
    }

    static async getAllApiKeysWithType(options?: {
        userId?: string;
        realmId?: string;
        includeGeneric?: boolean;
    }) {
        const where: any = {};

        if (options?.userId) {
            where.userId = options.userId;
        }

        if (options?.realmId) {
            where.realmId = options.realmId;
        }

        if (options?.includeGeneric === false) {
            where.isGeneric = false;
        }

        return await prisma.apiKey.findMany({
            where,
            include: {
                user: true,
                realm: true,
            },
            orderBy: {
                created: 'desc',
            },
        });
    }
}
