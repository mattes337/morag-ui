import { prisma } from '../database';
import { Document, DocumentState } from '@prisma/client';

export class DocumentService {
    static async createDocument(data: {
        name: string;
        type: string;
        databaseId?: number;
        state?: DocumentState;
        version?: number;
    }) {
        const document = await prisma.document.create({
            data,
            include: {
                database: true,
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

    static async getDocumentById(id: number) {
        return await prisma.document.findUnique({
            where: { id },
            include: {
                database: true,
                jobs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
    }

    static async getDocumentsByDatabase(databaseId: number) {
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

    static async updateDocument(id: number, data: Partial<Document>) {
        return await prisma.document.update({
            where: { id },
            data,
            include: {
                database: true,
                jobs: true,
            },
        });
    }

    static async deleteDocument(id: number) {
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

    static async updateDocumentState(id: number, state: DocumentState) {
        return await prisma.document.update({
            where: { id },
            data: { state },
            include: {
                database: true,
                jobs: true,
            },
        });
    }

    static async updateDocumentQuality(id: number, quality: number, chunks: number) {
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
