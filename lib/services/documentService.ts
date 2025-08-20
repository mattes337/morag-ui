import { Document, DocumentState, ProcessingMode } from '@prisma/client';
import { prisma } from '../database';
import { EnhancedDocumentDeletionService } from './enhancedDocumentDeletionService';

export class DocumentService {
    static async createDocument(data: {
        name: string;
        type: string;
        subType?: string;
        userId: string;
        realmId: string;
        state?: DocumentState;
        version?: number;
        processingMode?: ProcessingMode;
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

    static async deleteDocument(id: string, userId?: string) {
        // Use enhanced deletion service for better cleanup
        const enhancedDeletionService = new EnhancedDocumentDeletionService();

        try {
            const result = await enhancedDeletionService.deleteDocument(id, {
                preserveEntities: true,
                createAuditLog: true,
                userId: userId
            });

            // Update realm document count
            const document = await prisma.document.findUnique({
                where: { id },
                select: { realmId: true },
            });

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

            return result;
        } catch (error) {
            // Fallback to simple deletion if enhanced deletion fails
            console.warn('Enhanced deletion failed, falling back to simple deletion:', error);

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
}
