import { prisma } from './database';

// Type converters to match the existing AppContext types
export function convertPrismaUserToAppUser(prismaUser: any) {
    return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        avatar: prismaUser.avatar,
        role: prismaUser.role.toLowerCase(),
    };
}

export function convertPrismaUserSettingsToApp(prismaSettings: any) {
    return {
        theme: prismaSettings.theme.toLowerCase(),
        language: prismaSettings.language,
        notifications: prismaSettings.notifications,
        autoSave: prismaSettings.autoSave,
        defaultDatabase: prismaSettings.defaultDatabase,
    };
}

export function convertPrismaDatabaseToApp(prismaDatabase: any) {
    return {
        id: prismaDatabase.id,
        name: prismaDatabase.name,
        description: prismaDatabase.description,
        documentCount: prismaDatabase.documentCount,
        lastUpdated: prismaDatabase.lastUpdated.toISOString().split('T')[0],
    };
}

export function convertPrismaDocumentToApp(prismaDocument: any) {
    return {
        id: prismaDocument.id,
        name: prismaDocument.name,
        type: prismaDocument.type,
        state: prismaDocument.state.toLowerCase(),
        version: prismaDocument.version,
        chunks: prismaDocument.chunks,
        quality: prismaDocument.quality,
        uploadDate: prismaDocument.uploadDate.toISOString().split('T')[0],
    };
}

export function convertPrismaApiKeyToApp(prismaApiKey: any) {
    return {
        id: prismaApiKey.id,
        name: prismaApiKey.name,
        key: prismaApiKey.key,
        created: prismaApiKey.created.toISOString().split('T')[0],
        lastUsed: prismaApiKey.lastUsed?.toISOString().split('T')[0] || null,
    };
}

export function convertPrismaDatabaseServerToApp(prismaServer: any) {
    return {
        id: prismaServer.id,
        name: prismaServer.name,
        type: prismaServer.type.toLowerCase(),
        host: prismaServer.host,
        port: prismaServer.port,
        username: prismaServer.username,
        password: prismaServer.password,
        apiKey: prismaServer.apiKey,
        database: prismaServer.database,
        collection: prismaServer.collection,
        isActive: prismaServer.isActive,
        createdAt: prismaServer.createdAt.toISOString(),
        lastConnected: prismaServer.lastConnected?.toISOString(),
    };
}

export function convertPrismaJobToApp(prismaJob: any) {
    return {
        id: prismaJob.id,
        documentId: prismaJob.documentId,
        documentName: prismaJob.documentName,
        documentType: prismaJob.documentType,
        startDate: prismaJob.startDate.toISOString(),
        endDate: prismaJob.endDate?.toISOString(),
        status: prismaJob.status.toLowerCase().replace('_', '-'),
        progress: {
            percentage: prismaJob.percentage,
            summary: prismaJob.summary,
        },
        createdAt: prismaJob.createdAt.toISOString(),
        updatedAt: prismaJob.updatedAt.toISOString(),
    };
}

// Batch operations
export async function getAllAppData() {
    const [databases, documents, apiKeys, jobs, servers] = await Promise.all([
        prisma.database.findMany({
            include: { documents: true },
        }),
        prisma.document.findMany({
            include: { database: true, jobs: true },
        }),
        prisma.apiKey.findMany({
            include: { user: true },
        }),
        prisma.job.findMany({
            include: { document: true, user: true },
        }),
        prisma.databaseServer.findMany(),
    ]);

    return {
        databases: databases.map(convertPrismaDatabaseToApp),
        documents: documents.map(convertPrismaDocumentToApp),
        apiKeys: apiKeys.map(convertPrismaApiKeyToApp),
        jobs: jobs.map(convertPrismaJobToApp),
        servers: servers.map(convertPrismaDatabaseServerToApp),
    };
}
