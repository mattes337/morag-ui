import { Document, DocumentState } from '@prisma/client';
import { prisma } from '../database';

export class DocumentService {
    static async createDocument(data: {
        name: string;
        type: string;
        userId: string;
        realmId: string;
        state?: DocumentState;
        version?: number;
        filePath?: string;
        fileSize?: number;
        mimeType?: string;
        ingestionMetadata?: any;
    }) {
        const document = await prisma.document.create({
            data,
            include: {
                realm: true,
                user: true,
                jobs: true,
            },
        });

        // Update realm document count
        await prisma.realm.update({
            where: { id: data.realmId },
            data: {
                documentCount: {
                    increment: 1,
                },
                lastUpdated: new Date(),
            },
        });

        return document;
    }

    static async getAllDocuments() {
        return await prisma.document.findMany({
            include: {
                realm: true,
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
                realm: true,
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

    static async getDocumentsByUserId(userId: string, realmId?: string | null) {
        const whereClause: any = { userId };
        if (realmId) {
            whereClause.realmId = realmId;
        }
        
        return await prisma.document.findMany({
            where: whereClause,
            include: {
                realm: true,
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
                realm: true,
                user: true,
                jobs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
    }

    static async getDocumentsByRealm(realmId: string) {
        return await prisma.document.findMany({
            where: { realmId },
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
                realm: true,
                jobs: true,
            },
        });
    }

    static async deleteDocument(id: string) {
        const document = await prisma.document.findUnique({
            where: { id },
            select: { realmId: true },
        });

        const deletedDocument = await prisma.document.delete({
            where: { id },
        });

        // Update realm document count
        if (document?.realmId) {
            await prisma.realm.update({
                where: { id: document.realmId },
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
                realm: true,
                jobs: true,
            },
        });
    }

    static async updateDocumentQuality(id: string, quality: number, chunks: number) {
        return await prisma.document.update({
            where: { id },
            data: { quality, chunks },
            include: {
                realm: true,
                jobs: true,
            },
        });
    }

    static async updateIngestionMetadata(id: string, ingestionMetadata: any) {
        // Extract summary from ingestion metadata if available
        const summary = ingestionMetadata?.summary || null;

        return await prisma.document.update({
            where: { id },
            data: {
                ingestionMetadata,
                summary
            },
            include: {
                realm: true,
                jobs: true,
            },
        });
    }

    static async updateDocumentSummary(id: string, summary: string) {
        return await prisma.document.update({
            where: { id },
            data: { summary },
            include: {
                realm: true,
                jobs: true,
            },
        });
    }
}
