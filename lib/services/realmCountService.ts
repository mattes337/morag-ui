import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RealmCountService {
  /**
   * Recalculate document count for a specific realm
   */
  static async recalculateRealmDocumentCount(realmId: string): Promise<number> {
    try {
      // Count actual documents in the realm
      const actualCount = await prisma.document.count({
        where: { realmId },
      });

      // Update the realm with the correct count
      await prisma.realm.update({
        where: { id: realmId },
        data: {
          documentCount: actualCount,
          lastUpdated: new Date(),
        },
      });

      console.log(`Recalculated document count for realm ${realmId}: ${actualCount}`);
      return actualCount;
    } catch (error) {
      console.error(`Failed to recalculate document count for realm ${realmId}:`, error);
      throw error;
    }
  }

  /**
   * Recalculate document counts for all realms
   */
  static async recalculateAllRealmDocumentCounts(): Promise<void> {
    try {
      const realms = await prisma.realm.findMany({
        select: { id: true, name: true },
      });

      console.log(`Recalculating document counts for ${realms.length} realms...`);

      for (const realm of realms) {
        await this.recalculateRealmDocumentCount(realm.id);
      }

      console.log('Completed recalculating document counts for all realms');
    } catch (error) {
      console.error('Failed to recalculate document counts for all realms:', error);
      throw error;
    }
  }

  /**
   * Increment document count for a realm
   */
  static async incrementRealmDocumentCount(realmId: string): Promise<void> {
    try {
      await prisma.realm.update({
        where: { id: realmId },
        data: {
          documentCount: { increment: 1 },
          lastUpdated: new Date(),
        },
      });

      console.log(`Incremented document count for realm ${realmId}`);
    } catch (error) {
      console.error(`Failed to increment document count for realm ${realmId}:`, error);
      // Fall back to recalculation if increment fails
      await this.recalculateRealmDocumentCount(realmId);
    }
  }

  /**
   * Decrement document count for a realm
   */
  static async decrementRealmDocumentCount(realmId: string): Promise<void> {
    try {
      // First check current count to avoid going negative
      const realm = await prisma.realm.findUnique({
        where: { id: realmId },
        select: { documentCount: true },
      });

      if (!realm) {
        throw new Error(`Realm ${realmId} not found`);
      }

      if (realm.documentCount > 0) {
        await prisma.realm.update({
          where: { id: realmId },
          data: {
            documentCount: { decrement: 1 },
            lastUpdated: new Date(),
          },
        });

        console.log(`Decremented document count for realm ${realmId}`);
      } else {
        console.warn(`Realm ${realmId} already has 0 documents, recalculating count`);
        await this.recalculateRealmDocumentCount(realmId);
      }
    } catch (error) {
      console.error(`Failed to decrement document count for realm ${realmId}:`, error);
      // Fall back to recalculation if decrement fails
      await this.recalculateRealmDocumentCount(realmId);
    }
  }

  /**
   * Handle document realm migration (move from one realm to another)
   */
  static async handleDocumentRealmMigration(
    fromRealmId: string,
    toRealmId: string
  ): Promise<void> {
    try {
      // Use a transaction to ensure both operations succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Decrement source realm count
        const sourceRealm = await tx.realm.findUnique({
          where: { id: fromRealmId },
          select: { documentCount: true },
        });

        if (sourceRealm && sourceRealm.documentCount > 0) {
          await tx.realm.update({
            where: { id: fromRealmId },
            data: {
              documentCount: { decrement: 1 },
              lastUpdated: new Date(),
            },
          });
        }

        // Increment target realm count
        await tx.realm.update({
          where: { id: toRealmId },
          data: {
            documentCount: { increment: 1 },
            lastUpdated: new Date(),
          },
        });
      });

      console.log(`Migrated document count from realm ${fromRealmId} to ${toRealmId}`);
    } catch (error) {
      console.error(`Failed to handle document realm migration from ${fromRealmId} to ${toRealmId}:`, error);
      // Fall back to recalculating both realms
      await Promise.all([
        this.recalculateRealmDocumentCount(fromRealmId),
        this.recalculateRealmDocumentCount(toRealmId),
      ]);
    }
  }

  /**
   * Validate and fix realm document counts
   * Compares stored counts with actual counts and fixes discrepancies
   */
  static async validateAndFixRealmDocumentCounts(): Promise<{
    totalRealms: number;
    fixedRealms: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let fixedRealms = 0;

    try {
      const realms = await prisma.realm.findMany({
        select: { id: true, name: true, documentCount: true },
      });

      console.log(`Validating document counts for ${realms.length} realms...`);

      for (const realm of realms) {
        try {
          const actualCount = await prisma.document.count({
            where: { realmId: realm.id },
          });

          if (actualCount !== realm.documentCount) {
            console.warn(
              `Realm ${realm.name} (${realm.id}) has incorrect count: stored=${realm.documentCount}, actual=${actualCount}`
            );

            await prisma.realm.update({
              where: { id: realm.id },
              data: {
                documentCount: actualCount,
                lastUpdated: new Date(),
              },
            });

            fixedRealms++;
            console.log(`Fixed document count for realm ${realm.name}: ${actualCount}`);
          }
        } catch (error) {
          const errorMsg = `Failed to validate realm ${realm.name} (${realm.id}): ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(`Validation complete: ${fixedRealms} realms fixed, ${errors.length} errors`);

      return {
        totalRealms: realms.length,
        fixedRealms,
        errors,
      };
    } catch (error) {
      const errorMsg = `Failed to validate realm document counts: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);

      return {
        totalRealms: 0,
        fixedRealms,
        errors,
      };
    }
  }
}

export default RealmCountService;
