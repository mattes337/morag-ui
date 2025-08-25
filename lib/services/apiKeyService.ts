import { ApiKey } from '@prisma/client';
import { prisma } from '../database';

export class ApiKeyService {
    static async createApiKey(data: { name: string; key: string; userId: string; realmId: string }) {
        return await prisma.apiKey.create({
            data,
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
}
