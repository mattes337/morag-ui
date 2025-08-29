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
  }): any;

  /**
   * Handle immediate completion when backend returns results synchronously
   */
  protected async handleImmediateCompletion(request: DocumentProcessingRequest, result: any): Promise<void> {
    console.log(`🔄 [${this.constructor.name}] Processing immediate completion for document ${request.documentId}`);

    // Import services to avoid circular dependencies
    const { stageExecutionService } = await import('../stageExecutionService');
    const { unifiedFileService } = await import('../unifiedFileService');

    try {
      // Start execution record
      const execution = await stageExecutionService.startExecution({
        documentId: request.documentId,
        stage: request.stage as any,
        metadata: { immediateCompletion: true, processedAt: new Date().toISOString() }
      });

      // Store output files if any
      if (result.output_files && result.output_files.length > 0) {
        console.log(`📁 [${this.constructor.name}] Storing ${result.output_files.length} output files`);

        for (const file of result.output_files) {
          // The file content would need to be fetched from the backend
          // For now, we'll store the file metadata
          await unifiedFileService.storeFile({
            documentId: request.documentId,
            fileType: 'STAGE_OUTPUT',
            filename: file.filename,
            originalName: file.filename,
            content: Buffer.from(''), // Empty content for now - would need to fetch from backend
            contentType: file.content_type || 'text/plain',
            isPublic: false,
            accessLevel: 'REALM_MEMBERS',
            metadata: {
              stage: request.stage,
              executionId: execution.id,
              backendFilePath: file.file_path,
              fileSize: file.file_size,
              checksum: file.checksum,
              createdAt: file.created_at
            }
          });
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

  async processDocument(request: DocumentProcessingRequest): Promise<DocumentProcessingResult> {
    try {
      console.log(`🚀 [${this.constructor.name}] Processing document ${request.documentId}, stage ${request.stage}`);

      // Get document content
      const contentData = await this.getDocumentContent(request);

      // Build backend request
      const backendRequest = this.buildBackendRequest(request, contentData);

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

  buildBackendRequest(request: DocumentProcessingRequest, content: {
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }): any {
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

  buildBackendRequest(request: DocumentProcessingRequest, content: {
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }): any {
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

  buildBackendRequest(request: DocumentProcessingRequest, content: {
    content: string;
    contentSource: string;
    sourceUrl?: string;
  }): any {
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
        originalFile: document.files?.[0]?.filepath,
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
      return {
        ...baseRequest,
        input_files: [content.content] // This should be file paths from previous stages
      };
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
