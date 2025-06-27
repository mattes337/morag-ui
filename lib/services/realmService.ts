import { PrismaClient, Realm, UserRealm, RealmRole } from '@prisma/client';
import { database } from '../database';

export interface CreateRealmData {
    name: string;
    description?: string;
    ownerId: string;
}

export interface RealmWithUserRole extends Realm {
    userRole?: RealmRole;
    userCount?: number;
}

export class RealmService {
    private static db = database;

    static async createRealm(data: CreateRealmData): Promise<Realm> {
        return await this.db.realm.create({
            data: {
                name: data.name,
                description: data.description,
                ownerId: data.ownerId,
                isDefault: false,
                userRealms: {
                    create: {
                        userId: data.ownerId,
                        role: 'OWNER'
                    }
                }
            }
        });
    }

    static async createDefaultRealm(userId: string): Promise<Realm> {
        return await this.db.realm.create({
            data: {
                name: 'Default',
                description: 'Default realm for user',
                ownerId: userId,
                isDefault: true,
                userRealms: {
                    create: {
                        userId: userId,
                        role: 'OWNER'
                    }
                }
            }
        });
    }

    static async getUserRealms(userId: string): Promise<RealmWithUserRole[]> {
        const userRealms = await this.db.userRealm.findMany({
            where: { userId },
            include: {
                realm: {
                    include: {
                        _count: {
                            select: { userRealms: true }
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
                ...ur.realm,
                userRole: ur.role,
                userCount: ur.realm._count.userRealms
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
            ...userRealm.realm,
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

        return await this.db.realm.update({
            where: { id: realmId },
            data: {
                name: data.name,
                description: data.description
            }
        });
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

        return userRealm?.realm || null;
    }

    static async ensureUserHasDefaultRealm(userId: string): Promise<Realm> {
        let defaultRealm = await this.getUserDefaultRealm(userId);
        
        if (!defaultRealm) {
            defaultRealm = await this.createDefaultRealm(userId);
        }
        
        return defaultRealm;
    }
}