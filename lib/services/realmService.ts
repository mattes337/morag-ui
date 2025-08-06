import { prisma } from '../database';
import { Realm, RealmRole, CreateRealmData } from '../../types';
import { RealmPromptConfig } from '../types/domain';
import { UserRealm } from '@prisma/client';
import { getEffectivePrompt } from '../constants/defaultPrompts';

export interface RealmWithUserRole extends Realm {
    userRole?: RealmRole;
    userCount?: number;
}

export class RealmService {
    private static db = prisma;

    // Convert Prisma realm to app Realm type
    private static convertPrismaRealm(prismaRealm: any): Realm {
        return {
            ...prismaRealm,
            description: prismaRealm.description || undefined,
            domain: prismaRealm.domain || undefined,
            ingestionPrompt: prismaRealm.ingestionPrompt || undefined,
            systemPrompt: prismaRealm.systemPrompt || undefined,
            extractionPrompt: prismaRealm.extractionPrompt || undefined,
            domainPrompt: prismaRealm.domainPrompt || undefined,
        };
    }

    // Get effective prompts with defaults
    static getEffectivePrompts(realm: Realm): Required<RealmPromptConfig> {
        return {
            domain: realm.domain || 'general',
            ingestionPrompt: getEffectivePrompt(realm.ingestionPrompt, 'ingestionPrompt'),
            systemPrompt: getEffectivePrompt(realm.systemPrompt, 'systemPrompt'),
            extractionPrompt: getEffectivePrompt(realm.extractionPrompt, 'extractionPrompt'),
            domainPrompt: getEffectivePrompt(realm.domainPrompt, 'domainPrompt'),
        };
    }

    static async createRealm(data: CreateRealmData): Promise<Realm> {
        const realm = await this.db.realm.create({
            data: {
                name: data.name,
                description: data.description,
                domain: data.domain,
                ingestionPrompt: data.ingestionPrompt,
                systemPrompt: data.systemPrompt,
                extractionPrompt: data.extractionPrompt,
                domainPrompt: data.domainPrompt,
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
                }
            }
        });
        return this.convertPrismaRealm(realm);
    }

    static async createDefaultRealm(userId: string): Promise<Realm> {
        const realm = await this.db.realm.create({
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
        return this.convertPrismaRealm(realm);
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
                ...this.convertPrismaRealm(ur.realm),
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
            ...this.convertPrismaRealm(userRealm.realm),
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

        const realm = await this.db.realm.update({
            where: { id: realmId },
            data: {
                name: data.name,
                description: data.description,
                domain: data.domain,
                ingestionPrompt: data.ingestionPrompt,
                systemPrompt: data.systemPrompt,
                extractionPrompt: data.extractionPrompt,
                domainPrompt: data.domainPrompt
            }
        });
        return this.convertPrismaRealm(realm);
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

        return userRealm?.realm ? this.convertPrismaRealm(userRealm.realm) : null;
    }

    static async ensureUserHasDefaultRealm(userId: string): Promise<Realm> {
        let defaultRealm = await this.getUserDefaultRealm(userId);

        if (!defaultRealm) {
            defaultRealm = await this.createDefaultRealm(userId);
        }

        return defaultRealm;
    }



    static async updateRealmPrompts(realmId: string, userId: string, prompts: RealmPromptConfig): Promise<Realm | null> {
        // Check if user has permission to update
        const userRealm = await this.db.userRealm.findFirst({
            where: {
                realmId,
                userId,
                role: { in: ['OWNER', 'ADMIN'] }
            }
        });

        if (!userRealm) {
            throw new Error('Insufficient permissions to update realm prompts');
        }

        const realm = await this.db.realm.update({
            where: { id: realmId },
            data: {
                domain: prompts.domain,
                ingestionPrompt: prompts.ingestionPrompt,
                systemPrompt: prompts.systemPrompt,
                extractionPrompt: prompts.extractionPrompt,
                domainPrompt: prompts.domainPrompt
            }
        });
        return this.convertPrismaRealm(realm);
    }

    static async getRealmPrompts(realmId: string, userId: string): Promise<RealmPromptConfig | null> {
        const realm = await this.getRealmById(realmId, userId);
        if (!realm) {
            return null;
        }

        return {
            domain: realm.domain || undefined,
            ingestionPrompt: realm.ingestionPrompt || undefined,
            systemPrompt: realm.systemPrompt || undefined,
            extractionPrompt: realm.extractionPrompt || undefined,
            domainPrompt: realm.domainPrompt || undefined
        };
    }

    static validateRealmPrompts(prompts: RealmPromptConfig): string[] {
        const errors: string[] = [];

        if (prompts.ingestionPrompt && prompts.ingestionPrompt.trim().length === 0) {
            errors.push('Ingestion prompt cannot be empty');
        }

        if (prompts.systemPrompt && prompts.systemPrompt.trim().length === 0) {
            errors.push('System prompt cannot be empty');
        }

        if (prompts.extractionPrompt && prompts.extractionPrompt.trim().length === 0) {
            errors.push('Extraction prompt cannot be empty');
        }

        if (prompts.domainPrompt && prompts.domainPrompt.trim().length === 0) {
            errors.push('Domain prompt cannot be empty');
        }

        return errors;
    }
}