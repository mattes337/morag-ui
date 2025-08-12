import { DatabaseServer } from '@prisma/client';

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
  content?: string;
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
    content?: string;
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
   * Convert file to markdown using the new unified process endpoint
   */
  async convertToMarkdown(file: File, documentId: string, webhookUrl?: string): Promise<UnifiedProcessResponse> {
    const formData = new FormData();
    formData.append('mode', 'convert');
    formData.append('source_type', 'file');
    formData.append('file', file);
    formData.append('document_id', documentId);
    
    if (webhookUrl) {
      formData.append('webhook_url', webhookUrl);
    }

    const response = await fetch(`${this.baseUrl}/api/v1/process`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Process and ingest document using the new unified process endpoint
   */
  async processAndIngest(
    file: File,
    documentId: string,
    webhookUrl: string,
    databases: DatabaseServer[],
    metadata?: Record<string, any>
  ): Promise<UnifiedProcessResponse> {
    const formData = new FormData();
    formData.append('mode', 'ingest');
    formData.append('source_type', 'file');
    formData.append('file', file);
    formData.append('document_id', documentId);
    formData.append('webhook_url', webhookUrl);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    // Add database configurations
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
    
    formData.append('database_servers', JSON.stringify(databaseConfigs));

    const response = await fetch(`${this.baseUrl}/api/v1/process`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Process URL using the new unified process endpoint
   */
  async processUrl(
    url: string,
    documentId: string,
    mode: 'convert' | 'process' | 'ingest' = 'process',
    webhookUrl?: string,
    databases?: DatabaseServer[],
    metadata?: Record<string, any>
  ): Promise<UnifiedProcessResponse> {
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('source_type', 'url');
    formData.append('url', url);
    formData.append('document_id', documentId);
    
    if (webhookUrl) {
      formData.append('webhook_url', webhookUrl);
    }
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    if (databases && databases.length > 0) {
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
      
      formData.append('database_servers', JSON.stringify(databaseConfigs));
    }

    const response = await fetch(`${this.baseUrl}/api/v1/process`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Process batch of items using the new unified process endpoint
   */
  async processBatch(
    items: Array<{ url?: string; file?: File; metadata?: Record<string, any> }>,
    mode: 'convert' | 'process' | 'ingest' = 'process',
    webhookUrl?: string,
    databases?: DatabaseServer[]
  ): Promise<UnifiedProcessResponse> {
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('source_type', 'batch');
    
    if (webhookUrl) {
      formData.append('webhook_url', webhookUrl);
    }

    // Add batch items
    items.forEach((item, index) => {
      if (item.file) {
        formData.append(`batch_files`, item.file);
      }
      if (item.url) {
        formData.append(`batch_urls`, item.url);
      }
      if (item.metadata) {
        formData.append(`batch_metadata_${index}`, JSON.stringify(item.metadata));
      }
    });

    if (databases && databases.length > 0) {
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
      
      formData.append('database_servers', JSON.stringify(databaseConfigs));
    }

    const response = await fetch(`${this.baseUrl}/api/v1/process`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`MoRAG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
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
   * Search for similar content using the new search endpoint
   */
  async search(query: string, databases: DatabaseServer[], options?: {
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
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`, {
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