import { prisma } from '../database';
import { ApiKey } from '@prisma/client';

export class ApiKeyService {
    static async createApiKey(data: { name: string; key: string; userId: string }) {
        return await prisma.apiKey.create({
            data,
            include: {
                user: true,
            },
        });
    }

    static async getAllApiKeys() {
        return await prisma.apiKey.findMany({
            include: {
                user: true,
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
            },
            orderBy: {
                created: 'desc',
            },
        });
    }

    static async getApiKeyById(id: number) {
        return await prisma.apiKey.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
    }

    static async getApiKeyByKey(key: string) {
        return await prisma.apiKey.findUnique({
            where: { key },
            include: {
                user: true,
            },
        });
    }

    static async updateApiKey(id: number, data: Partial<ApiKey>) {
        return await prisma.apiKey.update({
            where: { id },
            data,
            include: {
                user: true,
            },
        });
    }

    static async updateLastUsed(id: number) {
        return await prisma.apiKey.update({
            where: { id },
            data: { lastUsed: new Date() },
            include: {
                user: true,
            },
        });
    }

    static async deleteApiKey(id: number) {
        return await prisma.apiKey.delete({
            where: { id },
        });
    }
}
