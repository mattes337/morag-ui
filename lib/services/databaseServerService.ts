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
        console.log('🔗 [DatabaseServerService] Using many-to-many relationship for realm:', data.realmId);

        // Create the server first (without realmId since it's no longer a direct field)
        const { realmId, ...serverData } = data;
        const mappedData = {
            ...serverData,
            type: mapDatabaseType(data.type)
        };

        const server = await prisma.databaseServer.create({
            data: mappedData,
            include: {
                user: true,
                realmServers: {
                    include: {
                        realm: true
                    }
                }
            },
        });

        // Create the realm-server link
        await prisma.realmServerLink.create({
            data: {
                realmId: data.realmId,
                databaseServerId: server.id
            }
        });

        return server;
    }

    static async getAllDatabaseServers() {
        return await prisma.databaseServer.findMany({
            include: {
                user: true,
                realmServers: {
                    include: {
                        realm: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    static async getDatabaseServersByUser(userId: string, realmId?: string) {
        const where: any = { userId };

        // If realmId is specified, filter by realm through the many-to-many relationship
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
                }
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
                }
            },
        });
    }

    static async updateDatabaseServer(id: string, data: any) {
        // Filter out relational fields and foreign keys that shouldn't be updated
        const { user, realm, userId, realmId, createdAt, updatedAt, realmServers, ...updateData } = data;

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
                }
            },
        });
    }

    static async deleteDatabaseServer(id: string) {
        // Delete realm-server links first (cascade should handle this, but being explicit)
        await prisma.realmServerLink.deleteMany({
            where: { databaseServerId: id }
        });

        return await prisma.databaseServer.delete({
            where: { id },
        });
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
                }
            },
        });
    }
}
