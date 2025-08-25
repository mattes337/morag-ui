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
    const canonicalStage = this.getCanonicalStageName(request.stage);

    // Create form data for the new API
    const formData = new FormData();

    // Add the request as JSON string (the API accepts both JSON objects and strings)
    const requestData = {
      document_id: request.documentId,
      execution_id: request.executionId,
      document: request.document,
      webhook_url: request.webhookUrl,
      metadata: request.metadata || {},
    };

    formData.append('request', JSON.stringify(requestData));

    // If there's a file to process, we would add it here
    // For now, we'll use the document content
    if (request.document.content) {
      const blob = new Blob([request.document.content], { type: 'text/markdown' });
      formData.append('file', blob, `${request.document.title}.md`);
    }

    const response = await fetch(`${this.baseUrl}/api/v1/stages/${canonicalStage}/execute`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData - let the browser set it with boundary
        'Authorization': this.getHeaders().Authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: result.success,
      taskId: result.task_id,
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