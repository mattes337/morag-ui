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
                server: true,
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
    userId: string;
    serverId: string;
    realmId: string;
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

export async function getAllDatabases() {
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

export async function getDatabasesByUser(userId: string) {
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

export async function getDatabaseById(id: string) {
    return await prisma.database.findUnique({
        where: { id },
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

export async function updateDatabase(
    id: string,
    data: {
        name?: string;
        description?: string;
    }
) {
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
