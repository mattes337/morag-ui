import { PrismaClient, ProcessingStage, DocumentStageFile } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const STAGE_FILES_DIR = process.env.STAGE_FILES_DIR || './uploads/stages';

export interface StageFileInput {
  documentId: string;
  stage: ProcessingStage;
  filename: string;
  content: string | Buffer;
  contentType: string;
  metadata?: Record<string, any>;
}

export interface StageFileOutput {
  id: string;
  documentId: string;
  stage: ProcessingStage;
  filename: string;
  filepath: string;
  filesize: number;
  contentType: string;
  content?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

class StageFileService {
  /**
   * Ensure the stage files directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Generate a unique file path for a stage file
   */
  private generateFilePath(documentId: string, stage: ProcessingStage, filename: string): string {
    const stageDir = path.join(STAGE_FILES_DIR, documentId, stage.toLowerCase());
    const uniqueId = randomUUID();
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    return path.join(stageDir, `${baseName}_${uniqueId}${ext}`);
  }

  /**
   * Store a stage file
   */
  async storeStageFile(input: StageFileInput): Promise<StageFileOutput> {
    const filepath = this.generateFilePath(input.documentId, input.stage, input.filename);
    const dirPath = path.dirname(filepath);
    
    // Ensure directory exists
    await this.ensureDirectoryExists(dirPath);
    
    // Write file to disk
    await fs.writeFile(filepath, input.content);
    
    // Get file size
    const stats = await fs.stat(filepath);
    
    // Store metadata in database
    const stageFile = await prisma.documentStageFile.create({
      data: {
        documentId: input.documentId,
        stage: input.stage,
        filename: input.filename,
        filepath,
        filesize: stats.size,
        contentType: input.contentType,
        content: input.contentType.startsWith('text/') ? input.content.toString() : null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
    
    return this.mapToOutput(stageFile);
  }

  /**
   * Retrieve a stage file by ID
   */
  async getStageFile(id: string, includeContent: boolean = false): Promise<StageFileOutput | null> {
    const stageFile = await prisma.documentStageFile.findUnique({
      where: { id },
    });
    
    if (!stageFile) return null;
    
    const output = this.mapToOutput(stageFile);
    
    if (includeContent && !stageFile.content) {
      try {
        const fileContent = await fs.readFile(stageFile.filepath, 'utf8');
        output.content = fileContent;
      } catch (error) {
        console.error(`Failed to read stage file content: ${error}`);
      }
    }
    
    return output;
  }

  /**
   * Get all stage files for a document
   */
  async getDocumentStageFiles(documentId: string, stage?: ProcessingStage): Promise<StageFileOutput[]> {
    const where: any = { documentId };
    if (stage) {
      where.stage = stage;
    }
    
    const stageFiles = await prisma.documentStageFile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return stageFiles.map(file => this.mapToOutput(file));
  }

  /**
   * Get the latest stage file for a document and stage
   */
  async getLatestStageFile(documentId: string, stage: ProcessingStage): Promise<StageFileOutput | null> {
    const stageFile = await prisma.documentStageFile.findFirst({
      where: {
        documentId,
        stage,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    if (!stageFile) return null;
    
    return this.mapToOutput(stageFile);
  }

  /**
   * Delete a stage file
   */
  async deleteStageFile(id: string): Promise<boolean> {
    const stageFile = await prisma.documentStageFile.findUnique({
      where: { id },
    });
    
    if (!stageFile) return false;
    
    try {
      // Delete file from disk
      await fs.unlink(stageFile.filepath);
    } catch (error) {
      console.error(`Failed to delete stage file from disk: ${error}`);
    }
    
    // Delete from database
    await prisma.documentStageFile.delete({
      where: { id },
    });
    
    return true;
  }

  /**
   * Delete all stage files for a document
   */
  async deleteDocumentStageFiles(documentId: string): Promise<number> {
    const stageFiles = await prisma.documentStageFile.findMany({
      where: { documentId },
    });
    
    // Delete files from disk
    for (const file of stageFiles) {
      try {
        await fs.unlink(file.filepath);
      } catch (error) {
        console.error(`Failed to delete stage file from disk: ${error}`);
      }
    }
    
    // Delete from database
    const result = await prisma.documentStageFile.deleteMany({
      where: { documentId },
    });
    
    return result.count;
  }

  /**
   * Get file content as stream
   */
  async getStageFileStream(id: string): Promise<NodeJS.ReadableStream | null> {
    const stageFile = await prisma.documentStageFile.findUnique({
      where: { id },
    });
    
    if (!stageFile) return null;
    
    try {
      const { createReadStream } = await import('fs');
      return createReadStream(stageFile.filepath);
    } catch (error) {
      console.error(`Failed to create read stream: ${error}`);
      return null;
    }
  }

  /**
   * Map database model to output interface
   */
  private mapToOutput(stageFile: DocumentStageFile): StageFileOutput {
    return {
      id: stageFile.id,
      documentId: stageFile.documentId,
      stage: stageFile.stage,
      filename: stageFile.filename,
      filepath: stageFile.filepath,
      filesize: stageFile.filesize,
      contentType: stageFile.contentType,
      content: stageFile.content || undefined,
      metadata: stageFile.metadata ? JSON.parse(stageFile.metadata) : undefined,
      createdAt: stageFile.createdAt,
      updatedAt: stageFile.updatedAt,
    };
  }

  /**
   * Clean up orphaned files (files on disk without database records)
   */
  async cleanupOrphanedFiles(): Promise<number> {
    let cleanedCount = 0;
    
    try {
      const stageFilesInDb = await prisma.documentStageFile.findMany({
        select: { filepath: true },
      });
      
      const dbFilePaths = new Set(stageFilesInDb.map(f => f.filepath));
      
      // Recursively scan the stage files directory
      const scanDirectory = async (dirPath: string): Promise<void> => {
        try {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });
          
          for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
              await scanDirectory(fullPath);
            } else if (entry.isFile() && !dbFilePaths.has(fullPath)) {
              // File exists on disk but not in database - delete it
              await fs.unlink(fullPath);
              cleanedCount++;
            }
          }
        } catch (error) {
          console.error(`Error scanning directory ${dirPath}: ${error}`);
        }
      };
      
      await scanDirectory(STAGE_FILES_DIR);
    } catch (error) {
      console.error(`Error during cleanup: ${error}`);
    }
    
    return cleanedCount;
  }
}

export const stageFileService = new StageFileService();
export default stageFileService;