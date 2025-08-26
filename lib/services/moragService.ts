import { Server } from '@prisma/client';

// New unified process request structure based on the API spec
export interface UnifiedProcessRequest {
  mode: 'convert' | 'process' | 'ingest';
  source_type: 'file' | 'url' | 'batch';
  url?: string;
  batch_items?: Array<{
    url?: string;
    file_path?: string;
    metadata?: Record<string, any>;
  }>;
  webhook_url?: string;
  webhook_auth_token?: string;
  document_id?: string;
  collection_name?: string;
  language?: string;
  chunking_strategy?: string;
  chunk_size?: number;
  chunk_overlap?: number;
  metadata?: Record<string, any>;
  database_servers?: Array<{
    type: string;
    host: string;
    port: number;
    username?: string;
    password?: string;
    apiKey?: string;
    database?: string;
    collection?: string;
  }>;
}

// New unified process response structure based on the API spec
export interface UnifiedProcessResponse {
  success: boolean;
  mode: string;
  markdown?: string;
  metadata?: Record<string, any>;
  processing_time_ms?: number;
  task_id?: string;
  estimated_time_seconds?: number;
  status_url?: string;
  document_id?: string;
  error_message?: string;
  warnings?: string[];
  thumbnails?: string[];
  message?: string;
}

// Markdown conversion response structure
export interface MarkdownConversionResponse {
  success: boolean;
  markdown: string;
  metadata: Record<string, any>;
  processing_time_ms: number;
  error_message?: string;
}

// Process with ingestion response structure
export interface ProcessIngestResponse {
  success: boolean;
  task_id: string;
  document_id?: string;
  estimated_time_seconds: number;
  status_url: string;
  message: string;
}

export interface WebhookPayload {
  task_id: string;
  document_id?: string;
  batch_job_id?: string;
  timestamp: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  progress: {
    percentage: number;
    current_step: string;
    total_steps: number;
    step_details?: Record<string, any>;
  };
  result?: {
    markdown?: string;
    metadata?: Record<string, any>;
    chunks?: number;
    entities?: any[];
    facts?: any[];
  };
  error?: {
    code: string;
    message: string;
    step: string;
    details?: Record<string, any>;
  };
}

export interface StageProcessRequest {
  documentId: string;
  stage: string;
  executionId: string;
  document: {
    id: string;
    title: string;
    content: string;
    filePath: string;
    realmId: string;
  };
  webhookUrl: string;
  metadata?: Record<string, any>;
}

export interface StageProcessResponse {
  success: boolean;
  taskId: string;
  executionId: string;
  stage: string;
  estimatedTimeSeconds: number;
  statusUrl: string;
  message: string;
  immediateResult?: any; // For synchronous processing results
}

export class MoragService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = process.env.MORAG_API_URL || 'http://localhost:8000', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  private getFormHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }









  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/status/${taskId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/cancel/${taskId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Convert internal stage names to canonical stage names
   */
  private getCanonicalStageName(stage: string): string {
    const stageMapping: Record<string, string> = {
      'MARKDOWN_CONVERSION': 'markdown-conversion',
      'MARKDOWN_OPTIMIZER': 'markdown-optimizer',
      'CHUNKER': 'chunker',
      'FACT_GENERATOR': 'fact-generator',
      'INGESTOR': 'ingestor',
    };
    return stageMapping[stage] || stage.toLowerCase().replace('_', '-');
  }

  /**
   * Process a specific stage for a document using the new API
   */
  async processStage(request: StageProcessRequest): Promise<StageProcessResponse> {
    console.log(`🎯 [MoragService] Processing stage ${request.stage} for document ${request.documentId}`);
    console.log(`🔗 [MoragService] Backend URL: ${this.baseUrl}`);
    console.log(`🔑 [MoragService] Has API Key: ${!!this.apiKey}`);

    const canonicalStage = this.getCanonicalStageName(request.stage);

    // Create form data for the new API according to BACKEND.json specification
    const formData = new FormData();

    // Check if we have document content to upload as a file
    const hasFileContent = request.document.content && request.document.content.trim().length > 0;

    // According to the API spec, we need either file upload OR input_files
    // If we have file content, upload it; otherwise, use input_files with the original file path
    let inputFiles: string[] = [];
    if (!hasFileContent && request.document.filePath) {
      // Use the original file path if available
      inputFiles = [request.document.filePath];
    } else if (!hasFileContent) {
      // Fallback to a standard path pattern
      inputFiles = [`./uploads/documents/${request.documentId}/original/${request.document.title}`];
    }

    const stageRequest = {
      input_files: inputFiles,
      config: request.metadata || {},
      output_dir: `./output/${request.documentId}`,
      webhook_config: {
        url: request.webhookUrl,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      skip_if_exists: false // Always process, don't skip
    };

    // Add the request data
    formData.append('request', JSON.stringify(stageRequest));

    // Add the document content as a file if we have content
    if (hasFileContent) {
      const blob = new Blob([request.document.content], { type: 'text/markdown' });
      formData.append('file', blob, `${request.document.title}.md`);
      console.log(`📄 [MoRAG] Uploading file: ${request.document.title}.md (${request.document.content.length} chars)`);
    } else if (inputFiles.length > 0) {
      // If no content, we rely on input_files array
      console.log(`📁 [MoRAG] Using input_files: ${inputFiles.join(', ')}`);
    } else {
      console.warn(`⚠️ [MoRAG] No file content or input_files provided for ${request.document.title}`);
    }

    // Add additional form fields as per API spec
    formData.append('output_dir', `./output/${request.documentId}`);
    formData.append('webhook_url', request.webhookUrl);
    formData.append('return_content', 'false'); // Don't return file content in response

    console.log(`🚀 [MoRAG] Calling ${canonicalStage} stage for document ${request.documentId}`);
    console.log(`🔗 [MoRAG] Endpoint: ${this.baseUrl}/api/v1/stages/${canonicalStage}/execute`);

    const response = await fetch(`${this.baseUrl}/api/v1/stages/${canonicalStage}/execute`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData - let the browser set it with boundary
        'Authorization': this.getHeaders().Authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [MoRAG] API error details:`, errorText);
      console.error(`❌ [MoRAG] Request details:`, {
        stage: canonicalStage,
        documentId: request.documentId,
        hasFileContent,
        stageRequest
      });
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    console.log(`✅ [MoRAG] Backend response for ${canonicalStage}:`, {
      success: result.success,
      task_id: result.task_id,
      taskId: result.taskId, // Check both formats
      estimated_time_seconds: result.estimated_time_seconds,
      status_url: result.status_url,
      message: result.message,
      fullResponse: result
    });

    // Handle both task_id and taskId formats from backend
    const taskId = result.task_id || result.taskId;

    // Check if this is an immediate completion (synchronous processing)
    if (!taskId && result.status === 'completed' && result.success) {
      console.log(`✅ [MoRAG] Stage ${canonicalStage} completed immediately (synchronous processing)`);

      // Return a special response indicating immediate completion
      return {
        success: result.success,
        taskId: 'IMMEDIATE_COMPLETION', // Special marker for immediate completion
        executionId: request.executionId,
        stage: request.stage,
        estimatedTimeSeconds: 0,
        statusUrl: '',
        message: 'Stage completed immediately',
        immediateResult: result, // Include the full result for immediate processing
      };
    }

    if (!taskId) {
      console.error(`❌ [MoRAG] No task ID in response:`, result);
      throw new Error('MoRAG backend did not return a task ID');
    }

    return {
      success: result.success,
      taskId: taskId,
      executionId: request.executionId,
      stage: request.stage,
      estimatedTimeSeconds: result.estimated_time_seconds || 60,
      statusUrl: result.status_url || '',
      message: result.message || 'Stage processing started',
    };
  }

  /**
   * Search for similar content using the new search endpoint
   * Note: Search functionality may not be available in the new stage-based API
   * This method is kept for backward compatibility but may need updating
   */
  async search(query: string, databases: Server[], options?: {
    limit?: number;
    threshold?: number;
    filters?: Record<string, any>;
  }): Promise<any> {
    const databaseConfigs = databases.map(db => ({
      type: db.type.toLowerCase(),
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      apiKey: db.apiKey,
      database: db.database,
      collection: db.collection,
    }));

    // Try the new API first, fall back to old if needed
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query,
          database_servers: databaseConfigs,
          limit: options?.limit || 10,
          threshold: options?.threshold || 0.7,
          filters: options?.filters || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('New search API failed, this may not be implemented in the stage-based API:', error);
      throw error;
    }
  }

  /**
   * Get files for a task
   */
  async getTaskFiles(taskId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/files/${taskId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Download a file from the backend
   */
  async downloadFile(taskId: string, filename: string): Promise<Buffer> {
    const response = await fetch(`${this.baseUrl}/api/v1/files/${taskId}/${filename}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Clean up job files in the backend
   */
  async cleanupJob(jobId: string, force: boolean = false): Promise<any> {
    const url = new URL(`${this.baseUrl}/api/v1/stages/cleanup/${jobId}`);
    if (force) {
      url.searchParams.set('force', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Health check endpoint using the new API
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/stages/health`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

export const moragService = new MoragService();