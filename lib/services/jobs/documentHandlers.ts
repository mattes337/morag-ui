import { moragService } from '../moragService';
import { unifiedFileService } from '../unifiedFileService';

export interface DocumentProcessingRequest {
  documentId: string;
  stage: string;
  executionId: string;
  document: any;
  job: any;
}

export interface DocumentProcessingResult {
  success: boolean;
  taskId?: string;
  error?: string;
  immediateCompletion?: boolean;
  result?: any;
}

/**
 * Base class for document type handlers
 */
abstract class BaseDocumentHandler {
  abstract getDocumentContent(request: DocumentProcessingRequest): Promise<{
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }>;

  abstract buildBackendRequest(request: DocumentProcessingRequest, content: {
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }): Promise<any>;

  /**
   * Handle immediate completion when backend returns results synchronously
   */
  protected async handleImmediateCompletion(request: DocumentProcessingRequest, result: any): Promise<void> {
    console.log(`🔄 [${this.constructor.name}] Processing immediate completion for document ${request.documentId}`);

    // Import services to avoid circular dependencies
    const { stageExecutionService } = await import('../stageExecutionService');
    const { unifiedFileService } = await import('../unifiedFileService');
    const { prisma } = await import('../../database');

    try {
      // Get the existing execution that was already started by the job processor
      // Don't create a new one as that would cause conflicts
      const execution = await stageExecutionService.getLatestExecution(request.documentId, request.stage as any);

      if (!execution) {
        throw new Error(`No existing execution found for document ${request.documentId}, stage ${request.stage}`);
      }

      if (execution.status !== 'RUNNING') {
        console.warn(`⚠️ [${this.constructor.name}] Expected execution to be RUNNING, but found status: ${execution.status}`);
      }

      console.log(`🔄 [${this.constructor.name}] Using existing execution ${execution.id} for immediate completion`);

      // Store output files if any
      if (result.output_files && result.output_files.length > 0) {
        console.log(`📁 [${this.constructor.name}] Downloading and storing ${result.output_files.length} output files`);

        for (const file of result.output_files) {
          try {
            const filePath = file.file_path || file.filename;
            console.log(`🔽 [${this.constructor.name}] Downloading file: ${filePath}`);

            // Download file content from MoRAG backend
            const fileContent = await this.downloadFileFromMorag(filePath);

            if (fileContent) {
              // Extract filename from path
              const filename = file.filename || filePath.split('/').pop() || filePath.split('\\').pop() || 'output_file';

              // Store file in database and on disk
              const storedFile = await unifiedFileService.storeFile({
                documentId: request.documentId,
                fileType: 'STAGE_OUTPUT',
                filename,
                originalName: filename,
                content: Buffer.from(fileContent, 'utf-8'),
                contentType: file.content_type || this.getContentTypeFromFilename(filename),
                isPublic: false,
                accessLevel: 'REALM_MEMBERS',
                metadata: {
                  stage: request.stage,
                  executionId: execution.id,
                  backendFilePath: filePath,
                  fileSize: file.file_size,
                  checksum: file.checksum,
                  createdAt: file.created_at,
                  immediateCompletion: true,
                  downloadedAt: new Date().toISOString()
                }
              });

              console.log(`✅ [${this.constructor.name}] Stored file ${filename} for stage ${request.stage} (ID: ${storedFile.id})`);

              // For markdown conversion stage, also update document markdown field
              if (request.stage === 'MARKDOWN_CONVERSION' && filename.endsWith('.md')) {
                await prisma.document.update({
                  where: { id: request.documentId },
                  data: {
                    markdown: fileContent,
                  },
                });
                console.log(`✅ [${this.constructor.name}] Updated document ${request.documentId} with markdown content (${fileContent.length} chars)`);
              }

              // For chunker stage, parse chunk JSON and create documentChunk records
              console.log(`🔍 [${this.constructor.name}] Checking chunk processing: stage=${request.stage}, filename=${filename}, endsWithChunksJson=${filename.endsWith('.chunks.json')}`);
              if (request.stage === 'CHUNKER' && filename.endsWith('.chunks.json')) {
                console.log(`📊 [${this.constructor.name}] Processing chunk file ${filename} for document ${request.documentId}`);
                try {
                  const chunkData = JSON.parse(fileContent);
                  console.log(`📋 [${this.constructor.name}] Parsed chunk JSON, structure:`, Object.keys(chunkData));
                  await this.createDocumentChunks(request.documentId, chunkData);
                  console.log(`✅ [${this.constructor.name}] Created chunks for document ${request.documentId} from ${filename}`);
                } catch (parseError) {
                  console.error(`❌ [${this.constructor.name}] Failed to parse chunk JSON for ${filename}:`, parseError);
                }
              }

              // For fact generator stage, parse fact JSON and create fact/entity records
              console.log(`🔍 [${this.constructor.name}] Checking fact processing: stage=${request.stage}, filename=${filename}, endsWithFactsJson=${filename.endsWith('.facts.json')}`);
              if (request.stage === 'FACT_GENERATOR' && filename.endsWith('.facts.json')) {
                console.log(`📊 [${this.constructor.name}] Processing fact file ${filename} for document ${request.documentId}`);
                try {
                  const factData = JSON.parse(fileContent);
                  console.log(`📋 [${this.constructor.name}] Parsed fact JSON, structure:`, Object.keys(factData));
                  await this.createDocumentFacts(request.documentId, factData);
                  console.log(`✅ [${this.constructor.name}] Created facts and entities for document ${request.documentId} from ${filename}`);
                } catch (parseError) {
                  console.error(`❌ [${this.constructor.name}] Failed to parse fact JSON for ${filename}:`, parseError);
                }
              }
            } else {
              console.warn(`⚠️ [${this.constructor.name}] Could not download file: ${filePath}`);
            }
          } catch (fileError) {
            console.error(`❌ [${this.constructor.name}] Error processing file ${file.filename || file.file_path}:`, fileError);
          }
        }
      }

      // Complete the execution
      await stageExecutionService.completeExecution(
        execution.id,
        result.output_files?.map((f: any) => f.filename) || [],
        result.metadata || {}
      );

      console.log(`✅ [${this.constructor.name}] Immediate completion processed successfully`);
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Failed to process immediate completion:`, error);
      throw error;
    }
  }

  /**
   * Download a file from MoRAG backend
   */
  private async downloadFileFromMorag(filePath: string): Promise<string | null> {
    try {
      const moragBaseUrl = process.env.MORAG_API_URL || 'http://localhost:8000';
      const moragApiKey = process.env.MORAG_API_KEY;

      // Use the correct URL format: /api/v1/files/download/{encoded_path}?inline=true
      const encodedPath = encodeURIComponent(filePath);
      const downloadUrl = `${moragBaseUrl}/api/v1/files/download/${encodedPath}?inline=true`;

      console.log(`🔽 [${this.constructor.name}] Downloading from: ${downloadUrl}`);

      const headers: Record<string, string> = {
        'Accept': 'text/plain, text/markdown, application/octet-stream',
      };

      if (moragApiKey) {
        headers['Authorization'] = `Bearer ${moragApiKey}`;
      }

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const content = await response.text();
        console.log(`✅ [${this.constructor.name}] Downloaded file content (${content.length} chars)`);
        return content;
      } else {
        console.error(`❌ [${this.constructor.name}] Download failed: ${response.status} ${response.statusText}`);

        // Try to get error details
        try {
          const errorText = await response.text();
          console.error(`❌ [${this.constructor.name}] Error response: ${errorText}`);
        } catch (e) {
          // Ignore error reading response
        }

        return null;
      }

    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error downloading file from MoRAG:`, error);
      return null;
    }
  }

  /**
   * Get content type from filename
   */
  private getContentTypeFromFilename(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'md':
        return 'text/markdown';
      case 'txt':
        return 'text/plain';
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'html':
        return 'text/html';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'text/plain';
    }
  }

  /**
   * Create documentChunk records from chunk JSON data
   */
  private async createDocumentChunks(documentId: string, chunkData: any): Promise<void> {
    const { prisma } = await import('../../database');

    try {
      // Delete existing chunks for this document
      await prisma.documentChunk.deleteMany({
        where: { documentId }
      });

      // Parse chunk data structure - handle different possible formats
      let chunks: any[] = [];

      if (Array.isArray(chunkData)) {
        chunks = chunkData;
      } else if (chunkData.chunks && Array.isArray(chunkData.chunks)) {
        chunks = chunkData.chunks;
      } else if (chunkData.data && Array.isArray(chunkData.data)) {
        chunks = chunkData.data;
      } else {
        console.warn(`⚠️ [${this.constructor.name}] Unexpected chunk data format:`, Object.keys(chunkData));
        return;
      }

      console.log(`📊 [${this.constructor.name}] Processing ${chunks.length} chunks for document ${documentId}`);

      // Create chunk records
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        try {
          await prisma.documentChunk.create({
            data: {
              documentId,
              chunkIndex: i,
              content: chunk.content || chunk.text || '',
              metadata: chunk.metadata ? JSON.stringify(chunk.metadata) : null,
              embedding: chunk.embedding || null,
            }
          });
        } catch (chunkError) {
          console.error(`❌ [${this.constructor.name}] Failed to create chunk ${i}:`, chunkError);
        }
      }

      console.log(`✅ [${this.constructor.name}] Successfully created ${chunks.length} chunks for document ${documentId}`);
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Failed to create document chunks:`, error);
      throw error;
    }
  }

  /**
   * Create fact and entity records from fact JSON data
   */
  private async createDocumentFacts(documentId: string, factData: any): Promise<void> {
    const { prisma } = await import('../../database');

    try {
      // Delete existing facts for this document
      await prisma.fact.deleteMany({
        where: { documentId }
      });

      // Parse fact data structure - handle different possible formats
      let facts: any[] = [];
      let entities: any[] = [];

      if (factData.facts && Array.isArray(factData.facts)) {
        facts = factData.facts;
      } else if (factData.relations && Array.isArray(factData.relations)) {
        facts = factData.relations;
      } else if (Array.isArray(factData)) {
        facts = factData;
      }

      if (factData.entities && Array.isArray(factData.entities)) {
        entities = factData.entities;
      } else if (factData.named_entities && Array.isArray(factData.named_entities)) {
        entities = factData.named_entities;
      }

      console.log(`📊 [${this.constructor.name}] Processing ${entities.length} entities and ${facts.length} facts for document ${documentId}`);

      // Create entities first
      const entityMap = new Map<string, string>(); // name -> id mapping

      for (const entity of entities) {
        try {
          const entityName = entity.name || entity.text || entity.entity;
          const entityType = entity.type || entity.label || 'UNKNOWN';

          if (!entityName) continue;

          // Check if entity already exists
          let existingEntity = await prisma.entity.findUnique({
            where: {
              name_type: {
                name: entityName,
                type: entityType
              }
            }
          });

          if (!existingEntity) {
            existingEntity = await prisma.entity.create({
              data: {
                name: entityName,
                type: entityType,
                description: entity.description || null,
                metadata: entity.metadata ? JSON.stringify(entity.metadata) : null,
              }
            });
          }

          entityMap.set(entityName, existingEntity.id);

          // Create document-entity relationship
          await prisma.documentEntity.upsert({
            where: {
              documentId_entityId: {
                documentId,
                entityId: existingEntity.id
              }
            },
            create: {
              documentId,
              entityId: existingEntity.id
            },
            update: {} // No updates needed if it exists
          });

        } catch (entityError) {
          console.error(`❌ [${this.constructor.name}] Failed to create entity:`, entityError);
        }
      }

      // Create facts
      for (let i = 0; i < facts.length; i++) {
        const fact = facts[i];

        try {
          const subject = fact.subject || fact.head || '';
          const predicate = fact.predicate || fact.relation || fact.relationship || '';
          const object = fact.object || fact.tail || '';
          const confidence = fact.confidence || fact.score || 1.0;
          const source = fact.source || `fact_${i}`;

          // Try to find related entity
          const entityId = entityMap.get(subject) || entityMap.get(object) || null;

          await prisma.fact.create({
            data: {
              documentId,
              subject,
              predicate,
              object,
              confidence,
              source,
              metadata: fact.metadata ? JSON.stringify(fact.metadata) : null,
              entityId,
            }
          });
        } catch (factError) {
          console.error(`❌ [${this.constructor.name}] Failed to create fact ${i}:`, factError);
        }
      }

      console.log(`✅ [${this.constructor.name}] Successfully created ${entities.length} entities and ${facts.length} facts for document ${documentId}`);
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Failed to create document facts:`, error);
      throw error;
    }
  }

  async processDocument(request: DocumentProcessingRequest): Promise<DocumentProcessingResult> {
    try {
      console.log(`🚀 [${this.constructor.name}] Processing document ${request.documentId}, stage ${request.stage}`);

      // Get document content
      const contentData = await this.getDocumentContent(request);

      // Build backend request
      const backendRequest = await this.buildBackendRequest(request, contentData);

      // Call MoRAG backend
      const response = await moragService.executeStage(backendRequest);

      if (response.immediateResult) {
        // Handle immediate completion
        console.log(`✅ [${this.constructor.name}] Stage completed immediately with status: ${response.immediateResult.status}`);

        // Process the immediate result (store files, update status, etc.)
        await this.handleImmediateCompletion(request, response.immediateResult);

        return {
          success: true,
          taskId: response.task_id,
          immediateCompletion: true,
          result: response.immediateResult
        };
      } else {
        // Handle async processing
        console.log(`✅ [${this.constructor.name}] Backend call successful, task ID: ${response.task_id}`);

        return {
          success: true,
          taskId: response.task_id
        };
      }
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Processing failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  protected getWebhookUrl(): string {
    return `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/stages`;
  }

  protected getDatabaseServers(document: any): any[] {
    return document.realm?.servers?.map((realmServer: any) => ({
      type: realmServer.server.type.toLowerCase(),
      host: realmServer.server.host,
      port: realmServer.server.port,
      username: realmServer.server.username,
      password: realmServer.server.password,
      apiKey: realmServer.server.apiKey,
      database: realmServer.server.database,
      collection: realmServer.server.collection,
    })) || [];
  }
}

/**
 * Handler for YouTube documents
 */
export class YouTubeDocumentHandler extends BaseDocumentHandler {
  async getDocumentContent(request: DocumentProcessingRequest): Promise<{
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }> {
    const { document, job } = request;

    // Try to get URL from job metadata first
    const jobMetadata = job.metadata ? JSON.parse(job.metadata) : {};
    let sourceUrl = jobMetadata.sourceUrl;

    // If not in job metadata, this is an error for YouTube documents
    if (!sourceUrl) {
      throw new Error(`No source URL found for YouTube document ${document.id}. URL must be provided in job metadata.`);
    }

    // Fix common URL corruption issues using centralized utility
    const { fixUrlCorruption } = await import('../../utils/youtubeUtils');
    const correctedUrl = fixUrlCorruption(sourceUrl);

    if (correctedUrl !== sourceUrl) {
      console.log(`🔧 [YouTubeDocumentHandler] Fixed URL corruption: ${sourceUrl} -> ${correctedUrl}`);
    }

    // Validate the corrected URL
    try {
      new URL(correctedUrl);
    } catch (error) {
      throw new Error(`Invalid YouTube URL after correction: ${correctedUrl}. Original: ${sourceUrl}`);
    }

    return {
      content: correctedUrl,
      contentSource: 'url',
      sourceUrl: correctedUrl
    };
  }

  async buildBackendRequest(request: DocumentProcessingRequest, content: {
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }): Promise<any> {
    const { document, job } = request;

    // Build stage-specific configuration according to backend API guide
    const stageConfig = this.getYouTubeStageConfig(job.stage);

    return {
      stage: job.stage,
      input_files: [content.sourceUrl],
      output_dir: `./output/${document.id}`,
      webhook_url: this.getWebhookUrl(),
      metadata: {
        ...stageConfig,
        jobId: job.id,
        documentName: document.name,
        realmId: document.realmId,
        sourceUrl: content.sourceUrl,
        isUrlDocument: true,
        hasFileContent: false,
        databaseServers: this.getDatabaseServers(document)
      }
    };
  }

  private getYouTubeStageConfig(stage: string): Record<string, any> {
    switch (stage) {
      case 'MARKDOWN_CONVERSION':
        return {
          include_timestamps: true,
          speaker_diarization: true,
          topic_segmentation: true,
          language: 'en',
          download_subtitles: true,
          subtitle_languages: ['en', 'auto'],
          quality: 'best'
        };
      case 'MARKDOWN_OPTIMIZER':
        return {
          fix_transcription_errors: true,
          improve_readability: true,
          preserve_timestamps: true
        };
      case 'CHUNKER':
        return {
          chunk_strategy: 'topic',
          chunk_size: 4000,
          generate_summary: true
        };
      case 'FACT_GENERATOR':
        return {
          extract_entities: true,
          extract_relations: true,
          domain: 'general'
        };
      case 'INGESTOR':
        return {
          databases: ['qdrant', 'neo4j'],
          collection_name: 'youtube_videos'
        };
      default:
        return {};
    }
  }
}

/**
 * Handler for website documents
 */
export class WebsiteDocumentHandler extends BaseDocumentHandler {
  async getDocumentContent(request: DocumentProcessingRequest): Promise<{
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }> {
    const { document, job } = request;

    // Try to get URL from job metadata first
    const jobMetadata = job.metadata ? JSON.parse(job.metadata) : {};
    let sourceUrl = jobMetadata.sourceUrl;

    // If not in job metadata, this is an error for website documents
    if (!sourceUrl) {
      throw new Error(`No source URL found for website document ${document.id}. URL must be provided in job metadata.`);
    }

    return {
      content: sourceUrl,
      contentSource: 'url',
      sourceUrl
    };
  }

  async buildBackendRequest(request: DocumentProcessingRequest, content: {
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }): Promise<any> {
    const { document, job } = request;

    // Build stage-specific configuration according to backend API guide
    const stageConfig = this.getWebsiteStageConfig(job.stage);

    return {
      stage: job.stage,
      input_files: [content.sourceUrl],
      output_dir: `./output/${document.id}`,
      webhook_url: this.getWebhookUrl(),
      metadata: {
        ...stageConfig,
        jobId: job.id,
        documentName: document.name,
        realmId: document.realmId,
        sourceUrl: content.sourceUrl,
        isUrlDocument: true,
        hasFileContent: false,
        databaseServers: this.getDatabaseServers(document)
      }
    };
  }

  private getWebsiteStageConfig(stage: string): Record<string, any> {
    switch (stage) {
      case 'MARKDOWN_CONVERSION':
        return {
          follow_links: false,
          max_depth: 1,
          extract_metadata: true,
          clean_content: true,
          extract_links: true,
          preserve_tables: true,
          preserve_lists: true
        };
      case 'MARKDOWN_OPTIMIZER':
        return {
          improve_readability: true,
          normalize_formatting: true,
          enhance_structure: true
        };
      case 'CHUNKER':
        return {
          chunk_strategy: 'semantic',
          chunk_size: 3000,
          generate_summary: true
        };
      case 'FACT_GENERATOR':
        return {
          extract_entities: true,
          extract_relations: true,
          extract_keywords: true,
          domain: 'general'
        };
      case 'INGESTOR':
        return {
          databases: ['qdrant', 'neo4j'],
          collection_name: 'web_articles'
        };
      default:
        return {};
    }
  }
}

/**
 * Handler for file-based documents (PDF, Word, etc.)
 */
export class FileDocumentHandler extends BaseDocumentHandler {
  async getDocumentContent(request: DocumentProcessingRequest): Promise<{
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }> {
    const { document, job } = request;

    if (job.stage === 'MARKDOWN_CONVERSION') {
      // For first stage, use original file
      const originalFile = document.files?.[0];
      if (!originalFile) {
        throw new Error(`No original file found for document ${document.id}`);
      }

      try {
        const fileWithContent = await unifiedFileService.getFile(originalFile.id, true);
        if (!fileWithContent || !fileWithContent.content) {
          throw new Error(`Failed to retrieve content for original file ${originalFile.id}`);
        }

        // Check if this is a URL-based document by examining the metadata
        const metadata = fileWithContent.metadata || {};
        if (metadata.sourceUrl) {
          return {
            content: metadata.sourceUrl,
            contentSource: 'url',
            sourceUrl: metadata.sourceUrl
          };
        }

        return {
          content: fileWithContent.content,
          contentSource: 'original_file'
        };
      } catch (error) {
        console.error(`Failed to read original file ${originalFile.id}:`, error);
        throw new Error(`Failed to read original file for document ${document.id}`);
      }
    } else {
      // For other stages, use markdown content from previous stages
      return {
        content: document.markdown || '',
        contentSource: 'markdown_field'
      };
    }
  }

  async buildBackendRequest(request: DocumentProcessingRequest, content: {
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }): Promise<any> {
    const { document, job } = request;

    // Build stage-specific configuration according to backend API guide
    const stageConfig = this.getFileStageConfig(job.stage, content.contentSource);

    // For file-based documents in first stage, we should use file upload
    // For URL-based or subsequent stages, use input_files
    const isFirstStage = job.stage === 'MARKDOWN_CONVERSION';
    const isFileContent = content.contentSource === 'original_file';

    const baseRequest = {
      stage: job.stage,
      output_dir: `./output/${document.id}`,
      webhook_url: this.getWebhookUrl(),
      metadata: {
        ...stageConfig,
        jobId: job.id,
        documentName: document.name,
        realmId: document.realmId,
        originalFile: document.files?.[0]?.originalName || document.files?.[0]?.filename,
        sourceUrl: content.sourceUrl,
        isUrlDocument: !!content.sourceUrl,
        hasFileContent: isFileContent,
        databaseServers: this.getDatabaseServers(document)
      }
    };

    // According to backend API guide:
    // - For file uploads in first stage: use 'file' parameter (handled by moragService)
    // - For URLs or subsequent stages: use 'input_files' array
    if (content.sourceUrl) {
      return {
        ...baseRequest,
        input_files: [content.sourceUrl]
      };
    } else if (isFirstStage && isFileContent) {
      // For first stage with file content, the file should be uploaded
      // This will be handled by the moragService using FormData
      return {
        ...baseRequest,
        file_content: content.content,
        use_file_upload: true
      };
    } else {
      // For subsequent stages, use input_files with previous stage outputs
      // We need to get the output file paths from the previous stage
      const previousStageFiles = await this.getPreviousStageOutputFiles(document.id, job.stage);

      if (previousStageFiles.length > 0) {
        return {
          ...baseRequest,
          input_files: previousStageFiles
        };
      } else {
        // Fallback: create a temporary file with the markdown content
        const tempFileName = `${document.id}_${job.stage.toLowerCase()}_input.md`;
        return {
          ...baseRequest,
          input_files: [`./temp/${tempFileName}`],
          temp_file_content: content.content,
          temp_file_name: tempFileName
        };
      }
    }
  }

  /**
   * Get output file paths from the previous stage
   */
  private async getPreviousStageOutputFiles(documentId: string, currentStage: string): Promise<string[]> {
    try {
      const { prisma } = await import('../../database');

    // Define stage order
    const stageOrder = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
    const currentIndex = stageOrder.indexOf(currentStage);

    if (currentIndex <= 0) {
      return []; // No previous stage
    }

      const previousStage = stageOrder[currentIndex - 1];

      // Get files from the previous stage
      const files = await prisma.documentFile.findMany({
        where: {
          documentId,
          stage: previousStage as any
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Return file paths that the backend can access
      return files.map(file => {
        // Try to get the backend file path from metadata
        const metadata = file.metadata ? JSON.parse(file.metadata) : {};
        if (metadata.originalPath) {
          return metadata.originalPath;
        }

        // Fallback to constructing the path
        return `./output/${documentId}/${file.filename}`;
      });
    } catch (error) {
      console.error(`Failed to get previous stage files for ${documentId}, stage ${currentStage}:`, error);
      return [];
    }
  }

  private getFileStageConfig(stage: string, contentSource: string): Record<string, any> {
    switch (stage) {
      case 'MARKDOWN_CONVERSION':
        if (contentSource === 'original_file') {
          return {
            preserve_formatting: true,
            extract_images: false,
            quality_threshold: 0.8
          };
        }
        return {};
      case 'MARKDOWN_OPTIMIZER':
        return {
          improve_readability: true,
          normalize_formatting: true,
          enhance_structure: true
        };
      case 'CHUNKER':
        return {
          chunk_strategy: 'semantic',
          chunk_size: 4000,
          generate_summary: true,
          preserve_structure: true
        };
      case 'FACT_GENERATOR':
        return {
          extract_entities: true,
          extract_relations: true,
          extract_keywords: true,
          domain: 'general'
        };
      case 'INGESTOR':
        return {
          databases: ['qdrant', 'neo4j'],
          collection_name: 'documents'
        };
      default:
        return {};
    }
  }
}

/**
 * Factory to get the appropriate handler for a document type
 */
export class DocumentHandlerFactory {
  static getHandler(documentType: string): BaseDocumentHandler {
    switch (documentType) {
      case 'youtube':
        return new YouTubeDocumentHandler();
      case 'website':
        return new WebsiteDocumentHandler();
      default:
        return new FileDocumentHandler();
    }
  }
}
