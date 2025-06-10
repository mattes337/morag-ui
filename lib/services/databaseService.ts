import { prisma } from '../database';
import { Database } from '@prisma/client';

export class DatabaseService {
    static async createDatabase(data: { name: string; description: string }) {
        return await prisma.database.create({
            data,
            include: {
                documents: true,
            },
        });
    }

    static async getAllDatabases() {
        return await prisma.database.findMany({
            include: {
                documents: true,
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });
    }

    static async getDatabaseById(id: number) {
        return await prisma.database.findUnique({
            where: { id },
            include: {
                documents: {
                    orderBy: {
                        uploadDate: 'desc',
                    },
                },
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });
    }

    static async updateDatabase(id: number, data: Partial<Database>) {
        return await prisma.database.update({
            where: { id },
            data,
            include: {
                documents: true,
            },
        });
    }

    static async deleteDatabase(id: number) {
        return await prisma.database.delete({
            where: { id },
        });
    }

    static async updateDocumentCount(databaseId: number) {
        const count = await prisma.document.count({
            where: { databaseId },
        });

        return await prisma.database.update({
            where: { id: databaseId },
            data: { documentCount: count },
        });
    }
}
