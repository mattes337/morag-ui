import { prisma } from '../database';
import { DocumentService } from './documentService';
import { RealmService } from './realmService';
import { Document, DocumentState, MigrationStatus, ProcessingStage } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import { stageExecutionService } from './stageExecutionService';
import { backgroundJobService } from './backgroundJobService';
import { RealmCountService } from './realmCountService';

export interface MigrationOptions {
  copyStageFiles: boolean;
  reprocessStages: string[];
  preserveOriginal: boolean;
  migrationMode: 'copy' | 'move';
  targetDatabases?: string[];
}

export interface MigrationRequest {
  documentIds: string[];
  sourceRealmId: string;
  targetRealmId: string;
  migrationOptions: MigrationOptions;
}

export interface DocumentMigrationResult {
  success: boolean;
  newDocumentId?: string;
  migratedStages?: string[];
  error?: string;
}

export interface MigrationProgress {
  id: string;
  status: MigrationStatus;
  totalDocuments: number;
  processedDocuments: number;
  currentDocument?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentWithStages extends Document {
  stages?: any[];
  files?: any[];
}

export interface DocumentMigrationContext {
  sourceDocument: DocumentWithStages;
  targetRealmId: string;
  migrationOptions: MigrationOptions;
  migrationId: string;
  targetDocument?: Document;
  migratedStages?: string[];
}

export class DocumentMigrationService {
  private static readonly FILES_BASE_PATH = process.env.FILES_PATH || './storage/files';

  /**
   * Create a new migration job
   */
  static async createMigration(request: MigrationRequest, userId: string): Promise<MigrationProgress> {
    // Validate the migration request
    await this.validateMigrationRequest(request, userId);

    // Create migration record
    const migration = await prisma.documentMigration.create({
      data: {
        sourceRealmId: request.sourceRealmId,
        targetRealmId: request.targetRealmId,
        migrationOptions: JSON.stringify(request.migrationOptions),
        status: 'PENDING',
        totalDocuments: request.documentIds.length,
        processedDocuments: 0,
        createdBy: userId,
      },
    });

    // Start migration process asynchronously
    this.processMigration(migration.id).catch(error => {
      console.error(`Migration ${migration.id} failed:`, error);
      this.updateMigrationStatus(migration.id, 'FAILED', error.message);
    });

    return {
      id: migration.id,
      status: migration.status as MigrationStatus,
      totalDocuments: migration.totalDocuments,
      processedDocuments: migration.processedDocuments,
      createdAt: migration.createdAt,
      updatedAt: migration.updatedAt,
    };
  }

  /**
   * Get migration status
   */
  static async getMigrationStatus(migrationId: string): Promise<MigrationProgress | null> {
    const migration = await prisma.documentMigration.findUnique({
      where: { id: migrationId },
    });

    if (!migration) {
      return null;
    }

    return {
      id: migration.id,
      status: migration.status as MigrationStatus,
      totalDocuments: migration.totalDocuments,
      processedDocuments: migration.processedDocuments,
      createdAt: migration.createdAt,
      updatedAt: migration.updatedAt,
    };
  }

  /**
   * Get migrations for a user
   */
  static async getMigrations(userId: string, options: {
    realmId?: string;
    status?: MigrationStatus;
    limit?: number;
    offset?: number;
  } = {}): Promise<MigrationProgress[]> {
    const { realmId, status, limit = 20, offset = 0 } = options;

    const where: any = { userId };
    if (realmId) {
      where.OR = [
        { sourceRealmId: realmId },
        { targetRealmId: realmId },
      ];
    }
    if (status) {
      where.status = status;
    }

    const migrations = await prisma.documentMigration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return migrations.map(migration => ({
      id: migration.id,
      status: migration.status as MigrationStatus,
      totalDocuments: migration.totalDocuments,
      processedDocuments: migration.processedDocuments,
      createdAt: migration.createdAt,
      updatedAt: migration.updatedAt,
    }));
  }

  /**
   * Get migration by ID (alias for getMigrationStatus)
   */
  static async getMigrationById(migrationId: string): Promise<MigrationProgress | null> {
    return this.getMigrationStatus(migrationId);
  }

  /**
   * Get migration progress (alias for getMigrationStatus)
   */
  static async getMigrationProgress(migrationId: string): Promise<MigrationProgress | null> {
    return this.getMigrationStatus(migrationId);
  }

  /**
   * Get migration history for a specific document
   */
  static async getDocumentMigrationHistory(documentId: string, userId: string): Promise<any[]> {
    // Get all migration items where this document was either source or target
    const migrationItems = await prisma.documentMigrationItem.findMany({
      where: {
        OR: [
          { sourceDocumentId: documentId },
          { targetDocumentId: documentId },
        ],
      },
      include: {
        migration: {
          include: {
            sourceRealm: true,
            targetRealm: true,
            createdByUser: true,
          },
        },
        sourceDocument: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        targetDocument: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter to only include migrations the user has access to
    const accessibleItems = migrationItems.filter(item =>
      item.migration.createdBy === userId
    );

    return accessibleItems.map(item => ({
      id: item.id,
      migrationId: item.migrationId,
      status: item.status,
      sourceDocument: item.sourceDocument,
      targetDocument: item.targetDocument,
      sourceRealm: {
        id: item.migration.sourceRealm.id,
        name: item.migration.sourceRealm.name,
      },
      targetRealm: {
        id: item.migration.targetRealm.id,
        name: item.migration.targetRealm.name,
      },
      migrationOptions: item.migration.migrationOptions ? JSON.parse(item.migration.migrationOptions) : {},
      migratedStages: item.migratedStages ? JSON.parse(item.migratedStages) : [],
      startedAt: item.startedAt,
      completedAt: item.completedAt,
      errorMessage: item.errorMessage,
      createdAt: item.createdAt,
      createdBy: {
        id: item.migration.createdByUser.id,
        email: item.migration.createdByUser.email,
      },
    }));
  }

  /**
   * Cancel a migration
   */
  static async cancelMigration(migrationId: string): Promise<void> {
    await prisma.documentMigration.update({
      where: { id: migrationId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Process migration asynchronously
   */
  private static async processMigration(migrationId: string): Promise<void> {
    const migration = await prisma.documentMigration.findUnique({
      where: { id: migrationId },
    });

    if (!migration) {
      throw new Error(`Migration ${migrationId} not found`);
    }

    await this.updateMigrationStatus(migrationId, 'IN_PROGRESS');

    try {
      // Get document IDs from migration items
      const migrationItems = await prisma.documentMigrationItem.findMany({
        where: { migrationId },
        select: { sourceDocumentId: true }
      });
      const documentIds = migrationItems.map(item => item.sourceDocumentId);
      const migrationOptions = JSON.parse(migration.migrationOptions || '{}') as MigrationOptions;

      for (let i = 0; i < documentIds.length; i++) {
        const documentId = documentIds[i];
        
        // Check if migration was cancelled
        const currentMigration = await prisma.documentMigration.findUnique({
          where: { id: migrationId },
        });
        
        if (currentMigration?.status === 'CANCELLED') {
          return;
        }

        // Update migration progress
        await prisma.documentMigration.update({
          where: { id: migrationId },
          data: {
            updatedAt: new Date(),
          },
        });

        // Get source document
        const sourceDocument = await prisma.document.findUnique({
          where: { id: documentId },
          include: {
            jobs: true,
          },
        });

        if (!sourceDocument) {
          console.warn(`Document ${documentId} not found, skipping`);
          continue;
        }

        // Create migration context
        const context: DocumentMigrationContext = {
          sourceDocument: sourceDocument as DocumentWithStages,
          targetRealmId: migration.targetRealmId,
          migrationOptions,
          migrationId,
        };

        // Migrate the document
        await this.migrateDocument(context);

        // Update progress
        await prisma.documentMigration.update({
          where: { id: migrationId },
          data: {
            processedDocuments: i + 1,
            updatedAt: new Date(),
          },
        });
      }

      await this.updateMigrationStatus(migrationId, 'COMPLETED');
    } catch (error) {
      console.error(`Migration ${migrationId} failed:`, error);
      await this.updateMigrationStatus(migrationId, 'FAILED', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Migrate a single document
   */
  private static async migrateDocument(context: DocumentMigrationContext): Promise<DocumentMigrationResult> {
    try {
      // Validate migration
      await this.validateMigration(context);

      // Copy document metadata
      await this.copyDocumentMetadata(context);

      // Copy stage files if requested
      if (context.migrationOptions.copyStageFiles) {
        await this.copyStageFiles(context);
      }

      // Reprocess required stages
      if (context.migrationOptions.reprocessStages.length > 0) {
        await this.reprocessRequiredStages(context);
      }

      // Update document realm association
      await this.updateDocumentRealm(context);

      // Cleanup if needed
      if (context.migrationOptions.migrationMode === 'move' && !context.migrationOptions.preserveOriginal) {
        await this.cleanupOriginalDocument(context);
      }

      return {
        success: true,
        newDocumentId: context.targetDocument?.id,
        migratedStages: context.migratedStages,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate migration prerequisites
   */
  private static async validateMigration(context: DocumentMigrationContext): Promise<void> {
    // Validate target realm exists
    const targetRealm = await RealmService.getRealmById(context.targetRealmId, context.sourceDocument.userId);
    if (!targetRealm) {
      throw new Error(`Target realm ${context.targetRealmId} not found`);
    }

    // Check for conflicts if copying
    if (context.migrationOptions.migrationMode === 'copy') {
      const existingDoc = await prisma.document.findFirst({
        where: {
          name: context.sourceDocument.name,
          realmId: context.targetRealmId,
          userId: context.sourceDocument.userId,
        },
      });

      if (existingDoc) {
        throw new Error(`Document with name '${context.sourceDocument.name}' already exists in target realm`);
      }
    }
  }

  /**
   * Copy document metadata to target realm
   */
  private static async copyDocumentMetadata(context: DocumentMigrationContext): Promise<void> {
    if (context.migrationOptions.migrationMode === 'move') {
      // For move operation, just update the realm ID
      context.targetDocument = await prisma.document.update({
        where: { id: context.sourceDocument.id },
        data: {
          realmId: context.targetRealmId,
          updatedAt: new Date(),
        },
      });
    } else {
      // For copy operation, create a new document
      context.targetDocument = await DocumentService.createDocument({
        name: context.sourceDocument.name,
        type: context.sourceDocument.type,
        subType: context.sourceDocument.subType || undefined,
        userId: context.sourceDocument.userId,
        realmId: context.targetRealmId,
        state: context.sourceDocument.state,
        version: context.sourceDocument.version || 1,
      });
    }
  }

  /**
   * Copy stage files to target document
   */
  private static async copyStageFiles(context: DocumentMigrationContext): Promise<void> {
    if (!context.targetDocument || context.migrationOptions.migrationMode === 'move') {
      return; // No need to copy files for move operations
    }

    const sourceDocId = context.sourceDocument.id;
    const targetDocId = context.targetDocument.id;

    const sourcePath = path.join(this.FILES_BASE_PATH, sourceDocId);
    const targetPath = path.join(this.FILES_BASE_PATH, targetDocId);

    try {
      // Check if source directory exists
      await fs.access(sourcePath);

      // Create target directory
      await fs.mkdir(targetPath, { recursive: true });

      // Copy all files from source to target
      const files = await fs.readdir(sourcePath, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isFile()) {
          const sourceFile = path.join(sourcePath, file.name);
          const targetFile = path.join(targetPath, file.name);
          await fs.copyFile(sourceFile, targetFile);
        } else if (file.isDirectory()) {
          // Recursively copy subdirectories
          await this.copyDirectory(path.join(sourcePath, file.name), path.join(targetPath, file.name));
        }
      }
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw new Error(`Failed to copy stage files: ${error}`);
      }
      // Source directory doesn't exist, which is fine
    }
  }

  /**
   * Recursively copy directory
   */
  private static async copyDirectory(source: string, target: string): Promise<void> {
    await fs.mkdir(target, { recursive: true });
    const files = await fs.readdir(source, { withFileTypes: true });
    
    for (const file of files) {
      if (file.isFile()) {
        await fs.copyFile(path.join(source, file.name), path.join(target, file.name));
      } else if (file.isDirectory()) {
        await this.copyDirectory(path.join(source, file.name), path.join(target, file.name));
      }
    }
  }

  /**
   * Reprocess required stages for the migrated document
   */
  private static async reprocessRequiredStages(context: DocumentMigrationContext): Promise<void> {
    if (!context.targetDocument || context.migrationOptions.reprocessStages.length === 0) {
      return;
    }

    const targetDocumentId = context.targetDocument.id;
    const stagesToReprocess = context.migrationOptions.reprocessStages;

    console.log(`Reprocessing ${stagesToReprocess.length} stages for migrated document ${targetDocumentId}`);

    try {
      // Reset document to the first stage that needs reprocessing
      const firstStage = this.getFirstStageToReprocess(stagesToReprocess);
      if (firstStage) {
        await stageExecutionService.resetToStage(targetDocumentId, firstStage);

        // Update document processing mode to manual to prevent automatic progression
        await prisma.document.update({
          where: { id: targetDocumentId },
          data: {
            processingMode: 'MANUAL',
            stageStatus: 'PENDING',
            lastStageError: null
          }
        });
      }

      // Schedule jobs for each stage that needs reprocessing
      const scheduledJobs: string[] = [];

      for (let i = 0; i < stagesToReprocess.length; i++) {
        const stage = stagesToReprocess[i] as ProcessingStage;

        // Validate that the stage is a valid ProcessingStage
        if (!Object.values(ProcessingStage).includes(stage)) {
          console.warn(`Invalid stage for reprocessing: ${stage}`);
          continue;
        }

        try {
          // Create a processing job for this stage
          const job = await backgroundJobService.createJob({
            documentId: targetDocumentId,
            stage: stage,
            priority: 10, // High priority for migration reprocessing
            scheduledAt: new Date(Date.now() + (i * 5000)), // Stagger jobs by 5 seconds
            metadata: {
              migrationId: context.migrationId,
              migrationReprocess: true,
              stageOrder: i,
              totalStages: stagesToReprocess.length
            }
          });

          scheduledJobs.push(job.id);
          console.log(`Scheduled reprocessing job ${job.id} for stage ${stage} (${i + 1}/${stagesToReprocess.length})`);

        } catch (error) {
          console.error(`Failed to schedule reprocessing job for stage ${stage}:`, error);
          throw new Error(`Failed to schedule reprocessing for stage ${stage}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Store the scheduled job IDs in the migration context
      context.migratedStages = stagesToReprocess;

      // Update migration record with reprocessing information
      await prisma.documentMigration.update({
        where: { id: context.migrationId },
        data: {
          migrationOptions: JSON.stringify({
            ...context.migrationOptions,
            scheduledJobs,
            reprocessingStarted: new Date().toISOString()
          })
        }
      });

      console.log(`Successfully scheduled ${scheduledJobs.length} reprocessing jobs for document ${targetDocumentId}`);

    } catch (error) {
      console.error(`Failed to reprocess stages for document ${targetDocumentId}:`, error);
      throw new Error(`Stage reprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the first stage in the processing pipeline from the list of stages to reprocess
   */
  private static getFirstStageToReprocess(stagesToReprocess: string[]): ProcessingStage | null {
    // Define the processing pipeline order
    const pipelineOrder: ProcessingStage[] = [
      ProcessingStage.MARKDOWN_CONVERSION,
      ProcessingStage.MARKDOWN_OPTIMIZER,
      ProcessingStage.CHUNKER,
      ProcessingStage.FACT_GENERATOR,
      ProcessingStage.INGESTOR
    ];

    // Find the first stage in the pipeline that needs reprocessing
    for (const stage of pipelineOrder) {
      if (stagesToReprocess.includes(stage)) {
        return stage;
      }
    }

    return null;
  }

  /**
   * Update document realm association
   */
  private static async updateDocumentRealm(context: DocumentMigrationContext): Promise<void> {
    if (!context.targetDocument) {
      return;
    }

    // Update realm document counts
    if (context.migrationOptions.migrationMode === 'move') {
      await RealmCountService.handleDocumentRealmMigration(
        context.sourceDocument.realmId,
        context.targetRealmId
      );
    }
    // For copy operations, the document count is already updated in createDocument
  }

  /**
   * Cleanup original document if moving and not preserving
   */
  private static async cleanupOriginalDocument(context: DocumentMigrationContext): Promise<void> {
    if (context.migrationOptions.migrationMode !== 'move' || context.migrationOptions.preserveOriginal) {
      return;
    }

    // Delete document files
    const sourcePath = path.join(this.FILES_BASE_PATH, context.sourceDocument.id);
    try {
      await fs.rm(sourcePath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to cleanup files for ${context.sourceDocument.id}:`, error);
    }
  }

  /**
   * Validate migration request
   */
  private static async validateMigrationRequest(request: MigrationRequest, userId: string): Promise<void> {
    // Validate document IDs
    if (!request.documentIds || request.documentIds.length === 0) {
      throw new Error('At least one document ID is required');
    }

    // Validate realms exist and user has access
    const sourceRealm = await RealmService.getRealmById(request.sourceRealmId, userId);
    if (!sourceRealm) {
      throw new Error('Source realm not found or access denied');
    }

    const targetRealm = await RealmService.getRealmById(request.targetRealmId, userId);
    if (!targetRealm) {
      throw new Error('Target realm not found or access denied');
    }

    // Validate documents exist and belong to user
    const documents = await prisma.document.findMany({
      where: {
        id: { in: request.documentIds },
        userId,
        realmId: request.sourceRealmId,
      },
    });

    if (documents.length !== request.documentIds.length) {
      throw new Error('Some documents not found or access denied');
    }
  }

  /**
   * Update migration status
   */
  private static async updateMigrationStatus(
    migrationId: string,
    status: MigrationStatus,
    error?: string
  ): Promise<void> {
    await prisma.documentMigration.update({
      where: { id: migrationId },
      data: {
        status,
        errorMessage: error,
        updatedAt: new Date(),
      },
    });
  }
}