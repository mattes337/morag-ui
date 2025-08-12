import { DatabaseServer, DatabaseType } from '@prisma/client';
import { prisma } from '../database';

// Type mapping between frontend and database
const typeMapping: Record<string, DatabaseType> = {
    'qdrant': 'QDRANT',
    'neo4j': 'NEO4J',
    'pinecone': 'PINECONE',
    'weaviate': 'WEAVIATE',
    'chroma': 'CHROMA'
};

function mapDatabaseType(frontendType: string): DatabaseType {
    const mappedType = typeMapping[frontendType.toLowerCase()];
    if (!mappedType) {
        throw new Error(`Invalid database type: ${frontendType}`);
    }
    return mappedType;
}

export class DatabaseServerService {
    static async createDatabaseServer(data: {
        name: string;
        type: string;
        host: string;
        port: number;
        userId: string;
        realmId: string;
        username?: string;
        password?: string;
        apiKey?: string;
        database?: string;
        collection?: string;
        isActive?: boolean;
    }) {
        console.log('🖥️ [DatabaseServerService] Creating database server:', data.name);

        // Extract realmId from data since it's not a direct field on DatabaseServer
        const { realmId, ...serverData } = data;
        const mappedData = {
            ...serverData,
            type: mapDatabaseType(data.type)
        };

        // Create the server and link it to the realm in a transaction
        return await prisma.$transaction(async (tx) => {
            // Create the database server
            const server = await tx.databaseServer.create({
                data: mappedData,
            });

            // Create the realm-server link
            await tx.realmServerLink.create({
                data: {
                    realmId: realmId,
                    databaseServerId: server.id,
                },
            });

            // Return the server with all relationships
            return await tx.databaseServer.findUnique({
                where: { id: server.id },
                include: {
                    user: true,
                    realmServers: {
                        include: {
                            realm: true
                        }
                    },
                },
            });
        });
    }

    static async getAllDatabaseServers() {
        return await prisma.databaseServer.findMany({
            include: {
                user: true,
                realmServers: {
                    include: {
                        realm: true
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    static async getDatabaseServersByUser(userId: string, realmId?: string) {
        const where: any = { userId };

        // If realmId is provided, filter by servers linked to that realm
        if (realmId) {
            where.realmServers = {
                some: {
                    realmId: realmId
                }
            };
        }

        return await prisma.databaseServer.findMany({
            where,
            include: {
                user: true,
                realmServers: {
                    include: {
                        realm: true
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    static async getDatabaseServerById(id: string) {
        return await prisma.databaseServer.findUnique({
            where: { id },
            include: {
                user: true,
                realmServers: {
                    include: {
                        realm: true
                    }
                },
            },
        });
    }

    static async updateDatabaseServer(id: string, data: any) {
        // Filter out relational fields and foreign keys that shouldn't be updated
        const { user, realm, userId, realmId, createdAt, updatedAt, ...updateData } = data;
        
        const mappedData = { ...updateData };
        if (updateData.type) {
            mappedData.type = mapDatabaseType(updateData.type);
        }
        
        return await prisma.databaseServer.update({
            where: { id },
            data: mappedData,
            include: {
                user: true,
                realmServers: {
                    include: {
                        realm: true
                    }
                },
            },
        });
    }

    static async getServersByRealm(realmId: string) {
        const realmServerLinks = await prisma.realmServerLink.findMany({
            where: { realmId },
            include: {
                databaseServer: true,
            },
        });

        return realmServerLinks.map(link => link.databaseServer);
    }

    static async setActiveServer(userId: string, serverId: string) {
        // First, deactivate all servers for the user
        await prisma.databaseServer.updateMany({
            where: { userId },
            data: { isActive: false },
        });

        // Then activate the selected server
        return await prisma.databaseServer.update({
            where: { id: serverId },
            data: {
                isActive: true,
                lastConnected: new Date(),
            },
            include: {
                user: true,
                realmServers: {
                    include: {
                        realm: true
                    }
                },
            },
        });
    }
}
