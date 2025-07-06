import { DocumentState } from '@prisma/client';

export interface MoragIngestionRequest {
    document_id: string;
    document_name: string;
    document_type: string;
    file_path: string;
    realm_id: string;
    user_id: string;
    ingestion_prompt?: string;
    chunk_size?: number;
    chunking_method?: string;
    servers: {
        qdrant?: {
            host: string;
            port: number;
            collection: string;
            api_key?: string;
        };
        neo4j?: {
            host: string;
            port: number;
            database: string;
            username?: string;
            password?: string;
        };
    };
}

export interface MoragIngestionResponse {
    success: boolean;
    job_id: string;
    message: string;
    document_id: string;
    chunks_created?: number;
    processing_time?: number;
    metadata?: {
        filename: string;
        file_size: number;
        file_extension: string;
        text_length?: number;
        chunk_count?: number;
        extraction_quality?: number;
        [key: string]: any;
    };
}

export interface MoragQueryRequest {
    query: string;
    realm_id: string;
    user_id: string;
    system_prompt?: string;
    max_results?: number;
    min_similarity?: number;
    document_ids?: string[];
    servers: {
        qdrant?: {
            host: string;
            port: number;
            collection: string;
            api_key?: string;
        };
        neo4j?: {
            host: string;
            port: number;
            database: string;
            username?: string;
            password?: string;
        };
    };
}

export interface MoragQueryResponse {
    success: boolean;
    answer: string;
    sources: Array<{
        document_id: string;
        document_name: string;
        chunk_id: string;
        content: string;
        similarity: number;
        metadata?: Record<string, any>;
    }>;
    processing_time: number;
    tokens_used?: number;
}

export interface MoragJobStatus {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message: string;
    created_at: string;
    updated_at: string;
    result?: MoragIngestionResponse;
    error?: string;
}

export class MoragService {
    private static getApiBaseUrl(): string {
        return process.env.API_BASE_URL || 'http://localhost:8000';
    }

    private static getApiKey(): string | null {
        // In production, this should come from environment variables
        // For now, we'll try to get it from localStorage (client-side) or env
        if (typeof window !== 'undefined') {
            return localStorage.getItem('api_key');
        }
        return process.env.MORAG_API_KEY || null;
    }

    private static async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const baseUrl = this.getApiBaseUrl();
        const apiKey = this.getApiKey();
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`MoRAG API error (${response.status}): ${errorText}`);
        }

        return response.json();
    }

    /**
     * Send a document to MoRAG for ingestion
     */
    static async ingestDocument(request: MoragIngestionRequest): Promise<MoragIngestionResponse> {
        console.log('📤 [MoragService] Sending document for ingestion:', request.document_name);
        
        try {
            const response = await this.makeRequest<MoragIngestionResponse>('/ingest', {
                method: 'POST',
                body: JSON.stringify(request),
            });

            console.log('✅ [MoragService] Document ingestion started:', response.job_id);
            return response;
        } catch (error) {
            console.error('❌ [MoragService] Document ingestion failed:', error);
            throw error;
        }
    }

    /**
     * Query the MoRAG backend for information
     */
    static async queryDocuments(request: MoragQueryRequest): Promise<MoragQueryResponse> {
        console.log('🔍 [MoragService] Querying documents:', request.query);
        
        try {
            const response = await this.makeRequest<MoragQueryResponse>('/query', {
                method: 'POST',
                body: JSON.stringify(request),
            });

            console.log('✅ [MoragService] Query completed, found', response.sources.length, 'sources');
            return response;
        } catch (error) {
            console.error('❌ [MoragService] Query failed:', error);
            throw error;
        }
    }

    /**
     * Check the status of an ingestion job
     */
    static async getJobStatus(jobId: string): Promise<MoragJobStatus> {
        console.log('📊 [MoragService] Checking job status:', jobId);
        
        try {
            const response = await this.makeRequest<MoragJobStatus>(`/jobs/${jobId}`);
            return response;
        } catch (error) {
            console.error('❌ [MoragService] Failed to get job status:', error);
            throw error;
        }
    }

    /**
     * Check if the MoRAG API is healthy
     */
    static async checkHealth(): Promise<boolean> {
        try {
            await this.makeRequest('/health');
            return true;
        } catch (error) {
            console.error('❌ [MoragService] Health check failed:', error);
            return false;
        }
    }

    /**
     * Get available models from MoRAG
     */
    static async getAvailableModels(): Promise<string[]> {
        try {
            const response = await this.makeRequest<{ models: string[] }>('/models');
            return response.models;
        } catch (error) {
            console.error('❌ [MoragService] Failed to get available models:', error);
            return [];
        }
    }
}
