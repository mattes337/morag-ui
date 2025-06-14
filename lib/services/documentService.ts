import { Document, DocumentState } from '@prisma/client';
import { prisma } from '../database';

export class DocumentService {
    static async createDocument(data: {
        name: string;
        type: string;
        userId: string;
        databaseId?: string;
        state?: DocumentState;
        version?: number;
    }) {
        const document = await prisma.document.create({
            data,
            include: {
                database: true,
                user: true,
                jobs: true,
            },
        });

        // Update database document count
        if (data.databaseId) {
            await prisma.database.update({
                where: { id: data.databaseId },
                data: {
                    documentCount: {
                        increment: 1,
                    },
                    lastUpdated: new Date(),
                },
            });
        }

        return document;
    }

    static async getAllDocuments() {
        return await prisma.document.findMany({
            include: {
                database: true,
                user: true,
                jobs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                uploadDate: 'desc',
            },
        });
    }

    static async getDocumentsByUser(userId: string) {
        return await prisma.document.findMany({
            where: { userId },
            include: {
                database: true,
                user: true,
                jobs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                uploadDate: 'desc',
            },
        });
    }

    static async getDocumentById(id: string) {
        return await prisma.document.findUnique({
            where: { id },
            include: {
                database: true,
                user: true,
                jobs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
    }

    static async getDocumentsByDatabase(databaseId: string) {
        return await prisma.document.findMany({
            where: { databaseId },
            include: {
                jobs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                uploadDate: 'desc',
            },
        });
    }

    static async updateDocument(id: string, data: Partial<Document>) {
        return await prisma.document.update({
            where: { id },
            data,
            include: {
                database: true,
                jobs: true,
            },
        });
    }

    static async deleteDocument(id: string) {
        const document = await prisma.document.findUnique({
            where: { id },
            select: { databaseId: true },
        });

        const deletedDocument = await prisma.document.delete({
            where: { id },
        });

        // Update database document count
        if (document?.databaseId) {
            await prisma.database.update({
                where: { id: document.databaseId },
                data: {
                    documentCount: {
                        decrement: 1,
                    },
                    lastUpdated: new Date(),
                },
            });
        }

        return deletedDocument;
    }

    static async updateDocumentState(id: string, state: DocumentState) {
        return await prisma.document.update({
            where: { id },
            data: { state },
            include: {
                database: true,
                jobs: true,
            },
        });
    }

    static async updateDocumentQuality(id: string, quality: number, chunks: number) {
        return await prisma.document.update({
            where: { id },
            data: { quality, chunks },
            include: {
                database: true,
                jobs: true,
            },
        });
    }
}
