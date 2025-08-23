import { PrismaClient, ProcessingStage, FileType, FileAccessLevel } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const FILES_BASE_DIR = process.env.FILES_BASE_DIR || './uploads';

export interface FileInput {
  documentId: string;
  fileType: FileType;
  stage?: ProcessingStage;
  filename: string;
  originalName?: string;
  content: string | Buffer;
  contentType: string;
  metadata?: Record<string, any>;
  isPublic?: boolean;
  accessLevel?: FileAccessLevel;
}

export interface FileOutput {
  id: string;
  documentId: string;
  fileType: FileType;
  stage?: ProcessingStage;
  filename: string;
  originalName?: string;
  filepath: string;
  filesize: number;
  contentType: string;
  content?: string;
  metadata?: Record<string, any>;
  isPublic: boolean;
  accessLevel: FileAccessLevel;
  createdAt: Date;
  updatedAt: Date;
}

export class UnifiedFileService {
  private static instance: UnifiedFileService;

  static getInstance(): UnifiedFileService {
    if (!UnifiedFileService.instance) {
      UnifiedFileService.instance = new UnifiedFileService();
    }
    return UnifiedFileService.instance;
  }

  /**
   * Generate file path based on document ID, file type, and stage
   */
  private generateFilePath(documentId: string, fileType: FileType, stage: ProcessingStage | null, filename: string): string {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (fileType === 'ORIGINAL_DOCUMENT') {
      return path.join(FILES_BASE_DIR, 'documents', documentId, 'original', sanitizedFilename);
    } else if (fileType === 'STAGE_OUTPUT' && stage) {
      return path.join(FILES_BASE_DIR, 'documents', documentId, 'stages', stage.toLowerCase(), sanitizedFilename);
    } else if (fileType === 'ARTIFACT') {
      return path.join(FILES_BASE_DIR, 'documents', documentId, 'artifacts', sanitizedFilename);
    } else if (fileType === 'THUMBNAIL') {
      return path.join(FILES_BASE_DIR, 'documents', documentId, 'thumbnails', sanitizedFilename);
    } else if (fileType === 'PREVIEW') {
      return path.join(FILES_BASE_DIR, 'documents', documentId, 'previews', sanitizedFilename);
    }
    
    // Fallback
    return path.join(FILES_BASE_DIR, 'documents', documentId, 'misc', sanitizedFilename);
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Map database record to output format
   */
  private mapToOutput(file: any): FileOutput {
    return {
      id: file.id,
      documentId: file.documentId,
      fileType: file.fileType,
      stage: file.stage || undefined,
      filename: file.filename,
      originalName: file.originalName || undefined,
      filepath: file.filepath,
      filesize: file.filesize,
      contentType: file.contentType,
      content: file.content || undefined,
      metadata: file.metadata ? JSON.parse(file.metadata) : undefined,
      isPublic: file.isPublic,
      accessLevel: file.accessLevel,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  /**
   * Store a file
   */
  async storeFile(input: FileInput): Promise<FileOutput> {
    const filepath = this.generateFilePath(input.documentId, input.fileType, input.stage || null, input.filename);
    const dirPath = path.dirname(filepath);
    
    // Ensure directory exists
    await this.ensureDirectoryExists(dirPath);
    
    // Write file to disk
    await fs.writeFile(filepath, input.content);
    
    // Get file size
    const stats = await fs.stat(filepath);
    
    // Store metadata in database
    const file = await prisma.documentFile.create({
      data: {
        documentId: input.documentId,
        fileType: input.fileType,
        stage: input.stage,
        filename: input.filename,
        originalName: input.originalName,
        filepath,
        filesize: stats.size,
        contentType: input.contentType,
        content: input.contentType.startsWith('text/') ? input.content.toString() : null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        isPublic: input.isPublic || false,
        accessLevel: input.accessLevel || 'REALM_MEMBERS',
      },
    });
    
    return this.mapToOutput(file);
  }

  /**
   * Retrieve a file by ID
   */
  async getFile(id: string, includeContent: boolean = false): Promise<FileOutput | null> {
    const file = await prisma.documentFile.findUnique({
      where: { id },
    });
    
    if (!file) return null;
    
    const output = this.mapToOutput(file);
    
    if (includeContent && !file.content) {
      try {
        const fileContent = await fs.readFile(file.filepath, 'utf8');
        output.content = fileContent;
      } catch (error) {
        console.error(`Failed to read file content: ${error}`);
      }
    }
    
    return output;
  }

  /**
   * Get files by document ID
   */
  async getFilesByDocument(documentId: string, fileType?: FileType, stage?: ProcessingStage): Promise<FileOutput[]> {
    const where: any = { documentId };
    
    if (fileType) {
      where.fileType = fileType;
    }
    
    if (stage) {
      where.stage = stage;
    }
    
    const files = await prisma.documentFile.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return files.map(file => this.mapToOutput(file));
  }

  /**
   * Get original document file
   */
  async getOriginalFile(documentId: string): Promise<FileOutput | null> {
    const file = await prisma.documentFile.findFirst({
      where: {
        documentId,
        fileType: 'ORIGINAL_DOCUMENT',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return file ? this.mapToOutput(file) : null;
  }

  /**
   * Get stage output files
   */
  async getStageFiles(documentId: string, stage: ProcessingStage): Promise<FileOutput[]> {
    return this.getFilesByDocument(documentId, 'STAGE_OUTPUT', stage);
  }

  /**
   * Delete a file
   */
  async deleteFile(id: string): Promise<boolean> {
    const file = await prisma.documentFile.findUnique({
      where: { id },
    });
    
    if (!file) return false;
    
    try {
      // Delete from filesystem
      await fs.unlink(file.filepath);
    } catch (error) {
      console.warn(`Failed to delete file from filesystem: ${error}`);
    }
    
    // Delete from database
    await prisma.documentFile.delete({
      where: { id },
    });
    
    return true;
  }

  /**
   * Delete all files for a document
   */
  async deleteDocumentFiles(documentId: string): Promise<number> {
    const files = await prisma.documentFile.findMany({
      where: { documentId },
    });
    
    let deletedCount = 0;
    
    for (const file of files) {
      try {
        await fs.unlink(file.filepath);
        deletedCount++;
      } catch (error) {
        console.warn(`Failed to delete file ${file.filepath}: ${error}`);
      }
    }
    
    // Delete all database records
    const result = await prisma.documentFile.deleteMany({
      where: { documentId },
    });
    
    return result.count;
  }

  /**
   * Get file content as stream
   */
  async getFileStream(id: string): Promise<NodeJS.ReadableStream | null> {
    const file = await prisma.documentFile.findUnique({
      where: { id },
    });
    
    if (!file) return null;
    
    try {
      const { createReadStream } = await import('fs');
      return createReadStream(file.filepath);
    } catch (error) {
      console.error(`Failed to create read stream: ${error}`);
      return null;
    }
  }

  /**
   * Check if user has access to file
   */
  async checkFileAccess(fileId: string, userId: string, realmId?: string): Promise<boolean> {
    const file = await prisma.documentFile.findUnique({
      where: { id: fileId },
      include: {
        document: {
          include: {
            realm: true,
            user: true,
          },
        },
      },
    });
    
    if (!file) return false;
    
    // Public files are accessible to everyone
    if (file.isPublic) return true;
    
    // Document owner always has access
    if (file.document.userId === userId) return true;
    
    // Check access level
    switch (file.accessLevel) {
      case 'PUBLIC':
        return true;
      case 'DOCUMENT_OWNER':
        return file.document.userId === userId;
      case 'REALM_MEMBERS':
        // Check if user is a member of the realm
        if (realmId && file.document.realmId === realmId) {
          return true;
        }
        // TODO: Check realm membership
        return false;
      case 'ADMIN_ONLY':
        // TODO: Check if user is admin
        return false;
      default:
        return false;
    }
  }
}

export const unifiedFileService = UnifiedFileService.getInstance();
