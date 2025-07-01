import { prisma } from '../database';

export const DatabaseService = {
    getDatabasesByUserId: async (userId: string, realmId?: string | null) => {
        const whereClause: any = { userId };
        if (realmId) {
            whereClause.realmId = realmId;
        }
        
        return await prisma.database.findMany({
            where: whereClause,
            include: {
                documents: true,
                user: true,
                databaseServers: {
                    include: {
                        databaseServer: true,
                    },
                },
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });
    },
};

export async function createDatabase(data: {
    name: string;
    description: string;
    ingestionPrompt?: string;
    systemPrompt?: string;
    userId: string;
    serverIds: string[]; // Array of server IDs
    realmId: string;
}) {
    const { serverIds, userId, realmId, ...databaseData } = data;
    
    return await prisma.database.create({
        data: {
            ...databaseData,
            user: {
                connect: { id: userId }
            },
            realm: {
                connect: { id: realmId }
            },
            databaseServers: {
                create: serverIds.map(serverId => ({
                    databaseServerId: serverId,
                })),
            },
        },
        include: {
            documents: true,
            user: true,
            databaseServers: {
                include: {
                    databaseServer: true,
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

export async function getAllDatabases() {
    return await prisma.database.findMany({
        include: {
            documents: true,
            user: true,
            databaseServers: {
                include: {
                    databaseServer: true,
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

export async function getDatabasesByUser(userId: string) {
    return await prisma.database.findMany({
        where: { userId },
        include: {
            documents: true,
            user: true,
            databaseServers: {
                include: {
                    databaseServer: true,
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

export async function getDatabaseById(id: string) {
    return await prisma.database.findUnique({
        where: { id },
        include: {
            documents: true,
            user: true,
            databaseServers: {
                include: {
                    databaseServer: true,
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

export async function updateDatabase(
    id: string,
    data: {
        name?: string;
        description?: string;
        ingestionPrompt?: string;
        systemPrompt?: string;
    }
) {
    return await prisma.database.update({
        where: { id },
        data,
        include: {
            documents: true,
            user: true,
            databaseServers: {
                include: {
                    databaseServer: true,
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

export async function deleteDatabase(id: string) {
    return await prisma.database.delete({
        where: { id },
    });
}

export async function updateDocumentCount(databaseId: string) {
    const count = await prisma.document.count({
        where: { databaseId },
    });

    return await prisma.database.update({
        where: { id: databaseId },
        data: { documentCount: count },
    });
}

export async function addServerToDatabase(databaseId: string, serverId: string) {
    return await prisma.databaseServerLink.create({
        data: {
            databaseId,
            databaseServerId: serverId,
        },
        include: {
            database: true,
            databaseServer: true,
        },
    });
}

export async function removeServerFromDatabase(databaseId: string, serverId: string) {
    return await prisma.databaseServerLink.delete({
        where: {
            databaseId_databaseServerId: {
                databaseId,
                databaseServerId: serverId,
            },
        },
    });
}

export async function getDatabaseServers(databaseId: string) {
    const links = await prisma.databaseServerLink.findMany({
        where: { databaseId },
        include: {
            databaseServer: true,
        },
    });
    
    return links.map(link => link.databaseServer);
}
