import { Database } from '@prisma/client';
import { prisma } from '../database';

export class DatabaseService {
    static async createDatabase(data: {
        name: string;
        description: string;
        userId: string;
        serverId: string;
    }) {
        return await prisma.database.create({
            data,
            include: {
                documents: true,
                user: true,
                server: true,
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });
    }

    static async getAllDatabases() {
        return await prisma.database.findMany({
            include: {
                documents: true,
                user: true,
                server: true,
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });
    }

    static async getDatabasesByUser(userId: string) {
        return await prisma.database.findMany({
            where: { userId },
            include: {
                documents: true,
                user: true,
                server: true,
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });
    }

    static async getDatabaseById(id: string) {
        return await prisma.database.findUnique({
            where: { id },
            include: {
                documents: {
                    orderBy: {
                        uploadDate: 'desc',
                    },
                },
                user: true,
                server: true,
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });
    }

    static async updateDatabase(id: string, data: Partial<Database>) {
        return await prisma.database.update({
            where: { id },
            data,
            include: {
                documents: true,
                user: true,
                server: true,
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });
    }

    static async deleteDatabase(id: string) {
        return await prisma.database.delete({
            where: { id },
        });
    }

    static async updateDocumentCount(databaseId: string) {
        const count = await prisma.document.count({
            where: { databaseId },
        });

        return await prisma.database.update({
            where: { id: databaseId },
            data: { documentCount: count },
        });
    }
}
