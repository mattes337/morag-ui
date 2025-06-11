import { prisma } from '../database';
import { DatabaseServer, DatabaseType } from '@prisma/client';

export class DatabaseServerService {
    static async createDatabaseServer(data: {
        name: string;
        type: DatabaseType;
        host: string;
        port: number;
        userId: string;
        username?: string;
        password?: string;
        apiKey?: string;
        database?: string;
        collection?: string;
        isActive?: boolean;
    }) {
        console.log('🖥️ [DatabaseServerService] Creating database server:', data.name);
        return await prisma.databaseServer.create({
            data,
            include: {
                user: true,
            },
        });
    }

    static async getAllDatabaseServers() {
        return await prisma.databaseServer.findMany({
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    static async getDatabaseServersByUser(userId: string) {
        return await prisma.databaseServer.findMany({
            where: { userId },
            include: {
                user: true,
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
            },
        });
    }

    static async updateDatabaseServer(id: string, data: Partial<DatabaseServer>) {
        return await prisma.databaseServer.update({
            where: { id },
            data,
            include: {
                user: true,
            },
        });
    }

    static async deleteDatabaseServer(id: string) {
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
            },
        });
    }
}
