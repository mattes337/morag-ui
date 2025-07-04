import { prisma } from '../database';
import { Realm, RealmRole, CreateRealmData, UpdateRealmData } from '../../types';
import { UserRealm } from '@prisma/client';

export interface RealmWithUserRole extends Realm {
    userRole?: RealmRole;
    userCount?: number;
}

export class RealmService {
    private static db = prisma;

    // Helper function to transform Prisma realm to our Realm type
    private static transformRealm(prismaRealm: any): Realm {
        return {
            ...prismaRealm,
            description: prismaRealm.description || undefined,
            ingestionPrompt: prismaRealm.ingestionPrompt || undefined,
            systemPrompt: prismaRealm.systemPrompt || undefined,
            documentCount: prismaRealm.documentCount || 0,
            lastUpdated: prismaRealm.lastUpdated?.toISOString() || prismaRealm.updatedAt?.toISOString(),
        };
    }

    static async createRealm(data: CreateRealmData): Promise<Realm> {
        const prismaRealm = await this.db.realm.create({
            data: {
                name: data.name,
                description: data.description,
                ingestionPrompt: data.ingestionPrompt,
                systemPrompt: data.systemPrompt,
                isDefault: false,
                owner: {
                    connect: {
                        id: data.ownerId
                    }
                },
                userRealms: {
                    create: {
                        userId: data.ownerId,
                        role: 'OWNER'
                    }
                },
                databaseServers: data.serverIds ? {
                    create: data.serverIds.map(serverId => ({
                        databaseServerId: serverId
                    }))
                } : undefined
            }
        });
        return this.transformRealm(prismaRealm);
    }

    static async createDefaultRealm(userId: string): Promise<Realm> {
        const prismaRealm = await this.db.realm.create({
            data: {
                name: 'Default',
                description: 'Default realm for user',
                isDefault: true,
                owner: {
                    connect: {
                        id: userId
                    }
                },
                userRealms: {
                    create: {
                        userId: userId,
                        role: 'OWNER'
                    }
                }
            }
        });
        return this.transformRealm(prismaRealm);
    }

    static async getUserRealms(userId: string): Promise<RealmWithUserRole[]> {
        const userRealms = await this.db.userRealm.findMany({
            where: { userId },
            include: {
                realm: {
                    include: {
                        _count: {
                            select: { userRealms: true }
                        },
                        databaseServers: {
                            include: {
                                databaseServer: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { realm: { isDefault: 'desc' } },
                { realm: { name: 'asc' } }
            ]
        });

        return userRealms
            .filter(ur => ur.realm) // Filter out entries where realm is null/undefined
            .map(ur => ({
                ...this.transformRealm(ur.realm),
                userRole: ur.role,
                userCount: ur.realm._count.userRealms,
                servers: ur.realm.databaseServers?.map(rs => rs.databaseServer) || []
            }));
    }

    static async getRealmById(realmId: string, userId: string): Promise<RealmWithUserRole | null> {
        const userRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId
            },
            include: {
                realm: {
                    include: {
                        _count: {
                            select: { userRealms: true }
                        }
                    }
                }
            }
        });

        if (!userRealm) {
            return null;
        }

        return {
            ...this.transformRealm(userRealm.realm),
            userRole: userRealm.role,
            userCount: userRealm.realm._count.userRealms
        };
    }

    static async updateRealm(realmId: string, userId: string, data: Partial<CreateRealmData>): Promise<Realm | null> {
        // Check if user has permission to update
        const userRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!userRealm) {
            throw new Error('Insufficient permissions to update realm');
        }

        const updatedRealm = await this.db.realm.update({
            where: { id: realmId },
            data: {
                name: data.name,
                description: data.description,
                ingestionPrompt: data.ingestionPrompt,
                systemPrompt: data.systemPrompt
            }
        });
        return this.transformRealm(updatedRealm);
    }

    static async deleteRealm(realmId: string, userId: string): Promise<void> {
        // Check if user is owner
        const userRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId,
                role: 'OWNER'
            },
            include: {
                realm: true
            }
        });

        if (!userRealm) {
            throw new Error('Only realm owners can delete realms');
        }

        if (userRealm.realm.isDefault) {
            throw new Error('Cannot delete default realm');
        }

        await this.db.realm.delete({
            where: { id: realmId }
        });
    }

    static async addUserToRealm(realmId: string, targetUserId: string, role: RealmRole, requestingUserId: string): Promise<UserRealm> {
        // Check if requesting user has permission
        const requestingUserRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId: requestingUserId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!requestingUserRealm) {
            throw new Error('Insufficient permissions to add users to realm');
        }

        return await this.db.userRealm.create({
            data: {
                realmId,
                userId: targetUserId,
                role
            }
        });
    }

    static async removeUserFromRealm(realmId: string, targetUserId: string, requestingUserId: string): Promise<void> {
        // Check if requesting user has permission
        const requestingUserRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId: requestingUserId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!requestingUserRealm) {
            throw new Error('Insufficient permissions to remove users from realm');
        }

        // Don't allow removing the owner
        const targetUserRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId: targetUserId
            }
        });

        if (targetUserRealm?.role === 'OWNER') {
            throw new Error('Cannot remove realm owner');
        }

        await this.db.userRealm.delete({
            where: {
                userId_realmId: {
                    userId: targetUserId,
                    realmId
                }
            }
        });
    }

    static async getUserDefaultRealm(userId: string): Promise<Realm | null> {
        const userRealm = await this.db.userRealm.findFirst({
            where: {
                userId,
                realm: { isDefault: true }
            },
            include: { realm: true }
        });

        return userRealm?.realm ? this.transformRealm(userRealm.realm) : null;
    }

    static async ensureUserHasDefaultRealm(userId: string): Promise<Realm> {
        let defaultRealm = await this.getUserDefaultRealm(userId);

        if (!defaultRealm) {
            defaultRealm = await this.createDefaultRealm(userId);
        }

        return defaultRealm;
    }

    static async addServerToRealm(realmId: string, serverId: string, userId: string): Promise<void> {
        // Check if user has permission to modify realm
        const userRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!userRealm) {
            throw new Error('Insufficient permissions to modify realm servers');
        }

        // Check if server belongs to the user
        const server = await this.db.databaseServer.findFirst({
            where: {
                id: serverId,
                userId
            }
        });

        if (!server) {
            throw new Error('Server not found or does not belong to user');
        }

        // Check if server is already assigned to this realm
        const existingLink = await this.db.realmServerLink.findFirst({
            where: {
                realmId,
                databaseServerId: serverId
            }
        });

        if (existingLink) {
            throw new Error('Server is already assigned to this realm');
        }

        // Create the realm-server link
        await this.db.realmServerLink.create({
            data: {
                realmId,
                databaseServerId: serverId
            }
        });
    }

    static async removeServerFromRealm(realmId: string, serverId: string, userId: string): Promise<void> {
        // Check if user has permission to modify realm
        const userRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!userRealm) {
            throw new Error('Insufficient permissions to modify realm servers');
        }

        // Delete the realm-server link
        const deletedLink = await this.db.realmServerLink.deleteMany({
            where: {
                realmId,
                databaseServerId: serverId
            }
        });

        if (deletedLink.count === 0) {
            throw new Error('Server is not assigned to this realm');
        }
    }

    static async getAvailableServersForRealm(realmId: string, userId: string) {
        // Check if user has permission to view realm
        const userRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId
            }
        });

        if (!userRealm) {
            throw new Error('Insufficient permissions to view realm');
        }

        // Get all user's servers that are not assigned to this realm
        const availableServers = await this.db.databaseServer.findMany({
            where: {
                userId,
                realmServers: {
                    none: {
                        realmId
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return availableServers;
    }
}