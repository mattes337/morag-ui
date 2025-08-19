import { DocumentMigrationService } from '../../../lib/services/documentMigrationService';
import { prisma } from '../../../lib/database';
import { MigrationStatus } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  documentMigration: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  documentMigrationItem: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../../../lib/database', () => ({
  prisma: mockPrisma,
}));

// Mock file system operations
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  copyFile: jest.fn(),
}));

const mockFs = require('fs/promises');

describe('DocumentMigrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMigration', () => {
    it('should create a new migration with items', async () => {
      const mockMigration = {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        targetRealmId: 'realm-2',
        status: MigrationStatus.PENDING,
        totalDocuments: 2,
        processedDocuments: 0,
        failedDocuments: 0,
        migrationOptions: JSON.stringify({ copyStageFiles: true }),
        startedAt: new Date(),
        completedAt: null,
        errorMessage: null,
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocuments = [
        { id: 'doc-1', name: 'Document 1' },
        { id: 'doc-2', name: 'Document 2' },
      ];

      mockPrisma.document.findMany.mockResolvedValue(mockDocuments as any);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.documentMigration.create.mockResolvedValue(mockMigration as any);
      mockPrisma.documentMigrationItem.create.mockResolvedValue({} as any);

      const result = await DocumentMigrationService.createMigration({
        documentIds: ['doc-1', 'doc-2'],
        sourceRealmId: 'realm-1',
        targetRealmId: 'realm-2',
        migrationOptions: { copyStageFiles: true },
        createdBy: 'user-1',
      });

      expect(result).toEqual(mockMigration);
      expect(mockPrisma.documentMigration.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sourceRealmId: 'realm-1',
          targetRealmId: 'realm-2',
          totalDocuments: 2,
          createdBy: 'user-1',
        }),
      });
    });

    it('should throw error for invalid document IDs', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);

      await expect(
        DocumentMigrationService.createMigration({
          documentIds: ['invalid-doc'],
          sourceRealmId: 'realm-1',
          targetRealmId: 'realm-2',
          migrationOptions: {},
          createdBy: 'user-1',
        })
      ).rejects.toThrow('Some documents not found or not accessible');
    });
  });

  describe('getMigrationsByUser', () => {
    it('should return user migrations with filters', async () => {
      const mockMigrations = [
        {
          id: 'migration-1',
          status: MigrationStatus.COMPLETED,
          sourceRealm: { name: 'Source Realm' },
          targetRealm: { name: 'Target Realm' },
        },
      ];

      mockPrisma.documentMigration.findMany.mockResolvedValue(mockMigrations as any);

      const result = await DocumentMigrationService.getMigrationsByUser('user-1', {
        realmId: 'realm-1',
        status: MigrationStatus.COMPLETED,
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(mockMigrations);
      expect(mockPrisma.documentMigration.findMany).toHaveBeenCalledWith({
        where: {
          createdBy: 'user-1',
          OR: [
            { sourceRealmId: 'realm-1' },
            { targetRealmId: 'realm-1' },
          ],
          status: MigrationStatus.COMPLETED,
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('getMigrationById', () => {
    it('should return migration with items', async () => {
      const mockMigration = {
        id: 'migration-1',
        status: MigrationStatus.IN_PROGRESS,
        migrationItems: [
          { id: 'item-1', status: MigrationStatus.COMPLETED },
          { id: 'item-2', status: MigrationStatus.PENDING },
        ],
      };

      mockPrisma.documentMigration.findUnique.mockResolvedValue(mockMigration as any);

      const result = await DocumentMigrationService.getMigrationById('migration-1');

      expect(result).toEqual(mockMigration);
      expect(mockPrisma.documentMigration.findUnique).toHaveBeenCalledWith({
        where: { id: 'migration-1' },
        include: expect.any(Object),
      });
    });

    it('should return null for non-existent migration', async () => {
      mockPrisma.documentMigration.findUnique.mockResolvedValue(null);

      const result = await DocumentMigrationService.getMigrationById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('cancelMigration', () => {
    it('should cancel pending migration', async () => {
      const mockMigration = {
        id: 'migration-1',
        status: MigrationStatus.PENDING,
      };

      mockPrisma.documentMigration.findUnique.mockResolvedValue(mockMigration as any);
      mockPrisma.documentMigration.update.mockResolvedValue({
        ...mockMigration,
        status: MigrationStatus.CANCELLED,
      } as any);

      const result = await DocumentMigrationService.cancelMigration('migration-1');

      expect(result.status).toBe(MigrationStatus.CANCELLED);
      expect(mockPrisma.documentMigration.update).toHaveBeenCalledWith({
        where: { id: 'migration-1' },
        data: { status: MigrationStatus.CANCELLED },
      });
    });

    it('should throw error for completed migration', async () => {
      const mockMigration = {
        id: 'migration-1',
        status: MigrationStatus.COMPLETED,
      };

      mockPrisma.documentMigration.findUnique.mockResolvedValue(mockMigration as any);

      await expect(
        DocumentMigrationService.cancelMigration('migration-1')
      ).rejects.toThrow('Cannot cancel migration with status: COMPLETED');
    });
  });

  describe('getMigrationProgress', () => {
    it('should return migration progress', async () => {
      const mockMigration = {
        id: 'migration-1',
        status: MigrationStatus.IN_PROGRESS,
        totalDocuments: 10,
        processedDocuments: 7,
        failedDocuments: 1,
        migrationItems: [
          { status: MigrationStatus.COMPLETED },
          { status: MigrationStatus.COMPLETED },
          { status: MigrationStatus.FAILED },
          { status: MigrationStatus.PENDING },
        ],
      };

      mockPrisma.documentMigration.findUnique.mockResolvedValue(mockMigration as any);

      const result = await DocumentMigrationService.getMigrationProgress('migration-1');

      expect(result).toEqual({
        migrationId: 'migration-1',
        status: MigrationStatus.IN_PROGRESS,
        totalDocuments: 10,
        processedDocuments: 7,
        failedDocuments: 1,
        completedDocuments: 2,
        pendingDocuments: 1,
        progressPercentage: 70,
      });
    });

    it('should return null for non-existent migration', async () => {
      mockPrisma.documentMigration.findUnique.mockResolvedValue(null);

      const result = await DocumentMigrationService.getMigrationProgress('invalid-id');

      expect(result).toBeNull();
    });
  });
});